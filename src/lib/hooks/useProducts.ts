"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Product, ProductWithAccess } from "@/lib/supabase/types";

export function useProducts() {
  const [products, setProducts] = useState<ProductWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch all active products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (productsError) throw productsError;

      // If user is logged in, fetch their purchases
      let purchases: { product_id: string }[] = [];
      if (user) {
        const { data: purchasesData } = await supabase
          .from("user_purchases")
          .select("product_id")
          .eq("user_id", user.id)
          .eq("status", "active");
        purchases = purchasesData || [];
      }

      // Combine products with ownership status
      const purchasedProductIds = new Set(purchases.map((p) => p.product_id));
      const productsWithAccess: ProductWithAccess[] = (productsData || []).map(
        (product: Product) => ({
          ...product,
          is_owned: purchasedProductIds.has(product.id),
        })
      );

      setProducts(productsWithAccess);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch products"));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const [product, setProduct] = useState<ProductWithAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Fetch product by slug
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (productError) throw productError;

        // Check if user owns this product
        let isOwned = false;
        if (user && productData) {
          const { data: purchase } = await supabase
            .from("user_purchases")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", productData.id)
            .eq("status", "active")
            .single();
          isOwned = !!purchase;
        }

        setProduct(productData ? { ...productData, is_owned: isOwned } : null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch product"));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, supabase]);

  return { product, isLoading, error };
}
