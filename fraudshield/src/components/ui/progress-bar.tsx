import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  color?: "default" | "success" | "warning" | "danger" | "info"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  animated?: boolean
}

const colorClasses = {
  default: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = "default",
  size = "md",
  showLabel = false,
  animated = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-foreground">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted/50 overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color],
            animated && "animate-pulse"
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar }
