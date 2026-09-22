import * as React from "react"
import { cn, getRiskLevel, getRiskColor } from "@/lib/utils"

interface RiskScoreProps {
  score: number
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
}

const sizeConfig = {
  sm: { container: "w-16 h-16", text: "text-lg", label: "text-xs", stroke: 4 },
  md: { container: "w-24 h-24", text: "text-2xl", label: "text-xs", stroke: 5 },
  lg: { container: "w-32 h-32", text: "text-3xl", label: "text-sm", stroke: 6 },
  xl: { container: "w-40 h-40", text: "text-4xl", label: "text-base", stroke: 8 },
}

const RiskScore: React.FC<RiskScoreProps> = ({
  score,
  size = "md",
  showLabel = true,
}) => {
  const [animatedScore, setAnimatedScore] = React.useState(0)
  const config = sizeConfig[size]
  const clampedScore = Math.min(100, Math.max(0, score))
  const level = getRiskLevel(clampedScore)
  const colorClass = getRiskColor(clampedScore)

  React.useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = clampedScore / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= clampedScore) {
        setAnimatedScore(clampedScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [clampedScore])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  const ringColor =
    clampedScore <= 30
      ? "text-emerald-500"
      : clampedScore <= 70
      ? "text-amber-500"
      : "text-red-500"

  return (
    <div className={cn("relative inline-flex items-center justify-center", config.container)}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn("transition-all duration-1000 ease-out", ringColor)}
        />
      </svg>
      <div className="flex flex-col items-center justify-center">
        <span className={cn("font-bold tabular-nums", config.text, colorClass)}>
          {animatedScore}
        </span>
        {showLabel && (
          <span className={cn("font-semibold uppercase tracking-wider", config.label, colorClass)}>
            {level}
          </span>
        )}
      </div>
    </div>
  )
}

export { RiskScore }
