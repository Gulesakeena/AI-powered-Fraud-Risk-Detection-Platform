import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Globe,
  Search,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Users,
  Filter,
  Network,
} from "lucide-react"
import { ipAddresses } from "@/data/mock"
import { cn, timeAgo, getRiskColor } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DataTable, type Column } from "@/components/ui/data-table"

const getProxyTypeLabel = (ip: typeof ipAddresses[0]) => {
  if (ip.isTor) return "Tor Node"
  if (ip.isVPN) return "VPN"
  if (ip.isProxy) return "Proxy"
  return "Direct"
}

const getProxyBadgeVariant = (ip: typeof ipAddresses[0]) => {
  if (ip.isTor) return "risk-high" as const
  if (ip.isVPN) return "risk-medium" as const
  if (ip.isProxy) return "risk-medium" as const
  return "risk-low" as const
}

const countryFlags: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", RU: "🇷🇺", AE: "🇦🇪", JP: "🇯🇵",
  SG: "🇸🇬", FR: "🇫🇷", KR: "🇰🇷", KE: "🇰🇪", SE: "🇸🇪", CO: "🇨🇴",
  AU: "🇦🇺", CA: "🇨🇦", BR: "🇧🇷", NO: "🇳🇴", DK: "🇩🇰", NL: "🇳🇱",
  AT: "🇦🇹", IN: "🇮🇳",
}

export default function IpIntelligencePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")
  const [showVpnOnly, setShowVpnOnly] = useState(false)
  const [showTorOnly, setShowTorOnly] = useState(false)

  const stats = useMemo(() => {
    const total = ipAddresses.length
    const vpnCount = ipAddresses.filter((ip) => ip.isVPN).length
    const torCount = ipAddresses.filter((ip) => ip.isTor).length
    const highRisk = ipAddresses.filter((ip) => ip.riskLevel === "HIGH").length
    return { total, vpnCount, torCount, highRisk }
  }, [])

  const filteredIps = useMemo(() => {
    return ipAddresses.filter((ip) => {
      const matchesSearch =
        searchQuery === "" ||
        ip.ip.includes(searchQuery) ||
        ip.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ip.city.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRisk =
        riskFilter === "ALL" ||
        (riskFilter === "LOW" && ip.riskLevel === "LOW") ||
        (riskFilter === "MEDIUM" && ip.riskLevel === "MEDIUM") ||
        (riskFilter === "HIGH" && ip.riskLevel === "HIGH")
      const matchesVpn = !showVpnOnly || ip.isVPN
      const matchesTor = !showTorOnly || ip.isTor
      return matchesSearch && matchesRisk && matchesVpn && matchesTor
    })
  }, [searchQuery, riskFilter, showVpnOnly, showTorOnly])

  const columns: Column<typeof ipAddresses[0]>[] = [
    {
      key: "riskScore",
      label: "Risk",
      sortable: true,
      width: "90px",
      render: (ip) => <RiskBadge score={ip.riskScore} size="sm" />,
    },
    {
      key: "ip",
      label: "IP Address",
      render: (ip) => (
        <span className="font-mono text-sm font-medium text-foreground">{ip.ip}</span>
      ),
    },
    {
      key: "isVPN",
      label: "VPN",
      width: "70px",
      render: (ip) => (
        ip.isVPN ? (
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">VPN</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "isProxy",
      label: "Proxy",
      width: "70px",
      render: (ip) => (
        ip.isProxy ? (
          <div className="flex items-center gap-1">
            <Network className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">PROXY</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "isTor",
      label: "Tor",
      width: "70px",
      render: (ip) => (
        ip.isTor ? (
          <div className="flex items-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-medium">TOR</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: "country",
      label: "Location",
      render: (ip) => {
        const flag = countryFlags[ip.locations[0]?.countryCode] || "🌍"
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{flag}</span>
            <div>
              <span className="text-sm text-foreground">{ip.city}</span>
              <span className="text-xs text-muted-foreground block">{ip.country}</span>
            </div>
          </div>
        )
      },
    },
    {
      key: "customerIds",
      label: "Customers",
      sortable: true,
      width: "90px",
      render: (ip) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{ip.customerIds.length}</span>
        </div>
      ),
    },
    {
      key: "totalTransactions",
      label: "Total Txns",
      sortable: true,
      width: "90px",
      render: (ip) => (
        <span className="tabular-nums">{ip.totalTransactions}</span>
      ),
    },
    {
      key: "suspiciousTransactions",
      label: "Suspicious",
      sortable: true,
      width: "90px",
      render: (ip) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            ip.suspiciousTransactions > 0 ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {ip.suspiciousTransactions}
        </span>
      ),
    },
    {
      key: "riskScore",
      label: "Score",
      sortable: true,
      width: "70px",
      render: (ip) => (
        <span className={cn("text-lg font-bold tabular-nums", getRiskColor(ip.riskScore))}>
          {ip.riskScore}
        </span>
      ),
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      width: "100px",
      render: (ip) => (
        <span className="text-xs text-muted-foreground">
          {timeAgo(new Date(ip.lastSeenAt))}
        </span>
      ),
    },
    {
      key: "isVPN",
      label: "Status",
      width: "80px",
      render: (ip) => (
        <Badge variant={getProxyBadgeVariant(ip)}>
          {getProxyTypeLabel(ip)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="IP Intelligence"
        description="IP address risk analysis with VPN, proxy, and Tor detection"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total IPs"
          value={stats.total}
          icon={Globe}
          trend="neutral"
        />
        <MetricCard
          title="VPN / Proxy Detected"
          value={stats.vpnCount}
          icon={Shield}
          trend="up"
          change={{ value: stats.vpnCount, label: "anonymized" }}
        />
        <MetricCard
          title="Tor Nodes"
          value={stats.torCount}
          icon={ShieldAlert}
          trend="up"
          
        />
        <MetricCard
          title="High Risk"
          value={stats.highRisk}
          icon={AlertTriangle}
          trend="neutral"
          change={{ value: 0, label: "critical IPs" }}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by IP, country, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={riskFilter}
            onChange={setRiskFilter}
            options={[
              { label: "All Risk Levels", value: "ALL" },
              { label: "Low Risk", value: "LOW" },
              { label: "Medium Risk", value: "MEDIUM" },
              { label: "High Risk", value: "HIGH" },
            ]}
          />
          <Switch
            checked={showVpnOnly}
            onChange={setShowVpnOnly}
            label="VPN only"
          />
          <Switch
            checked={showTorOnly}
            onChange={setShowTorOnly}
            label="Tor only"
          />
          <Badge variant="outline" className="gap-1 ml-auto">
            <Filter className="h-3 w-3" />
            {filteredIps.length} results
          </Badge>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredIps}
        onRowClick={() => navigate("/ip-intelligence")}
        emptyMessage="No IP addresses match your filters"
        searchable={false}
      />
    </div>
  )
}
