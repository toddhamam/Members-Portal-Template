"use client";

import { memo } from "react";
import Link from "next/link";
import type { ProductWithAccess } from "@/lib/supabase/types";

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

interface ProductCardProps {
  product: ProductWithAccess;
  progress?: number;
  showPrice?: boolean;
}

export const ProductCard = memo(function ProductCard({ product, progress = 0, showPrice = true }: ProductCardProps) {
  const isOwned = product.is_owned;
  // Use portal_price_cents for unlock pricing (falls back to price_cents if not set)
  const displayPrice = product.portal_price_cents ?? product.price_cents;
  const priceFormatted = displayPrice > 0
    ? `$${(displayPrice / 100).toFixed(2)}`
    : "Free";

  return (
    <div className={`relative rounded-xl overflow-hidden border transition-all ${
      isOwned
        ? "bg-white border-[#e5e7eb] hover:border-[#d4a574] hover:shadow-md"
        : "bg-[#f5f3ef] border-[#e5e7eb]"
    }`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-b from-[#d4a574] to-[#b8956c]">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white text-4xl font-serif">{product.name.charAt(0)}</span>
          </div>
        )}

        {/* Lock Overlay for non-owned products */}
        {!isOwned && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center">
              <LockIcon className="w-10 h-10 text-white/80 mx-auto mb-2" />
              <span className="text-white/90 font-medium">Locked</span>
            </div>
          </div>
        )}

        {/* Owned Badge */}
        {isOwned && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckIcon className="w-3 h-3" />
            Owned
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#222222] mb-1 line-clamp-2">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-[#6b7280] mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Progress Bar (only for owned products) */}
        {isOwned && progress > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-[#6b7280] mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d4a574] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {isOwned ? (
          <Link
            href={`/portal/products/${product.slug}`}
            className="block w-full text-center bg-[#222222] hover:bg-black text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Continue Learning
          </Link>
        ) : (
          <div className="flex items-center justify-between">
            {showPrice && (
              <span className="text-lg font-semibold text-[#ee5d0b]">{priceFormatted}</span>
            )}
            <Link
              href={`/portal/products/${product.slug}`}
              className="bg-[#222222] hover:bg-black text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Unlock Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
});
