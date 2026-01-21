"use client";

import { useState } from "react";
import Link from "next/link";
import { ProgressBar } from "./ProgressBar";
import type { ModuleWithLessons, LessonProgress, Product } from "@/lib/supabase/types";

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ListIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

interface MobileCourseNavProps {
  product: Product;
  modules: ModuleWithLessons[];
  progressMap: Record<string, LessonProgress>;
  currentModuleSlug: string;
  currentLessonSlug: string;
  overallProgress: number;
}

export function MobileCourseNav({
  product,
  modules,
  progressMap,
  currentModuleSlug,
  currentLessonSlug,
  overallProgress,
}: MobileCourseNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    const currentModule = modules.find((m) => m.slug === currentModuleSlug);
    if (currentModule) {
      initial.add(currentModule.id);
    }
    return initial;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = Object.values(progressMap).filter((p) => p.completed_at).length;

  // Find current lesson title
  const currentModule = modules.find((m) => m.slug === currentModuleSlug);
  const currentLesson = currentModule?.lessons.find((l) => l.slug === currentLessonSlug);

  return (
    <div className="md:hidden bg-white border-b border-[#e5e7eb]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <ListIcon className="w-5 h-5 text-[#6b7280] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-[#6b7280]">Course Contents</p>
            <p className="text-sm font-medium text-[#222222] truncate">
              {currentLesson?.title || "Select Lesson"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#6b7280]">{overallProgress}%</span>
          <ChevronDownIcon
            className={`w-5 h-5 text-[#6b7280] transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="border-t border-[#e5e7eb] max-h-[60vh] overflow-y-auto">
          {/* Progress */}
          <div className="px-4 py-3 bg-[#faf9f7]">
            <div className="flex justify-between text-xs text-[#6b7280] mb-1">
              <span>{overallProgress}% complete</span>
              <span>{completedLessons}/{totalLessons}</span>
            </div>
            <ProgressBar progress={overallProgress} size="sm" />
          </div>

          {/* Modules List */}
          <div className="py-1">
            {modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.has(module.id);
              const moduleCompletedCount = module.lessons.filter(
                (l) => progressMap[l.id]?.completed_at
              ).length;

              return (
                <div key={module.id}>
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f3ef] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#6b7280] block">
                        Module {moduleIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-[#222222] line-clamp-1">
                        {module.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-[#6b7280]">
                        {moduleCompletedCount}/{module.lessons.length}
                      </span>
                      <ChevronDownIcon
                        className={`w-4 h-4 text-[#6b7280] transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Lessons List */}
                  {isExpanded && (
                    <div className="pb-2 bg-[#faf9f7]">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCurrentLesson =
                          module.slug === currentModuleSlug && lesson.slug === currentLessonSlug;
                        const isCompleted = !!progressMap[lesson.id]?.completed_at;

                        return (
                          <Link
                            key={lesson.id}
                            href={`/portal/products/${product.slug}/modules/${module.slug}/lessons/${lesson.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                              isCurrentLesson
                                ? "bg-[#d4a574]/20 border-l-2 border-[#d4a574]"
                                : "hover:bg-white/50"
                            }`}
                          >
                            {/* Status Icon / Lesson Number */}
                            {isCompleted ? (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
                                <CheckIcon className="w-3 h-3" />
                              </div>
                            ) : (
                              <span
                                className={`text-xs font-medium flex-shrink-0 ${
                                  isCurrentLesson ? "text-[#d4a574]" : "text-[#6b7280]"
                                }`}
                              >
                                {moduleIndex + 1}.{lessonIndex + 1}
                              </span>
                            )}

                            {/* Lesson Title */}
                            <span
                              className={`flex-1 line-clamp-1 ${
                                isCurrentLesson
                                  ? "text-[#222222] font-medium"
                                  : isCompleted
                                  ? "text-[#6b7280]"
                                  : "text-[#4b5563]"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Back to Course Link */}
          <div className="border-t border-[#e5e7eb] p-3">
            <Link
              href={`/portal/products/${product.slug}`}
              className="text-sm text-[#ee5d0b] font-medium"
              onClick={() => setIsOpen(false)}
            >
              ← Back to Course Overview
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
