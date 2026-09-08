import { useState, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  FolderSearch,
  Shield,
  Users,
  CreditCard,
  Smartphone,
  Globe,
  MapPin,
  Clock,
  Send,
  AlertOctagon,
  CheckCircle2,
  Ban,
  ExternalLink,
  MessageSquare,
  History,
  Link2,
  Flag,
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
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  getInvestigation,
  getCustomer,
  getTransaction,
  investigations,
  timelineEvents,
} from "@/data/mock"
import type { Investigation, Customer, Transaction } from "@/data/mock"
import { cn, formatCurrency, timeAgo } from "@/lib/utils"

const statusConfig: Record<
  Investigation["status"],
  { label: string; className: string }
> = {
  OPEN: { label: "Open", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  IN_PROGRESS: { label: "In Progress", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  CLOSED_FRAUD: { label: "Closed (Fraud)", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  CLOSED_FALSE_POSITIVE: { label: "Closed (False Positive)", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  CLOSED_RESOLVED: { label: "Closed (Resolved)", className: "bg-muted text-muted-foreground border-border/60" },
}

const statusOptions = [
  { label: "Open", value: "OPEN" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Closed (Fraud)", value: "CLOSED_FRAUD" },
  { label: "Closed (False Positive)", value: "CLOSED_FALSE_POSITIVE" },
  { label: "Closed (Resolved)", value: "CLOSED_RESOLVED" },
]

const priorityConfig: Record<number, { label: string; className: string }> = {
  1: { label: "P1 - Critical", className: "text-red-400 bg-red-500/15 border-red-500/30" },
  2: { label: "P2 - High", className: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
  3: { label: "P3 - Medium", className: "text-blue-400 bg-blue-500/15 border-blue-500/30" },
  4: { label: "P4 - Low", className: "text-muted-foreground bg-muted/50 border-border/60" },
}

const riskFactors = [
  { label: "Device Sharing", score: 95, color: "danger" as const },
  { label: "IP Overlap", score: 88, color: "danger" as const },
  { label: "Velocity Abuse", score: 82, color: "danger" as const },
  { label: "Geo Anomaly", score: 76, color: "warning" as const },
  { label: "Behavioral Drift", score: 65, color: "warning" as const },
  { label: "Account Age Risk", score: 45, color: "info" as const },
]

export default function InvestigationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const investigation = getInvestigation(id || "")
  const [status, setStatus] = useState(investigation?.status || "OPEN")
  const [noteText, setNoteText] = useState("")
  const [notes, setNotes] = useState(investigation?.notes || [])
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)

  const primaryCustomer = investigation
    ? getCustomer(investigation.customerIds[0])
    : undefined

  const linkedTransactions = useMemo(() => {
    if (!investigation) return []
    return investigation.transactionIds
      .map((tid) => getTransaction(tid))
      .filter((t): t is Transaction => Boolean(t))
      .slice(0, 5)
  }, [investigation])

  const relatedInvestigations = useMemo(() => {
    if (!investigation) return []
    return investigations.filter(
      (inv) =>
        inv.id !== investigation.id &&
        inv.customerIds.some((cid) =>
          investigation.customerIds.includes(cid)
        )
    )
  }, [investigation])

  const handleAddNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [
      ...prev,
      { author: "Gule Sakeena", content: noteText, createdAt: new Date().toISOString() },
    ])
    setNoteText("")
  }

  if (!investigation) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Investigation Not Found"
          description="The requested investigation could not be found."
          backHref="/investigations"
        />
        <Card className="flex flex-col items-center justify-center py-16">
          <FolderSearch className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">
            Investigation not found
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/investigations")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investigations
          </Button>
        </Card>
      </div>
    )
  }

  const st = statusConfig[status]
  const pri = priorityConfig[investigation.priority] || priorityConfig[4]

  const allLinkedCustomers = investigation.customerIds
    .map((cid) => getCustomer(cid))
    .filter((c): c is Customer => Boolean(c))

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span>{investigation.id}</span>
          </span>
        }
        description={investigation.title}
        backHref="/investigations"
        breadcrumbs={[
          { label: "Investigations", href: "/investigations" },
          { label: investigation.id },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("border text-xs", st.className)}>
              {st.label}
            </Badge>
            <Badge variant="outline" className={cn("border text-xs", pri.className)}>
              {pri.label}
            </Badge>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border/50">
              <Avatar name={investigation.assignedTo || "Unassigned"} size="sm" />
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {investigation.assignedTo || "Unassigned"}
                </p>
                <p className="text-[10px] text-muted-foreground">Analyst</p>
              </div>
            </div>
            <Select
              value={status}
              onChange={(value) => setStatus(value as Investigation["status"])}
              options={statusOptions}
            />
            <Button variant="outline" size="sm" onClick={() => setAssignDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-3 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Primary Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allLinkedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  className="rounded-lg border border-border/30 p-3 space-y-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => navigate(`/customers/${cust.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={cust.name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cust.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {cust.id}
                      </p>
                    </div>
                    <RiskBadge score={cust.riskScore} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">Spending</p>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(cust.totalSpending)}
                      </p>
                    </div>
                    <div className="rounded bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">Txns</p>
                      <p className="font-semibold text-foreground">
                        {cust.totalTransactions}
                      </p>
                    </div>
                    <div className="rounded bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">Suspicious</p>
                      <p className="font-semibold text-red-400">
                        {cust.suspiciousTransactions}
                      </p>
                    </div>
                    <div className="rounded bg-muted/30 px-2 py-1.5">
                      <p className="text-muted-foreground">Account Age</p>
                      <p className="font-semibold text-foreground">
                        {cust.accountAge}d
                      </p>
                    </div>
                  </div>
                  {cust.id !== investigation.customerIds[0] && (
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                      <Link2 className="mr-1 h-2.5 w-2.5" />
                      Linked
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                Linked Transactions ({linkedTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {linkedTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/20 cursor-pointer transition-colors border border-border/20"
                  onClick={() => navigate(`/transactions/${txn.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary">
                        {txn.id}
                      </span>
                      <RiskBadge score={txn.riskScore} size="sm" />
                    </div>
                    <p className="text-xs text-foreground mt-0.5 truncate">
                      {txn.merchant} • {formatCurrency(txn.amount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {txn.location.city}, {txn.location.country} •{" "}
                      {timeAgo(new Date(txn.createdAt))}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      txn.status === "BLOCKED"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : txn.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}
                  >
                    {txn.status}
                  </Badge>
                </div>
              ))}
              {linkedTransactions.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No transactions linked
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                Linked Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {primaryCustomer?.devices.slice(0, 4).map((devId) => (
                <div
                  key={devId}
                  className="flex items-center justify-between rounded-lg border border-border/20 p-2.5 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => navigate("/devices")}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-foreground">
                      {devId}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Linked IPs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {primaryCustomer?.ipAddresses.slice(0, 4).map((ip) => (
                <div
                  key={ip}
                  className="flex items-center justify-between rounded-lg border border-border/20 p-2.5 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => navigate("/ip-intelligence")}
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono text-foreground">
                      {ip}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Linked Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {primaryCustomer?.locations.map((loc) => (
                <div
                  key={loc}
                  className="flex items-center justify-between rounded-lg border border-border/20 p-2.5 hover:bg-muted/20 cursor-pointer transition-colors"
                  onClick={() => navigate("/locations")}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">{loc}</span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 xl:col-span-6 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                AI Investigation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-purple-500/5 border border-primary/10 p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Shield className="h-4 w-4" />
                  AI Analysis Summary
                </div>
                <div className="text-sm text-foreground/85 leading-relaxed space-y-3">
                  <p>
                    This investigation involves{" "}
                    {primaryCustomer && (
                      <>
                        a customer (<span className="font-mono text-primary">{primaryCustomer.id}</span>){" "}
                        who is part of a suspected fraud ring.{" "}
                      </>
                    )}
                    The analysis identified shared device fingerprints with{" "}
                    {Math.max(1, investigation.customerIds.length - 1)} other flagged
                    accounts, common IP addresses, and a pattern of rapid
                    small-value transactions followed by large purchases.
                  </p>
                  <div>
                    <p className="font-medium text-foreground mb-2">
                      Key findings:
                    </p>
                    <ul className="space-y-1.5">
                      {investigation.findings.map((finding, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-foreground/80"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-border/30">
                    <p className="font-medium text-foreground mb-1">
                      Recommended action:
                    </p>
                    <p className="text-foreground/80">
                      {investigation.status === "CLOSED_FRAUD"
                        ? "All connected accounts have been blocked and suspended. Law enforcement referral submitted."
                        : investigation.status === "CLOSED_FALSE_POSITIVE"
                        ? "Investigation determined this was a false positive. All accounts have been reinstated."
                        : "Block all connected accounts and escalate for manual review. Consider law enforcement referral."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                  <span className="font-mono">Model: FraudNet-v3.2</span>
                  <span className="text-border">|</span>
                  <span>Confidence: {Math.min(99, investigation.riskScore + 3)}%</span>
                  <span className="text-border">|</span>
                  <span>Analyzed: {timeAgo(new Date(investigation.updatedAt))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                Risk Signal Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskFactors.map((factor) => (
                <div key={factor.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{factor.label}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {factor.score}%
                    </span>
                  </div>
                  <ProgressBar
                    value={factor.score}
                    color={factor.color}
                    size="sm"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Event Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                events={timelineEvents.slice(0, 12).map((te) => ({
                  id: te.id,
                  time: timeAgo(new Date(te.timestamp)),
                  title: te.title,
                  description: te.description,
                  status:
                    te.type === "alert"
                      ? "error"
                      : te.type === "investigation"
                      ? "current"
                      : te.type === "note"
                      ? "completed"
                      : "completed",
                  icon:
                    te.type === "alert"
                      ? AlertOctagon
                      : te.type === "investigation"
                      ? FolderSearch
                      : te.type === "note"
                      ? MessageSquare
                      : te.type === "transaction"
                      ? CreditCard
                      : Shield,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 xl:col-span-3 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Investigation Notes
              </CardTitle>
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
                  className="shrink-0 h-10 w-10"
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                {[...notes].reverse().map((note, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-muted/20 border border-border/30 p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar name={note.author} size="sm" />
                      <span className="text-xs font-medium text-foreground">
                        {note.author}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {timeAgo(new Date(note.createdAt))}
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed pl-9">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertOctagon className="h-4 w-4 text-primary" />
                Analyst Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="destructive"
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatus("CLOSED_FRAUD")}
              >
                <AlertOctagon className="mr-2 h-4 w-4" />
                Mark as Confirmed Fraud
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                size="sm"
                onClick={() => setStatus("CLOSED_FALSE_POSITIVE")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as False Positive
              </Button>
              <div className="h-px bg-border/30 my-1" />
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Ban className="mr-2 h-4 w-4" />
                Block Customer
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Smartphone className="mr-2 h-4 w-4" />
                Block Device
              </Button>
              <div className="h-px bg-border/30 my-1" />
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
                onClick={() => setStatus("CLOSED_RESOLVED")}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Close Investigation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Investigation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    action: "Status changed to In Progress",
                    user: investigation.assignedTo || "System",
                    time: investigation.createdAt,
                  },
                  ...investigation.notes.map((n) => ({
                    action: "Note added",
                    user: n.author,
                    time: n.createdAt,
                  })),
                  {
                    action: "Risk score updated",
                    user: "System",
                    time: investigation.updatedAt,
                  },
                ]
                  .sort(
                    (a, b) =>
                      new Date(b.time).getTime() - new Date(a.time).getTime()
                  )
                  .slice(0, 8)
                  .map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{entry.action}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {entry.user}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">
                            {timeAgo(new Date(entry.time))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {relatedInvestigations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" />
              Related Investigations ({relatedInvestigations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedInvestigations.map((ri) => {
                const riSt = statusConfig[ri.status]
                return (
                  <div
                    key={ri.id}
                    className="rounded-lg border border-border/30 p-3 hover:bg-muted/20 cursor-pointer transition-colors space-y-2"
                    onClick={() => navigate(`/investigations/${ri.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-primary">
                        {ri.id}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] border", riSt.className)}
                      >
                        {riSt.label}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">
                      {ri.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <RiskBadge score={ri.riskScore} size="sm" />
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(new Date(ri.updatedAt))}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        isOpen={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        title="Assign Analyst"
      >
        <div className="space-y-4">
          <Select
            value={investigation.assignedTo || ""}
            onChange={() => {}}
            options={[
              { label: "Gule Sakeena", value: "Gule Sakeena" },
              { label: "Raj Mehta", value: "Raj Mehta" },
              { label: "Unassigned", value: "" },
            ]}
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
    </div>
  )
}
