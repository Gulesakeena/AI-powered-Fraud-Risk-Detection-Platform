import { useNavigate } from "react-router-dom"
import {
  TrendingUp,
  ArrowRight,
  Target,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Radar,
  Crosshair,
  ScanSearch,
  ArrowUpRight,
  ArrowDownRight,
  Brain,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const keyFindings = [
  {
    index: "01",
    title: "Fraud activity increased 18%",
    description:
      "Fraud activity increased 18% in the last 24 hours. 12 new high-risk patterns detected.",
    action: "Investigate",
    severity: "HIGH",
    color: "text-red-400",
  },
  {
    index: "02",
    title: "Device sharing is the fastest-growing risk",
    description:
      "Device sharing is the fastest-growing risk pattern. 17 suspicious devices identified.",
    action: "View Devices",
    severity: "HIGH",
    color: "text-red-400",
  },
  {
    index: "03",
    title: "Fraud cluster of 14 accounts",
    description:
      "A cluster of 14 accounts connected through 3 devices and 2 IP addresses.",
    action: "Investigate Cluster",
    severity: "CRITICAL",
    color: "text-red-500",
  },
  {
    index: "04",
    title: "False positives decreased",
    description:
      "False positives decreased by 6.4%. Model precision improving.",
    action: "View Model Performance",
    severity: "GOOD",
    color: "text-emerald-400",
  },
  {
    index: "05",
    title: "Impossible travel detected in Europe",
    description:
      "3 new impossible travel patterns detected in European accounts.",
    action: "View Locations",
    severity: "MEDIUM",
    color: "text-amber-400",
  },
]

const modelPerformance = [
  { label: "Precision", value: 94.7, change: 1.2, up: true },
  { label: "Recall", value: 92.3, change: 0.8, up: true },
  { label: "F1 Score", value: 93.5, change: 1.0, up: true },
  { label: "False Positive Rate", value: 4.9, change: 6.4, up: false },
]

const emergingPatterns = [
  {
    title: "Cross-border velocity spike (Nordics → UAE)",
    confidence: 96,
    severity: "HIGH",
    action: "Create targeted rule for Nordics-UA corridors",
    color: "text-ai-light",
  },
  {
    title: "Tor exit node cluster reuse across accounts",
    confidence: 89,
    severity: "CRITICAL",
    action: "Block transactions from known cluster IPs",
    color: "text-ai-light",
  },
  {
    title: "Crypto cash-out following high-value card purchases",
    confidence: 84,
    severity: "HIGH",
    action: "Flag paired card+crypto patterns in real-time",
    color: "text-ai-light",
  },
  {
    title: "New-account behavioral drift within 48h",
    confidence: 78,
    severity: "MEDIUM",
    action: "Escalate new accounts with early drift signals",
    color: "text-ai-light",
  },
]

const anomalies = [
  {
    title: "Impossible travel — Miami to London (45 min)",
    severity: "CRITICAL",
    evidence: "TXN-00042 & TXN-00044, CUST-0024",
  },
  {
    title: "5 new devices in 48h with Tor + VPN",
    severity: "CRITICAL",
    evidence: "CUST-0009, 5 devices, all anonymized",
  },
  {
    title: "$37,500 in 90 minutes across 3 payment methods",
    severity: "CRITICAL",
    evidence: "CUST-0024, TXN-00042/43/44",
  },
  {
    title: "Account age 35 days with $98,400 spend",
    severity: "HIGH",
    evidence: "CUST-0013, multi-country activity",
  },
]

function ThreatGauge() {
  const level = 68
  const angle = -120 + (level / 100) * 240
  const cx = 100
  const cy = 110
  const needleAngle = angle * (Math.PI / 180)
  const needleX = cx + Math.cos(needleAngle) * 62
  const needleY = cy + Math.sin(needleAngle) * 62

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-44">
        <defs>
          <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="url(#gauge-grad)"
          strokeOpacity="0.25"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(level / 100) * 251} 251`}
        />
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#f8fafc"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="5" fill="#0f0e1a" stroke="#f8fafc" strokeWidth="2" />
        <text x={cx} y="128" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">
          {level}%
        </text>
      </svg>
      <p className="text-xs font-medium text-amber-400 mt-1">Elevated Threat</p>
    </div>
  )
}

function MiniChart() {
  const data = [42, 48, 45, 55, 52, 60, 58, 64, 61, 68]
  const width = 200
  const height = 60
  const max = Math.max(...data) * 1.15
  const min = 0
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / (max - min)) * height
    return `${x},${y}`
  })
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12">
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const severityBadge: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  MEDIUM: { label: "Medium", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  HIGH: { label: "High", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  CRITICAL: { label: "Critical", className: "bg-red-600/20 text-red-300 border-red-600/40" },
  GOOD: { label: "Improved", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
}

export default function AiInsightsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <PageHeader
        title="✦ AI Risk Intelligence"
        description="Automated analysis and detection of emerging threats"
        actions={
          <Button variant="outline" size="sm">
            <ScanSearch className="mr-2 h-4 w-4" />
            Run Full Scan
          </Button>
        }
      />

      {/* Key findings */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Key Findings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyFindings.map((finding) => {
            const sev = severityBadge[finding.severity as keyof typeof severityBadge] || severityBadge.MEDIUM
            return (
              <Card key={finding.index} className="p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className={cn("font-mono text-2xl font-bold", finding.color)}>{finding.index}</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{finding.title}</h3>
                      <Badge variant="outline" className={cn("text-[9px]", sev.className)}>
                        {sev.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{finding.description}</p>
                    <Button variant="link" size="sm" className="h-6 px-0 text-ai-light">
                      {finding.action}
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Threat level overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex flex-col items-center">
            <div className="mb-2 flex items-center gap-2 self-start">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Threat Level
              </p>
            </div>
            <ThreatGauge />
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-red-400" />
              <span>+18% vs. 24h ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Trend Over Time
              </p>
            </div>
            <MiniChart />
            <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
              <span>Last 10 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Radar className="h-4 w-4 text-ai-light" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Top Contributing Factors
              </p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "VPN / Tor Anonymization", pct: 34 },
                { label: "New Device Velocity", pct: 28 },
                { label: "Crypto Cash-Out", pct: 21 },
                { label: "Impossible Travel", pct: 17 },
              ].map((f) => (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span className="font-medium text-foreground">{f.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ai to-ai-light transition-all"
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model performance */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Target className="h-4 w-4 text-ai-light" />
                Model Performance
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Detection model v3.2 · trained on 2.4M transactions
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <Activity className="mr-1 h-3 w-3" />
              Optimal
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelPerformance.map((m) => (
              <div key={m.label} className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {m.value}
                  <span className="text-sm font-medium text-muted-foreground">%</span>
                </p>
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 text-xs font-medium",
                    m.up ? "text-emerald-400" : "text-red-400"
                  )}
                >
                  {m.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {m.change}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emerging patterns + anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-ai-light" />
              <p className="text-sm font-semibold text-foreground">Emerging Patterns</p>
            </div>
            <div className="space-y-3">
              {emergingPatterns.map((p) => {
                const sev = severityBadge[p.severity]
                return (
                  <div key={p.title} className="rounded-xl border border-border/40 bg-muted/20 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug">{p.title}</p>
                      <Badge variant="outline" className={cn("shrink-0 text-[9px]", sev.className)}>
                        {sev.label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-ai-light">
                        <span className="font-medium">{p.confidence}%</span>
                        <span className="text-muted-foreground">confidence</span>
                      </div>
                      <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-ai"
                          style={{ width: `${p.confidence}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 text-ai-light" />
                      <span>{p.action}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Crosshair className="h-4 w-4 text-red-400" />
              <p className="text-sm font-semibold text-foreground">Recent Anomalies Detected</p>
            </div>
            <div className="space-y-3">
              {anomalies.map((a) => {
                const sev = severityBadge[a.severity]
                return (
                  <div
                    key={a.title}
                    className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug">{a.title}</p>
                      <Badge variant="outline" className={cn("shrink-0 text-[9px]", sev.className)}>
                        {sev.label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                      <span>{a.evidence}</span>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-1 h-6 px-0 text-ai-light"
                      onClick={() => navigate("/fraud-network")}
                    >
                      View in Network
                      <ArrowRight className="ml-1.5 h-3 w-3" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
