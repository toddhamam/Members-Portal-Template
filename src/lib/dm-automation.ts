/**
 * DM Automation Service
 * Handles triggering and sending automated direct messages
 */

import { createAdminClientInstance } from "@/lib/supabase/server";

export type AutomationTrigger =
  | "welcome"
  | "purchase"
  | "purchase_specific"
  | "course_started"
  | "course_progress_25"
  | "course_progress_50"
  | "course_progress_75"
  | "course_completed"
  | "inactivity_7d"
  | "inactivity_14d"
  | "inactivity_30d"
  | "anniversary_30d"
  | "anniversary_90d"
  | "anniversary_1y"
  | "first_community_post";

interface TriggerContext {
  memberId: string;
  memberName?: string;
  memberFirstName?: string;
  productId?: string;
  productName?: string;
  progressPercent?: number;
  daysSinceJoin?: number;
  contextKey?: string; // Unique key to prevent duplicate sends
}

interface AutomationRecord {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, string>;
  message_template: string;
  sender_id: string | null;
  delay_minutes: number;
  is_enabled: boolean;
}

/**
 * Process template variables
 */
function processTemplate(template: string, context: TriggerContext): string {
  let result = template;

  const replacements: Record<string, string | undefined> = {
    "{{member_name}}": context.memberName,
    "{{member_first_name}}": context.memberFirstName || context.memberName?.split(" ")[0],
    "{{product_name}}": context.productName,
    "{{progress_percent}}": context.progressPercent?.toString(),
    "{{days_since_join}}": context.daysSinceJoin?.toString(),
  };

  for (const [key, value] of Object.entries(replacements)) {
    if (value) {
      result = result.replace(new RegExp(key, "g"), value);
    }
  }

  return result;
}

/**
 * Find or create a conversation between admin and member
 */
async function getOrCreateConversation(
  adminId: string,
  memberId: string
): Promise<string | null> {
  const supabase = createAdminClientInstance();

  // Check if conversation already exists
  const { data: existingParticipation } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", memberId)
    .single();

  if (existingParticipation) {
    // Verify the admin is also in this conversation
    const { data: adminParticipation } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", existingParticipation.conversation_id)
      .eq("user_id", adminId)
      .single();

    if (adminParticipation) {
      return existingParticipation.conversation_id;
    }
  }

  // Create new conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convError || !conversation) {
    console.error("[DM Automation] Failed to create conversation:", convError);
    return null;
  }

  // Add participants
  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversation.id, user_id: adminId, is_admin: true },
      { conversation_id: conversation.id, user_id: memberId, is_admin: false },
    ]);

  if (partError) {
    console.error("[DM Automation] Failed to add participants:", partError);
    return null;
  }

  return conversation.id;
}

/**
 * Send an automated DM
 */
async function sendAutomatedMessage(
  automation: AutomationRecord,
  context: TriggerContext
): Promise<{ success: boolean; messageId?: string; conversationId?: string; error?: string }> {
  const supabase = createAdminClientInstance();

  // Get sender (automation sender or first admin)
  let senderId: string | null = automation.sender_id;
  if (!senderId) {
    const { data: admin } = await supabase
      .from("profiles")
      .select("id")
      .eq("is_admin", true)
      .limit(1)
      .single();

    if (!admin) {
      return { success: false, error: "No admin found to send message" };
    }
    senderId = admin.id;
  }

  // At this point senderId is guaranteed to be non-null
  const validSenderId = senderId as string;

  // Get or create conversation
  const conversationId = await getOrCreateConversation(validSenderId, context.memberId);
  if (!conversationId) {
    return { success: false, error: "Failed to create conversation" };
  }

  // Process message template
  const messageContent = processTemplate(automation.message_template, context);

  // Send message
  const { data: message, error: msgError } = await supabase
    .from("direct_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: validSenderId,
      content: messageContent,
    })
    .select("id")
    .single();

  if (msgError || !message) {
    console.error("[DM Automation] Failed to send message:", msgError);
    return { success: false, error: msgError?.message || "Failed to send message" };
  }

  return { success: true, messageId: message.id, conversationId };
}

/**
 * Check if automation has already been triggered for this context
 */
async function hasAlreadyTriggered(
  automationId: string,
  memberId: string,
  contextKey?: string
): Promise<boolean> {
  const supabase = createAdminClientInstance();

  let query = supabase
    .from("dm_automation_logs")
    .select("id")
    .eq("automation_id", automationId)
    .eq("recipient_id", memberId)
    .in("status", ["sent", "pending"]);

  if (contextKey) {
    query = query.eq("trigger_data->>context_key", contextKey);
  }

  const { data } = await query.limit(1).single();
  return !!data;
}

/**
 * Get member details for template processing
 */
async function getMemberDetails(memberId: string): Promise<{ name: string; firstName: string; daysSinceJoin: number } | null> {
  const supabase = createAdminClientInstance();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, first_name, created_at")
    .eq("id", memberId)
    .single();

  if (!profile) return null;

  const daysSinceJoin = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    name: profile.full_name || profile.first_name || "there",
    firstName: profile.first_name || profile.full_name?.split(" ")[0] || "there",
    daysSinceJoin,
  };
}

/**
 * Main function to trigger automations
 */
export async function triggerAutomation(
  triggerType: AutomationTrigger,
  context: TriggerContext
): Promise<void> {
  console.log(`[DM Automation] Triggering ${triggerType} for member ${context.memberId}`);

  const supabase = createAdminClientInstance();

  // Get enabled automations for this trigger type
  const { data: automations, error } = await supabase
    .from("dm_automations")
    .select("*")
    .eq("trigger_type", triggerType)
    .eq("is_enabled", true);

  if (error || !automations || automations.length === 0) {
    console.log(`[DM Automation] No enabled automations for trigger: ${triggerType}`);
    return;
  }

  // Get member details for template
  const memberDetails = await getMemberDetails(context.memberId);
  if (!memberDetails) {
    console.error(`[DM Automation] Member not found: ${context.memberId}`);
    return;
  }

  const fullContext: TriggerContext = {
    ...context,
    memberName: memberDetails.name,
    memberFirstName: memberDetails.firstName,
    daysSinceJoin: memberDetails.daysSinceJoin,
  };

  for (const automation of automations as AutomationRecord[]) {
    // Check if specific product matches (for purchase_specific)
    if (
      automation.trigger_type === "purchase_specific" &&
      automation.trigger_config?.product_id &&
      automation.trigger_config.product_id !== context.productId
    ) {
      continue;
    }

    // Check for course-specific triggers
    if (
      automation.trigger_config?.product_id &&
      ["course_started", "course_progress_25", "course_progress_50", "course_progress_75", "course_completed"].includes(automation.trigger_type) &&
      automation.trigger_config.product_id !== context.productId
    ) {
      continue;
    }

    // Check if already triggered
    const contextKey = context.contextKey || `${triggerType}_${context.productId || "general"}`;
    if (await hasAlreadyTriggered(automation.id, context.memberId, contextKey)) {
      console.log(`[DM Automation] Already triggered ${automation.name} for member ${context.memberId}`);
      continue;
    }

    // Create log entry
    const scheduledFor = automation.delay_minutes > 0
      ? new Date(Date.now() + automation.delay_minutes * 60 * 1000)
      : new Date();

    const { data: logEntry, error: logError } = await supabase
      .from("dm_automation_logs")
      .insert({
        automation_id: automation.id,
        recipient_id: context.memberId,
        trigger_data: { ...fullContext, context_key: contextKey },
        status: automation.delay_minutes > 0 ? "pending" : "pending",
        scheduled_for: scheduledFor.toISOString(),
      })
      .select("id")
      .single();

    if (logError) {
      console.error(`[DM Automation] Failed to create log entry:`, logError);
      continue;
    }

    // If no delay, send immediately
    if (automation.delay_minutes === 0) {
      const result = await sendAutomatedMessage(automation, fullContext);

      // Update log
      await supabase
        .from("dm_automation_logs")
        .update({
          status: result.success ? "sent" : "failed",
          conversation_id: result.conversationId,
          message_id: result.messageId,
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.error,
        })
        .eq("id", logEntry?.id);

      console.log(
        `[DM Automation] ${result.success ? "Sent" : "Failed"} ${automation.name} to member ${context.memberId}`
      );
    } else {
      console.log(
        `[DM Automation] Scheduled ${automation.name} for member ${context.memberId} at ${scheduledFor}`
      );
    }
  }
}

/**
 * Process pending scheduled automations (called by cron job)
 */
export async function processPendingAutomations(): Promise<number> {
  const supabase = createAdminClientInstance();

  // Get pending logs that are due
  const { data: pendingLogs, error } = await supabase
    .from("dm_automation_logs")
    .select(`
      *,
      automation:dm_automations(*)
    `)
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .limit(50);

  if (error || !pendingLogs) {
    console.error("[DM Automation] Error fetching pending logs:", error);
    return 0;
  }

  let processed = 0;

  for (const log of pendingLogs) {
    const automation = log.automation as AutomationRecord;
    if (!automation) continue;

    const context = log.trigger_data as TriggerContext;
    const result = await sendAutomatedMessage(automation, context);

    await supabase
      .from("dm_automation_logs")
      .update({
        status: result.success ? "sent" : "failed",
        conversation_id: result.conversationId,
        message_id: result.messageId,
        sent_at: result.success ? new Date().toISOString() : null,
        error_message: result.error,
      })
      .eq("id", log.id);

    processed++;
  }

  return processed;
}

// Convenience functions for specific triggers
export const triggerWelcome = (memberId: string) =>
  triggerAutomation("welcome", { memberId });

export const triggerPurchase = (memberId: string, productId: string, productName: string) =>
  triggerAutomation("purchase", { memberId, productId, productName, contextKey: `purchase_${productId}` });

export const triggerCourseStarted = (memberId: string, productId: string, productName: string) =>
  triggerAutomation("course_started", { memberId, productId, productName, contextKey: `course_started_${productId}` });

export const triggerCourseProgress = (memberId: string, productId: string, productName: string, percent: number) => {
  const triggerType =
    percent >= 75 ? "course_progress_75" :
    percent >= 50 ? "course_progress_50" :
    percent >= 25 ? "course_progress_25" : null;

  if (!triggerType) return;

  triggerAutomation(triggerType, {
    memberId,
    productId,
    productName,
    progressPercent: percent,
    contextKey: `${triggerType}_${productId}`,
  });
};

export const triggerCourseCompleted = (memberId: string, productId: string, productName: string) =>
  triggerAutomation("course_completed", { memberId, productId, productName, contextKey: `course_completed_${productId}` });

export const triggerFirstCommunityPost = (memberId: string) =>
  triggerAutomation("first_community_post", { memberId });
