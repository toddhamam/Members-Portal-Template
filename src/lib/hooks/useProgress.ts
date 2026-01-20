"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LessonProgress } from "@/lib/supabase/types";

export function useProgress() {
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  const updateProgress = useCallback(
    async (
      lessonId: string,
      progress: {
        progress_percent?: number;
        last_position_seconds?: number;
        completed?: boolean;
      }
    ) => {
      setIsUpdating(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Not authenticated");
        }

        const updateData: Partial<LessonProgress> = {
          progress_percent: progress.progress_percent,
          last_position_seconds: progress.last_position_seconds,
        };

        if (progress.completed) {
          updateData.completed_at = new Date().toISOString();
          updateData.progress_percent = 100;
        }

        // Upsert progress record
        const { error } = await supabase
          .from("lesson_progress")
          .upsert(
            {
              user_id: user.id,
              lesson_id: lessonId,
              ...updateData,
            },
            {
              onConflict: "user_id,lesson_id",
            }
          );

        if (error) throw error;
      } catch (err) {
        console.error("Failed to update progress:", err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is a stable singleton
    []
  );

  const getProgress = useCallback(
    async (lessonId: string): Promise<LessonProgress | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      return data;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is a stable singleton
    []
  );

  const getProductProgress = useCallback(
    async (productId: string): Promise<number> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Get all lessons for this product
      const { data: lessons } = await supabase
        .from("lessons")
        .select(`
          id,
          modules!inner(product_id)
        `)
        .eq("modules.product_id", productId);

      if (!lessons || lessons.length === 0) return 0;

      // Get progress for these lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessonIds = lessons.map((l: any) => l.id);
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      if (!progress) return 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completedCount = progress.filter((p: any) => p.completed_at).length;
      return Math.round((completedCount / lessons.length) * 100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is a stable singleton
    []
  );

  // Batch fetch progress for multiple products in 2 queries instead of N*2 sequential queries
  const getAllProductsProgress = useCallback(
    async (productIds: string[]): Promise<Record<string, number>> => {
      if (productIds.length === 0) return {};

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return {};

      // Single query: get all lessons for all products
      const { data: lessons } = await supabase
        .from("lessons")
        .select(`
          id,
          modules!inner(product_id)
        `)
        .in("modules.product_id", productIds);

      if (!lessons || lessons.length === 0) {
        // Return 0 progress for all products
        return productIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {});
      }

      // Single query: get progress for all lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessonIds = lessons.map((l: any) => l.id);
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      // Group lessons by product
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessonsByProduct: Record<string, string[]> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      lessons.forEach((l: any) => {
        const productId = l.modules.product_id;
        if (!lessonsByProduct[productId]) lessonsByProduct[productId] = [];
        lessonsByProduct[productId].push(l.id);
      });

      // Get completed lesson IDs
      const completedLessonIds = new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (progress || []).filter((p: any) => p.completed_at).map((p: any) => p.lesson_id)
      );

      // Calculate progress per product
      const result: Record<string, number> = {};
      for (const productId of productIds) {
        const productLessons = lessonsByProduct[productId] || [];
        if (productLessons.length === 0) {
          result[productId] = 0;
        } else {
          const completed = productLessons.filter(id => completedLessonIds.has(id)).length;
          result[productId] = Math.round((completed / productLessons.length) * 100);
        }
      }
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- supabase is a stable singleton
    []
  );

  return { updateProgress, getProgress, getProductProgress, getAllProductsProgress, isUpdating };
}
