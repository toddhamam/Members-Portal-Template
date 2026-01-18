import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_details?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 404 });
    }

    return NextResponse.json({
      email: session.customer_details.email,
      name: session.customer_details.name || "",
    });
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
