import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClientInstance } from "@/lib/supabase/server";

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
  product_type: string;
}

interface ProductData {
  name: string;
  price_cents: number;
  product_type: string;
}

interface PurchaseWithProduct {
  id: string;
  purchased_at: string;
  products: ProductData;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 });
  }

  try {
    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer_details?.email) {
      return NextResponse.json({ error: "No email found" }, { status: 404 });
    }

    const email = session.customer_details.email;
    const emailLower = email.toLowerCase();
    const name = session.customer_details.name || "";

    // Query Supabase for user's purchases
    const supabase = createAdminClientInstance();

    // Find user by email (case-insensitive search)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", emailLower)
      .single();

    if (profileError) {
      console.error("[session-email] Profile lookup error:", profileError.message, { email: emailLower });
    }

    if (!profile) {
      // User not found yet - return just email/name with empty order
      // This might happen if webhook hasn't processed yet
      console.log("[session-email] No profile found for email:", emailLower);
      return NextResponse.json({
        email,
        name,
        items: [],
        total: "0.00",
      });
    }

    console.log("[session-email] Found profile:", profile.id, "for email:", emailLower);

    // Get all purchases for this user with product details
    const { data: purchases, error: purchasesError } = await supabase
      .from("user_purchases")
      .select(`
        id,
        purchased_at,
        products (
          name,
          price_cents,
          product_type
        )
      `)
      .eq("user_id", profile.id)
      .eq("status", "active")
      .order("purchased_at", { ascending: true });

    if (purchasesError) {
      console.error("[session-email] Failed to fetch purchases:", purchasesError);
      return NextResponse.json({
        email,
        name,
        items: [],
        total: "0.00",
      });
    }

    console.log("[session-email] Found purchases:", purchases?.length || 0);

    // Transform purchases into order items (filter out any with missing product data)
    const typedPurchases = (purchases || []) as PurchaseWithProduct[];
    const validPurchases = typedPurchases.filter((purchase) => purchase.products != null);

    if (validPurchases.length !== typedPurchases.length) {
      console.warn("[session-email] Some purchases have missing product data:",
        typedPurchases.length - validPurchases.length, "missing");
    }

    const items: OrderItem[] = validPurchases.map((purchase) => {
      const product = purchase.products;
      return {
        title: product.name,
        quantity: 1,
        price: (product.price_cents / 100).toFixed(2),
        product_type: product.product_type,
      };
    });

    // Calculate total
    const totalCents = validPurchases.reduce((sum, purchase) => {
      return sum + (purchase.products.price_cents || 0);
    }, 0);

    return NextResponse.json({
      email,
      name,
      items,
      total: (totalCents / 100).toFixed(2),
    });
  } catch (error) {
    console.error("Failed to retrieve session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session" },
      { status: 500 }
    );
  }
}
