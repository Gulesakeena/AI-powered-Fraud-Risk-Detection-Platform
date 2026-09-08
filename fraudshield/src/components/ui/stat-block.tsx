import * as React from "react"
import { cn } from "@/lib/utils"

interface StatBlockProps {
  label: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon?: React.ComponentType<{ className?: string }>
  color?: "default" | "primary" | "success" | "warning" | "danger"
}

const colorClasses = {
  default: "bg-muted/50 text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  danger: "bg-red-500/10 text-red-500",
}

const StatBlock: React.FC<StatBlockProps> = ({
  label,
  value,
  change,
  icon: Icon,
  color = "default",
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className={cn("rounded-lg p-2", colorClasses[color])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              change.value >= 0 ? "text-emerald-500" : "text-red-500"
            )}
          >
            {change.value >= 0 ? "+" : ""}
            {change.value}% {change.label}
          </span>
        )}
      </div>
    </div>
  )
}

export { StatBlock }
