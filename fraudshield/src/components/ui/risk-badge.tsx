import * as React from "react"
import { cn, getRiskLevel, getRiskColor } from "@/lib/utils"

interface RiskBadgeProps {
  score: number
  size?: "sm" | "md"
}

const sizeConfig = {
  sm: { dot: "w-1.5 h-1.5", text: "text-xs", padding: "px-2 py-0.5" },
  md: { dot: "w-2 h-2", text: "text-sm", padding: "px-2.5 py-1" },
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ score, size = "md" }) => {
  const config = sizeConfig[size]
  const level = getRiskLevel(score)
  const colorClass = getRiskColor(score)

  const dotColor =
    score <= 30
      ? "bg-emerald-500"
      : score <= 70
      ? "bg-amber-500"
      : "bg-red-500"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        config.padding,
        config.text,
        colorClass,
        score <= 30
          ? "bg-emerald-500/10"
          : score <= 70
          ? "bg-amber-500/10"
          : "bg-red-500/10"
      )}
    >
      <span className={cn("rounded-full", config.dot, dotColor)} />
      {score} · {level}
    </span>
  )
}

export { RiskBadge }
