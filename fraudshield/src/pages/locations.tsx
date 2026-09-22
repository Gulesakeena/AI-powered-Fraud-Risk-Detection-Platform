import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  MapPin,
  AlertTriangle,
  Users,
  CreditCard,
  ArrowRight,
  Plane,
  Zap,
  Map,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { locations } from "@/data/mock"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/ui/data-table"

const countryFlags: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", RU: "🇷🇺", AE: "🇦🇪", JP: "🇯🇵",
  SG: "🇸🇬", FR: "🇫🇷", KR: "🇰🇷", KE: "🇰🇪", SE: "🇸🇪", CO: "🇨🇴",
  AU: "🇦🇺", CA: "🇨🇦", BR: "🇧🇷", NO: "🇳🇴", DK: "🇩🇰", NL: "🇳🇱",
  AT: "🇦🇹", IN: "🇮🇳",
}

const impossibleTravelData = [
  {
    from: "London",
    fromCountry: "GB",
    to: "Dubai",
    toCountry: "AE",
    distance: "5,500 km",
    time: "16 minutes",
    speed: "20,625 km/h",
    status: "IMPOSSIBLE",
    risk: "HIGH",
    customerId: "CUST-0003",
    transactionIds: ["TXN-00005", "TXN-00006"],
  },
  {
    from: "Moscow",
    fromCountry: "RU",
    to: "Berlin",
    toCountry: "DE",
    distance: "1,608 km",
    time: "45 minutes",
    speed: "2,144 km/h",
    status: "IMPOSSIBLE",
    risk: "HIGH",
    customerId: "CUST-0009",
    transactionIds: ["TXN-00013", "TXN-00014"],
  },
  {
    from: "New York",
    fromCountry: "US",
    to: "London",
    toCountry: "GB",
    distance: "5,570 km",
    time: "45 minutes",
    speed: "7,427 km/h",
    status: "IMPOSSIBLE",
    risk: "HIGH",
    customerId: "CUST-0024",
    transactionIds: ["TXN-00043", "TXN-00044"],
  },
  {
    from: "Miami",
    fromCountry: "US",
    to: "New York",
    toCountry: "US",
    distance: "2,060 km",
    time: "35 minutes",
    speed: "3,531 km/h",
    status: "IMPOSSIBLE",
    risk: "HIGH",
    customerId: "CUST-0005",
    transactionIds: ["TXN-00007", "TXN-00009"],
  },
]

const anomalyCards = [
  {
    type: "new_location",
    title: "New Location for Existing Customer",
    description: "CUST-0013 (Robert Blackwell) transacted from Nairobi, Kenya - a location never previously associated with this account.",
    severity: "MEDIUM",
    customerId: "CUST-0013",
    details: "Account created 35 days ago. First transaction outside of Dubai/London corridor.",
  },
  {
    type: "impossible_travel",
    title: "Impossible Travel Detected",
    description: "CUST-0024 (Tyler Wright) - Transaction in New York at 01:45 followed by London at 02:30. 3,459 miles in 45 minutes.",
    severity: "CRITICAL",
    customerId: "CUST-0024",
    details: "Both transactions used different devices and payment methods.",
  },
  {
    type: "high_risk_country",
    title: "High-Risk Country Access",
    description: "CUST-0009 (Viktor Petrov) accessed the platform from Russia using Tor browser. Russia is flagged as a high-risk jurisdiction.",
    severity: "CRITICAL",
    customerId: "CUST-0009",
    details: "All 3 transactions from this location were blocked. Combined fraud value: $37,299.",
  },
]

export default function LocationsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<"grid" | "impossible" | "highrisk" | "anomalies">("grid")

  const stats = useMemo(() => {
    const total = locations.length
    const highRisk = locations.filter((l) => l.riskScore > 70).length
    const anomalies = impossibleTravelData.length + anomalyCards.length
    const totalTransactions = locations.reduce((sum, l) => sum + l.transactionCount, 0)
    return { total, highRisk, anomalies, totalTransactions }
  }, [])

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => b.riskScore - a.riskScore),
    []
  )

  const getRiskBg = (score: number) => {
    if (score <= 30) return "border-emerald-500/20 bg-emerald-500/5"
    if (score <= 70) return "border-amber-500/20 bg-amber-500/5"
    return "border-red-500/20 bg-red-500/5"
  }

  const highRiskLocations = locations.filter((l) => l.riskScore > 60)

  const highRiskColumns: Column<typeof locations[0]>[] = [
    {
      key: "city",
      label: "Location",
      render: (loc) => {
        const flag = countryFlags[loc.countryCode] || "🌍"
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <div>
              <span className="text-sm font-medium text-foreground">{loc.city}</span>
              <span className="text-xs text-muted-foreground block">{loc.country}</span>
            </div>
          </div>
        )
      },
    },
    {
      key: "transactionCount",
      label: "Transactions",
      sortable: true,
      width: "110px",
      render: (loc) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums font-medium">{loc.transactionCount}</span>
        </div>
      ),
    },
    {
      key: "suspiciousCount",
      label: "Suspicious",
      sortable: true,
      width: "100px",
      render: (loc) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            loc.suspiciousCount > 0 ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {loc.suspiciousCount}
        </span>
      ),
    },
    {
      key: "riskScore",
      label: "Risk Score",
      sortable: true,
      width: "120px",
      render: (loc) => (
        <div className="flex items-center gap-3">
          <RiskBadge score={loc.riskScore} size="sm" />
        </div>
      ),
    },
    {
      key: "customers",
      label: "Customers",
      width: "100px",
      render: (loc) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{loc.customers.length}</span>
        </div>
      ),
    },
  ]

  const tabs = [
    { id: "grid", label: "Location Grid" },
    { id: "impossible", label: "Impossible Travel" },
    { id: "highrisk", label: "High Risk Locations" },
    { id: "anomalies", label: "Anomalies" },
  ] as const

  return (
    <div className="space-y-6">
      <PageHeader
        title="Location Intelligence"
        description="Geographic risk analysis and impossible travel detection"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Locations"
          value={stats.total}
          icon={MapPin}
          trend="neutral"
        />
        <MetricCard
          title="High Risk"
          value={stats.highRisk}
          icon={ShieldAlert}
          trend="up"
          
        />
        <MetricCard
          title="Anomalies"
          value={stats.anomalies}
          icon={AlertTriangle}
          trend="up"
          change={{ value: stats.anomalies, label: "active alerts" }}
        />
        <MetricCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={CreditCard}
          trend="neutral"
        />
      </div>

      <div className="border-b border-border/50">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.id === "impossible" && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-500/15 text-red-400">
                    {impossibleTravelData.length}
                  </span>
                )}
                {tab.id === "anomalies" && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-amber-500/15 text-amber-400">
                    {anomalyCards.length}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "grid" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary" />
                Geographic Risk Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {sortedLocations.map((loc) => {
                  const flag = countryFlags[loc.countryCode] || "🌍"
                  return (
                    <div
                      key={`${loc.city}-${loc.countryCode}`}
                      className={cn(
                        "p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg",
                        getRiskBg(loc.riskScore)
                      )}
                      onClick={() => navigate("/locations")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{flag}</span>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground truncate">
                            {loc.city}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {loc.country}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <RiskBadge score={loc.riskScore} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {loc.transactionCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {loc.customers.length}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "impossible" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-red-400" />
                Impossible Travel Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                These alerts represent transactions where the geographic velocity between consecutive transactions
                exceeds physically possible travel speeds (500+ mph), indicating potential fraud.
              </p>
              <div className="space-y-4">
                {impossibleTravelData.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-red-500/20 bg-red-500/5 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{countryFlags[item.fromCountry] || "🌍"}</span>
                            <span className="text-base font-bold text-foreground">{item.from}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-px w-8 bg-red-500/40" />
                            <ArrowRight className="h-4 w-4 text-red-400" />
                            <div className="h-px w-8 bg-red-500/40" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{countryFlags[item.toCountry] || "🌍"}</span>
                            <span className="text-base font-bold text-foreground">{item.to}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="rounded-lg bg-muted/30 p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Distance</span>
                            <p className="text-sm font-bold text-foreground mt-0.5">{item.distance}</p>
                          </div>
                          <div className="rounded-lg bg-muted/30 p-2.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</span>
                            <p className="text-sm font-bold text-foreground mt-0.5">{item.time}</p>
                          </div>
                          <div className="rounded-lg bg-red-500/10 p-2.5">
                            <span className="text-[10px] text-red-400 uppercase tracking-wider">Speed Required</span>
                            <p className="text-sm font-bold text-red-400 mt-0.5">{item.speed}</p>
                          </div>
                          <div className="rounded-lg bg-red-500/10 p-2.5">
                            <span className="text-[10px] text-red-400 uppercase tracking-wider">Status</span>
                            <p className="text-sm font-bold text-red-400 mt-0.5 flex items-center gap-1">
                              <Zap className="h-3.5 w-3.5" />
                              {item.status}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="text-xs text-muted-foreground">
                            Customer: <button onClick={() => navigate(`/customers/${item.customerId}`)} className="font-mono font-medium text-primary hover:underline">{item.customerId}</button>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Transactions: {item.transactionIds.map((id, i) => (
                              <span key={id}>
                                <button onClick={() => navigate(`/transactions/${id}`)} className="font-mono font-medium text-primary hover:underline">{id}</button>
                                {i < item.transactionIds.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                      <Badge variant="risk-high" className="shrink-0 gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {item.risk} RISK
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "highrisk" && (
        <div className="space-y-4">
          <DataTable
            columns={highRiskColumns}
            data={highRiskLocations}
            onRowClick={() => navigate("/locations")}
            searchable
            searchPlaceholder="Search locations..."
            emptyMessage="No high-risk locations found"
          />
        </div>
      )}

      {activeTab === "anomalies" && (
        <div className="space-y-4">
          {anomalyCards.map((anomaly, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      anomaly.severity === "CRITICAL" ? "bg-red-500/10" : "bg-amber-500/10"
                    )}>
                      {anomaly.type === "new_location" && <MapPin className="h-6 w-6 text-amber-400" />}
                      {anomaly.type === "impossible_travel" && <Plane className="h-6 w-6 text-red-400" />}
                      {anomaly.type === "high_risk_country" && <ShieldAlert className="h-6 w-6 text-red-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">{anomaly.title}</h3>
                        <Badge
                          variant={anomaly.severity === "CRITICAL" ? "risk-high" : "risk-medium"}
                        >
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                      <p className="text-xs text-muted-foreground/80 italic">{anomaly.details}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          onClick={() => navigate(`/customers/${anomaly.customerId}`)}
                          className="text-xs font-mono font-medium text-primary hover:underline flex items-center gap-1"
                        >
                          {anomaly.customerId}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
