"use client";

import { useState } from "react";
import Link from "next/link";
import type { ModuleWithLessons, LessonProgress } from "@/lib/supabase/types";
import { ProgressBar } from "./ProgressBar";

function ChevronIcon({ className = "w-5 h-5", isOpen = false }: { className?: string; isOpen?: boolean }) {
  return (
    <svg
      className={`${className} transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckCircleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function getContentTypeIcon(contentType: string) {
  switch (contentType) {
    case "video":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    case "audio":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    case "pdf":
    case "download":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case "text":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return <PlayIcon className="w-4 h-4" />;
  }
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface ModuleAccordionProps {
  module: ModuleWithLessons;
  productSlug: string;
  isOwned: boolean;
  progressMap?: Record<string, LessonProgress>;
  defaultOpen?: boolean;
}

export function ModuleAccordion({
  module,
  productSlug,
  isOwned,
  progressMap = {},
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedLessons = module.lessons.filter(
    (lesson) => progressMap[lesson.id]?.completed_at
  ).length;
  const totalLessons = module.lessons.length;
  const moduleProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="border border-[#e5e7eb] rounded-lg overflow-hidden bg-white">
      {/* Module Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[#f5f3ef] hover:bg-[#efeae3] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <h3 className="font-semibold text-[#222222]">{module.title}</h3>
            <p className="text-sm text-[#6b7280]">
              {completedLessons}/{totalLessons} lessons completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isOwned && moduleProgress > 0 && (
            <div className="w-24 hidden sm:block">
              <ProgressBar progress={moduleProgress} size="sm" />
            </div>
          )}
          <ChevronIcon className="w-5 h-5 text-[#6b7280]" isOpen={isOpen} />
        </div>
      </button>

      {/* Lessons List */}
      {isOpen && (
        <div className="divide-y divide-[#e5e7eb]">
          {module.lessons.map((lesson) => {
            const progress = progressMap[lesson.id];
            const isCompleted = !!progress?.completed_at;
            const canAccess = isOwned || lesson.is_free_preview;

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-4 p-4 ${
                  canAccess ? "hover:bg-[#faf9f7]" : "opacity-60"
                }`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  ) : canAccess ? (
                    <div className="w-6 h-6 rounded-full border-2 border-[#e5e7eb] flex items-center justify-center">
                      <PlayIcon className="w-3 h-3 text-[#6b7280]" />
                    </div>
                  ) : (
                    <LockIcon className="w-6 h-6 text-[#9ca3af]" />
                  )}
                </div>

                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  {canAccess ? (
                    <Link
                      href={`/portal/products/${productSlug}/modules/${module.slug}/lessons/${lesson.slug}`}
                      className="block"
                    >
                      <h4 className="font-medium text-[#222222] hover:text-[#ee5d0b] transition-colors">
                        {lesson.title}
                      </h4>
                      {lesson.description && (
                        <p className="text-sm text-[#6b7280] truncate">{lesson.description}</p>
                      )}
                    </Link>
                  ) : (
                    <>
                      <h4 className="font-medium text-[#6b7280]">{lesson.title}</h4>
                      {lesson.description && (
                        <p className="text-sm text-[#9ca3af] truncate">{lesson.description}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-[#6b7280]">
                  <span className="flex items-center gap-1 text-sm">
                    {getContentTypeIcon(lesson.content_type)}
                  </span>
                  {lesson.duration_seconds && (
                    <span className="text-sm">{formatDuration(lesson.duration_seconds)}</span>
                  )}
                  {lesson.is_free_preview && !isOwned && (
                    <span className="text-xs bg-[#ee5d0b]/10 text-[#ee5d0b] px-2 py-0.5 rounded-full font-medium">
                      Preview
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
