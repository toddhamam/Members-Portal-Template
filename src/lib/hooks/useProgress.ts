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
    [supabase]
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
    [supabase]
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
    [supabase]
  );

  return { updateProgress, getProgress, getProductProgress, isUpdating };
}
