import * as React from "react"
import { cn } from "@/lib/utils"

interface TimelineEvent {
  id: string
  time: string
  title: string
  description?: string
  status: "completed" | "current" | "pending" | "error"
  icon?: React.ComponentType<{ className?: string }>
}

interface TimelineProps {
  events: TimelineEvent[]
}

const statusConfig = {
  completed: {
    dot: "bg-emerald-500",
    line: "bg-emerald-500/30",
    icon: "text-emerald-500",
  },
  current: {
    dot: "bg-primary ring-4 ring-primary/20",
    line: "bg-border",
    icon: "text-primary",
  },
  pending: {
    dot: "bg-muted-foreground/30",
    line: "bg-border/50",
    icon: "text-muted-foreground/50",
  },
  error: {
    dot: "bg-red-500",
    line: "bg-red-500/30",
    icon: "text-red-500",
  },
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const config = statusConfig[event.status]
        const isLast = index === events.length - 1

        return (
          <div key={event.id} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-3 w-3 rounded-full mt-1.5",
                  config.dot
                )}
              />
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1",
                    config.line
                  )}
                />
              )}
            </div>

            <div className={cn("flex-1 pb-8", isLast && "pb-0")}>
              <div className="flex items-center gap-2">
                {event.icon && (
                  <event.icon className={cn("h-4 w-4", config.icon)} />
                )}
                <span className="text-sm font-medium text-foreground">
                  {event.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {event.time}
              </p>
              {event.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Timeline }
