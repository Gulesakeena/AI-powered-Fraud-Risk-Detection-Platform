import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Activity as ActivityIcon,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  ShieldAlert,
  Wallet,
  Bot,
  FolderSearch,
  FileText,
  CreditCard,
  ListFilter,
  ChevronRight,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"
import type { TooltipContentProps } from "recharts"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { user, transactions, fraudPatterns } from "@/data/mock"
import type { Transaction } from "@/data/mock"
import { MetricCard } from "@/components/ui/metric-card"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

type TimeRange = "24h" | "7d" | "30d" | "custom"

type DistributionMetric = "percentage" | "count" | "value"

interface DistributionDatum {
  name: "LOW" | "MEDIUM" | "HIGH"
  color: string
  percent: number
  count: number
  value: number
}

interface TrendDatum {
  label: string
  total: number
  highRisk: number
  fraud: number
}

interface RiskRangeDatum {
  range: string
  count: number
  color: string
  score: number
}

interface FeedItem {
  id: string
  level: "LOW" | "MEDIUM" | "HIGH"
  txnId: string
  customer: string
  amount: number
  reason: string
  score: number
  timeAgo: string
}

const timeRangeTabs: { id: TimeRange; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "custom", label: "Custom" },
]

const businessOptions = [
  { label: "All Businesses", value: "all" },
  { label: "E-Commerce", value: "ecommerce" },
  { label: "Payments", value: "payments" },
  { label: "Crypto Exchange", value: "crypto" },
  { label: "Travel", value: "travel" },
]

const distributionData: DistributionDatum[] = [
  { name: "LOW", color: "#22C55E", percent: 68, count: 16924, value: 1284300 },
  { name: "MEDIUM", color: "#F59E0B", percent: 27, count: 6720, value: 584600 },
  { name: "HIGH", color: "#EF4444", percent: 5, count: 1248, value: 182430 },
]

const trendData: TrendDatum[] = [
  { label: "Sep 2", total: 3100, highRisk: 142, fraud: 8 },
  { label: "Sep 3", total: 3550, highRisk: 168, fraud: 11 },
  { label: "Sep 4", total: 3820, highRisk: 195, fraud: 14 },
  { label: "Sep 5", total: 3440, highRisk: 152, fraud: 9 },
  { label: "Sep 6", total: 4195, highRisk: 231, fraud: 18 },
  { label: "Sep 7", total: 3670, highRisk: 188, fraud: 13 },
  { label: "Sep 8", total: 3117, highRisk: 172, fraud: 11 },
]

const riskRangeData: RiskRangeDatum[] = [
  { range: "0-20", count: 12840, color: "#22C55E", score: 10 },
  { range: "21-40", count: 6820, color: "#84CC16", score: 30 },
  { range: "41-60", count: 4230, color: "#F59E0B", score: 50 },
  { range: "61-80", count: 1248, color: "#F97316", score: 70 },
  { range: "81-100", count: 754, color: "#EF4444", score: 90 },
]

const timeAgoFromNow = (iso: string): string => {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const buildFeed = (): FeedItem[] => {
  const sorted = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
  return sorted.map((t) => ({
    id: t.id,
    level: t.riskLevel,
    txnId: t.id,
    customer: t.customerName,
    amount: t.amount,
    reason: t.riskFactors[0] ?? "Standard behavior",
    score: t.riskScore,
    timeAgo: timeAgoFromNow(t.createdAt),
  }))
}

const formatAmount = (amount: number): string => formatCurrency(amount)

export default function DashboardPage() {
  const navigate = useNavigate()
  const [activeRange, setActiveRange] = React.useState<TimeRange>("7d")
  const [business, setBusiness] = React.useState("all")
  const [distributionMetric, setDistributionMetric] = React.useState<DistributionMetric>("percentage")
  const [showTotal, setShowTotal] = React.useState(true)
  const [showHighRisk, setShowHighRisk] = React.useState(true)
  const [showFraud, setShowFraud] = React.useState(true)

  const highRiskTxns = React.useMemo(
    () => transactions.filter((t) => t.riskScore > 60).slice(0, 8),
    []
  )

  const feed = React.useMemo(buildFeed, [])

  const distributionToggle: { id: DistributionMetric; label: string }[] = [
    { id: "percentage", label: "%" },
    { id: "count", label: "Count" },
    { id: "value", label: "Value" },
  ]

  const renderDistributionValue = (d: DistributionDatum) => {
    if (distributionMetric === "percentage") return `${d.percent}%`
    if (distributionMetric === "count") return `${formatNumber(d.count)}`
    return formatCurrency(d.value)
  }

  const renderTrendTooltip = ({ active, payload, label }: TooltipContentProps) => {
    if (!active || !payload || payload.length === 0) return null
    return (
      <div className="rounded-lg border border-border/50 bg-card p-3 shadow-xl">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
        {payload.map((entry) => {
          const dataKey = String(entry.dataKey)
          const value = Number(entry.value)
          return (
            <div key={dataKey} className="flex items-center justify-between gap-6 py-0.5">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || "#94a3b8" }} />
                {dataKey === "total"
                  ? "Total Transactions"
                  : dataKey === "highRisk"
                    ? "High-Risk"
                    : "Confirmed Fraud"}
              </span>
              <span className="font-mono text-xs font-medium text-foreground">
                {formatNumber(value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderRiskTooltip = ({ active, payload }: TooltipContentProps) => {
    if (!active || !payload || payload.length === 0) return null
    const data = payload[0]?.payload as RiskRangeDatum | undefined
    if (!data) return null
    return (
      <div className="rounded-lg border border-border/50 bg-card p-3 shadow-xl">
        <p className="text-xs font-semibold text-foreground">Risk {data.range}</p>
        <p className="mt-1 font-mono text-sm font-medium text-foreground">{formatNumber(data.count)} transactions</p>
      </div>
    )
  }

  const renderPieTooltip = ({ active, payload }: TooltipContentProps) => {
    if (!active || !payload || payload.length === 0) return null
    const data = payload[0]?.payload as DistributionDatum | undefined
    if (!data) return null
    return (
      <div className="rounded-lg border border-border/50 bg-card p-3 shadow-xl">
        <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name} Risk
        </p>
        <div className="mt-1.5 space-y-1">
          <p className="text-xs text-muted-foreground">Share: <span className="font-medium text-foreground">{data.percent}%</span></p>
          <p className="text-xs text-muted-foreground">Count: <span className="font-medium text-foreground">{formatNumber(data.count)}</span></p>
          <p className="text-xs text-muted-foreground">Value: <span className="font-medium text-foreground">{formatCurrency(data.value)}</span></p>
        </div>
      </div>
    )
  }

  const legendButton = (active: boolean, color: string, label: string, onClick: () => void) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "border-border/50 bg-muted/30 text-foreground"
          : "border-border/30 text-muted-foreground/50"
      )}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: active ? color : "#64748B" }} />
      {label}
    </button>
  )

  const getStatusVariant = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "risk-low"
      case "PENDING":
        return "risk-medium"
      case "REVIEWING":
        return "risk-medium"
      case "BLOCKED":
        return "risk-high"
      default:
        return "outline"
    }
  }

  const getLevelDot = (level: "LOW" | "MEDIUM" | "HIGH") => {
    const colors = {
      LOW: "bg-emerald-500",
      MEDIUM: "bg-amber-500",
      HIGH: "bg-red-500",
    }
    return (
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full",
          colors[level],
          level === "HIGH" && "animate-pulse-dot"
        )}
      />
    )
  }

  const getLevelTextColor = (level: "LOW" | "MEDIUM" | "HIGH") => {
    const colors = {
      LOW: "text-emerald-400",
      MEDIUM: "text-amber-400",
      HIGH: "text-red-400",
    }
    return colors[level]
  }

  const getLevelBg = (level: "LOW" | "MEDIUM" | "HIGH") => {
    const colors = {
      LOW: "bg-emerald-500/10",
      MEDIUM: "bg-amber-500/10",
      HIGH: "bg-red-500/10",
    }
    return colors[level]
  }

  const getScoreBadge = (score: number) => (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold",
        score <= 30
          ? "bg-emerald-500/10 text-emerald-400"
          : score <= 70
            ? "bg-amber-500/10 text-amber-400"
            : "bg-red-500/10 text-red-400"
      )}
    >
      {score}
    </span>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Good afternoon, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening across your fraud and risk environment.
          </p>
        </div>

        {/* Time range + Business selector */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-card/50 p-1">
            {timeRangeTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRange(tab.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  activeRange === tab.id
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={business}
              onChange={setBusiness}
              options={businessOptions}
              placeholder="Select business"
            />
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6 animate-fade-in">
        <MetricCard
          title="Total Transactions"
          value="24,892"
          change={{ value: 12.4, label: "vs previous" }}
          trend="up"
          icon={CreditCard}
          
          onClick={() => navigate("/transactions")}
        />
        <MetricCard
          title="High Risk"
          value="1,248"
          change={{ value: 5.01, label: "of total" }}
          trend="neutral"
          icon={ShieldAlert}
          
          onClick={() => navigate("/transactions?risk=high")}
        />
        <MetricCard
          title="Fraud Alerts"
          value="327"
          change={{ value: 8.2, label: "vs previous" }}
          trend="up"
          icon={AlertTriangle}
          
          onClick={() => navigate("/alerts")}
        />
        <MetricCard
          title="Confirmed Fraud"
          value="84"
          change={{ value: 182430, label: "USD loss" }}
          trend="down"
          icon={Shield}
          
          onClick={() => navigate("/investigations")}
        />
        <MetricCard
          title="Avg Risk Score"
          value="42.7"
          change={{ value: 4.3, label: "vs previous" }}
          trend="down"
          icon={ActivityIcon}
          
          onClick={() => navigate("/fraud-patterns")}
        />
        <MetricCard
          title="False Positive Rate"
          value="7.8%"
          change={{ value: 1.2, label: "vs previous" }}
          trend="down"
          icon={Wallet}
          
          onClick={() => navigate("/reports")}
        />
      </div>

      {/* Main grid: overview + trend + feed */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 animate-fade-in">
        {/* Risk Distribution Overview */}
        <Card className="xl:col-span-1 @container">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription className="mt-1">Breakdown by transaction risk level</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                {distributionToggle.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDistributionMetric(t.id)}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                      distributionMetric === t.id
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 @[26rem]:flex-row @[26rem]:items-start">
              <div className="h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      dataKey="percent"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {distributionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex-1 space-y-3">
                {distributionData.map((d) => (
                  <div key={d.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {renderDistributionValue(d)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.percent}%`, backgroundColor: d.color }}
                      />
                    </div>
                  </div>
                ))}

                <div className="mt-4 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total transactions</span>
                    <span className="font-semibold text-foreground">24,892</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total value</span>
                    <span className="font-semibold text-foreground">$2.05M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Trend Chart */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-2">
            <div>
              <CardTitle>Fraud & Risk Activity</CardTitle>
              <CardDescription className="mt-1">Transaction flow over the selected period</CardDescription>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {legendButton(showTotal, "#3B82F6", "Total", () => setShowTotal(!showTotal))}
              {legendButton(showHighRisk, "#F59E0B", "High-Risk", () => setShowHighRisk(!showHighRisk))}
              {legendButton(showFraud, "#EF4444", "Fraud", () => setShowFraud(!showFraud))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradFraud" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20% / 0.5)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(217 33% 20% / 0.5)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={renderTrendTooltip} cursor={{ stroke: "hsl(217 33% 30% / 0.5)" }} />
                  {showTotal && (
                    <Area
                      type="monotone"
                      dataKey="total"
                      stackId="1"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fill="url(#gradTotal)"
                    />
                  )}
                  {showHighRisk && (
                    <Area
                      type="monotone"
                      dataKey="highRisk"
                      stackId="2"
                      stroke="#F59E0B"
                      strokeWidth={1.5}
                      fill="url(#gradHigh)"
                    />
                  )}
                  {showFraud && (
                    <Area
                      type="monotone"
                      dataKey="fraud"
                      stackId="3"
                      stroke="#EF4444"
                      strokeWidth={1.5}
                      fill="url(#gradFraud)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Risk Activity Feed */}
        <Card className="xl:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Risk Activity</CardTitle>
                <CardDescription className="mt-1">Recent flagged transactions</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                <span className="text-[11px] font-semibold text-emerald-400">Live</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ScrollArea className="max-h-[340px] pr-2 xl:max-h-[380px]">
              <div className="space-y-3">
                {feed.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/transactions/${item.txnId}`)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border/30 bg-muted/10 p-2.5 text-left transition-colors hover:bg-muted/30"
                  >
                    <span
                      className={cn(
                        "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        getLevelBg(item.level)
                      )}
                    >
                      {getLevelDot(item.level)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-xs font-medium", getLevelTextColor(item.level))}>
                          {item.level}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{item.txnId}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                        {item.customer} · <span className="font-mono">{formatAmount(item.amount)}</span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.reason}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        {getScoreBadge(item.score)}
                        <span className="text-[10px] text-muted-foreground">{item.timeAgo}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Risk Score Distribution + Quick Actions / Patterns */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 animate-fade-in">
        {/* Risk Score Distribution */}
        <Card className="xl:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle>Risk Score Distribution</CardTitle>
            <CardDescription className="mt-1">Transaction distribution across risk ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={riskRangeData}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20% / 0.5)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="range"
                    tick={{ fill: "hsl(215 20% 55%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={renderRiskTooltip} cursor={{ fill: "hsl(217 33% 20% / 0.15)" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                    {riskRangeData.map((entry) => (
                      <Cell key={entry.range} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Risk Patterns */}
        <Card className="xl:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Risk Patterns</CardTitle>
                <CardDescription className="mt-1">Detected behavioral patterns this period</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => navigate("/fraud-patterns")}
              >
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {fraudPatterns.slice(0, 3).map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => navigate("/fraud-patterns")}
                  className="flex flex-col items-start rounded-lg border border-border/30 bg-muted/10 p-3 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        pattern.severity === "CRITICAL" || pattern.severity === "HIGH"
                          ? "risk-high"
                          : "risk-medium"
                      }
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {pattern.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-tight text-foreground">
                    {pattern.title}
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-2xl font-bold text-foreground">{pattern.incidentCount}</span>
                    <span className="pb-0.5 text-xs text-muted-foreground">incidents</span>
                  </div>
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-0.5 text-xs font-medium",
                      pattern.trend >= 0 ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {pattern.trend >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(pattern.trend)}% {pattern.trend >= 0 ? "increase" : "decrease"}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {pattern.description}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription className="mt-1">Common workflow shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate("/transactions")}
              >
                <CreditCard className="h-4 w-4 text-primary" />
                View All Transactions
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate("/investigations")}
              >
                <FolderSearch className="h-4 w-4 text-ai" />
                Create Investigation
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate("/ai-assistant")}
              >
                <Bot className="h-4 w-4 text-ai" />
                Open AI Assistant
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate("/reports")}
              >
                <FileText className="h-4 w-4 text-info" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Risk Transactions Table */}
      <Card className="animate-fade-in">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>High-Risk Transactions</CardTitle>
              <CardDescription className="mt-1">
                Top transactions exceeding risk threshold ({highRiskTxns.length} of 8 shown)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="risk-high" className="text-xs">
                {highRiskTxns.length} flagged
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="hidden gap-1 text-xs text-primary sm:flex"
                onClick={() => navigate("/transactions")}
              >
                <ListFilter className="h-3.5 w-3.5" /> View all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] whitespace-nowrap">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {[
                    "Risk",
                    "Transaction ID",
                    "Customer",
                    "Amount",
                    "Location",
                    "Score",
                    "Trigger",
                    "Time",
                    "Status",
                    "",
                  ].map((h) => (
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
                {highRiskTxns.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => navigate(`/transactions/${txn.id}`)}
                    className="cursor-pointer border-b border-border/30 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          txn.riskLevel === "HIGH"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                        )}
                      >
                        {txn.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{txn.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                      {txn.customerName}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-medium text-foreground">
                      {formatAmount(txn.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                      {txn.location.city}, {txn.location.countryCode}
                    </td>
                    <td className="px-4 py-3">{getScoreBadge(txn.riskScore)}</td>
                    <td className="max-w-[220px] px-4 py-3">
                      <span className="block truncate text-xs text-muted-foreground" title={txn.riskFactors.join(", ")}>
                        {txn.riskFactors.slice(0, 2).join(" · ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {timeAgoFromNow(txn.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(txn.status)} className="text-[11px]">
                        {txn.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/transactions/${txn.id}`)
                        }}
                      >
                        Investigate
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
