"use client";

import { useState } from "react";
import type { MemberProductProgress } from "@/lib/admin/types";

interface ProductProgressListProps {
  products: MemberProductProgress[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProductProgressList({ products }: ProductProgressListProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const toggleProduct = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
    setExpandedModule(null);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div
          key={product.productId}
          className="border border-slate-200 rounded-xl overflow-hidden"
        >
          {/* Product Header */}
          <button
            onClick={() => toggleProduct(product.productId)}
            className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-slate-700 truncate">
                  {product.productName}
                </h5>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    product.purchaseSource === "portal"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {product.purchaseSource === "portal" ? "Portal" : "Funnel"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Purchased {formatDate(product.purchasedAt)}
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {product.progressPercent.toFixed(0)}%
                </p>
                <p className="text-xs text-slate-400">
                  {product.lessonsCompleted}/{product.totalLessons} lessons
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform ${
                  expandedProduct === product.productId ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  product.progressPercent >= 100
                    ? "bg-gradient-to-r from-lime-400 to-lime-500"
                    : "bg-gradient-to-r from-violet-400 to-violet-500"
                }`}
                style={{ width: `${Math.min(100, product.progressPercent)}%` }}
              />
            </div>
          </div>

          {/* Expanded Modules */}
          {expandedProduct === product.productId && (
            <div className="border-t border-slate-100 bg-slate-50/50">
              {product.modules.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No modules available
                </p>
              ) : (
                product.modules.map((module) => (
                  <div key={module.moduleId} className="border-b border-slate-100 last:border-b-0">
                    {/* Module Header */}
                    <button
                      onClick={() => toggleModule(module.moduleId)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100/50 transition-colors text-left"
                    >
                      <span className="text-sm text-slate-600">{module.moduleTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {module.lessons.filter((l) => l.progressPercent >= 100).length}/
                          {module.lessons.length}
                        </span>
                        <svg
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedModule === module.moduleId ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Expanded Lessons */}
                    {expandedModule === module.moduleId && (
                      <div className="px-4 pb-3 space-y-2">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.lessonId}
                            className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg"
                          >
                            {/* Completion indicator */}
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                lesson.progressPercent >= 100
                                  ? "bg-lime-100"
                                  : lesson.progressPercent > 0
                                  ? "bg-violet-100"
                                  : "bg-slate-100"
                              }`}
                            >
                              {lesson.progressPercent >= 100 ? (
                                <svg className="w-3 h-3 text-lime-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : lesson.progressPercent > 0 ? (
                                <div
                                  className="w-2 h-2 rounded-full bg-violet-500"
                                  style={{
                                    opacity: lesson.progressPercent / 100,
                                  }}
                                />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  lesson.progressPercent >= 100
                                    ? "text-slate-500"
                                    : "text-slate-700"
                                }`}
                              >
                                {lesson.lessonTitle}
                              </p>
                            </div>

                            {/* Progress */}
                            <span className="text-xs text-slate-400 tabular-nums">
                              {lesson.progressPercent.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
