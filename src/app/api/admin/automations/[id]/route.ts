import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClientInstance } from "@/lib/supabase/server";

/**
 * GET /api/admin/automations/[id]
 * Get a single automation with logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    // Get automation
    const { data: automation, error } = await adminSupabase
      .from("dm_automations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    // Get recent logs
    const { data: logs } = await adminSupabase
      .from("dm_automation_logs")
      .select(`
        *,
        recipient:profiles!dm_automation_logs_recipient_id_fkey(id, full_name, email)
      `)
      .eq("automation_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({ automation, logs: logs || [] });
  } catch (error) {
    console.error("[Automations API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/automations/[id]
 * Update an automation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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
    const allowedFields = ["name", "description", "trigger_type", "trigger_config", "message_template", "sender_id", "is_enabled", "delay_minutes"];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    const { data: automation, error } = await adminSupabase
      .from("dm_automations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Automations API] Update error:", error);
      return NextResponse.json({ error: "Failed to update automation" }, { status: 500 });
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error("[Automations API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/automations/[id]
 * Delete an automation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

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

    const { error } = await adminSupabase
      .from("dm_automations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Automations API] Delete error:", error);
      return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Automations API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
