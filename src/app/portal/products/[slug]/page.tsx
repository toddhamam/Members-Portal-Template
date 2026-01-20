"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useProduct } from "@/lib/hooks/useProducts";

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

function PlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

interface LessonLink {
  moduleSlug: string;
  lessonSlug: string;
}

interface ModuleSummary {
  id: string;
  slug: string;
  lessons: { id: string; slug: string; sort_order: number }[] | null;
}

interface ProgressSummary {
  lesson_id: string;
  completed_at: string | null;
  updated_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth(); // Get user from context
  const { product, isLoading: productLoading, error: productError } = useProduct(slug);

  const [stats, setStats] = useState({ modules: 0, lessons: 0, progress: 0 });
  const [firstLesson, setFirstLesson] = useState<LessonLink | null>(null);
  const [continueLesson, setContinueLesson] = useState<LessonLink | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const supabase = createClient();

  // Fetch lightweight stats and continue point
  useEffect(() => {
    async function fetchStats() {
      if (!product) return;

      try {
        // Fetch module and lesson counts
        const { data: modulesData } = await supabase
          .from("modules")
          .select(`
            id,
            slug,
            lessons (id, slug, sort_order)
          `)
          .eq("product_id", product.id)
          .eq("is_published", true)
          .order("sort_order");

        const modules = (modulesData || []) as ModuleSummary[];
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);

        // Find first lesson
        const firstModule = modules[0];
        const firstModuleLessons = firstModule?.lessons;
        if (firstModule && firstModuleLessons && firstModuleLessons.length > 0) {
          const sortedLessons = [...firstModuleLessons].sort((a, b) => a.sort_order - b.sort_order);
          setFirstLesson({
            moduleSlug: firstModule.slug,
            lessonSlug: sortedLessons[0].slug,
          });
        }

        // If owned, fetch progress and last viewed lesson (using user from context)
        if (product.is_owned && user) {
          // Get all lesson IDs for this product
          const lessonIds = modules.flatMap(m => m.lessons?.map(l => l.id) || []);

          if (lessonIds.length > 0) {
            // Fetch progress
            const { data: progressData } = await supabase
              .from("lesson_progress")
              .select("lesson_id, completed_at, updated_at")
              .eq("user_id", user.id)
              .in("lesson_id", lessonIds);

            const progress = (progressData || []) as ProgressSummary[];
            const completedCount = progress.filter(p => p.completed_at).length;
            const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

            setStats({
              modules: modules.length,
              lessons: totalLessons,
              progress: progressPercent,
            });

            // Find the most recently updated incomplete lesson, or fall back to first lesson
            if (progress.length > 0) {
              const incompleteLessons = progress
                .filter(p => !p.completed_at)
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

              if (incompleteLessons.length > 0) {
                // Find the lesson details for the most recent incomplete
                const lastLessonId = incompleteLessons[0].lesson_id;
                for (const module of modules) {
                  const lesson = module.lessons?.find(l => l.id === lastLessonId);
                  if (lesson) {
                    setContinueLesson({
                      moduleSlug: module.slug,
                      lessonSlug: lesson.slug,
                    });
                    break;
                  }
                }
              }
            }
          } else {
            setStats({ modules: modules.length, lessons: totalLessons, progress: 0 });
          }
        } else {
          setStats({ modules: modules.length, lessons: totalLessons, progress: 0 });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setStatsLoading(false);
      }
    }

    if (product) {
      fetchStats();
    }
  }, [product, user, supabase]);

  const targetLesson = continueLesson || firstLesson;

  // Show skeleton only while product is loading (progressive rendering)
  if (productLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-[400px] bg-gray-200 rounded-2xl" />
        <div className="h-32 bg-gray-200 rounded-xl" />
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/portal/products"
        className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#222222] transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Products
      </Link>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
        {/* Background Image */}
        {product.thumbnail_url && (
          <div className="absolute inset-0">
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-[#1a1a2e]/50" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-8 text-white/70">
            <div>
              <span className="text-2xl font-semibold text-white">{stats.modules}</span>
              <span className="ml-2">Modules</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <span className="text-2xl font-semibold text-white">{stats.lessons}</span>
              <span className="ml-2">Lessons</span>
            </div>
            {product.is_owned && stats.progress > 0 && (
              <>
                <div className="w-px h-8 bg-white/20" />
                <div>
                  <span className="text-2xl font-semibold text-white">{stats.progress}%</span>
                  <span className="ml-2">Complete</span>
                </div>
              </>
            )}
          </div>

          {/* CTA Button */}
          {product.is_owned ? (
            targetLesson ? (
              <Link
                href={`/portal/products/${slug}/modules/${targetLesson.moduleSlug}/lessons/${targetLesson.lessonSlug}`}
                className="inline-flex items-center gap-3 bg-white text-[#1a1a2e] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors text-lg shadow-lg"
              >
                <PlayIcon className="w-6 h-6" />
                {continueLesson ? "Continue Learning" : "Start Learning"}
              </Link>
            ) : (
              <div className="inline-flex items-center gap-3 bg-white/20 text-white/60 font-semibold px-8 py-4 rounded-xl text-lg cursor-not-allowed">
                <PlayIcon className="w-6 h-6" />
                Coming Soon
              </div>
            )
          ) : (
            <Link
              href={`/?product=${product.slug}`}
              className="inline-flex items-center gap-3 bg-[#ee5d0b] hover:bg-[#d54d00] text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg shadow-lg"
            >
              <LockIcon className="w-5 h-5" />
              Unlock for ${((product.portal_price_cents ?? product.price_cents) / 100).toFixed(2)}
            </Link>
          )}
        </div>
      </div>

      {/* Instructor Section */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Instructor Photo */}
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#d4a574] to-[#b8956c] flex-shrink-0 overflow-hidden shadow-md">
            <img
              src="/images/instructor/your-guide.png"
              alt="Your Guide"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-white text-3xl font-serif flex items-center justify-center w-full h-full">IW</span>';
              }}
            />
          </div>

          {/* Instructor Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-[#222222] font-serif mb-2">
              Your Guide
            </h3>
            <p className="text-[#4b5563] leading-relaxed">
              Welcome to this transformational journey. I&apos;m here to guide you through each step,
              helping you uncover and release the patterns that have been running beneath the surface.
              Take your time with each lesson—this is your space for deep inner work.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section (for owned products) */}
      {product.is_owned && stats.progress > 0 && stats.progress < 100 && (
        <div className="bg-[#f5f3ef] border border-[#e5e7eb] rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#4b5563] font-medium">Your Progress</span>
            <span className="text-[#222222] font-semibold">{stats.progress}% Complete</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#d4a574] to-[#b8956c] transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Completion Badge */}
      {product.is_owned && stats.progress === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-800 font-serif mb-2">
            Course Complete!
          </h3>
          <p className="text-green-700">
            Congratulations on completing this course. Feel free to revisit any lesson at any time.
          </p>
        </div>
      )}
    </div>
  );
}
