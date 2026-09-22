import { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  ExternalLink,
  UserPlus,
  FileSearch,
  MessageSquare,
  CreditCard,
  Users,
  Send,
  AlertOctagon,
  CheckCircle2,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Avatar } from "@/components/ui/avatar"
import { Timeline } from "@/components/ui/timeline"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import {
  getAlert,
  getTransaction,
  getCustomer,
  alerts,
} from "@/data/mock"
import type { Alert } from "@/data/mock"
import { cn, formatCurrency, timeAgo } from "@/lib/utils"

const severityConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  CRITICAL: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Critical" },
  HIGH: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "High" },
  MEDIUM: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", label: "Medium" },
  LOW: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Low" },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  INVESTIGATING: { label: "Investigating", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  CONFIRMED_FRAUD: { label: "Confirmed Fraud", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  FALSE_POSITIVE: { label: "False Positive", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  RESOLVED: { label: "Resolved", className: "bg-muted text-muted-foreground border-border/60" },
}

const statusOptions = [
  { label: "New", value: "NEW" },
  { label: "Investigating", value: "INVESTIGATING" },
  { label: "Confirmed Fraud", value: "CONFIRMED_FRAUD" },
  { label: "False Positive", value: "FALSE_POSITIVE" },
  { label: "Resolved", value: "RESOLVED" },
]

const analystOptions = [
  { label: "Gule Sakeena", value: "Gule Sakeena" },
  { label: "Raj Mehta", value: "Raj Mehta" },
  { label: "Unassigned", value: "" },
]

export default function AlertDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const alert = getAlert(id || "")
  const transaction = alert ? getTransaction(alert.transactionId) : undefined
  const customer = alert ? getCustomer(alert.customerId) : undefined
  const [status, setStatus] = useState(alert?.status || "NEW")
  const [assignee, setAssignee] = useState(alert?.assignedTo || "")
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState<
    { author: string; content: string; time: string }[]
  >([
    {
      author: "Gule Sakeena",
      content: "Initial review complete. Alert pattern matches known velocity abuse. Assigning for deep investigation.",
      time: "2026-09-07T10:00:00Z",
    },
  ])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [investigationDialogOpen, setInvestigationDialogOpen] = useState(false)

  const relatedAlerts = useMemo(() => {
    if (!alert) return []
    return alerts.filter(
      (a) =>
        a.id !== alert.id &&
        (a.customerId === alert.customerId ||
          a.transactionId === alert.transactionId)
    )
  }, [alert])

  if (!alert) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Alert Not Found"
          description="The requested alert could not be found."
          backHref="/alerts"
        />
        <Card className="flex flex-col items-center justify-center py-16">
          <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">
            Alert not found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The alert {id} does not exist or has been removed.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/alerts")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Alerts
          </Button>
        </Card>
      </div>
    )
  }

  const sev = severityConfig[alert.severity]
  const st = statusConfig[status]

  const handleAddNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        author: "Gule Sakeena",
        content: noteText,
        time: new Date().toISOString(),
      },
    ])
    setNoteText("")
  }

  const timelineItems = [
    {
      id: "tl-1",
      time: timeAgo(new Date(alert.createdAt)),
      title: "Alert Created",
      description: alert.description,
      status: "completed" as const,
      icon: AlertTriangle,
    },
    ...(alert.status !== "NEW"
      ? [
          {
            id: "tl-2",
            time: timeAgo(new Date(alert.updatedAt)),
            title: `Status changed to ${statusConfig[alert.status]?.label || alert.status}`,
            description: "Analyst updated alert status",
            status: "current" as const,
            icon: Shield,
          },
        ]
      : []),
    ...notes.map((n, i) => ({
      id: `tl-note-${i}`,
      time: timeAgo(new Date(n.time)),
      title: `Note by ${n.author}`,
      description: n.content,
      status: "completed" as const,
      icon: MessageSquare,
    })),
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={alert.id}
        description={alert.title}
        backHref="/alerts"
        breadcrumbs={[
          { label: "Alerts", href: "/alerts" },
          { label: alert.id },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("border", sev.bg, sev.text, sev.border)}>
              {sev.label}
            </Badge>
            <Badge variant="outline" className={cn("border", st.className)}>
              {st.label}
            </Badge>
            <Select
              value={status}
              onChange={(value) => setStatus(value as Alert["status"])}
              options={statusOptions}
            />
            <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign
            </Button>
            <Button size="sm" onClick={() => setInvestigationDialogOpen(true)}>
              <FileSearch className="mr-2 h-4 w-4" />
              Create Investigation
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                Alert Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">
                    {alert.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Severity</p>
                  <Badge variant="outline" className={cn("w-fit border", sev.bg, sev.text, sev.border)}>
                    {sev.label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <RiskBadge score={alert.riskScore} size="sm" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <p className="text-sm font-medium text-foreground">
                    P{alert.priority}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-foreground">
                    {timeAgo(new Date(alert.createdAt))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm text-foreground">
                    {timeAgo(new Date(alert.updatedAt))}
                  </p>
                </div>
              </div>
              <div className="space-y-1 pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {alert.description}
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground">Risk Factors</p>
                <div className="space-y-1.5">
                  {alert.reasons.map((reason, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-primary/5 border border-primary/10 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Shield className="h-4 w-4" />
                  Why was this flagged?
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed space-y-2">
                  {alert.severity === "CRITICAL" && (
                    <>
                      <p>
                        This alert was triggered by the fraud detection engine due to
                        multiple high-confidence risk indicators occurring simultaneously.
                        The pattern observed strongly matches known fraud methodologies.
                      </p>
                      <p>
                        <strong>Key observations:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {alert.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {alert.severity === "HIGH" && (
                    <>
                      <p>
                        This alert was generated based on a combination of behavioral
                        and network risk signals. The customer's recent activity shows
                        a significant deviation from their established baseline.
                      </p>
                      <p>
                        <strong>Analysis:</strong> {alert.description}
                      </p>
                    </>
                  )}
                  {alert.severity === "MEDIUM" && (
                    <>
                      <p>
                        Moderate risk indicators detected. While individually these
                        signals may be explainable, their combination warrants
                        human review.
                      </p>
                      <p>
                        <strong>Factors:</strong>{" "}
                        {alert.reasons.slice(0, 2).join("; ")}.
                      </p>
                    </>
                  )}
                  {alert.severity === "LOW" && (
                    <p>
                      Low-confidence alert triggered for monitoring purposes.
                      {alert.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <span className="font-mono">Model: FraudNet-v3.2</span>
                  <span className="text-border">|</span>
                  <span>Confidence: {Math.min(99, alert.riskScore + 5)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {transaction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Transaction Details
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/transactions/${transaction.id}`)
                    }
                  >
                    View Full
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Transaction ID
                    </p>
                    <p className="text-sm font-mono text-primary">
                      {transaction.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Merchant</p>
                    <p className="text-sm text-foreground">
                      {transaction.merchant}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm text-foreground">
                      {transaction.merchantCategory}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit text-[10px]",
                        transaction.status === "BLOCKED"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : transaction.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      )}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <RiskBadge score={transaction.riskScore} size="sm" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      Payment Method
                    </p>
                    <p className="text-sm text-foreground">
                      {transaction.paymentMethod.type} ••••{" "}
                      {transaction.paymentMethod.last4}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm text-foreground">
                      {transaction.location.city},{" "}
                      {transaction.location.country}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Device</p>
                    <p className="text-sm text-foreground">
                      {transaction.device.type} • {transaction.device.os}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IP Address</p>
                    <p className="text-sm font-mono text-foreground">
                      {transaction.ipAddress.ip}
                      {transaction.ipAddress.isVPN && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30"
                        >
                          VPN
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                {transaction.riskFactors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/30 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Risk Factors
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {transaction.riskFactors.map((factor, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="text-[10px] bg-red-500/5 text-red-400/80 border-red-500/20"
                        >
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Customer
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/customers/${customer.id}`)
                    }
                  >
                    Profile
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={customer.name} size="lg" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.email}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {customer.id}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Risk Score
                    </p>
                    <RiskBadge score={customer.riskScore} size="sm" />
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Status
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] w-fit",
                        customer.status === "SUSPENDED"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : customer.status === "FLAGGED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Transactions
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {customer.totalTransactions}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2.5 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Suspicious
                    </p>
                    <p className="text-sm font-bold text-red-400">
                      {customer.suspiciousTransactions}
                    </p>
                  </div>
                </div>
                {customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {customer.tags.slice(0, 5).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] bg-muted/50 text-muted-foreground"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={timelineItems} />
            </CardContent>
          </Card>

          {relatedAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Related Alerts ({relatedAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedAlerts.slice(0, 5).map((ra) => {
                  return (
                    <div
                      key={ra.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/alerts/${ra.id}`)}
                    >
                      <div
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full shrink-0",
                          ra.severity === "CRITICAL" || ra.severity === "HIGH"
                            ? "bg-red-500"
                            : ra.severity === "MEDIUM"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {ra.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {ra.id}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {timeAgo(new Date(ra.createdAt))}
                          </span>
                        </div>
                      </div>
                      <RiskBadge score={ra.riskScore} size="sm" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                />
                <Button
                  size="icon"
                  variant="default"
                  className="shrink-0 h-10 w-10"
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {[...notes].reverse().map((note, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-muted/20 border border-border/30 p-3 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={note.author} size="sm" />
                      <span className="text-xs font-medium text-foreground">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(new Date(note.time))}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed pl-9">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="sticky bottom-4 border-primary/20 bg-card/95 backdrop-blur-xl shadow-xl">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Quick Actions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setStatus("CONFIRMED_FRAUD")}
            >
              <AlertOctagon className="mr-2 h-4 w-4" />
              Mark as Fraud
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => setStatus("FALSE_POSITIVE")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as False Positive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus("RESOLVED")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Resolve
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog
        isOpen={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        title="Assign Analyst"
      >
        <div className="space-y-4">
          <Select
            value={assignee}
            onChange={setAssignee}
            options={analystOptions}
            label="Select Analyst"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setAssignDialogOpen(false)}>
              Assign
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={investigationDialogOpen}
        onClose={() => setInvestigationDialogOpen(false)}
        title="Create Investigation"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a new investigation from this alert. The alert details and
            related entities will be linked automatically.
          </p>
          <Input placeholder="Investigation Title" defaultValue={`Investigation: ${alert.title}`} />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setInvestigationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setInvestigationDialogOpen(false)
                navigate("/investigations")
              }}
            >
              <FileSearch className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
