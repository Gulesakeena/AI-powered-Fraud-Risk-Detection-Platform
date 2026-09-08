import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowClasses = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-border border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-border border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-border border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-border border-y-transparent border-l-transparent",
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = "top",
}) => {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs font-medium text-foreground bg-popover border border-border/50 rounded-md shadow-lg pointer-events-none animate-in fade-in duration-150 whitespace-nowrap",
            positionClasses[side]
          )}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[side]
            )}
          />
        </div>
      )}
    </div>
  )
}

export { Tooltip }
