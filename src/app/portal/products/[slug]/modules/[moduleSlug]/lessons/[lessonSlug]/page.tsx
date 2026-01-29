"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/hooks/useProgress";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { VideoPlayer } from "@/components/portal/VideoPlayer";
import { AudioPlayer } from "@/components/portal/AudioPlayer";
import { DownloadButton } from "@/components/portal/DownloadButton";
import { CourseSidebar } from "@/components/portal/CourseSidebar";
import { MobileCourseNav } from "@/components/portal/MobileCourseNav";
import { LessonResources } from "@/components/portal/LessonResources";
import type { Lesson, Module, Product, LessonProgress, ModuleWithLessons, LessonResource } from "@/lib/supabase/types";

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

interface LessonData extends Lesson {
  module: Module & {
    product: Product;
    lessons: Lesson[];
  };
}

export default function LessonPage() {
  const params = useParams();
  const { slug: productSlug, moduleSlug, lessonSlug } = params as {
    slug: string;
    moduleSlug: string;
    lessonSlug: string;
  };

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [isOwned, setIsOwned] = useState(false);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [resources, setResources] = useState<LessonResource[]>([]);

  const { updateProgress, getProgress } = useProgress();
  const supabase = createClient();

  // Debounce progress updates to avoid too many writes (5 second minimum interval)
  const lastProgressUpdateRef = useRef<number>(0);

  // Find adjacent lessons for navigation (across all modules)
  const adjacentLessons = useCallback(() => {
    if (!modules.length || !lesson) return { prev: null, next: null, prevModule: null, nextModule: null };

    // Flatten all lessons with their module info
    const allLessons: { lesson: Lesson; module: Module }[] = [];
    modules.forEach((module) => {
      module.lessons.forEach((l) => {
        allLessons.push({ lesson: l, module });
      });
    });

    const currentIndex = allLessons.findIndex(
      (item) => item.lesson.slug === lessonSlug && item.module.slug === moduleSlug
    );

    return {
      prev: currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null,
      prevModule: currentIndex > 0 ? allLessons[currentIndex - 1].module : null,
      next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null,
      nextModule: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].module : null,
    };
  }, [modules, lesson, lessonSlug, moduleSlug]);

  // Fetch all data - optimized with parallel fetches and smart caching
  useEffect(() => {
    // Only reset lesson-specific state, preserve product/modules when navigating within same product
    setIsLoading(true);
    setLesson(null);
    setProgress(null);
    setResources([]);

    async function fetchData() {
      try {
        // Check if we need to fetch product/modules (skip if same product)
        let currentProduct = product;
        let currentModules = modules;

        if (!currentProduct || currentProduct.slug !== productSlug) {
          // Fetch product and user in parallel
          const [productResult, userResult] = await Promise.all([
            supabase
              .from("products")
              .select("*")
              .eq("slug", productSlug)
              .eq("is_active", true)
              .single(),
            supabase.auth.getUser()
          ]);

          if (productResult.error || !productResult.data) {
            console.error("Failed to fetch product:", productResult.error);
            setIsLoading(false);
            return;
          }

          currentProduct = productResult.data;
          setProduct(currentProduct);

          // Fetch modules and purchase status in parallel
          const [modulesResult, purchaseResult] = await Promise.all([
            supabase
              .from("modules")
              .select(`*, lessons (*)`)
              .eq("product_id", currentProduct!.id)
              .eq("is_published", true)
              .order("sort_order"),
            userResult.data.user
              ? supabase
                  .from("user_purchases")
                  .select("id")
                  .eq("user_id", userResult.data.user.id)
                  .eq("product_id", currentProduct!.id)
                  .eq("status", "active")
                  .single()
              : Promise.resolve({ data: null })
          ]);

          if (modulesResult.error) {
            console.error("Failed to fetch modules:", modulesResult.error);
            setIsLoading(false);
            return;
          }

          // Sort lessons within each module
          currentModules = (modulesResult.data || []).map((module: ModuleWithLessons) => ({
            ...module,
            lessons: (module.lessons || []).sort(
              (a: Lesson, b: Lesson) => a.sort_order - b.sort_order
            ),
          }));

          setModules(currentModules);
          // Lead magnets are accessible to all authenticated users
          setIsOwned(!!purchaseResult.data || currentProduct!.is_lead_magnet);
        }

        // Find current lesson from cached or fetched modules
        const currentModule = currentModules.find((m: ModuleWithLessons) => m.slug === moduleSlug);
        const currentLesson = currentModule?.lessons.find((l: Lesson) => l.slug === lessonSlug);

        if (!currentModule || !currentLesson || !currentProduct) {
          console.error("Lesson not found");
          setIsLoading(false);
          return;
        }

        setLesson({
          ...currentLesson,
          module: {
            ...currentModule,
            product: currentProduct,
            lessons: currentModule.lessons,
          },
        } as LessonData);

        // Fetch resources and progress in parallel
        const { data: { user } } = await supabase.auth.getUser();
        const lessonIds = currentModules.flatMap((m: ModuleWithLessons) =>
          m.lessons.map((l: Lesson) => l.id)
        );

        const [resourcesResult, progressResult] = await Promise.all([
          supabase
            .from("lesson_resources")
            .select("*")
            .eq("lesson_id", currentLesson.id)
            .eq("is_published", true)
            .order("sort_order"),
          user && lessonIds.length > 0
            ? supabase
                .from("lesson_progress")
                .select("*")
                .eq("user_id", user.id)
                .in("lesson_id", lessonIds)
            : Promise.resolve({ data: null })
        ]);

        setResources(resourcesResult.data || []);

        if (progressResult.data) {
          const progressById: Record<string, LessonProgress> = {};
          progressResult.data.forEach((p: LessonProgress) => {
            progressById[p.lesson_id] = p;
          });
          setProgressMap(progressById);

          // Set current lesson progress
          if (progressById[currentLesson.id]) {
            setProgress(progressById[currentLesson.id]);
          }
        }
      } catch (error) {
        console.error("Error fetching lesson data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSlug, moduleSlug, lessonSlug]);

  const handleToggleComplete = async () => {
    if (!lesson || !product) return;

    setIsCompleting(true);
    try {
      const newCompleted = !isCompleted;
      await updateProgress(lesson.id, { completed: newCompleted });
      const updatedProgress = {
        ...progress!,
        progress_percent: newCompleted ? 100 : (progress?.progress_percent || 0),
        completed_at: newCompleted ? new Date().toISOString() : null,
      } as LessonProgress;
      setProgress(updatedProgress);
      setProgressMap((prev) => ({
        ...prev,
        [lesson.id]: updatedProgress,
      }));

      // If lesson was just completed, check if the entire course is now complete
      if (newCompleted) {
        fetch('/api/portal/check-course-completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        }).catch((err) => {
          // Don't let this error affect the UI
          console.error('Error checking course completion:', err);
        });
      }
    } catch (err) {
      console.error("Failed to toggle completion:", err);
    }
    setIsCompleting(false);
  };

  const handleProgressUpdate = async (progressPercent: number, currentTime: number) => {
    if (!lesson) return;

    // Debounce: only update every 5 seconds to reduce database writes
    const now = Date.now();
    if (now - lastProgressUpdateRef.current < 5000) {
      return;
    }
    lastProgressUpdateRef.current = now;

    await updateProgress(lesson.id, {
      progress_percent: progressPercent,
      last_position_seconds: currentTime,
    });

    // Update local state
    setProgress((prev) => ({
      ...prev!,
      progress_percent: progressPercent,
      last_position_seconds: currentTime,
    } as LessonProgress));
  };

  const { prev, next, prevModule, nextModule } = adjacentLessons();
  const isCompleted = !!progress?.completed_at;
  // Access: user owns product, lesson is free preview, or product is a lead magnet
  const canAccess = isOwned || lesson?.is_free_preview || product?.is_lead_magnet;

  // Calculate overall progress for sidebar
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = Object.values(progressMap).filter((p) => p.completed_at).length;
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (isLoading) {
    return (
      <div className="-m-4 md:-m-6 overflow-hidden">
        {/* Mobile loading skeleton */}
        <div className="md:hidden bg-white border-b border-[#e5e7eb] p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-48 max-w-full" />
        </div>

        <div className="flex md:h-[calc(100vh-64px)]">
          {/* Desktop sidebar skeleton */}
          <div className="hidden md:block w-72 flex-shrink-0 bg-white border-r border-[#e5e7eb] animate-pulse">
            <div className="p-4 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-200 rounded" />
              <div className="space-y-2 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0 p-4 md:p-6 animate-pulse">
            <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
              <div className="h-8 bg-gray-200 rounded w-64 max-w-full" />
              <div className="h-48 sm:h-64 md:h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[#222222] mb-2 font-serif">Lesson Not Found</h2>
        <p className="text-[#6b7280] mb-4">This lesson doesn&apos;t exist or has been removed.</p>
        <Link href={`/portal/products/${productSlug}`} className="text-[#ee5d0b] hover:text-[#d54d00] font-medium">
          Back to Product
        </Link>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-[#222222] mb-2 font-serif">Locked Content</h2>
        <p className="text-[#6b7280] mb-4">You need to purchase this product to access this lesson.</p>
        <Link href={`/portal/products/${productSlug}`} className="text-[#ee5d0b] hover:text-[#d54d00] font-medium">
          View Product Details
        </Link>
      </div>
    );
  }

  return (
    <div className="-m-4 md:-m-6 overflow-hidden">
      {/* Mobile Course Navigation */}
      <MobileCourseNav
        product={product}
        modules={modules}
        progressMap={progressMap}
        currentModuleSlug={moduleSlug}
        currentLessonSlug={lessonSlug}
        overallProgress={overallProgress}
      />

      <div className="flex md:h-[calc(100vh-64px)]">
        {/* Course Sidebar - Desktop only */}
        <div className="hidden md:block flex-shrink-0">
          <CourseSidebar
            product={product}
            modules={modules}
            progressMap={progressMap}
            currentModuleSlug={moduleSlug}
            currentLessonSlug={lessonSlug}
            overallProgress={overallProgress}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 md:overflow-y-auto overflow-x-hidden">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6 overflow-x-hidden">
          {/* Lesson Header */}
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-[#6b7280] mb-1">{lesson.module.title}</p>
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#222222] font-serif">{lesson.title}</h1>
            </div>

            {/* Completion Toggle */}
            {isOwned && (
              <button
                onClick={handleToggleComplete}
                disabled={isCompleting}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors font-medium text-[11px] leading-tight flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-[#222222] hover:bg-black text-white"
                }`}
              >
                <CheckIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-center">
                  {isCompleted ? "Completed" : isCompleting ? "Saving..." : <><span className="block">Mark as</span><span className="block">Complete</span></>}
                </span>
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden w-full max-w-full">
            {lesson.content_type === "video" && (
              <VideoPlayer
                productSlug={productSlug}
                moduleSlug={moduleSlug}
                lessonSlug={lessonSlug}
                thumbnailUrl={lesson.thumbnail_url || undefined}
                initialPosition={progress?.last_position_seconds || 0}
                onProgress={handleProgressUpdate}
                onComplete={() => !isCompleted && handleToggleComplete()}
              />
            )}

            {lesson.content_type === "audio" && (
              <AudioPlayer
                productSlug={productSlug}
                moduleSlug={moduleSlug}
                lessonSlug={lessonSlug}
                title={lesson.title}
                initialPosition={progress?.last_position_seconds || 0}
                onProgress={handleProgressUpdate}
                onComplete={() => !isCompleted && handleToggleComplete()}
              />
            )}

            {(lesson.content_type === "pdf" || lesson.content_type === "download") && (
              <DownloadButton
                productSlug={productSlug}
                moduleSlug={moduleSlug}
                lessonSlug={lessonSlug}
                title={lesson.title}
              />
            )}

            {lesson.content_type === "text" && (
              <div className="p-4 sm:p-6 md:p-8 prose prose-gray max-w-none prose-sm sm:prose-base">
                {lesson.description || "Content coming soon..."}
              </div>
            )}
          </div>

          {/* Description */}
          {lesson.description && lesson.content_type !== "text" && (
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-[#222222] mb-2 sm:mb-3 font-serif">About This Lesson</h3>
              <p className="text-sm sm:text-base text-[#4b5563] whitespace-pre-wrap break-words">{lesson.description}</p>
            </div>
          )}

          {/* Resources */}
          <LessonResources resources={resources} />

          {/* Progress Bar (for video/audio) */}
          {isOwned && !isCompleted && progress && (lesson.content_type === "video" || lesson.content_type === "audio") && (
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#6b7280]">Progress</span>
                <div className="flex-1">
                  <ProgressBar progress={progress.progress_percent || 0} size="sm" />
                </div>
                <span className="text-sm font-medium text-[#222222]">{progress.progress_percent || 0}%</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#e5e7eb]">
            {prev && prevModule ? (
              <Link
                href={`/portal/products/${productSlug}/modules/${prevModule.slug}/lessons/${prev.slug}`}
                className="flex items-center gap-1 sm:gap-2 text-[#4b5563] hover:text-[#222222] transition-colors min-w-0 flex-1"
              >
                <ChevronLeftIcon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <span className="text-xs text-[#6b7280] block">Previous</span>
                  <span className="font-medium text-[#222222] text-sm sm:text-base line-clamp-1">{prev.title}</span>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {next && nextModule ? (
              <Link
                href={`/portal/products/${productSlug}/modules/${nextModule.slug}/lessons/${next.slug}`}
                className="flex items-center gap-1 sm:gap-2 text-[#4b5563] hover:text-[#222222] transition-colors min-w-0 flex-1 justify-end"
              >
                <div className="text-right min-w-0">
                  <span className="text-xs text-[#6b7280] block">Next</span>
                  <span className="font-medium text-[#222222] text-sm sm:text-base line-clamp-1">{next.title}</span>
                </div>
                <ChevronRightIcon className="w-5 h-5 flex-shrink-0" />
              </Link>
            ) : (
              <Link
                href={`/portal/products/${productSlug}`}
                className="flex items-center gap-1 sm:gap-2 text-[#ee5d0b] hover:text-[#d54d00] font-medium transition-colors text-sm sm:text-base"
              >
                <span className="whitespace-nowrap">Back to Course</span>
                <ChevronRightIcon className="w-5 h-5 flex-shrink-0" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
