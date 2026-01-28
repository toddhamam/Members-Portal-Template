import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClientInstance } from "@/lib/supabase/server";

/**
 * GET /api/admin/automations
 * List all DM automations
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check auth and admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClientInstance();

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all automations with stats
    const { data: automations, error } = await adminSupabase
      .from("dm_automations")
      .select(`
        *,
        sent_count:dm_automation_logs(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Automations API] Error:", error);
      return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
    }

    // Get sent counts
    const { data: stats } = await adminSupabase
      .from("dm_automation_logs")
      .select("automation_id, status")
      .eq("status", "sent");

    interface LogStat {
      automation_id: string;
      status: string;
    }

    const sentCounts = new Map<string, number>();
    (stats as LogStat[] | null)?.forEach((s: LogStat) => {
      sentCounts.set(s.automation_id, (sentCounts.get(s.automation_id) || 0) + 1);
    });

    interface AutomationRecord {
      id: string;
      name: string;
      description: string | null;
      trigger_type: string;
      trigger_config: Record<string, string>;
      message_template: string;
      sender_id: string | null;
      is_enabled: boolean;
      delay_minutes: number;
      created_at: string;
      updated_at: string;
      created_by: string | null;
    }

    const automationsWithStats = (automations as AutomationRecord[] | null)?.map((a: AutomationRecord) => ({
      ...a,
      sent_count: sentCounts.get(a.id) || 0,
    })) || [];

    return NextResponse.json({ automations: automationsWithStats });
  } catch (error) {
    console.error("[Automations API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/automations
 * Create a new automation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth and admin status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClientInstance();

    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { name, description, trigger_type, trigger_config, message_template, sender_id, is_enabled, delay_minutes } = body;

    if (!name || !trigger_type || !message_template) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: automation, error } = await adminSupabase
      .from("dm_automations")
      .insert({
        name,
        description,
        trigger_type,
        trigger_config: trigger_config || {},
        message_template,
        sender_id,
        is_enabled: is_enabled ?? false,
        delay_minutes: delay_minutes ?? 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[Automations API] Create error:", error);
      return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("[Automations API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
