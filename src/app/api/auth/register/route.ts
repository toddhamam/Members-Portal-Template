import { NextRequest, NextResponse } from "next/server";
import { createAdminClientInstance } from "@/lib/supabase/server";
import { triggerWelcome } from "@/lib/dm-automation";

// This endpoint allows free user registration without a purchase
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const emailLower = email.toLowerCase().trim();
    const fullNameTrimmed = fullName.trim();

    // Parse name into first and last
    const nameParts = fullNameTrimmed.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const supabase = createAdminClientInstance();

    // Check if user already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from("profiles")
      .select("id, email")
      .ilike("email", emailLower)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw lookupError;
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 400 }
      );
    }

    // Create new auth user with password
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: emailLower,
      password,
      email_confirm: true, // Auto-confirm for free registration
      user_metadata: {
        full_name: fullNameTrimmed,
      },
    });

    if (createError) {
      console.error("[Register] Failed to create user:", createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // Update profile with name (trigger should have created the profile)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullNameTrimmed,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", newUser.user.id);

    if (profileError) {
      console.error("[Register] Failed to update profile:", profileError);
      // Non-critical - user was created, just profile update failed
    }

    // Trigger welcome DM automation (non-critical)
    try {
      await triggerWelcome(newUser.user.id);
    } catch (dmError) {
      console.error("[Register] Failed to trigger welcome DM (non-critical):", dmError);
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user.id,
      message: "Account created successfully"
    });
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
