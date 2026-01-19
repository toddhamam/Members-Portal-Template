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

function PlayIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

interface CourseSidebarProps {
  product: Product;
  modules: ModuleWithLessons[];
  progressMap: Record<string, LessonProgress>;
  currentModuleSlug: string;
  currentLessonSlug: string;
  overallProgress: number;
}

export function CourseSidebar({
  product,
  modules,
  progressMap,
  currentModuleSlug,
  currentLessonSlug,
  overallProgress,
}: CourseSidebarProps) {
  // Track which modules are expanded - default expand the current module
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Find and expand the current module
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

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-[#e5e7eb] h-full overflow-y-auto">
      {/* Course Header */}
      <div className="p-4 border-b border-[#e5e7eb]">
        <Link
          href={`/portal/products/${product.slug}`}
          className="text-sm font-semibold text-[#222222] hover:text-[#ee5d0b] transition-colors font-serif line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-[#6b7280] mb-1">
            <span>{overallProgress}% complete</span>
            <span>{completedLessons}/{totalLessons}</span>
          </div>
          <ProgressBar progress={overallProgress} size="sm" />
        </div>
      </div>

      {/* Modules List */}
      <div className="py-2">
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
                  <span className="text-sm text-[#6b7280] block">
                    Module {moduleIndex + 1}
                  </span>
                  <span className="text-base font-medium text-[#222222] line-clamp-1">
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
                <div className="pb-2">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCurrentLesson =
                      module.slug === currentModuleSlug && lesson.slug === currentLessonSlug;
                    const isCompleted = !!progressMap[lesson.id]?.completed_at;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/portal/products/${product.slug}/modules/${module.slug}/lessons/${lesson.slug}`}
                        className={`flex items-center gap-3 px-4 py-2.5 text-base transition-colors ${
                          isCurrentLesson
                            ? "bg-[#d4a574]/20 border-l-2 border-[#d4a574]"
                            : "hover:bg-[#f5f3ef]"
                        }`}
                      >
                        {/* Status Icon / Lesson Number */}
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500 text-white">
                            <CheckIcon className="w-3 h-3" />
                          </div>
                        ) : (
                          <span
                            className={`text-sm font-medium flex-shrink-0 ${
                              isCurrentLesson ? "text-[#d4a574]" : "text-[#6b7280]"
                            }`}
                          >
                            {moduleIndex + 1}.{lessonIndex + 1}
                          </span>
                        )}

                        {/* Lesson Title */}
                        <span
                          className={`flex-1 line-clamp-2 ${
                            isCurrentLesson
                              ? "text-[#222222] font-medium"
                              : isCompleted
                              ? "text-[#6b7280]"
                              : "text-[#4b5563]"
                          }`}
                        >
                          {lesson.title}
                        </span>

                        {/* Completed Check */}
                        {isCompleted && !isCurrentLesson && (
                          <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
