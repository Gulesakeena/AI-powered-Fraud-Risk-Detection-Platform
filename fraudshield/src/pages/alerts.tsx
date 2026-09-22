import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  UserPlus,
  XCircle,
  Clock,
  CheckCircle2,
  XOctagon,
  CircleDot,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tooltip } from "@/components/ui/tooltip"
import { alerts } from "@/data/mock"
import type { Alert } from "@/data/mock"
import { cn, timeAgo } from "@/lib/utils"

const severityConfig: Record<
  Alert["severity"],
  { border: string; bg: string; text: string; label: string }
> = {
  CRITICAL: {
    border: "border-l-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "Critical",
  },
  HIGH: {
    border: "border-l-red-400",
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "High",
  },
  MEDIUM: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "Medium",
  },
  LOW: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "Low",
  },
}

const statusConfig: Record<
  Alert["status"],
  { label: string; className: string }
> = {
  NEW: { label: "New", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  INVESTIGATING: { label: "Investigating", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  CONFIRMED_FRAUD: { label: "Confirmed Fraud", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  FALSE_POSITIVE: { label: "False Positive", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  RESOLVED: { label: "Resolved", className: "bg-muted text-muted-foreground border-border/60" },
}

const typeLabels: Record<Alert["type"], string> = {
  new_device: "New Device",
  unusual_amount: "Unusual Amount",
  velocity: "Velocity",
  location: "Location",
  behavioral: "Behavioral",
  network: "Network",
}

const severityOptions = [
  { label: "All Severities", value: "all" },
  { label: "Critical", value: "CRITICAL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
]

const typeOptions = [
  { label: "All Types", value: "all" },
  { label: "New Device", value: "new_device" },
  { label: "Unusual Amount", value: "unusual_amount" },
  { label: "Velocity", value: "velocity" },
  { label: "Location", value: "location" },
  { label: "Behavioral", value: "behavioral" },
  { label: "Network", value: "network" },
]

export default function AlertsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const counts = useMemo(
    () => ({
      all: alerts.length,
      NEW: alerts.filter((a) => a.status === "NEW").length,
      INVESTIGATING: alerts.filter((a) => a.status === "INVESTIGATING").length,
      CONFIRMED_FRAUD: alerts.filter((a) => a.status === "CONFIRMED_FRAUD").length,
      FALSE_POSITIVE: alerts.filter((a) => a.status === "FALSE_POSITIVE").length,
      RESOLVED: alerts.filter((a) => a.status === "RESOLVED").length,
    }),
    []
  )

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (activeTab !== "all" && alert.status !== activeTab) return false
      if (
        search &&
        !alert.title.toLowerCase().includes(search.toLowerCase()) &&
        !alert.id.toLowerCase().includes(search.toLowerCase()) &&
        !alert.customerName.toLowerCase().includes(search.toLowerCase()) &&
        !alert.transactionId.toLowerCase().includes(search.toLowerCase())
      )
        return false
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false
      if (typeFilter !== "all" && alert.type !== typeFilter) return false
      return true
    })
  }, [activeTab, search, severityFilter, typeFilter])

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "NEW", label: "New", count: counts.NEW },
    { id: "INVESTIGATING", label: "Investigating", count: counts.INVESTIGATING },
    { id: "CONFIRMED_FRAUD", label: "Confirmed Fraud", count: counts.CONFIRMED_FRAUD },
    { id: "FALSE_POSITIVE", label: "False Positive", count: counts.FALSE_POSITIVE },
    { id: "RESOLVED", label: "Resolved", count: counts.RESOLVED },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Alerts"
        description="Monitor and manage risk alerts"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total Alerts", value: counts.all, icon: AlertTriangle, color: "text-foreground" },
          { label: "New", value: counts.NEW, icon: CircleDot, color: "text-blue-400" },
          { label: "Investigating", value: counts.INVESTIGATING, icon: Eye, color: "text-amber-400" },
          { label: "Confirmed", value: counts.CONFIRMED_FRAUD, icon: XOctagon, color: "text-red-400" },
          { label: "False Positive", value: counts.FALSE_POSITIVE, icon: CheckCircle2, color: "text-emerald-400" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg bg-muted/50 p-2", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search alerts by ID, customer, transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severityOptions}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No alerts found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search terms
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const sev = severityConfig[alert.severity]
            const st = statusConfig[alert.status]
            return (
              <Card
                key={alert.id}
                className={cn(
                  "border-l-4 hover:shadow-lg transition-shadow cursor-pointer",
                  sev.border
                )}
                onClick={() => navigate(`/alerts/${alert.id}`)}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider", sev.bg, sev.text, "border-transparent")}>
                          {sev.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", st.className)}>
                          {st.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[alert.type]}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">
                        {alert.title}
                      </h3>
                    </div>
                    <RiskBadge score={alert.riskScore} size="sm" />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span
                      className="font-mono text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/transactions/${alert.transactionId}`)
                      }}
                    >
                      {alert.transactionId}
                    </span>
                    <span
                      className="hover:text-foreground hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/customers/${alert.customerId}`)
                      }}
                    >
                      {alert.customerName}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {alert.reasons.slice(0, 3).map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                    {alert.reasons.length > 3 && (
                      <p className="text-xs text-muted-foreground/60">
                        +{alert.reasons.length - 3} more reasons
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{timeAgo(new Date(alert.createdAt))}</span>
                      </div>
                      {alert.assignedTo && (
                        <div className="flex items-center gap-1.5">
                          <Avatar name={alert.assignedTo} size="sm" />
                          <span className="text-xs text-muted-foreground">{alert.assignedTo}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Tooltip content="Investigate">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/alerts/${alert.id}`)
                          }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Assign">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <UserPlus className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Dismiss">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/50">
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
