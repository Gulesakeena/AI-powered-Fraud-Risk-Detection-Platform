import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Users,
  CreditCard,
  DollarSign,
  AlertTriangle,
  Smartphone,
  Calendar,
  Ban,
  Flag,
  PauseCircle,
  FolderSearch,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Globe,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Tag,
} from "lucide-react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts"
import { getCustomer, getCustomerTransactions, devices, ipAddresses } from "@/data/mock"
import { cn, formatCurrency, timeAgo } from "@/lib/utils"
import { MetricCard } from "@/components/ui/metric-card"
import { RiskScore } from "@/components/ui/risk-score"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ChartCard } from "@/components/ui/chart-card"

function generateSpendingData() {
  const data = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const avg = 800 + Math.sin(i * 0.3) * 200
    const current = avg + (Math.random() > 0.85 ? avg * 1.5 : 0) + (Math.random() - 0.5) * 300
    const threshold = avg * 2.5
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      historical: Math.round(avg),
      current: Math.round(Math.max(0, current)),
      threshold: Math.round(threshold),
    })
  }
  return data
}

function generateRiskTimelineData(riskScore: number) {
  const data = []
  let score = Math.max(5, riskScore - 40 + Math.floor(Math.random() * 20))
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const trend = riskScore > 50 ? 1.5 : -0.5
    score = Math.min(100, Math.max(0, score + trend + (Math.random() - 0.48) * 8))
    if (i < 5) score = score + (riskScore - score) * 0.6
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(score),
    })
  }
  return data
}

function generateHeatmapData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return days.flatMap((day, di) =>
    hours.map((hour) => {
      const base = Math.sin((hour - 6) * 0.3) * 0.5 + 0.5
      const weekendBoost = di >= 5 ? 0.3 : 0
      const value = Math.max(0, Math.min(1, base + weekendBoost + (Math.random() - 0.4) * 0.3))
      return { day, hour, value, label: `${hour}:00` }
    })
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null
  return (
    <div className="rounded-lg border border-border/50 bg-card p-3 shadow-xl">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export default function CustomerRiskProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const customerId = id || "CUST-0001"
  const customer = getCustomer(customerId)
  const customerTransactions = getCustomerTransactions(customerId)

  const spendingData = useMemo(() => generateSpendingData(), [])
  const riskTimelineData = useMemo(
    () => generateRiskTimelineData(customer?.riskScore || 10),
    [customer?.riskScore]
  )
  const heatmapData = useMemo(() => generateHeatmapData(), [])

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Customer Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customer {customerId} could not be found.
        </p>
        <Button className="mt-4" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    )
  }

  const recentTransactions = [...customerTransactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  const customerDevices = devices.filter((d) => customer.devices.includes(d.id))
  const customerIps = ipAddresses.filter((ip) => customer.ipAddresses.includes(ip.ip))

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE": return "risk-low" as const
      case "FLAGGED": return "risk-medium" as const
      case "SUSPENDED": return "risk-high" as const
      default: return "outline" as const
    }
  }

  const getHeatColor = (value: number) => {
    if (value < 0.2) return "bg-emerald-500/10"
    if (value < 0.4) return "bg-emerald-500/25"
    if (value < 0.6) return "bg-amber-500/30"
    if (value < 0.8) return "bg-amber-500/50"
    return "bg-red-500/60"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-6">
          <button
            onClick={() => navigate("/customers")}
            className="mt-2 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
              <RiskBadge score={customer.riskScore} />
              <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{customer.id}</p>
            <div className="flex flex-wrap gap-2">
              {customer.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <RiskScore score={customer.riskScore} size="xl" />
          <div className="flex flex-col gap-2">
            <Button variant="destructive" size="sm">
              <Ban className="h-4 w-4 mr-1.5" />
              Block
            </Button>
            <Button variant="outline" size="sm">
              <PauseCircle className="h-4 w-4 mr-1.5" />
              Suspend
            </Button>
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4 mr-1.5" />
              Flag
            </Button>
            <Button variant="default" size="sm">
              <FolderSearch className="h-4 w-4 mr-1.5" />
              Investigate
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Total Transactions" value={customer.totalTransactions} icon={CreditCard} trend="neutral" />
        <MetricCard title="Total Spending" value={formatCurrency(customer.totalSpending)} icon={DollarSign} trend="neutral" />
        <MetricCard title="Suspicious Txns" value={customer.suspiciousTransactions} icon={AlertTriangle} trend={customer.suspiciousTransactions > 3 ? "up" : "down"} />
        <MetricCard title="Fraud History" value={customer.fraudHistory.confirmedFraud} icon={ShieldAlert} trend={customer.fraudHistory.confirmedFraud > 0 ? "up" : "neutral"} />
        <MetricCard title="Devices" value={customer.devices.length} icon={Smartphone} trend="neutral" />
        <MetricCard title="Account Age" value={`${customer.accountAge}d`} icon={Calendar} trend="neutral" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium text-foreground">{customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium text-foreground">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium text-foreground">+1 (***) ***-{customer.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium text-foreground">{customer.locations.join(", ")}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium text-foreground">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Active:</span>
                    <span className="font-medium text-foreground">
                      {timeAgo(new Date(customer.lastActiveAt))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Spending:</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(customer.totalSpending)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ChartCard title="Spending Behavior" description="Historical vs current spending pattern (30 days)">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={spendingData[0]?.threshold} stroke="#ef4444" strokeDasharray="8 4" label={{ value: "Threshold", fill: "#ef4444", fontSize: 11 }} />
                <Area type="monotone" dataKey="historical" fill="hsl(var(--primary))" fillOpacity={0.05} stroke="none" />
                <Line type="monotone" dataKey="historical" stroke="#6366f1" strokeWidth={2} dot={false} name="Historical Avg" />
                <Line type="monotone" dataKey="current" stroke="#22c55e" strokeWidth={2} dot={false} name="Current" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Activity Pattern Heatmap" description="Transaction activity by hour and day of week">
            <div className="overflow-x-auto">
              <div className="inline-flex flex-col gap-1 min-w-[600px]">
                <div className="flex items-center gap-1 pl-12 mb-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="w-[22px] text-center text-[9px] text-muted-foreground">
                      {i % 4 === 0 ? `${i}` : ""}
                    </div>
                  ))}
                </div>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="w-10 text-right text-[10px] text-muted-foreground pr-2">{day}</span>
                    {heatmapData
                      .filter((d) => d.day === day)
                      .sort((a, b) => a.hour - b.hour)
                      .map((d) => (
                        <div
                          key={`${d.day}-${d.hour}`}
                          className={cn(
                            "w-[22px] h-[18px] rounded-sm transition-colors",
                            getHeatColor(d.value)
                          )}
                          title={`${day} ${d.hour}:00 - Activity: ${Math.round(d.value * 100)}%`}
                        />
                      ))}
                  </div>
                ))}
                <div className="flex items-center gap-3 mt-2 pl-12">
                  <span className="text-[10px] text-muted-foreground">Low</span>
                  <div className="flex gap-0.5">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                      <div key={v} className={cn("w-5 h-3 rounded-sm", getHeatColor(v))} />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">High</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Risk Score Timeline" description="Risk score evolution over the last 30 days">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={riskTimelineData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceArea y1={0} y2={30} fill="#22c55e" fillOpacity={0.05} />
                <ReferenceArea y1={30} y2={70} fill="#f59e0b" fillOpacity={0.05} />
                <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.05} />
                <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" opacity={0.4} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" opacity={0.4} />
                <Area type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} fill="url(#riskGradient)" name="Risk Score" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <span className="text-xs text-muted-foreground">Low (0-30)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="text-xs text-muted-foreground">Medium (31-70)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="text-xs text-muted-foreground">High (71-100)</span>
              </div>
            </div>
          </ChartCard>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Recent Transactions
                </span>
                <Badge variant="outline" className="text-xs">{recentTransactions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {recentTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        txn.riskLevel === "HIGH" ? "bg-red-500/10" :
                        txn.riskLevel === "MEDIUM" ? "bg-amber-500/10" : "bg-emerald-500/10"
                      )}>
                        {txn.riskLevel === "HIGH" ? (
                          <AlertTriangle className="h-4 w-4 text-red-400" />
                        ) : txn.riskLevel === "MEDIUM" ? (
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                        ) : (
                          <CreditCard className="h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {txn.merchant}
                          </span>
                          <RiskBadge score={txn.riskScore} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {txn.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(new Date(txn.createdAt))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Devices Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/devices")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        device.riskScore > 70 ? "bg-red-500/10" : device.riskScore > 30 ? "bg-amber-500/10" : "bg-emerald-500/10"
                      )}>
                        <Smartphone className="h-5 w-5" style={{ color: device.riskScore > 70 ? "#ef4444" : device.riskScore > 30 ? "#f59e0b" : "#22c55e" }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground font-mono">{device.id}</span>
                          {!device.isKnown && (
                            <Badge variant="risk-high" className="text-[10px] px-1.5 py-0">NEW</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {device.type} - {device.os} / {device.browser}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <RiskBadge score={device.riskScore} size="sm" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {device.totalTransactions} txns
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                IP Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerIps.map((ip) => (
                  <div
                    key={ip.ip}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/ip-intelligence")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        ip.riskScore > 70 ? "bg-red-500/10" : ip.riskScore > 30 ? "bg-amber-500/10" : "bg-emerald-500/10"
                      )}>
                        <Globe className="h-5 w-5" style={{ color: ip.riskScore > 70 ? "#ef4444" : ip.riskScore > 30 ? "#f59e0b" : "#22c55e" }} />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground font-mono">{ip.ip}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {ip.city}, {ip.country}
                          </span>
                          {ip.isVPN && (
                            <Badge variant="risk-medium" className="text-[10px] px-1.5 py-0 gap-0.5">
                              <Shield className="h-2.5 w-2.5" /> VPN
                            </Badge>
                          )}
                          {ip.isTor && (
                            <Badge variant="risk-high" className="text-[10px] px-1.5 py-0 gap-0.5">
                              <ShieldAlert className="h-2.5 w-2.5" /> TOR
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <RiskBadge score={ip.riskScore} size="sm" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {customer.locations.map((loc) => (
                  <div
                    key={loc}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate("/locations")}
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{loc}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Fraud History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-muted-foreground">Confirmed Fraud</span>
                  </div>
                  <p className={cn(
                    "text-3xl font-bold tabular-nums",
                    customer.fraudHistory.confirmedFraud > 0 ? "text-red-400" : "text-foreground"
                  )}>
                    {customer.fraudHistory.confirmedFraud}
                  </p>
                  {customer.fraudHistory.confirmedFraud > 0 && (
                    <p className="text-xs text-red-400 mt-1">
                      {customer.fraudHistory.confirmedFraud} confirmed fraud {customer.fraudHistory.confirmedFraud === 1 ? "incident" : "incidents"} on record
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium text-muted-foreground">False Positives</span>
                  </div>
                  <p className="text-3xl font-bold tabular-nums text-foreground">
                    {customer.fraudHistory.falsePositives}
                  </p>
                  {customer.fraudHistory.falsePositives > 0 && (
                    <p className="text-xs text-emerald-400 mt-1">
                      {customer.fraudHistory.falsePositives} {customer.fraudHistory.falsePositives === 1 ? "incident" : "incidents"} cleared
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fraud Rate</span>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    customer.fraudHistory.confirmedFraud > 0 ? "text-red-400" : "text-emerald-400"
                  )}>
                    {customer.totalTransactions > 0
                      ? ((customer.fraudHistory.confirmedFraud / customer.totalTransactions) * 100).toFixed(1)
                      : "0.0"}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted/50 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{
                      width: `${customer.totalTransactions > 0
                        ? Math.min(100, (customer.fraudHistory.confirmedFraud / customer.totalTransactions) * 100)
                        : 0}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
