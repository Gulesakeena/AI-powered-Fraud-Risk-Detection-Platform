import * as React from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  className?: string
  children: React.ReactNode
}

/**
 * Shared page wrapper. Guarantees the layout column (flex-1/min-w-0) can
 * shrink below its content width without blowing out the viewport, and
 * adds consistent vertical rhythm between page sections.
 */
const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "w-full min-w-0 space-y-6",
        className
      )}
    >
      {children}
    </div>
  )
)
PageContainer.displayName = "PageContainer"

export { PageContainer }