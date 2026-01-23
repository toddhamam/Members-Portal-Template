import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/supabase/types";

interface MarketingProductCardProps {
  product: Product;
}

export function MarketingProductCard({ product }: MarketingProductCardProps) {
  const price = product.price_cents / 100;
  const formattedPrice = price === 0 ? "Free" : `$${price.toFixed(2)}`;

  // All products link to the main product page for funnel optimization
  const productUrl = "/product";

  return (
    <div className="bg-[#252525] rounded-lg overflow-hidden group">
      {/* Thumbnail - slightly taller on mobile for better visual */}
      <div className="relative aspect-[4/3] sm:aspect-[4/3] bg-gradient-to-br from-[#d4a574] to-[#b8956c]">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <span className="text-white/60 text-base sm:text-lg font-serif italic text-center">
              {product.name}
            </span>
          </div>
        )}
      </div>

      {/* Content - responsive padding */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Product Type Badge */}
        <div className="mb-2">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d4a574]">
            {product.product_type === "main"
              ? "Digital Guide"
              : product.product_type === "order_bump"
              ? "Add-on"
              : product.product_type === "upsell"
              ? "Program"
              : "Resource"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base sm:text-lg mb-2 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Description - hidden on very small screens */}
        {product.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2 hidden sm:block">
            {product.description}
          </p>
        )}

        {/* Price & CTA - stack on very small screens */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-white font-bold text-lg sm:text-xl">
            {formattedPrice}
          </span>
          <Link
            href={productUrl}
            className="inline-flex items-center justify-center px-4 py-2.5 sm:py-2 bg-[#ee5d0b] hover:bg-[#d54d00] active:bg-[#d54d00] text-white text-sm font-medium rounded transition-colors w-full sm:w-auto"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
