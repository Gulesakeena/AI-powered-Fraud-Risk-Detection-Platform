import { createContext, useContext, useReducer, useCallback, useMemo } from "react"
import type { ReactNode } from "react"

interface Notification {
  id: string
  type: "alert" | "fraud" | "system" | "model"
  title: string
  description: string
  timestamp: string
  read: boolean
  href?: string
}

interface DateRange {
  start: Date
  end: Date
  label: string
}

interface AppState {
  sidebarCollapsed: boolean
  currentPage: string
  notifications: Notification[]
  isCommandPaletteOpen: boolean
  isNotificationDrawerOpen: boolean
  dateRange: DateRange
  selectedBusiness: string
}

type AppAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_PAGE"; payload: string }
  | { type: "MARK_NOTIFICATION_READ"; payload: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "TOGGLE_COMMAND_PALETTE" }
  | { type: "SET_COMMAND_PALETTE"; payload: boolean }
  | { type: "TOGGLE_NOTIFICATION_DRAWER" }
  | { type: "SET_NOTIFICATION_DRAWER"; payload: boolean }
  | { type: "SET_DATE_RANGE"; payload: DateRange }
  | { type: "SET_BUSINESS"; payload: string }

const now = new Date()
const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

const initialState: AppState = {
  sidebarCollapsed: false,
  currentPage: "Dashboard",
  notifications: [
    {
      id: "n1",
      type: "alert",
      title: "Critical Fraud Alert - Tyler Wright",
      description: "3 transactions over $10K in 90 minutes detected. Account linked to known fraud network.",
      timestamp: "2026-09-08T14:30:00Z",
      read: false,
      href: "/alerts/ALT-00014",
    },
    {
      id: "n2",
      type: "fraud",
      title: "Confirmed Fraud Ring - Petrov & Wright",
      description: "Device fingerprint analysis confirmed shared device between CUST-0009 and CUST-0024.",
      timestamp: "2026-09-08T12:00:00Z",
      read: false,
      href: "/investigations/INV-00001",
    },
    {
      id: "n3",
      type: "model",
      title: "AI Model Update Complete",
      description: "Behavioral analysis model v3.2 deployed. Detection accuracy improved to 94.7%.",
      timestamp: "2026-09-08T10:15:00Z",
      read: false,
    },
    {
      id: "n4",
      type: "system",
      title: "System Maintenance Scheduled",
      description: "Scheduled maintenance window: Sept 9, 2026 02:00-04:00 UTC.",
      timestamp: "2026-09-08T08:00:00Z",
      read: true,
    },
    {
      id: "n5",
      type: "alert",
      title: "New Device Alert - Oscar Lindqvist",
      description: "Tor browser detected on new device. $9,800 crypto purchase blocked.",
      timestamp: "2026-09-07T12:01:00Z",
      read: true,
      href: "/alerts/ALT-00012",
    },
    {
      id: "n6",
      type: "fraud",
      title: "Cross-Border Fraud Ring Identified",
      description: "Diego Morales device linked to 2 confirmed fraud cases. Pattern matches organized ring.",
      timestamp: "2026-09-07T08:00:00Z",
      read: true,
      href: "/investigations/INV-00008",
    },
  ],
  isCommandPaletteOpen: false,
  isNotificationDrawerOpen: false,
  dateRange: {
    start: thirtyDaysAgo,
    end: now,
    label: "Last 30 days",
  },
  selectedBusiness: "All Businesses",
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }
    case "SET_PAGE":
      return { ...state, currentPage: action.payload }
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      }
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      }
    case "TOGGLE_COMMAND_PALETTE":
      return { ...state, isCommandPaletteOpen: !state.isCommandPaletteOpen }
    case "SET_COMMAND_PALETTE":
      return { ...state, isCommandPaletteOpen: action.payload }
    case "TOGGLE_NOTIFICATION_DRAWER":
      return { ...state, isNotificationDrawerOpen: !state.isNotificationDrawerOpen }
    case "SET_NOTIFICATION_DRAWER":
      return { ...state, isNotificationDrawerOpen: action.payload }
    case "SET_DATE_RANGE":
      return { ...state, dateRange: action.payload }
    case "SET_BUSINESS":
      return { ...state, selectedBusiness: action.payload }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  toggleSidebar: () => void
  setPage: (page: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  toggleCommandPalette: () => void
  setCommandPalette: (open: boolean) => void
  toggleNotificationDrawer: () => void
  setNotificationDrawer: (open: boolean) => void
  setDateRange: (range: DateRange) => void
  setBusiness: (business: string) => void
  unreadCount: number
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const toggleSidebar = useCallback(() => dispatch({ type: "TOGGLE_SIDEBAR" }), [])
  const setPage = useCallback((page: string) => dispatch({ type: "SET_PAGE", payload: page }), [])
  const markNotificationRead = useCallback(
    (id: string) => dispatch({ type: "MARK_NOTIFICATION_READ", payload: id }),
    []
  )
  const markAllNotificationsRead = useCallback(
    () => dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
    []
  )
  const toggleCommandPalette = useCallback(
    () => dispatch({ type: "TOGGLE_COMMAND_PALETTE" }),
    []
  )
  const setCommandPalette = useCallback(
    (open: boolean) => dispatch({ type: "SET_COMMAND_PALETTE", payload: open }),
    []
  )
  const toggleNotificationDrawer = useCallback(
    () => dispatch({ type: "TOGGLE_NOTIFICATION_DRAWER" }),
    []
  )
  const setNotificationDrawer = useCallback(
    (open: boolean) => dispatch({ type: "SET_NOTIFICATION_DRAWER", payload: open }),
    []
  )
  const setDateRange = useCallback(
    (range: DateRange) => dispatch({ type: "SET_DATE_RANGE", payload: range }),
    []
  )
  const setBusiness = useCallback(
    (business: string) => dispatch({ type: "SET_BUSINESS", payload: business }),
    []
  )

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  )

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      toggleSidebar,
      setPage,
      markNotificationRead,
      markAllNotificationsRead,
      toggleCommandPalette,
      setCommandPalette,
      toggleNotificationDrawer,
      setNotificationDrawer,
      setDateRange,
      setBusiness,
      unreadCount,
    }),
    [
      state,
      toggleSidebar,
      setPage,
      markNotificationRead,
      markAllNotificationsRead,
      toggleCommandPalette,
      setCommandPalette,
      toggleNotificationDrawer,
      setNotificationDrawer,
      setDateRange,
      setBusiness,
      unreadCount,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export type { Notification, DateRange }
