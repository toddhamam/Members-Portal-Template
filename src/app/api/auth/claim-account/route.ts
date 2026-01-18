import { NextRequest, NextResponse } from "next/server";
import { createAdminClientInstance } from "@/lib/supabase/server";

// This endpoint allows a user to claim an account that was created for them
// during purchase (email-only, no password)
export async function POST(request: NextRequest) {
  try {
    const { email, password, sessionId } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClientInstance();

    // Check if user exists
    const { data: existingUsers, error: lookupError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (lookupError && lookupError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw lookupError;
    }

    if (existingUsers) {
      // User exists, update their password using admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUsers.id,
        { password }
      );

      if (updateError) {
        console.error("Failed to update user password:", updateError);
        return NextResponse.json(
          { error: "Failed to set password. Please try the reset password flow." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, userId: existingUsers.id });
    }

    // User doesn't exist, create new account
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since they came from a purchase
    });

    if (createError) {
      console.error("Failed to create user:", createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (error) {
    console.error("Claim account error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
