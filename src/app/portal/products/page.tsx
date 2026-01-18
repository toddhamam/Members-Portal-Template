"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useProgress } from "@/lib/hooks/useProgress";
import { ProductCard } from "@/components/portal/ProductCard";

type FilterType = "all" | "owned" | "available";

export default function ProductsPage() {
  const { products, isLoading } = useProducts();
  const { getProductProgress } = useProgress();

  const [filter, setFilter] = useState<FilterType>("all");
  const [productProgress, setProductProgress] = useState<Record<string, number>>({});
  const [progressLoading, setProgressLoading] = useState(true);

  const ownedProducts = products.filter((p) => p.is_owned);
  const lockedProducts = products.filter((p) => !p.is_owned);

  // Fetch progress for owned products
  useEffect(() => {
    async function fetchProgress() {
      if (ownedProducts.length === 0) {
        setProgressLoading(false);
        return;
      }

      const progressMap: Record<string, number> = {};
      for (const product of ownedProducts) {
        progressMap[product.id] = await getProductProgress(product.id);
      }
      setProductProgress(progressMap);
      setProgressLoading(false);
    }

    if (!isLoading) {
      fetchProgress();
    }
  }, [ownedProducts, isLoading, getProductProgress]);

  const filteredProducts =
    filter === "all"
      ? products
      : filter === "owned"
      ? ownedProducts
      : lockedProducts;

  if (isLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#222222] font-serif">My Products</h1>

        {/* Filter Tabs */}
        <div className="flex bg-white rounded-lg p-1 border border-[#e5e7eb]">
          {[
            { value: "all" as FilterType, label: "All" },
            { value: "owned" as FilterType, label: `Owned (${ownedProducts.length})` },
            { value: "available" as FilterType, label: `Available (${lockedProducts.length})` },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.value
                  ? "bg-[#222222] text-white"
                  : "text-[#4b5563] hover:text-[#222222]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              progress={productProgress[product.id] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#f5f3ef] rounded-xl">
          <p className="text-[#6b7280]">
            {filter === "owned"
              ? "You haven't purchased any products yet."
              : filter === "available"
              ? "You've unlocked all available products!"
              : "No products available."}
          </p>
        </div>
      )}
    </div>
  );
}
