import { Shield } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-border/50 border-t-primary" />
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Loading workspace</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Analyzing risk environment...</p>
      </div>
    </div>
  )
}