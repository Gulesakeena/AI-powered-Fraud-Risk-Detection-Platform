import { useEffect, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Search,
  Bell,
  Bot,
  Calendar,
  ChevronDown,
  Command,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/stores/app-context"
import { user } from "@/data/mock"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/alerts": "Alerts",
  "/investigations": "Investigations",
  "/customers": "Customers",
  "/devices": "Devices & IPs",
  "/ip-intelligence": "IP Intelligence",
  "/locations": "Locations",
  "/fraud-patterns": "Fraud Patterns",
  "/fraud-network": "Fraud Network",
  "/ai-assistant": "AI Assistant",
  "/ai-insights": "AI Insights",
  "/rules-engine": "Rules Engine",
  "/reports": "Reports",
  "/csv-import": "CSV Import",
  "/api-integrations": "API & Integrations",
  "/users-roles": "Users & Roles",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
}

const dateRangeOptions = [
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
  "All time",
]

interface HeaderProps {
  onOpenMobileSidebar?: () => void
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, toggleCommandPalette, toggleNotificationDrawer, unreadCount } = useApp()

  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/transactions/")
      ? "Transaction Detail"
      : location.pathname.startsWith("/alerts/")
        ? "Alert Detail"
        : location.pathname.startsWith("/investigations/")
          ? "Investigation Detail"
          : location.pathname.startsWith("/customers/")
            ? "Customer Risk Profile"
            : state.currentPage)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        toggleCommandPalette()
      }
    },
    [toggleCommandPalette]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      {/* Left: Page title */}
      <div className="flex min-w-0 items-center gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      {/* Right: Actions */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* Search button */}
        <button
          onClick={toggleCommandPalette}
          className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Search...</span>
          <kbd className="pointer-events-none hidden items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Date range selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground">
            <Calendar className="h-4 w-4" />
            <span className="hidden lg:inline">{state.dateRange.label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="invisible absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border/50 bg-card p-1 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">
            {dateRangeOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  const end = new Date()
                  switch (option) {
                    case "Last 24 hours":
                      end.setDate(end.getDate() - 1)
                      break
                    case "Last 7 days":
                      end.setDate(end.getDate() - 7)
                      break
                    case "Last 30 days":
                      end.setDate(end.getDate() - 30)
                      break
                    case "Last 90 days":
                      end.setDate(end.getDate() - 90)
                      break
                    case "This year":
                      end.setMonth(end.getMonth() - 1)
                      break
                  }
                }}
                className={cn(
                  "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/50",
                  state.dateRange.label === option
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Environment badge */}
        <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 md:flex">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          Production
        </div>

        {/* Notifications */}
        <button
          onClick={toggleNotificationDrawer}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => navigate("/ai-assistant")}
          className="flex items-center gap-2 rounded-lg border border-ai/30 bg-ai/10 px-3 py-1.5 text-sm font-medium text-ai-light transition-colors hover:bg-ai/20"
        >
          <Bot className="h-4 w-4" />
          <span className="hidden lg:inline">AI Assistant</span>
        </button>

        {/* User avatar */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {user.avatarInitials}
          </div>
        </button>
      </div>
    </header>
  )
}
