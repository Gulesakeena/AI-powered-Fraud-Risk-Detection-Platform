import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon?: React.ComponentType<{ className?: string }>
  trend?: "up" | "down" | "neutral"
  onClick?: () => void
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  onClick,
}) => {
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
  const trendBg = trend === "up" ? "bg-emerald-500/10" : trend === "down" ? "bg-red-500/10" : "bg-muted/50"

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-card hover:border-border hover:shadow-md"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  trendBg,
                  trendColor
                )}
              >
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {trend === "neutral" && <Minus className="h-3 w-3" />}
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </span>
              <span className="truncate text-xs text-muted-foreground">{change.label}</span>
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { MetricCard }
