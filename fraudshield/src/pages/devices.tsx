import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Smartphone,
  Tablet,
  Monitor,
  Search,
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Users,
  Filter,
  Fingerprint,
  Laptop,
} from "lucide-react"
import { devices } from "@/data/mock"
import { cn, timeAgo, getRiskColor } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DataTable, type Column } from "@/components/ui/data-table"

const getDeviceIcon = (type: string, os: string) => {
  if (type === "Tablet") return Tablet
  if (type === "Mobile") return Smartphone
  if (os.toLowerCase().includes("mac") || os.toLowerCase().includes("ipad")) return Laptop
  return Monitor
}

const getDeviceTypeColor = (type: string) => {
  switch (type) {
    case "Desktop": return "text-blue-400"
    case "Mobile": return "text-purple-400"
    case "Tablet": return "text-teal-400"
    default: return "text-muted-foreground"
  }
}

const getDeviceTypeBg = (type: string) => {
  switch (type) {
    case "Desktop": return "bg-blue-500/10"
    case "Mobile": return "bg-purple-500/10"
    case "Tablet": return "bg-teal-500/10"
    default: return "bg-muted/50"
  }
}

export default function DevicesPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [knownOnly, setKnownOnly] = useState(false)

  const stats = useMemo(() => {
    const total = devices.length
    const suspicious = devices.filter((d) => d.suspiciousTransactions > 0).length
    const highRisk = devices.filter((d) => d.riskLevel === "HIGH").length
    const newDevices = devices.filter((d) => {
      const firstSeen = new Date(d.firstSeenAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return firstSeen >= weekAgo
    }).length
    return { total, suspicious, highRisk, newDevices }
  }, [])

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchesSearch =
        searchQuery === "" ||
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.browser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerIds.some((id) => id.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesRisk =
        riskFilter === "ALL" ||
        (riskFilter === "LOW" && d.riskLevel === "LOW") ||
        (riskFilter === "MEDIUM" && d.riskLevel === "MEDIUM") ||
        (riskFilter === "HIGH" && d.riskLevel === "HIGH")
      const matchesType =
        typeFilter === "ALL" || d.type === typeFilter
      const matchesKnown = !knownOnly || d.isKnown
      return matchesSearch && matchesRisk && matchesType && matchesKnown
    })
  }, [searchQuery, riskFilter, typeFilter, knownOnly])

  const columns: Column<typeof devices[0]>[] = [
    {
      key: "riskScore",
      label: "Risk",
      sortable: true,
      width: "90px",
      render: (device) => <RiskBadge score={device.riskScore} size="sm" />,
    },
    {
      key: "id",
      label: "Device ID",
      render: (device) => (
        <span className="font-mono text-xs text-foreground">{device.id}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (device) => {
        const Icon = getDeviceIcon(device.type, device.os)
        return (
          <div className="flex items-center gap-2">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", getDeviceTypeBg(device.type))}>
              <Icon className={cn("h-4 w-4", getDeviceTypeColor(device.type))} />
            </div>
            <span className="text-sm font-medium text-foreground">{device.type}</span>
          </div>
        )
      },
    },
    {
      key: "os",
      label: "OS + Browser",
      render: (device) => (
        <div>
          <span className="text-sm text-foreground">{device.os}</span>
          <span className="text-xs text-muted-foreground block">{device.browser}</span>
        </div>
      ),
    },
    {
      key: "customerIds",
      label: "Customers",
      render: (device) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{device.customerIds.length}</span>
          {device.customerIds.length > 1 && (
            <Badge variant="risk-high" className="text-[10px] px-1 py-0 ml-1">SHARED</Badge>
          )}
        </div>
      ),
    },
    {
      key: "totalTransactions",
      label: "Total Txns",
      sortable: true,
      width: "90px",
      render: (device) => (
        <span className="tabular-nums">{device.totalTransactions}</span>
      ),
    },
    {
      key: "suspiciousTransactions",
      label: "Suspicious",
      sortable: true,
      width: "90px",
      render: (device) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            device.suspiciousTransactions > 0 ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {device.suspiciousTransactions}
        </span>
      ),
    },
    {
      key: "riskScore",
      label: "Score",
      sortable: true,
      width: "70px",
      render: (device) => (
        <span className={cn("text-lg font-bold tabular-nums", getRiskColor(device.riskScore))}>
          {device.riskScore}
        </span>
      ),
    },
    {
      key: "locations",
      label: "Locations",
      render: (device) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{device.locations.length}</span>
        </div>
      ),
    },
    {
      key: "firstSeenAt",
      label: "First Seen",
      sortable: true,
      width: "100px",
      render: (device) => (
        <span className="text-xs text-muted-foreground">
          {new Date(device.firstSeenAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      ),
    },
    {
      key: "lastSeenAt",
      label: "Last Seen",
      sortable: true,
      width: "100px",
      render: (device) => (
        <span className="text-xs text-muted-foreground">
          {timeAgo(new Date(device.lastSeenAt))}
        </span>
      ),
    },
    {
      key: "isKnown",
      label: "Known",
      width: "70px",
      render: (device) => (
        device.isKnown ? (
          <Badge variant="risk-low" className="text-[10px]">KNOWN</Badge>
        ) : (
          <Badge variant="risk-high" className="text-[10px]">NEW</Badge>
        )
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Device Intelligence"
        description="Device fingerprinting and behavioral analysis"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Devices"
          value={stats.total}
          icon={Smartphone}
          trend="neutral"
          change={{ value: 2, label: "this month" }}
        />
        <MetricCard
          title="Suspicious"
          value={stats.suspicious}
          icon={AlertTriangle}
          trend="up"
          change={{ value: 3, label: "this week" }}
          
        />
        <MetricCard
          title="High Risk"
          value={stats.highRisk}
          icon={ShieldAlert}
          trend="up"
          
        />
        <MetricCard
          title="New (7 days)"
          value={stats.newDevices}
          icon={Fingerprint}
          trend="up"
          change={{ value: stats.newDevices, label: "new devices" }}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by device ID, OS, browser, or customer..."
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
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { label: "All Device Types", value: "ALL" },
              { label: "Desktop", value: "Desktop" },
              { label: "Mobile", value: "Mobile" },
              { label: "Tablet", value: "Tablet" },
            ]}
          />
          <Switch
            checked={knownOnly}
            onChange={setKnownOnly}
            label="Known only"
          />
          <Badge variant="outline" className="gap-1 ml-auto">
            <Filter className="h-3 w-3" />
            {filteredDevices.length} results
          </Badge>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredDevices}
        onRowClick={() => navigate("/devices")}
        emptyMessage="No devices match your filters"
        searchable={false}
      />
    </div>
  )
}
