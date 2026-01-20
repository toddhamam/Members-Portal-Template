"use client";

import { useEffect, useState, memo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProducts } from "@/lib/hooks/useProducts";
import { useProgress } from "@/lib/hooks/useProgress";
import { ProductCard } from "@/components/portal/ProductCard";
import { ProgressBar } from "@/components/portal/ProgressBar";
import type { ProductWithAccess } from "@/lib/supabase/types";

const WelcomeCard = memo(function WelcomeCard({ name }: { name: string }) {
  const firstName = name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] rounded-xl p-8 text-white">
      <h1 className="text-3xl font-semibold mb-2 font-serif">
        {greeting}, {firstName}!
      </h1>
      <p className="text-[#9ca3af]">
        Welcome to your Inner Wealth Initiate member portal. Access your products and track your progress below.
      </p>
    </div>
  );
});

const ContinueLearningCard = memo(function ContinueLearningCard({ product, progress }: { product: ProductWithAccess; progress: number }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-xl p-6 hover:border-[#d4a574] transition-colors">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-lg bg-gradient-to-b from-[#d4a574] to-[#b8956c] flex-shrink-0 flex items-center justify-center overflow-hidden">
          {product.thumbnail_url ? (
            <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-serif">{product.name.charAt(0)}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#222222] mb-1 truncate">{product.name}</h3>
          <div className="mb-2">
            <ProgressBar progress={progress} size="sm" />
          </div>
          <p className="text-sm text-[#6b7280]">{progress}% complete</p>
        </div>

        {/* Action */}
        <Link
          href={`/portal/products/${product.slug}`}
          className="flex-shrink-0 bg-[#222222] hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Continue
        </Link>
      </div>
    </div>
  );
});

function EmptyState() {
  return (
    <div className="text-center py-12 bg-[#f5f3ef] rounded-xl">
      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e5e7eb]">
        <svg className="w-8 h-8 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#222222] mb-2">No products yet</h3>
      <p className="text-[#6b7280] mb-4">
        You haven&apos;t purchased any products yet. Browse our offerings to get started.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-[#222222] hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors tracking-wide"
      >
        Browse Products
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { products, isLoading: productsLoading } = useProducts();
  const { getAllProductsProgress } = useProgress();

  const [productProgress, setProductProgress] = useState<Record<string, number>>({});
  const [progressLoading, setProgressLoading] = useState(true);

  const ownedProducts = products.filter((p) => p.is_owned);
  const lockedProducts = products.filter((p) => !p.is_owned);

  // Fetch progress for all owned products in a single batch (2 queries instead of N*2)
  useEffect(() => {
    async function fetchProgress() {
      if (ownedProducts.length === 0) {
        setProgressLoading(false);
        return;
      }

      const productIds = ownedProducts.map((p) => p.id);
      const progressMap = await getAllProductsProgress(productIds);
      setProductProgress(progressMap);
      setProgressLoading(false);
    }

    if (!productsLoading) {
      fetchProgress();
    }
  }, [ownedProducts, productsLoading, getAllProductsProgress]);

  // Find in-progress product for "Continue Learning" (only when progress is loaded)
  const inProgressProduct = !progressLoading
    ? ownedProducts.find((p) => productProgress[p.id] > 0 && productProgress[p.id] < 100)
    : null;

  // Progressive rendering: show each section as its data arrives
  return (
    <div className="space-y-8">
      {/* Welcome Card - renders immediately when auth ready, skeleton otherwise */}
      {authLoading ? (
        <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />
      ) : (
        <WelcomeCard name={profile?.full_name || profile?.first_name || ""} />
      )}

      {/* Continue Learning - only shows when progress is loaded and there's an in-progress product */}
      {!progressLoading && inProgressProduct && (
        <section>
          <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Continue Learning</h2>
          <ContinueLearningCard
            product={inProgressProduct}
            progress={productProgress[inProgressProduct.id] || 0}
          />
        </section>
      )}

      {/* My Products - renders when products are ready, shows progress skeletons if progress still loading */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#222222] font-serif">My Products</h2>
          <Link
            href="/portal/products"
            className="text-sm text-[#ee5d0b] hover:text-[#d54d00] font-medium"
          >
            View All
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : ownedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedProducts.slice(0, 3).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                progress={progressLoading ? undefined : productProgress[product.id] || 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Available Products (Locked) - renders when products are ready */}
      {!productsLoading && lockedProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Unlock More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedProducts.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
