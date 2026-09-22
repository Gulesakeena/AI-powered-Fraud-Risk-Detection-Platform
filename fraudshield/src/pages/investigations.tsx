import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  FolderSearch,
  Plus,
  Search,
  Clock,
  ChevronRight,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Users,
  FileText,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tooltip } from "@/components/ui/tooltip"
import { investigations } from "@/data/mock"
import type { Investigation } from "@/data/mock"
import { cn, timeAgo } from "@/lib/utils"

const statusConfig: Record<
  Investigation["status"],
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  OPEN: {
    label: "Open",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: FolderOpen,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Clock,
  },
  CLOSED_FRAUD: {
    label: "Closed (Fraud)",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: XCircle,
  },
  CLOSED_FALSE_POSITIVE: {
    label: "Closed (False Positive)",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: CheckCircle2,
  },
  CLOSED_RESOLVED: {
    label: "Closed (Resolved)",
    className: "bg-muted text-muted-foreground border-border/60",
    icon: CheckCircle2,
  },
}

const priorityColor = (p: number) => {
  if (p <= 1) return "text-red-400 bg-red-500/15 border-red-500/30"
  if (p === 2) return "text-amber-400 bg-amber-500/15 border-amber-500/30"
  if (p === 3) return "text-blue-400 bg-blue-500/15 border-blue-500/30"
  return "text-muted-foreground bg-muted/50 border-border/60"
}

export default function InvestigationsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")

  const counts = useMemo(
    () => ({
      all: investigations.length,
      OPEN: investigations.filter((i) => i.status === "OPEN").length,
      IN_PROGRESS: investigations.filter((i) => i.status === "IN_PROGRESS").length,
      CLOSED: investigations.filter((i) =>
        i.status.startsWith("CLOSED")
      ).length,
    }),
    []
  )

  const filtered = useMemo(() => {
    return investigations.filter((inv) => {
      if (activeTab === "OPEN" && inv.status !== "OPEN") return false
      if (activeTab === "IN_PROGRESS" && inv.status !== "IN_PROGRESS") return false
      if (activeTab === "CLOSED" && !inv.status.startsWith("CLOSED")) return false
      if (
        search &&
        !inv.title.toLowerCase().includes(search.toLowerCase()) &&
        !inv.id.toLowerCase().includes(search.toLowerCase()) &&
        !(inv.assignedTo || "").toLowerCase().includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [activeTab, search])

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "OPEN", label: "Open", count: counts.OPEN },
    { id: "IN_PROGRESS", label: "In Progress", count: counts.IN_PROGRESS },
    { id: "CLOSED", label: "Closed", count: counts.CLOSED },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investigations"
        description="Active and completed fraud investigations"
        actions={
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Investigation
          </Button>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Open", value: counts.OPEN, icon: FolderOpen, color: "text-blue-400" },
          {
            label: "In Progress",
            value: counts.IN_PROGRESS,
            icon: Clock,
            color: "text-amber-400",
          },
          {
            label: "Closed (Fraud)",
            value: investigations.filter((i) => i.status === "CLOSED_FRAUD").length,
            icon: XCircle,
            color: "text-red-400",
          },
          {
            label: "Closed (Resolved)",
            value: investigations.filter((i) => i.status === "CLOSED_RESOLVED").length,
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
          {
            label: "Closed (FP)",
            value: investigations.filter((i) => i.status === "CLOSED_FALSE_POSITIVE").length,
            icon: CheckCircle2,
            color: "text-emerald-400",
          },
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

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search investigations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <FolderSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">
            No investigations found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Investigation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Entities
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((inv) => {
                  const st = statusConfig[inv.status]
                  const StatusIcon = st.icon
                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-muted/20 cursor-pointer transition-colors"
                      onClick={() => navigate(`/investigations/${inv.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-primary/10 p-1.5">
                            <FolderSearch className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate max-w-[300px]">
                              {inv.title}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {inv.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] border", st.className)}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {st.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-bold border w-8 h-6 justify-center",
                            priorityColor(inv.priority)
                          )}
                        >
                          P{inv.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        {inv.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={inv.assignedTo} size="sm" />
                            <span className="text-sm text-foreground">
                              {inv.assignedTo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <RiskBadge score={inv.riskScore} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="h-3.5 w-3.5" />
                          <span>{inv.customerIds.length}</span>
                          <span className="text-border">/</span>
                          <FileText className="h-3.5 w-3.5" />
                          <span>{inv.transactionIds.length}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(new Date(inv.createdAt))}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(new Date(inv.updatedAt))}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Tooltip content="Open">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                navigate(`/investigations/${inv.id}`)
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
