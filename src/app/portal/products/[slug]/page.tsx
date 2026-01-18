"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProduct } from "@/lib/hooks/useProducts";
import { ModuleAccordion } from "@/components/portal/ModuleAccordion";
import { ProgressBar } from "@/components/portal/ProgressBar";
import type { ModuleWithLessons, LessonProgress } from "@/lib/supabase/types";

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { product, isLoading: productLoading, error: productError } = useProduct(slug);

  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  const supabase = createClient();

  // Fetch modules and lessons for this product
  useEffect(() => {
    async function fetchModulesAndProgress() {
      if (!product) return;

      // Fetch modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select(`
          *,
          lessons (*)
        `)
        .eq("product_id", product.id)
        .eq("is_published", true)
        .order("sort_order");

      if (modulesError) {
        console.error("Failed to fetch modules:", modulesError);
        setModulesLoading(false);
        return;
      }

      // Sort lessons within each module
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sortedModules = (modulesData || []).map((module: any) => ({
        ...module,
        lessons: (module.lessons || []).sort(
          (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
      }));

      setModules(sortedModules);

      // Fetch user progress if owned
      if (product.is_owned) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const lessonIds = sortedModules.flatMap((m: any) => m.lessons.map((l: { id: string }) => l.id));

          if (lessonIds.length > 0) {
            const { data: progressData } = await supabase
              .from("lesson_progress")
              .select("*")
              .eq("user_id", user.id)
              .in("lesson_id", lessonIds);

            const progressById: Record<string, LessonProgress> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (progressData || []).forEach((p: any) => {
              progressById[p.lesson_id] = p;
            });
            setProgressMap(progressById);

            // Calculate overall progress
            const totalLessons = lessonIds.length;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const completedLessons = (progressData || []).filter((p: any) => p.completed_at).length;
            setOverallProgress(totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0);
          }
        }
      }

      setModulesLoading(false);
    }

    if (product) {
      fetchModulesAndProgress();
    }
  }, [product, supabase]);

  const isLoading = productLoading || modulesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-48 bg-gray-200 rounded-xl" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[#222222] mb-2 font-serif">Product Not Found</h2>
        <p className="text-[#6b7280] mb-4">The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/portal/products" className="text-[#ee5d0b] hover:text-[#d54d00] font-medium">
          Back to Products
        </Link>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = Object.values(progressMap).filter((p) => p.completed_at).length;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/portal/products"
        className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#222222] transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Product Header */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Thumbnail */}
          <div className="md:w-64 h-48 md:h-auto bg-gradient-to-b from-[#d4a574] to-[#b8956c] flex-shrink-0 flex items-center justify-center">
            {product.thumbnail_url ? (
              <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-6xl font-serif">{product.name.charAt(0)}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6">
            <h1 className="text-2xl font-semibold text-[#222222] mb-2 font-serif">{product.name}</h1>

            {product.description && (
              <p className="text-[#4b5563] mb-4">{product.description}</p>
            )}

            {product.is_owned ? (
              <div className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#4b5563]">Your Progress</span>
                    <span className="font-medium text-[#222222]">
                      {completedLessons}/{totalLessons} lessons complete
                    </span>
                  </div>
                  <ProgressBar progress={overallProgress} size="lg" />
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-[#6b7280]">Modules:</span>{" "}
                    <span className="font-medium text-[#222222]">{modules.length}</span>
                  </div>
                  <div>
                    <span className="text-[#6b7280]">Lessons:</span>{" "}
                    <span className="font-medium text-[#222222]">{totalLessons}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#6b7280]">
                  <LockIcon className="w-5 h-5" />
                  <span>This product is locked</span>
                </div>
                <Link
                  href={`/?product=${product.slug}`}
                  className="bg-[#222222] hover:bg-black text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Unlock for ${(product.price_cents / 100).toFixed(2)}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div>
        <h2 className="text-lg font-semibold text-[#222222] mb-4 font-serif">Course Content</h2>

        {modules.length > 0 ? (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <ModuleAccordion
                key={module.id}
                module={module}
                productSlug={slug}
                isOwned={product.is_owned}
                progressMap={progressMap}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#f5f3ef] rounded-xl">
            <p className="text-[#6b7280]">No content available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
