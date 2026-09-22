import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Search,
  Shield,
  Flag,
  StickyNote,
  Plus,
  CheckCircle2,
  Smartphone,
  Globe,
  ExternalLink,
  Clock,
  MapPin,
  CreditCard,
  Laptop,
  Monitor,
  Tablet,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RiskBadge } from "@/components/ui/risk-badge"
import { RiskScore } from "@/components/ui/risk-score"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Timeline } from "@/components/ui/timeline"
import { Input } from "@/components/ui/input"
import {
  getTransaction,
  getCustomer,
  getCustomerTransactions,
  devices,
  ipAddresses,
  investigations,
} from "@/data/mock"
import {
  formatCurrency,
  timeAgo,
} from "@/lib/utils"

const statusVariant: Record<string, string> = {
  COMPLETED: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  PENDING: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  BLOCKED: "border-red-500/30 bg-red-500/15 text-red-400",
  REVIEWING: "border-blue-500/30 bg-blue-500/15 text-blue-400",
}

const deviceIcon: Record<string, React.ReactNode> = {
  Desktop: <Monitor className="h-4 w-4" />,
  Mobile: <Smartphone className="h-4 w-4" />,
  Tablet: <Tablet className="h-4 w-4" />,
}

const riskBreakdown = [
  { label: "Customer Behavior", value: 90, color: "danger" as const },
  { label: "ML Anomaly Score", value: 72, color: "warning" as const },
  { label: "Rules", value: 85, color: "warning" as const },
  { label: "Velocity", value: 92, color: "danger" as const },
  { label: "Location", value: 78, color: "warning" as const },
]

const timelineEvents = [
  { id: "1", time: "10:42:01", title: "Login detected", description: "New device", status: "completed" as const, icon: Laptop },
  { id: "2", time: "10:43:12", title: "Location changed", description: "New geographic region", status: "completed" as const, icon: MapPin },
  { id: "3", time: "10:44:01", title: "Transaction initiated", description: "$1,249.00 at Electronics Store", status: "completed" as const, icon: CreditCard },
  { id: "4", time: "10:44:04", title: "Rule triggered", description: "New device + unusual amount rules fired", status: "current" as const, icon: ShieldAlert },
  { id: "5", time: "10:44:05", title: "ML anomaly detected", description: "Behavioral model flagged transaction", status: "current" as const, icon: AlertTriangle },
  { id: "6", time: "10:44:06", title: "Risk score calculated", description: "Final composite score: 87", status: "current" as const, icon: Shield },
  { id: "7", time: "10:44:06", title: "Alert created", description: "Altitude alert: ALERT-10293", status: "pending" as const, icon: Flag },
]

interface InvestigationNote {
  author: string
  content: string
  createdAt: string
}

export default function TransactionDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const transaction = getTransaction(id ?? "")

  const [noteText, setNoteText] = React.useState("")
  const [notes, setNotes] = React.useState<InvestigationNote[]>(() => {
    const inv = investigations.find((i) => i.transactionIds.includes(transaction?.id ?? ""))
    return (inv?.notes ?? []).map((n) => n)
  })

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="mb-4 h-12 w-12 text-amber-400" />
        <h2 className="text-xl font-semibold text-foreground">Transaction not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The transaction you're looking for doesn't exist.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate("/transactions")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Transactions
        </Button>
      </div>
    )
  }

  const customer = getCustomer(transaction.customerId)
  const customerTransactions = getCustomerTransactions(transaction.customerId)
  const relatedTransactions = customerTransactions
    .filter((t) => t.id !== transaction.id)
    .filter((t) => t.riskScore >= 30)
    .slice(0, 5)

  const relatedDevices = devices
    .filter((d) => d.customerIds.includes(transaction.customerId))
    .slice(0, 4)

  const relatedIPs = ipAddresses
    .filter((ip) => ip.customerIds.includes(transaction.customerId))
    .slice(0, 4)

  const addNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        author: "Gule Sakeena",
        content: noteText.trim(),
        createdAt: new Date().toISOString(),
      },
    ])
    setNoteText("")
    toast.success("Note added to investigation")
  }

  const accountAgeDays = customer ? Math.floor(customer.accountAge / 30.44) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={transaction.id}
        description="Transaction investigation workspace"
        backHref="/transactions"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="destructive" onClick={() => toast.success("Transaction blocked")}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Block Transaction
            </Button>
            <Button variant="outline" onClick={() => toast.success("Transaction approved")}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" onClick={() => toast.success("Investigation created")}>
              <Search className="mr-2 h-4 w-4" />
              Create Investigation
            </Button>
            <Button variant="outline" onClick={() => toast.success("Note added")}>
              <StickyNote className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        }
      />

      {/* Status + risk summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/50 bg-card/80 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2">
            <Badge className={statusVariant[transaction.status]} variant="outline">
              {transaction.status.charAt(0) + transaction.status.slice(1).toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {timeAgo(new Date(transaction.createdAt))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {transaction.location.city}, {transaction.location.country}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiskScore score={transaction.riskScore} size="xl" showLabel />
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* AI Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
              <CardDescription>Machine learning risk assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/40 bg-muted/30 p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  "This transaction significantly differs from the customer's normal behavior and
                  matches multiple known risk indicators."
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-foreground">Risk factors</p>
                <ul className="space-y-2">
                  {transaction.riskFactors.length > 0 ? (
                    transaction.riskFactors.map((factor, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {factor}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        Transaction amount is 12× higher than customer's average
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        New device detected
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        New geographic location
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        3 transactions within 5 minutes
                      </li>
                      <li className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        Account is only 8 days old
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Confidence</span>
                  <span className="text-xl font-bold text-primary">94%</span>
                </div>
                <Button variant="ghost" size="sm">
                  View detailed reasoning
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Risk Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Breakdown</CardTitle>
              <CardDescription>Composite risk scoring by signal source</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskBreakdown.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {item.value}
                    </span>
                  </div>
                  <ProgressBar value={item.value} color={item.color} />
                </div>
              ))}
              <div className="mt-2 flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Final Risk Score</span>
                <div className="flex items-center gap-2">
                  <RiskBadge
                    score={transaction.riskScore}
                    size="md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Timeline</CardTitle>
              <CardDescription>Event sequence leading to risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Timeline events={timelineEvents.map((e) => ({ ...e }))} />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-6 lg:col-span-1">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Amount
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Merchant
                  </p>
                  <p className="mt-1 font-medium text-foreground">{transaction.merchant}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </p>
                  <p className="mt-1 font-medium text-foreground">{transaction.merchantCategory}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Payment
                  </p>
                  <p className="mt-1 font-mono font-medium text-foreground">
                    {transaction.paymentMethod.type} •••• {transaction.paymentMethod.last4}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    IP
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-mono font-medium text-foreground">
                      {transaction.ipAddress.ip}
                    </span>
                    {transaction.ipAddress.isVPN && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/15 text-amber-400">
                        VPN
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Device
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {deviceIcon[transaction.device.type]}
                    <span className="font-mono font-medium text-foreground">{transaction.device.id}</span>
                    {!transaction.device.isKnown && (
                      <Badge variant="outline" className="border-amber-500/30 bg-amber-500/15 text-amber-400">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {transaction.location.city}, {transaction.location.countryCode}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 text-sm text-foreground">{transaction.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Context */}
          {customer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Customer Context
                  <Link to={`/customers/${customer.id}`}>
                    <Button variant="ghost" size="sm">
                      View Profile
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{customer.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{customer.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Risk Level</p>
                    <div className="mt-1">
                      <RiskBadge score={customer.riskScore} size="sm" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Risk Score</p>
                    <p className="mt-1 font-mono text-lg font-bold text-foreground">{customer.riskScore}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Total Transactions</p>
                    <p className="mt-1 font-bold text-foreground">{customer.totalTransactions}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Suspicious</p>
                    <p className="mt-1 font-bold text-red-400">{customer.suspiciousTransactions}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Devices</p>
                    <p className="mt-1 font-bold text-foreground">{customer.devices.length}</p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-3">
                    <p className="text-xs text-muted-foreground">Locations</p>
                    <p className="mt-1 font-bold text-foreground">{customer.locations.length}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Account Age
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {customer.accountAge} days ({accountAgeDays} months)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Related Transactions</CardTitle>
              <CardDescription>Suspicious transactions from same customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedTransactions.length > 0 ? (
                relatedTransactions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/transactions/${t.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium text-foreground">{t.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.merchant} · {formatCurrency(t.amount)}
                      </p>
                    </div>
                    <RiskBadge score={t.riskScore} size="sm" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No related suspicious transactions.</p>
              )}
            </CardContent>
          </Card>

          {/* Related Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Related Devices</CardTitle>
              <CardDescription>Devices linked to this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedDevices.length > 0 ? (
                relatedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {deviceIcon[device.type]}
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-medium text-foreground">{device.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {device.os} · {device.browser} · {device.totalTransactions} txn
                        </p>
                      </div>
                    </div>
                    <RiskBadge score={device.riskScore} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No related devices.</p>
              )}
            </CardContent>
          </Card>

          {/* Related IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Related IPs</CardTitle>
              <CardDescription>IP addresses linked to this customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedIPs.length > 0 ? (
                relatedIPs.map((ip) => (
                  <div
                    key={ip.ip}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/40 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm font-medium text-foreground">{ip.ip}</p>
                        <p className="text-xs text-muted-foreground">
                          {ip.city}, {ip.country} · {ip.totalTransactions} txn
                          {ip.isVPN && " · VPN"}
                          {ip.isTor && " · Tor"}
                        </p>
                      </div>
                    </div>
                    <RiskBadge score={ip.riskScore} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No related IPs.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom: Investigation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Investigation Notes</CardTitle>
          <CardDescription>Collaborative notes for this investigation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a note to the investigation..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote()
              }}
            />
            <Button onClick={addNote}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
          <div className="space-y-3">
            {notes.length > 0 ? (
              notes.map((note, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border/40 bg-muted/30 p-4"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{note.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(new Date(note.createdAt))}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No notes yet. Add your first note above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
