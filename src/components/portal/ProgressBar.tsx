"use client";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  size = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }[size];

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#6b7280] mb-1">
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`${heightClass} bg-[#e5e7eb] rounded-full overflow-hidden`}>
        <div
          className="h-full bg-[#d4a574] transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
