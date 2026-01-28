"use client";

import { ReactNode } from "react";

export type GradientColor = "lime" | "violet" | "slate" | "amber" | "rose";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  gradient?: GradientColor;
  icon?: ReactNode;
  className?: string;
}

const gradientClasses: Record<GradientColor, { bg: string; border: string; text: string }> = {
  lime: {
    bg: "bg-gradient-to-br from-lime-50 to-white",
    border: "border-lime-100/60",
    text: "text-lime-600/80",
  },
  violet: {
    bg: "bg-gradient-to-br from-violet-50 to-white",
    border: "border-violet-100/60",
    text: "text-violet-600/80",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-50 to-white",
    border: "border-slate-200/60",
    text: "text-slate-500",
  },
  amber: {
    bg: "bg-gradient-to-br from-amber-50 to-white",
    border: "border-amber-100/60",
    text: "text-amber-600/80",
  },
  rose: {
    bg: "bg-gradient-to-br from-rose-50 to-white",
    border: "border-rose-100/60",
    text: "text-rose-600/80",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  gradient = "slate",
  icon,
  className = "",
}: MetricCardProps) {
  const colors = gradientClasses[gradient];

  return (
    <div
      className={`${colors.bg} rounded-2xl p-5 shadow-sm border ${colors.border} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm ${colors.text} mb-1`}>{title}</p>
          <p className="text-3xl font-semibold text-slate-800 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className={`text-sm ${colors.text} mt-1`}>{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Smaller variant for secondary metrics
interface SmallMetricProps {
  title: string;
  value: string | number;
  color?: "lime" | "violet" | "slate";
}

export function SmallMetric({ title, value, color = "slate" }: SmallMetricProps) {
  const textColors = {
    lime: "text-lime-600",
    violet: "text-violet-600",
    slate: "text-slate-700",
  };

  return (
    <div>
      <p className="text-sm text-slate-500 mb-0.5">{title}</p>
      <p className={`text-xl font-semibold ${textColors[color]}`}>{value}</p>
    </div>
  );
}
