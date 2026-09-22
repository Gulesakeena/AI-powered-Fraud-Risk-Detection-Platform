import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Share2,
  Globe,
  MapPin,
  Brain,
  DollarSign,
  Timer,
  UserX,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  Radar,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fraudPatterns } from "@/data/mock"
import type { FraudPattern } from "@/data/mock"
import { cn } from "@/lib/utils"

type Category = {
  key: string
  name: string
  incidents: number
  trend: number
  entities: number
  entityLabel: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const categories: Category[] = [
  {
    key: "velocity",
    name: "Rapid Transactions",
    incidents: 43,
    trend: 18,
    entities: 29,
    entityLabel: "incidents",
    icon: Zap,
    description: "Multiple transactions from different devices within a short timeframe, indicating account takeover or card testing.",
  },
  {
    key: "device",
    name: "Device Sharing",
    incidents: 17,
    trend: 24,
    entities: 17,
    entityLabel: "suspicious devices",
    icon: Share2,
    description: "Devices used across multiple accounts, often signaling coordinated fraud rings or shared credential abuse.",
  },
  {
    key: "ip",
    name: "IP Sharing",
    incidents: 28,
    trend: -5,
    entities: 28,
    entityLabel: "suspicious IPs",
    icon: Globe,
    description: "IP addresses linked to many accounts or flagged for VPN, proxy, and Tor usage patterns.",
  },
  {
    key: "location",
    name: "Location Anomalies",
    incidents: 82,
    trend: 12,
    entities: 42,
    entityLabel: "incidents",
    icon: MapPin,
    description: "Impossible travel and geographic velocity anomalies where transactions exceed physical travel limits.",
  },
  {
    key: "behavioral",
    name: "Behavioral Changes",
    incidents: 126,
    trend: -3,
    entities: 126,
    entityLabel: "customers",
    icon: Brain,
    description: "Sudden shifts in spending, merchant categories, or access patterns diverging from customer baselines.",
  },
  {
    key: "amount",
    name: "Amount Anomalies",
    incidents: 219,
    trend: 31,
    entities: 219,
    entityLabel: "transactions",
    icon: DollarSign,
    description: "Transactions significantly exceeding a customer's historical average or platform thresholds.",
  },
  {
    key: "velocity_attack",
    name: "Velocity Attacks",
    incidents: 18,
    trend: 42,
    entities: 18,
    entityLabel: "incidents",
    icon: Timer,
    description: "Automated attacks firing many transactions in rapid succession to test or drain cards and accounts.",
  },
  {
    key: "takeover",
    name: "Account Takeover",
    incidents: 7,
    trend: -15,
    entities: 7,
    entityLabel: "accounts",
    icon: UserX,
    description: "Stolen credentials used to access accounts and execute high-value fraudulent transactions.",
  },
]

const severityConfig: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  HIGH: { label: "High", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  CRITICAL: { label: "Critical", className: "bg-red-600/20 text-red-300 border-red-600/40" },
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  MONITORING: { label: "Monitoring", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  MITIGATED: { label: "Mitigated", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  CLOSED: { label: "Resolved", className: "bg-muted text-muted-foreground border-border/60" },
}

const trendSeries = [
  { label: "Jan", value: 18 },
  { label: "Feb", value: 22 },
  { label: "Mar", value: 20 },
  { label: "Apr", value: 27 },
  { label: "May", value: 31 },
  { label: "Jun", value: 29 },
  { label: "Jul", value: 38 },
  { label: "Aug", value: 44 },
  { label: "Sep", value: 52 },
]

function TrendChart() {
  const width = 820
  const height = 220
  const padding = { top: 20, right: 24, bottom: 30, left: 36 }
  const values = trendSeries.map((d) => d.value)
  const max = Math.max(...values) * 1.1
  const min = 0
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const points = values.map((v, i) => {
    const x = padding.left + (i / (values.length - 1)) * innerW
    const y = padding.top + innerH - ((v - min) / (max - min)) * innerH
    return { x, y, v, label: trendSeries[i].label }
  })

  const areaPath = `M ${points[0].x} ${padding.top + innerH} L ${points
    .map((p) => `${p.x} ${p.y}`)
    .join(" L ")} L ${points[points.length - 1].x} ${padding.top + innerH} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="trend-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = padding.top + innerH - f * innerH
        return (
          <g key={f}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(148,163,184,0.12)" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9">
              {Math.round(max * f)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="url(#trend-fill)" />
      <polyline
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="none"
        stroke="url(#trend-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#0f0e1a" stroke="#C084FC" strokeWidth="1.5" />
          <text x={p.x} y={height - 6} textAnchor="middle" fill="#64748b" fontSize="9">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

export default function FraudPatternsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState("all")

  const patterns = useMemo(() => fraudPatterns, [])

  const stats = useMemo(() => {
    const total = categories.reduce((s, c) => s + c.incidents, 0)
    const active = categories.filter((_, i) => i < 7).length
    const newThisWeek = categories.reduce((s, c) => s + (c.trend > 0 ? 1 : 0), 0)
    return { total, active, newThisWeek }
  }, [])

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (activeCategory !== "all" && c.key !== activeCategory) return false
      return true
    })
  }, [activeCategory])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fraud Patterns"
        description="AI-detected suspicious behavior patterns"
        actions={
          <Button variant="outline" size="sm">
            <Radar className="mr-2 h-4 w-4" />
            Run Detection
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Patterns", value: stats.total, icon: Activity, color: "text-ai-light" },
          { label: "Active Patterns", value: stats.active, icon: Radar, color: "text-primary" },
          { label: "New This Week", value: stats.newThisWeek, icon: ShieldAlert, color: "text-risk-high" },
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

      {/* Trend chart */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Pattern Detections Over Time</h3>
              <p className="text-xs text-muted-foreground">Monthly count of detected fraud pattern incidents</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-ai-light">
                <TrendingUp className="h-3.5 w-3.5" />
                +18% vs last month
              </span>
            </div>
          </div>
          <div className="h-56">
            <TrendChart />
          </div>
        </CardContent>
      </Card>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeCategory === "all"
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-accent/40"
          )}
        >
          All Patterns
        </button>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(activeCategory === c.key ? "all" : c.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeCategory === c.key
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border/60 text-muted-foreground hover:bg-accent/40"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Pattern cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCategories.map((category, index) => {
          const pattern = patterns[index] as FraudPattern | undefined
          const severity = severityConfig[pattern?.severity || "HIGH"]
          const status = statusConfig[pattern?.status || "ACTIVE"]
          const up = category.trend >= 0
          return (
            <Card key={category.key} className="overflow-hidden transition-shadow hover:shadow-md">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ai/10">
                      <category.icon className="h-5 w-5 text-ai-light" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground leading-tight">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                  <div>
                    <p className="text-3xl font-bold text-foreground">{category.incidents}</p>
                    <p className="text-xs text-muted-foreground">{category.entityLabel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                        up ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                      )}
                    >
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {up ? "+" : ""}
                      {category.trend}%
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px]", severity.className)}>
                        {severity.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px]", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {pattern && pattern.examples.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Example Detections
                    </p>
                    {pattern.examples.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1 w-1 rounded-full bg-ai-light shrink-0" />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-muted-foreground">
                      {category.entities} related entities
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate("/ai-assistant")}>
                    Investigate Pattern
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
