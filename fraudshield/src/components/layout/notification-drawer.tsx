import { useNavigate } from "react-router-dom"
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Settings,
  Sparkles,
  CheckCheck,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApp } from "@/stores/app-context"
import type { Notification } from "@/stores/app-context"
import { timeAgo } from "@/lib/utils"

const typeIcons: Record<Notification["type"], React.ComponentType<{ className?: string }>> = {
  alert: AlertTriangle,
  fraud: ShieldAlert,
  system: Settings,
  model: Sparkles,
}

const typeColors: Record<Notification["type"], string> = {
  alert: "text-amber-400 bg-amber-500/10",
  fraud: "text-red-400 bg-red-500/10",
  system: "text-blue-400 bg-blue-500/10",
  model: "text-purple-400 bg-purple-500/10",
}

export function NotificationDrawer() {
  const {
    state,
    setNotificationDrawer,
    markNotificationRead,
    markAllNotificationsRead,
    unreadCount,
  } = useApp()
  const navigate = useNavigate()

  const handleNotificationClick = (notification: Notification) => {
    markNotificationRead(notification.id)
    if (notification.href) {
      navigate(notification.href)
      setNotificationDrawer(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      {state.isNotificationDrawerOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setNotificationDrawer(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col border-l border-border/50 bg-card shadow-2xl transition-transform duration-300 ease-in-out",
          state.isNotificationDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground">
                {unreadCount} unread
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setNotificationDrawer(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {state.notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                You're all caught up
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {state.notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                const colorClass = typeColors[notification.type]
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex w-full gap-3 px-6 py-4 text-left transition-colors hover:bg-accent/30",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        colorClass
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium leading-tight",
                            notification.read ? "text-muted-foreground" : "text-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                        {timeAgo(new Date(notification.timestamp))}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-3">
          <p className="text-center text-xs text-muted-foreground/60">
            Showing {state.notifications.length} notifications
          </p>
        </div>
      </div>
    </>
  )
}
