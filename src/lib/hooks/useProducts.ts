"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Product, ProductWithAccess } from "@/lib/supabase/types";

export function useProducts() {
  const { user } = useAuth(); // Get user from context instead of calling getUser()
  const [products, setProducts] = useState<ProductWithAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch products and purchases in parallel using Promise.all
      const [productsResult, purchasesResult] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .order("sort_order"),
        user
          ? supabase
              .from("user_purchases")
              .select("product_id")
              .eq("user_id", user.id)
              .eq("status", "active")
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (productsResult.error) throw productsResult.error;

      // Combine products with ownership status
      // Lead magnets are accessible to all authenticated users
      const purchasedProductIds = new Set(
        (purchasesResult.data || []).map((p: { product_id: string }) => p.product_id)
      );
      const productsWithAccess: ProductWithAccess[] = (productsResult.data || []).map(
        (product: Product) => ({
          ...product,
          is_owned: purchasedProductIds.has(product.id) || product.is_lead_magnet,
        })
      );

      setProducts(productsWithAccess);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch products"));
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(slug: string) {
  const { user } = useAuth(); // Get user from context instead of calling getUser()
  const [product, setProduct] = useState<ProductWithAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch product by slug
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (productError) throw productError;

      // Check if user owns this product (using user from context)
      // Lead magnets are accessible to all authenticated users
      let isOwned = false;
      if (productData) {
        if (productData.is_lead_magnet) {
          isOwned = true;
        } else if (user) {
          const { data: purchase } = await supabase
            .from("user_purchases")
            .select("id")
            .eq("user_id", user.id)
            .eq("product_id", productData.id)
            .eq("status", "active")
            .single();
          isOwned = !!purchase;
        }
      }

      setProduct(productData ? { ...productData, is_owned: isOwned } : null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch product"));
    } finally {
      setIsLoading(false);
    }
  }, [slug, user, supabase]);

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug, fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
}
