import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Search,
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Flag,
  UserCheck,
  Smartphone,
  MapPin,
  CreditCard,
  Filter,
} from "lucide-react"
import { customers } from "@/data/mock"
import { cn, timeAgo, getRiskColor } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { MetricCard } from "@/components/ui/metric-card"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DataTable, type Column } from "@/components/ui/data-table"

export default function CustomersPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const stats = useMemo(() => {
    const total = customers.length
    const active = customers.filter((c) => c.status === "ACTIVE").length
    const flagged = customers.filter((c) => c.status === "FLAGGED").length
    const suspicious = customers.filter((c) => c.suspiciousTransactions > 0).length
    const highRisk = customers.filter((c) => c.riskLevel === "HIGH").length
    return { total, active, flagged, suspicious, highRisk }
  }, [])

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        searchQuery === "" ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRisk =
        riskFilter === "ALL" ||
        (riskFilter === "LOW" && c.riskLevel === "LOW") ||
        (riskFilter === "MEDIUM" && c.riskLevel === "MEDIUM") ||
        (riskFilter === "HIGH" && c.riskLevel === "HIGH")
      const matchesStatus =
        statusFilter === "ALL" || c.status === statusFilter
      return matchesSearch && matchesRisk && matchesStatus
    })
  }, [searchQuery, riskFilter, statusFilter])

  const statusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "risk-low" as const
      case "FLAGGED":
        return "risk-medium" as const
      case "SUSPENDED":
        return "risk-high" as const
      default:
        return "outline" as const
    }
  }

  const columns: Column<typeof customers[0]>[] = [
    {
      key: "riskScore",
      label: "Risk",
      sortable: true,
      width: "90px",
      render: (customer) => <RiskBadge score={customer.riskScore} size="sm" />,
    },
    {
      key: "id",
      label: "Customer ID",
      render: (customer) => (
        <span className="font-mono text-xs text-muted-foreground">{customer.id}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (customer) => (
        <div>
          <div className="font-medium text-foreground">{customer.name}</div>
          <div className="text-xs text-muted-foreground">{customer.email}</div>
        </div>
      ),
    },
    {
      key: "riskScore",
      label: "Score",
      sortable: true,
      width: "80px",
      render: (customer) => (
        <div className={cn("text-lg font-bold tabular-nums", getRiskColor(customer.riskScore))}>
          {customer.riskScore}
        </div>
      ),
    },
    {
      key: "totalTransactions",
      label: "Transactions",
      sortable: true,
      width: "100px",
      render: (customer) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{customer.totalTransactions}</span>
        </div>
      ),
    },
    {
      key: "suspiciousTransactions",
      label: "Suspicious",
      sortable: true,
      width: "90px",
      render: (customer) => (
        <span
          className={cn(
            "tabular-nums font-medium",
            customer.suspiciousTransactions > 0 ? "text-red-400" : "text-muted-foreground"
          )}
        >
          {customer.suspiciousTransactions}
        </span>
      ),
    },
    {
      key: "devices",
      label: "Devices",
      sortable: false,
      width: "80px",
      render: (customer) => (
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{customer.devices.length}</span>
        </div>
      ),
    },
    {
      key: "locations",
      label: "Locations",
      sortable: false,
      width: "90px",
      render: (customer) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="tabular-nums">{customer.locations.length}</span>
        </div>
      ),
    },
    {
      key: "accountAge",
      label: "Account Age",
      sortable: true,
      width: "100px",
      render: (customer) => (
        <span className="text-muted-foreground tabular-nums">{customer.accountAge}d</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "100px",
      render: (customer) => (
        <Badge variant={statusVariant(customer.status)}>{customer.status}</Badge>
      ),
    },
    {
      key: "lastActiveAt",
      label: "Last Active",
      sortable: true,
      width: "100px",
      render: (customer) => (
        <span className="text-muted-foreground text-xs">
          {timeAgo(new Date(customer.lastActiveAt))}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "60px",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/customers/${customer.id}`)
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => e.stopPropagation()}
          >
            <Flag className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => e.stopPropagation()}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Intelligence"
        description="Monitor customer risk profiles and behavior patterns"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Customers"
          value={stats.total}
          icon={Users}
          trend="neutral"
          change={{ value: 3, label: "this month" }}
        />
        <MetricCard
          title="Active"
          value={stats.active}
          icon={UserCheck}
          trend="up"
          change={{ value: 1, label: "this week" }}
        />
        <MetricCard
          title="Flagged"
          value={stats.flagged}
          icon={AlertTriangle}
          trend="up"
          change={{ value: 2, label: "this week" }}
          
        />
        <MetricCard
          title="Suspicious"
          value={stats.suspicious}
          icon={Shield}
          trend="up"
          
        />
        <MetricCard
          title="High Risk"
          value={stats.highRisk}
          icon={Ban}
          trend="neutral"
          change={{ value: 0, label: "no change" }}
        />
      </div>

      <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, ID, or email..."
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
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Flagged", value: "FLAGGED" },
              { label: "Suspended", value: "SUSPENDED" },
            ]}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="gap-1">
              <Filter className="h-3 w-3" />
              {filteredCustomers.length} results
            </Badge>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCustomers}
        onRowClick={(customer) => navigate(`/customers/${customer.id}`)}
        emptyMessage="No customers match your filters"
        searchable={false}
      />
    </div>
  )
}
