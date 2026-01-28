import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClientInstance } from "@/lib/supabase/server";

/**
 * GET /api/admin/canned-responses
 * List canned responses for current admin
 */
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = adminSupabase
      .from("dm_canned_responses")
      .select("*")
      .or(`is_shared.eq.true,created_by.eq.${user.id}`)
      .order("usage_count", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data: responses, error } = await query;

    if (error) {
      console.error("[Canned Responses API] Error:", error);
      return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("[Canned Responses API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/canned-responses
 * Create a new canned response
 */
export async function POST(request: NextRequest) {
  try {
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
    const { title, content, shortcut, category, is_shared } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const { data: response, error } = await adminSupabase
      .from("dm_canned_responses")
      .insert({
        title,
        content,
        shortcut: shortcut || null,
        category: category || null,
        is_shared: is_shared ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[Canned Responses API] Create error:", error);
      return NextResponse.json({ error: "Failed to create response" }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("[Canned Responses API] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
