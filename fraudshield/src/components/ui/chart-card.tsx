import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
  children: React.ReactNode
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  description,
  actions,
  className,
  children,
}) => {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-0">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="min-w-0 p-6">{children}</div>
    </div>
  )
}

export { ChartCard }
