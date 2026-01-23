"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MarketingHeader, MarketingFooter, MarketingProductCard } from "@/components/marketing";
import type { Product } from "@/lib/supabase/types";

// Note: Metadata must be in a separate file for client components
// Create src/app/products/metadata.ts if needed, or use generateMetadata in a server component

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-[#1a1a1a]">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4 sm:mb-6">
            Our Products
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Discover our collection of digital guides, programs, and resources designed to help you
            clear fears, overcome blocks, and align with your authentic self.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#252525] rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-700" />
                  <div className="p-4 sm:p-6 space-y-3">
                    <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/4" />
                    <div className="h-5 sm:h-6 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 sm:h-4 bg-gray-700 rounded w-full hidden sm:block" />
                    <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
                      <div className="h-6 sm:h-8 bg-gray-700 rounded w-16" />
                      <div className="h-10 sm:h-8 bg-gray-700 rounded w-full sm:w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-base sm:text-lg">No products available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <MarketingProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#252525]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white mb-3 sm:mb-4">
            Ready to Begin Your Transformation?
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6 sm:mb-8">
            Start with our flagship product, the Resistance Mapping Guide, and learn to
            identify and clear the patterns keeping you stuck.
          </p>
          <a
            href="/product"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-[#ee5d0b] hover:bg-[#d54d00] active:bg-[#d54d00] text-white font-medium rounded transition-colors text-sm sm:text-base"
          >
            Get Started with Resistance Mapping
          </a>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
