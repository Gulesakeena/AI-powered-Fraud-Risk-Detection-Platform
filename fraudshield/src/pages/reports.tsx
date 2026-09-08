import { useState, useMemo } from "react"
import {
  Search,
  FileText,
  Calendar,
  Clock,
  Download,
  Eye,
  Trash2,
  BarChart3,
  Users,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronDown,
  Mail,
  FileSpreadsheet,
  File,
  Play,
  History,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
import { Tooltip } from "@/components/ui/tooltip"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { cn, timeAgo } from "@/lib/utils"

interface ReportType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  lastGenerated: string
  nextScheduled: string
  reportCount: number
  color: string
}

interface GeneratedReport {
  id: string
  name: string
  type: string
  generatedAt: string
  generatedBy: string
  status: "complete" | "generating" | "error"
  size: string
}

interface ScheduleForm {
  reportType: string
  frequency: string
  time: string
  recipients: string
  format: string
}

const reportTypes: ReportType[] = [
  {
    id: "daily-fraud",
    name: "Daily Fraud Activity",
    description: "Summary of all fraud-related activity for the day",
    icon: <Shield className="h-5 w-5" />,
    category: "Activity",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 245,
    color: "text-blue-400",
  },
  {
    id: "monthly-fraud",
    name: "Monthly Fraud Activity",
    description: "Comprehensive monthly fraud analysis",
    icon: <BarChart3 className="h-5 w-5" />,
    category: "Activity",
    lastGenerated: "2026-09-01T06:00:00Z",
    nextScheduled: "2026-10-01T06:00:00Z",
    reportCount: 12,
    color: "text-purple-400",
  },
  {
    id: "high-risk-customers",
    name: "High-Risk Customers",
    description: "Customers with elevated risk profiles",
    icon: <Users className="h-5 w-5" />,
    category: "Risk",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 189,
    color: "text-amber-400",
  },
  {
    id: "high-risk-transactions",
    name: "High-Risk Transactions",
    description: "Transactions flagged as high risk",
    icon: <AlertTriangle className="h-5 w-5" />,
    category: "Risk",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 312,
    color: "text-orange-400",
  },
  {
    id: "confirmed-fraud",
    name: "Confirmed Fraud",
    description: "Confirmed fraud incidents and losses",
    icon: <XCircle className="h-5 w-5" />,
    category: "Incidents",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 47,
    color: "text-red-400",
  },
  {
    id: "false-positives",
    name: "False Positives",
    description: "False positive analysis and model accuracy",
    icon: <CheckCircle2 className="h-5 w-5" />,
    category: "Performance",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 85,
    color: "text-emerald-400",
  },
  {
    id: "fraud-trends",
    name: "Fraud Trends",
    description: "Emerging fraud patterns and trend analysis",
    icon: <TrendingUp className="h-5 w-5" />,
    category: "Analysis",
    lastGenerated: "2026-09-01T06:00:00Z",
    nextScheduled: "2026-10-01T06:00:00Z",
    reportCount: 36,
    color: "text-cyan-400",
  },
  {
    id: "rule-performance",
    name: "Rule Performance",
    description: "Detection rules effectiveness and trigger statistics",
    icon: <Activity className="h-5 w-5" />,
    category: "Performance",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 178,
    color: "text-indigo-400",
  },
  {
    id: "model-performance",
    name: "Model Performance",
    description: "ML model precision, recall, and accuracy metrics",
    icon: <Activity className="h-5 w-5" />,
    category: "Performance",
    lastGenerated: "2026-09-08T06:00:00Z",
    nextScheduled: "2026-09-09T06:00:00Z",
    reportCount: 64,
    color: "text-pink-400",
  },
]

const generatedReports: GeneratedReport[] = [
  { id: "GEN-001", name: "Daily Fraud Activity", type: "daily-fraud", generatedAt: "2026-09-08T06:00:00Z", generatedBy: "System", status: "complete", size: "2.4 MB" },
  { id: "GEN-002", name: "High-Risk Customer Report", type: "high-risk-customers", generatedAt: "2026-09-08T06:05:00Z", generatedBy: "System", status: "complete", size: "1.8 MB" },
  { id: "GEN-003", name: "High-Risk Transactions", type: "high-risk-transactions", generatedAt: "2026-09-08T06:10:00Z", generatedBy: "System", status: "complete", size: "3.1 MB" },
  { id: "GEN-004", name: "Rule Performance Report", type: "rule-performance", generatedAt: "2026-09-08T06:15:00Z", generatedBy: "Gule Sakeena", status: "complete", size: "1.2 MB" },
  { id: "GEN-005", name: "Model Performance", type: "model-performance", generatedAt: "2026-09-08T06:20:00Z", generatedBy: "System", status: "generating", size: "—" },
  { id: "GEN-006", name: "Daily Fraud Activity", type: "daily-fraud", generatedAt: "2026-09-07T06:00:00Z", generatedBy: "System", status: "complete", size: "2.2 MB" },
  { id: "GEN-007", name: "Confirmed Fraud", type: "confirmed-fraud", generatedAt: "2026-09-07T06:10:00Z", generatedBy: "System", status: "complete", size: "0.9 MB" },
  { id: "GEN-008", name: "High-Risk Customers", type: "high-risk-customers", generatedAt: "2026-09-07T06:05:00Z", generatedBy: "Raj Mehta", status: "error", size: "—" },
  { id: "GEN-009", name: "False Positives Report", type: "false-positives", generatedAt: "2026-09-07T07:00:00Z", generatedBy: "System", status: "complete", size: "1.5 MB" },
  { id: "GEN-010", name: "Network Analysis", type: "high-risk-customers", generatedAt: "2026-09-06T06:00:00Z", generatedBy: "System", status: "complete", size: "2.8 MB" },
]

const reportTypeOptions = reportTypes.map((rt) => ({ label: rt.name, value: rt.id }))

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]

const formatOptions = [
  { label: "CSV", value: "csv" },
  { label: "PDF", value: "pdf" },
  { label: "Both", value: "both" },
]

const emptyScheduleForm: ScheduleForm = {
  reportType: "",
  frequency: "daily",
  time: "06:00",
  recipients: "",
  format: "both",
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  complete: {
    label: "Complete",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  generating: {
    label: "Generating",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  error: {
    label: "Error",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: <XCircle className="h-3 w-3" />,
  },
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(emptyScheduleForm)
  const [localReports, setLocalReports] = useState<GeneratedReport[]>(generatedReports)

  const counts = useMemo(
    () => ({
      all: reportTypes.length,
      activity: reportTypes.filter((r) => r.category === "Activity").length,
      risk: reportTypes.filter((r) => r.category === "Risk").length,
      incidents: reportTypes.filter((r) => r.category === "Incidents").length,
      performance: reportTypes.filter((r) => r.category === "Performance").length,
      analysis: reportTypes.filter((r) => r.category === "Analysis").length,
    }),
    []
  )

  const filteredReportTypes = useMemo(() => {
    let result = reportTypes

    if (activeTab !== "all") {
      result = result.filter(
        (r) => r.category.toLowerCase() === activeTab
      )
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [activeTab, search])

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "activity", label: "Activity", count: counts.activity },
    { id: "risk", label: "Risk", count: counts.risk },
    { id: "incidents", label: "Incidents", count: counts.incidents },
    { id: "performance", label: "Performance", count: counts.performance },
    { id: "analysis", label: "Analysis", count: counts.analysis },
  ]

  const handleSaveSchedule = () => {
    setShowScheduleModal(false)
    setScheduleForm(emptyScheduleForm)
  }

  const deleteGeneratedReport = (id: string) => {
    setLocalReports((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and manage fraud intelligence reports"
        actions={
          <Button onClick={() => setShowScheduleModal(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Report
          </Button>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search report types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReportTypes.map((report) => (
          <Card
            key={report.id}
            className="hover:shadow-lg transition-all duration-200 group"
          >
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-lg bg-muted/50 p-2.5",
                      report.color
                    )}
                  >
                    {report.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {report.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="text-[10px] bg-muted/50 text-muted-foreground border-transparent"
                    >
                      {report.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {report.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>Last: {timeAgo(new Date(report.lastGenerated))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>
                    Next:{" "}
                    {new Date(report.nextScheduled).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 shrink-0" />
                  <span>{report.reportCount} reports generated</span>
                </div>
              </div>

              <div className="flex items-center gap-1 pt-2 border-t border-border/30">
                <Tooltip content="Generate Now">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  }
                  items={[
                    {
                      label: "Export CSV",
                      icon: <FileSpreadsheet className="h-3.5 w-3.5" />,
                      onClick: () => {},
                    },
                    {
                      label: "Export PDF",
                      icon: <File className="h-3.5 w-3.5" />,
                      onClick: () => {},
                    },
                  ]}
                />
                <Tooltip content="Schedule">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setScheduleForm((prev) => ({
                        ...prev,
                        reportType: report.id,
                      }))
                      setShowScheduleModal(true)
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content="View History">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <History className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReportTypes.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No report types found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search terms
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {localReports.map((report) => {
                  const st = statusConfig[report.status]
                  const rt = reportTypes.find((r) => r.id === report.type)
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "rounded-lg bg-muted/50 p-2 shrink-0",
                              rt?.color || "text-muted-foreground"
                            )}
                          >
                            {rt?.icon || <FileText className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {report.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted/50 text-muted-foreground border-transparent"
                        >
                          {rt?.category || report.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {timeAgo(new Date(report.generatedAt))}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {report.generatedBy}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] border-transparent", st.className)}
                        >
                          <span className="flex items-center gap-1">
                            {st.icon}
                            {st.label}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {report.size}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {report.status === "complete" && (
                            <Tooltip content="Download">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </Tooltip>
                          )}
                          <Tooltip content="View">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-400"
                              onClick={() => deleteGeneratedReport(report.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      <Dialog
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Report"
        size="md"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Report Type</label>
            <div className="relative">
              <select
                value={scheduleForm.reportType}
                onChange={(e) =>
                  setScheduleForm((prev) => ({ ...prev, reportType: e.target.value }))
                }
                className="flex h-10 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select report type</option>
                {reportTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Frequency</label>
              <div className="relative">
                <select
                  value={scheduleForm.frequency}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({ ...prev, frequency: e.target.value }))
                  }
                  className="flex h-10 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {frequencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <Input
                type="time"
                value={scheduleForm.time}
                onChange={(e) =>
                  setScheduleForm((prev) => ({ ...prev, time: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Recipients</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter email addresses (comma separated)"
                value={scheduleForm.recipients}
                onChange={(e) =>
                  setScheduleForm((prev) => ({ ...prev, recipients: e.target.value }))
                }
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Format</label>
            <div className="relative">
              <select
                value={scheduleForm.format}
                onChange={(e) =>
                  setScheduleForm((prev) => ({ ...prev, format: e.target.value }))
                }
                className="flex h-10 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSchedule}
              disabled={!scheduleForm.reportType}
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
