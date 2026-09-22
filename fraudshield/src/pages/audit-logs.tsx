import * as React from "react"
import {
  Search,
  Download,
  LogIn,
  PlusCircle,
  Pencil,
  Trash2,
  FileDown,
  XCircle,
  ChevronDown,
  ShieldAlert,
  Calendar,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type ActionType = "Login" | "Create" | "Update" | "Delete" | "Export" | "Login Failed"
type EntityType = "Transaction" | "Alert" | "Investigation" | "Rule" | "User" | "Settings" | "System" | "Customer" | "Report"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: ActionType
  entityType: EntityType
  entityId: string
  description: string
  ipAddress: string
  userAgent: string
  sessionId: string
  requestId: string
  before?: string
  after?: string
}

const mockLogs: AuditLog[] = [
  { id: "L-9E3001", timestamp: "2026-09-08T14:32:15Z", user: "Gule Sakeena", action: "Login", entityType: "System", entityId: "—", description: "User logged in", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_a7f3b2" },
  { id: "L-9E3002", timestamp: "2026-09-08T14:28:42Z", user: "Marcus Chen", action: "Update", entityType: "Investigation", entityId: "INV-00231", description: "Status changed to In Progress", ipAddress: "10.0.0.45", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", sessionId: "sess_82l1x9", requestId: "req_b4c1d3", before: '{"status":"Pending"}', after: '{"status":"In Progress"}' },
  { id: "L-9E3003", timestamp: "2026-09-08T14:15:33Z", user: "Gule Sakeena", action: "Create", entityType: "Alert", entityId: "ALT-00847", description: "Created alert ALT-00847", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_c2d4e5", after: '{"priority":"HIGH"}' },
  { id: "L-9E3004", timestamp: "2026-09-08T13:58:01Z", user: "System", action: "Update", entityType: "Rule", entityId: "RUL-0012", description: "Rule triggered 47 times", ipAddress: "System", userAgent: "FraudShield Engine/2.4.0", sessionId: "sess_system", requestId: "req_sys_0012", before: '{"triggerCount":36}', after: '{"triggerCount":47}' },
  { id: "L-9E3005", timestamp: "2026-09-08T13:45:22Z", user: "Sarah Williams", action: "Export", entityType: "Report", entityId: "RPT-0044", description: "Exported Monthly Fraud Report", ipAddress: "10.0.0.12", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_73m8v2", requestId: "req_d3e5f6", after: '{"format":"CSV"}' },
  { id: "L-9E3006", timestamp: "2026-09-08T13:30:15Z", user: "James Rodriguez", action: "Update", entityType: "Customer", entityId: "CUST-0009", description: "Risk level changed to HIGH", ipAddress: "10.0.0.67", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", sessionId: "sess_64n7w1", requestId: "req_e4f6a7", before: '{"riskLevel":"MEDIUM"}', after: '{"riskLevel":"HIGH"}' },
  { id: "L-9E3007", timestamp: "2026-09-08T12:15:00Z", user: "Gule Sakeena", action: "Create", entityType: "Investigation", entityId: "INV-00232", description: "Created INV-00232", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_f5g7h8", after: '{"status":"New"}' },
  { id: "L-9E3008", timestamp: "2026-09-08T11:52:34Z", user: "Marcus Chen", action: "Update", entityType: "Transaction", entityId: "TXN-000154", description: "Transaction flag added: Suspicious Velocity", ipAddress: "10.0.0.45", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", sessionId: "sess_82l1x9", requestId: "req_g6h8i9", before: '{"flags":[]}', after: '{"flags":["SUSPICIOUS_VELOCITY"]}' },
  { id: "L-9E3009", timestamp: "2026-09-08T11:20:47Z", user: "System", action: "Login Failed", entityType: "System", entityId: "—", description: "Failed login attempt for user james@fraudshield.ai", ipAddress: "45.83.14.220", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", sessionId: "sess_failed_01", requestId: "req_h7i9j0", after: '{"reason":"invalid_password"}' },
  { id: "L-9E3010", timestamp: "2026-09-08T10:58:12Z", user: "Gule Sakeena", action: "Delete", entityType: "Alert", entityId: "ALT-00719", description: "Deleted alert ALT-00719 (false positive)", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_i8j0k1", before: '{"status":"OPEN"}' },
  { id: "L-9E3011", timestamp: "2026-09-08T10:30:05Z", user: "Emily Park", action: "Login", entityType: "System", entityId: "—", description: "User logged in", ipAddress: "10.0.0.88", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", sessionId: "sess_51f6t3", requestId: "req_j9k1l2" },
  { id: "L-9E3012", timestamp: "2026-09-08T09:45:20Z", user: "David Kim", action: "Export", entityType: "Transaction", entityId: "TXN-000142", description: "Exported transaction history", ipAddress: "10.0.0.90", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", sessionId: "sess_42g5s1", requestId: "req_k0l2m3", after: '{"format":"PDF"}' },
  { id: "L-9E3013", timestamp: "2026-09-08T09:12:41Z", user: "Marcus Chen", action: "Create", entityType: "Investigation", entityId: "INV-00230", description: "Created INV-00230", ipAddress: "10.0.0.45", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", sessionId: "sess_82l1x9", requestId: "req_l1m3n4", after: '{"status":"New"}' },
  { id: "L-9E3014", timestamp: "2026-09-08T08:40:55Z", user: "System", action: "Login Failed", entityType: "System", entityId: "—", description: "Failed login attempt for user sarah@fraudshield.ai", ipAddress: "203.0.113.44", userAgent: "curl/8.1.2", sessionId: "sess_failed_02", requestId: "req_m2n4o5", after: '{"reason":"account_locked"}' },
  { id: "L-9E3015", timestamp: "2026-09-08T08:15:03Z", user: "Gule Sakeena", action: "Update", entityType: "Settings", entityId: "SET-0001", description: "Updated risk threshold configuration", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_n3o5p6", before: '{"autoBlockThreshold":95}', after: '{"autoBlockThreshold":90}' },
  { id: "L-9E3016", timestamp: "2026-09-07T23:58:32Z", user: "Sarah Williams", action: "Update", entityType: "Rule", entityId: "RUL-0018", description: "Changed rule threshold from 0.8 to 0.85", ipAddress: "10.0.0.12", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_73m8v2", requestId: "req_o4p6q7", before: '{"threshold":0.8}', after: '{"threshold":0.85}' },
  { id: "L-9E3017", timestamp: "2026-09-07T23:12:19Z", user: "Marcus Chen", action: "Update", entityType: "Investigation", entityId: "INV-00229", description: "Status changed to Resolved", ipAddress: "10.0.0.45", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", sessionId: "sess_82l1x9", requestId: "req_p5q7r8", before: '{"status":"In Progress"}', after: '{"status":"Resolved","resolution":"Confirmed Fraud"}' },
  { id: "L-9E3018", timestamp: "2026-09-07T22:40:08Z", user: "David Kim", action: "Login", entityType: "System", entityId: "—", description: "User logged in", ipAddress: "10.0.0.90", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", sessionId: "sess_42g5s1", requestId: "req_q6r8s9" },
  { id: "L-9E3019", timestamp: "2026-09-07T22:05:41Z", user: "James Rodriguez", action: "Update", entityType: "Customer", entityId: "CUST-0012", description: "Added new device fingerprint", ipAddress: "10.0.0.67", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", sessionId: "sess_64n7w1", requestId: "req_r7s9t0", before: '{"devices":2}', after: '{"devices":3}' },
  { id: "L-9E3020", timestamp: "2026-09-07T21:33:27Z", user: "Gule Sakeena", action: "Create", entityType: "Rule", entityId: "RUL-0032", description: "Created new rule: Card Testing Defense", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_s8t0u1", after: '{"enabled":true}' },
  { id: "L-9E3021", timestamp: "2026-09-07T21:00:53Z", user: "System", action: "Update", entityType: "System", entityId: "—", description: "Scheduled maintenance completed", ipAddress: "System", userAgent: "FraudShield Ops/1.0.0", sessionId: "sess_ops", requestId: "req_t9u1v2", before: '{"status":"MAINTENANCE"}', after: '{"status":"OPERATIONAL"}' },
  { id: "L-9E3022", timestamp: "2026-09-07T20:18:36Z", user: "Emily Park", action: "Export", entityType: "Investigation", entityId: "INV-00227", description: "Exported investigation evidence", ipAddress: "10.0.0.88", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", sessionId: "sess_51f6t3", requestId: "req_u0v2w3", after: '{"format":"ZIP"}' },
  { id: "L-9E3023", timestamp: "2026-09-07T19:47:12Z", user: "Marcus Chen", action: "Update", entityType: "Alert", entityId: "ALT-00812", description: "Alert priority escalated to CRITICAL", ipAddress: "10.0.0.45", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15", sessionId: "sess_82l1x9", requestId: "req_v1w3x4", before: '{"priority":"HIGH"}', after: '{"priority":"CRITICAL"}' },
  { id: "L-9E3024", timestamp: "2026-09-07T19:10:44Z", user: "Sarah Williams", action: "Delete", entityType: "User", entityId: "USR-0044", description: "Removed deactivated user account", ipAddress: "10.0.0.12", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_73m8v2", requestId: "req_w2x4y5", before: '{"status":"Disabled"}' },
  { id: "L-9E3025", timestamp: "2026-09-07T18:32:01Z", user: "Gule Sakeena", action: "Create", entityType: "User", entityId: "USR-0055", description: "Created new user account", ipAddress: "192.168.1.100", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36", sessionId: "sess_91kd2x", requestId: "req_x3y5z6", after: '{"role":"Analyst"}' },
  { id: "L-9E3026", timestamp: "2026-09-07T17:55:28Z", user: "James Rodriguez", action: "Update", entityType: "Investigation", entityId: "INV-00226", description: "Added evidence file to investigation", ipAddress: "10.0.0.67", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36", sessionId: "sess_64n7w1", requestId: "req_y4z6a7", before: '{"evidenceCount":2}', after: '{"evidenceCount":3}' },
  { id: "L-9E3027", timestamp: "2026-09-07T17:20:39Z", user: "System", action: "Login Failed", entityType: "System", entityId: "—", description: "Failed login attempt for unknown user", ipAddress: "198.51.100.77", userAgent: "python-requests/2.31.0", sessionId: "sess_failed_03", requestId: "req_z5a7b8", after: '{"reason":"user_not_found"}' },
  { id: "L-9E3028", timestamp: "2026-09-07T16:42:17Z", user: "David Kim", action: "Login", entityType: "System", entityId: "—", description: "User logged in", ipAddress: "10.0.0.90", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36", sessionId: "sess_42g5s1", requestId: "req_aa6b8c9" },
]

const actionConfig: Record<ActionType, { label: string; className: string; icon: React.ReactNode }> = {
  Login: {
    label: "Login",
    className: "border-blue-500/30 bg-blue-500/15 text-blue-400",
    icon: <LogIn className="h-3 w-3" />,
  },
  Create: {
    label: "Create",
    className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
    icon: <PlusCircle className="h-3 w-3" />,
  },
  Update: {
    label: "Update",
    className: "border-amber-500/30 bg-amber-500/15 text-amber-400",
    icon: <Pencil className="h-3 w-3" />,
  },
  Delete: {
    label: "Delete",
    className: "border-red-500/30 bg-red-500/15 text-red-400",
    icon: <Trash2 className="h-3 w-3" />,
  },
  Export: {
    label: "Export",
    className: "border-purple-500/30 bg-purple-500/15 text-purple-400",
    icon: <FileDown className="h-3 w-3" />,
  },
  "Login Failed": {
    label: "Login Failed",
    className: "border-red-500/30 bg-red-500/15 text-red-400",
    icon: <XCircle className="h-3 w-3" />,
  },
}

const actionOptions = [
  { label: "All Actions", value: "all" },
  { label: "Login", value: "Login" },
  { label: "Create", value: "Create" },
  { label: "Update", value: "Update" },
  { label: "Delete", value: "Delete" },
  { label: "Export", value: "Export" },
  { label: "Login Failed", value: "Login Failed" },
]

const userOptions = [
  { label: "All Users", value: "all" },
  { label: "Gule Sakeena", value: "Gule Sakeena" },
  { label: "Marcus Chen", value: "Marcus Chen" },
  { label: "Sarah Williams", value: "Sarah Williams" },
  { label: "James Rodriguez", value: "James Rodriguez" },
  { label: "Emily Park", value: "Emily Park" },
  { label: "David Kim", value: "David Kim" },
  { label: "System", value: "System" },
]

const entityOptions = [
  { label: "All Entities", value: "all" },
  { label: "Transaction", value: "Transaction" },
  { label: "Alert", value: "Alert" },
  { label: "Investigation", value: "Investigation" },
  { label: "Rule", value: "Rule" },
  { label: "User", value: "User" },
  { label: "Customer", value: "Customer" },
  { label: "Settings", value: "Settings" },
  { label: "Report", value: "Report" },
  { label: "System", value: "System" },
]

const dateRangeOptions = [
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom range", value: "custom" },
]

function formatTimestamp(ts: string): { date: string; time: string } {
  const d = new Date(ts)
  const date = d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
  return { date, time }
}

export default function AuditLogsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [dateRange, setDateRange] = React.useState("7d")
  const [actionFilter, setActionFilter] = React.useState("all")
  const [userFilter, setUserFilter] = React.useState("all")
  const [entityFilter, setEntityFilter] = React.useState("all")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const filteredLogs = React.useMemo(() => {
    let result = [...mockLogs]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (log) =>
          log.user.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.entityType.toLowerCase().includes(q)
      )
    }

    if (actionFilter !== "all") {
      result = result.filter((log) => log.action === actionFilter)
    }

    if (userFilter !== "all") {
      result = result.filter((log) => log.user === userFilter)
    }

    if (entityFilter !== "all") {
      result = result.filter((log) => log.entityType === entityFilter)
    }

    return result
  }, [searchQuery, actionFilter, userFilter, entityFilter])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleExport = () => {
    toast.success(`Exported ${filteredLogs.length} audit log entries as CSV`)
  }

  const hasActiveFilters =
    searchQuery !== "" || actionFilter !== "all" || userFilter !== "all" || entityFilter !== "all"

  const clearFilters = () => {
    setSearchQuery("")
    setActionFilter("all")
    setUserFilter("all")
    setEntityFilter("all")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      {/* Filter bar */}
      <Card className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user, action, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={dateRange}
            onChange={setDateRange}
            options={dateRangeOptions}
          />
          <Select
            value={actionFilter}
            onChange={setActionFilter}
            options={actionOptions}
          />
          <Select
            value={userFilter}
            onChange={setUserFilter}
            options={userOptions}
          />
          <Select
            value={entityFilter}
            onChange={setEntityFilter}
            options={entityOptions}
          />
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Sep 1 – Sep 8, 2026</span>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {filteredLogs.length} of {mockLogs.length} entries
            </p>
          </div>
        </div>
      </Card>

      {/* Logs table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Timestamp", "User", "Action", "Entity", "Description", "IP Address", "User Agent", ""].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const { date, time } = formatTimestamp(log.timestamp)
                const isExpanded = expandedId === log.id
                const action = actionConfig[log.action]
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={cn(
                        "cursor-pointer border-b border-border/30 transition-colors",
                        isExpanded ? "bg-muted/40" : "hover:bg-muted/25"
                      )}
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-sm tabular-nums text-foreground">{date}</span>
                        <span className="block text-xs tabular-nums text-muted-foreground">{time}</span>
                      </td>
                      <td className="px-4 py-3">
                        {log.user === "System" ? (
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500/20 text-slate-300">
                              <ShieldAlert className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-sm text-foreground">System</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar name={log.user} size="sm" />
                            <span className="text-sm text-foreground whitespace-nowrap">{log.user}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn("text-[11px]", action.className)}>
                          <span className="mr-1">{action.icon}</span>
                          {action.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{log.entityType}</span>
                        <span className="block font-mono text-xs text-primary">
                          {log.entityId !== "—" ? log.entityId : "—"}
                        </span>
                      </td>
                      <td className="max-w-[280px] px-4 py-3">
                        <span className="block truncate text-sm text-foreground" title={log.description}>
                          {log.description}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                        {log.ipAddress}
                      </td>
                      <td className="max-w-[160px] px-4 py-3">
                        <span className="block truncate font-mono text-xs text-muted-foreground" title={log.userAgent}>
                          {log.userAgent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-border/30 bg-muted/20">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 animate-fade-in">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Request Details
                              </p>
                              <DetailRow label="Log ID" value={log.id} />
                              <DetailRow label="Session ID" value={log.sessionId} />
                              <DetailRow label="Request ID" value={log.requestId} />
                              <DetailRow label="IP Address" value={log.ipAddress} />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Full User Agent
                              </p>
                              <div className="rounded-lg border border-border/50 bg-background p-3">
                                <p className="break-all font-mono text-xs text-muted-foreground">
                                  {log.userAgent}
                                </p>
                              </div>
                            </div>
                            {log.before && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Before
                                </p>
                                <pre className="overflow-x-auto rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 font-mono text-xs text-amber-400">
                                  {log.before}
                                </pre>
                              </div>
                            )}
                            {log.after && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  After
                                </p>
                                <pre className="overflow-x-auto rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 font-mono text-xs text-emerald-400">
                                  {log.after}
                                </pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium text-foreground">No audit log entries found</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {filteredLogs.length} of {mockLogs.length} log entries
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  )
}
