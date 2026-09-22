import { NavLink, useLocation } from "react-router-dom"
import {
  Shield,
  LayoutDashboard,
  CreditCard,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  Network,
  Smartphone,
  MapPin,
  FolderSearch,
  ClipboardList,
  Bot,
  Sparkles,
  FileText,
  Activity,
  Cog,
  UserCog,
  Webhook,
  History,
  Settings,
  ChevronLeft,
  Circle,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/stores/app-context"
import { user } from "@/data/mock"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Detection",
    items: [
      { label: "Transactions", href: "/transactions", icon: CreditCard },
      { label: "Alerts", href: "/alerts", icon: AlertTriangle },
      { label: "Risk Analysis", href: "/dashboard", icon: BarChart3 },
      { label: "Fraud Patterns", href: "/fraud-patterns", icon: TrendingUp },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Fraud Network", href: "/fraud-network", icon: Network },
      { label: "Devices & IPs", href: "/devices", icon: Smartphone },
      { label: "Locations", href: "/locations", icon: MapPin },
    ],
  },
  {
    title: "Investigation",
    items: [
      { label: "Investigations", href: "/investigations", icon: FolderSearch },
      { label: "Case Management", href: "/investigations", icon: ClipboardList },
    ],
  },
  {
    title: "AI",
    items: [
      { label: "AI Investigation Assistant", href: "/ai-assistant", icon: Bot },
      { label: "AI Insights", href: "/ai-insights", icon: Sparkles },
    ],
  },
  {
    title: "Reporting",
    items: [
      { label: "Reports", href: "/reports", icon: FileText },
      { label: "Analytics", href: "/reports", icon: Activity },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Rules Engine", href: "/rules-engine", icon: Cog },
      { label: "Users & Roles", href: "/users-roles", icon: UserCog },
      { label: "API & Integrations", href: "/api-integrations", icon: Webhook },
      { label: "Audit Logs", href: "/audit-logs", icon: History },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
]

interface SidebarProps {
  mobileSidebarOpen?: boolean
  onOpenMobileSidebar?: () => void
  onCloseMobileSidebar?: () => void
}

export function Sidebar({
  mobileSidebarOpen = false,
  onCloseMobileSidebar,
}: SidebarProps) {
  const { state, toggleSidebar } = useApp()
  const collapsed = state.sidebarCollapsed
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-border/50 bg-card/97 backdrop-blur-xl",
          "transition-[width,transform] duration-300 ease-in-out",
          collapsed ? "w-[260px] lg:w-[68px]" : "w-[260px]",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <h1 className="truncate text-sm font-bold tracking-tight text-foreground">
                  FraudShield AI
                </h1>
                <p className="truncate text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Risk Intelligence
                </p>
              </div>
            )}
          </div>
          {/* Mobile close */}
          <button
            onClick={onCloseMobileSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-md transition-colors hover:bg-accent hover:text-foreground lg:flex"
        >
          <ChevronLeft
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="mb-2">
              {!collapsed && (
                <div className="mb-1 px-4 py-1">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    {section.title}
                  </span>
                </div>
              )}
              {collapsed && <div className="mx-auto my-2 h-px w-8 bg-border/50" />}
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      location.pathname.startsWith(item.href + "/"))
                  return (
                    <NavLink
                      key={`${section.title}-${item.label}`}
                      to={item.href}
                      onClick={onCloseMobileSidebar}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {collapsed && (
                        <span className="pointer-events-none invisible absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md border border-border/50 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100 lg:block">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/50 p-3">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
                <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse-dot" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
                  System Operational
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {user.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <Circle className="h-2 w-2 fill-emerald-500 text-emerald-500 animate-pulse-dot" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user.avatarInitials}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}