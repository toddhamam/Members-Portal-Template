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
    const name = session.customer_details.name || "";

    // Query Supabase for user's purchases
    const supabase = createAdminClientInstance();

    // Find user by email
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (!profile) {
      // User not found yet - return just email/name with empty order
      // This might happen if webhook hasn't processed yet
      return NextResponse.json({
        email,
        name,
        items: [],
        total: "0.00",
      });
    }

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
      console.error("Failed to fetch purchases:", purchasesError);
      return NextResponse.json({
        email,
        name,
        items: [],
        total: "0.00",
      });
    }

    // Transform purchases into order items
    const typedPurchases = (purchases || []) as PurchaseWithProduct[];
    const items: OrderItem[] = typedPurchases.map((purchase) => {
      const product = purchase.products;
      return {
        title: product.name,
        quantity: 1,
        price: (product.price_cents / 100).toFixed(2),
        product_type: product.product_type,
      };
    });

    // Calculate total
    const totalCents = typedPurchases.reduce((sum, purchase) => {
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
