"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "@/lib/hooks/useProgress";
import { ProgressBar } from "@/components/portal/ProgressBar";
import { VideoPlayer } from "@/components/portal/VideoPlayer";
import { AudioPlayer } from "@/components/portal/AudioPlayer";
import { DownloadButton } from "@/components/portal/DownloadButton";
import type { Lesson, Module, Product, LessonProgress } from "@/lib/supabase/types";

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

function CheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  const [isOwned, setIsOwned] = useState(false);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  const { updateProgress, getProgress } = useProgress();
  const supabase = createClient();

  // Find adjacent lessons for navigation
  const adjacentLessons = useCallback(() => {
    if (!lesson?.module.lessons) return { prev: null, next: null };

    const sortedLessons = [...lesson.module.lessons].sort((a, b) => a.sort_order - b.sort_order);
    const currentIndex = sortedLessons.findIndex((l) => l.slug === lessonSlug);

    return {
      prev: currentIndex > 0 ? sortedLessons[currentIndex - 1] : null,
      next: currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null,
    };
  }, [lesson, lessonSlug]);

  // Fetch lesson data
  useEffect(() => {
    async function fetchLesson() {
      // Get lesson with module and product
      const { data: lessonData, error } = await supabase
        .from("lessons")
        .select(`
          *,
          module:modules!inner (
            *,
            product:products!inner (*),
            lessons (*)
          )
        `)
        .eq("slug", lessonSlug)
        .eq("module.slug", moduleSlug)
        .eq("module.product.slug", productSlug)
        .single();

      if (error || !lessonData) {
        console.error("Failed to fetch lesson:", error);
        setIsLoading(false);
        return;
      }

      setLesson(lessonData as unknown as LessonData);

      // Check if user owns this product
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: purchase } = await supabase
          .from("user_purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", lessonData.module.product.id)
          .eq("status", "active")
          .single();

        setIsOwned(!!purchase);

        // Fetch progress
        if (purchase) {
          const progressData = await getProgress(lessonData.id);
          setProgress(progressData);
        }
      }

      setIsLoading(false);
    }

    fetchLesson();
  }, [productSlug, moduleSlug, lessonSlug, supabase, getProgress]);

  const handleMarkComplete = async () => {
    if (!lesson) return;

    setIsCompleting(true);
    try {
      await updateProgress(lesson.id, { completed: true });
      setProgress((prev) => ({
        ...prev!,
        progress_percent: 100,
        completed_at: new Date().toISOString(),
      } as LessonProgress));
    } catch (err) {
      console.error("Failed to mark complete:", err);
    }
    setIsCompleting(false);
  };

  const { prev, next } = adjacentLessons();
  const isCompleted = !!progress?.completed_at;
  const canAccess = isOwned || lesson?.is_free_preview;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-96 bg-gray-200 rounded-xl" />
        <div className="h-20 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!lesson) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#6b7280]">
        <Link href={`/portal/products/${productSlug}`} className="hover:text-[#222222] transition-colors">
          {lesson.module.product.name}
        </Link>
        <span>/</span>
        <span>{lesson.module.title}</span>
        <span>/</span>
        <span className="text-[#222222]">{lesson.title}</span>
      </div>

      {/* Back Link */}
      <Link
        href={`/portal/products/${productSlug}`}
        className="inline-flex items-center gap-2 text-[#4b5563] hover:text-[#222222] transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to {lesson.module.product.name}
      </Link>

      {/* Lesson Title */}
      <div>
        <h1 className="text-2xl font-semibold text-[#222222] mb-2 font-serif">{lesson.title}</h1>
        {lesson.description && <p className="text-[#4b5563]">{lesson.description}</p>}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        {lesson.content_type === "video" && (
          <VideoPlayer
            productSlug={productSlug}
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            thumbnailUrl={lesson.thumbnail_url || undefined}
            initialPosition={progress?.last_position_seconds || 0}
            onProgress={(progressPercent, currentTime) => {
              // Save progress periodically (throttled in the hook)
              if (lesson) {
                updateProgress(lesson.id, {
                  progress_percent: progressPercent,
                  last_position_seconds: currentTime,
                });
              }
            }}
            onComplete={() => handleMarkComplete()}
          />
        )}

        {lesson.content_type === "audio" && (
          <AudioPlayer
            productSlug={productSlug}
            moduleSlug={moduleSlug}
            lessonSlug={lessonSlug}
            title={lesson.title}
            initialPosition={progress?.last_position_seconds || 0}
            onProgress={(progressPercent, currentTime) => {
              if (lesson) {
                updateProgress(lesson.id, {
                  progress_percent: progressPercent,
                  last_position_seconds: currentTime,
                });
              }
            }}
            onComplete={() => handleMarkComplete()}
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
          <div className="p-8 prose prose-gray max-w-none">
            {lesson.description || "Content coming soon..."}
          </div>
        )}
      </div>

      {/* Progress & Actions */}
      {isOwned && (
        <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckIcon className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              ) : progress ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#6b7280]">Progress</span>
                  <div className="w-32">
                    <ProgressBar progress={progress.progress_percent || 0} size="sm" />
                  </div>
                </div>
              ) : null}
            </div>

            {!isCompleted && (
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="flex items-center gap-2 bg-[#222222] hover:bg-black text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isCompleting ? "Saving..." : "Mark Complete"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[#e5e7eb]">
        {prev ? (
          <Link
            href={`/portal/products/${productSlug}/modules/${moduleSlug}/lessons/${prev.slug}`}
            className="flex items-center gap-2 text-[#4b5563] hover:text-[#222222] transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <div className="text-left">
              <span className="text-xs text-[#6b7280] block">Previous</span>
              <span className="font-medium text-[#222222]">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/portal/products/${productSlug}/modules/${moduleSlug}/lessons/${next.slug}`}
            className="flex items-center gap-2 text-[#4b5563] hover:text-[#222222] transition-colors"
          >
            <div className="text-right">
              <span className="text-xs text-[#6b7280] block">Next</span>
              <span className="font-medium text-[#222222]">{next.title}</span>
            </div>
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        ) : (
          <Link
            href={`/portal/products/${productSlug}`}
            className="flex items-center gap-2 text-[#ee5d0b] hover:text-[#d54d00] font-medium transition-colors"
          >
            Back to Course
            <ChevronRightIcon className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
}
