import * as React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  Search,
  Download,
  SlidersHorizontal,
  Eye,
  ShieldAlert,
  Ban,
  MapPin,
  CreditCard,
  MoreHorizontal,
  Calendar,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DataTable, type Column } from "@/components/ui/data-table"
import { RiskBadge } from "@/components/ui/risk-badge"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { transactions, type Transaction } from "@/data/mock"
import { formatCurrency, timeAgo } from "@/lib/utils"

const RISK_LEVELS = [
  { label: "All Risk Levels", value: "all" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
]

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "all" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "PENDING" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Reviewing", value: "REVIEWING" },
]

const PAYMENT_OPTIONS = [
  { label: "All Methods", value: "all" },
  { label: "Visa", value: "Visa" },
  { label: "Mastercard", value: "Mastercard" },
  { label: "Amex", value: "Amex" },
  { label: "Bank Transfer", value: "Bank Transfer" },
  { label: "PayPal", value: "PayPal" },
  { label: "Crypto", value: "Crypto" },
]

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "all" },
  { label: "Electronics", value: "Electronics" },
  { label: "Travel", value: "Travel" },
  { label: "Gaming", value: "Gaming" },
  { label: "Crypto Exchange", value: "Crypto Exchange" },
  { label: "Retail", value: "Retail" },
  { label: "Food & Dining", value: "Food & Dining" },
  { label: "Subscription", value: "Subscription" },
  { label: "Financial Services", value: "Financial Services" },
]

const PAGE_SIZE = 10

const statusVariant: Record<Transaction["status"], string> = {
  COMPLETED: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  PENDING: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  BLOCKED: "border-red-500/30 bg-red-500/15 text-red-400",
  REVIEWING: "border-blue-500/30 bg-blue-500/15 text-blue-400",
}

const paymentIcon: Record<string, React.ReactNode> = {
  Visa: <CreditCard className="h-4 w-4" />,
  Mastercard: <CreditCard className="h-4 w-4" />,
  Amex: <CreditCard className="h-4 w-4" />,
  "Bank Transfer": <CreditCard className="h-4 w-4" />,
  PayPal: <CreditCard className="h-4 w-4" />,
  Crypto: <CreditCard className="h-4 w-4" />,
}

export default function TransactionsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchQuery, setSearchQuery] = React.useState("")
  const [riskFilter, setRiskFilter] = React.useState(() =>
    searchParams.get("risk") ? searchParams.get("risk")!.toUpperCase() : "all"
  )
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [paymentFilter, setPaymentFilter] = React.useState("all")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedRows, setSelectedRows] = React.useState<Transaction[]>([])

  const filteredTransactions = React.useMemo(() => {
    let result = [...transactions]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          String(t.amount).toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q)
      )
    }

    if (riskFilter !== "all") {
      result = result.filter((t) => t.riskLevel === riskFilter)
    }

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }

    if (paymentFilter !== "all") {
      result = result.filter((t) => t.paymentMethod.type === paymentFilter)
    }

    if (categoryFilter !== "all") {
      result = result.filter((t) => t.merchantCategory === categoryFilter)
    }

    return result
  }, [searchQuery, riskFilter, statusFilter, paymentFilter, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageData = React.useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredTransactions.slice(start, start + PAGE_SIZE)
  }, [filteredTransactions, safePage])

  const totalCount = transactions.length
  const highRiskCount = transactions.filter((t) => t.riskLevel === "HIGH").length
  const blockedCount = transactions.filter((t) => t.status === "BLOCKED").length
  const avgRiskScore = Math.round(
    transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length
  )

  const columns: Column<Transaction>[] = [
    {
      key: "risk",
      label: "Risk",
      width: "120px",
      render: (t) => <RiskBadge score={t.riskScore} size="sm" />,
    },
    {
      key: "id",
      label: "Transaction",
      sortable: true,
      width: "130px",
      render: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/transactions/${t.id}`)
          }}
          className="font-mono text-sm font-medium text-primary hover:underline"
        >
          {t.id}
        </button>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      sortable: true,
      width: "160px",
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{t.customerName}</span>
          <span className="text-xs text-muted-foreground font-mono">{t.customerId}</span>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      width: "110px",
      render: (t) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatCurrency(t.amount)}
        </span>
      ),
    },
    {
      key: "merchant",
      label: "Merchant",
      width: "150px",
      render: (t) => (
        <div className="flex flex-col">
          <span className="text-foreground">{t.merchant}</span>
          <span className="text-xs text-muted-foreground">{t.merchantCategory}</span>
        </div>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      width: "140px",
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="text-primary/70">{paymentIcon[t.paymentMethod.type]}</span>
          <div className="flex flex-col">
            <span className="text-sm text-foreground">{t.paymentMethod.type}</span>
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      width: "150px",
      render: (t) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {t.location.city}, {t.location.countryCode}
          </span>
        </div>
      ),
    },
    {
      key: "riskScore",
      label: "Risk Score",
      sortable: true,
      width: "110px",
      render: (t) => (
        <span
          className={`font-mono text-base font-bold tabular-nums ${
            t.riskScore <= 30
              ? "text-emerald-400"
              : t.riskScore <= 70
              ? "text-amber-400"
              : "text-red-400"
          }`}
        >
          {t.riskScore}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "120px",
      render: (t) => (
        <Badge className={statusVariant[t.status]} variant="outline">
          {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "time",
      label: "Time",
      sortable: true,
      width: "100px",
      render: (t) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {timeAgo(new Date(t.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      width: "60px",
      render: (t) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu
            align="right"
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: "View",
                icon: <Eye className="h-4 w-4" />,
                onClick: () => navigate(`/transactions/${t.id}`),
              },
              {
                label: "Investigate",
                icon: <ShieldAlert className="h-4 w-4" />,
                onClick: () => navigate(`/transactions/${t.id}`),
              },
              {
                label: "Block Transaction",
                icon: <Ban className="h-4 w-4" />,
                danger: true,
                onClick: () =>
                  toast.success(`${t.id} blocked successfully`),
              },
            ]}
          />
        </div>
      ),
    },
  ]

  const handleExport = () => {
    toast.success(`Exported ${filteredTransactions.length} transactions`)
  }

  const stats = [
    { label: "Total", value: totalCount },
    { label: "High Risk", value: highRiskCount },
    { label: "Blocked", value: blockedCount },
    { label: "Avg Risk Score", value: avgRiskScore },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Monitor and analyze all transactions across your platform"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
          </div>
        }
      />

      {/* Summary stats bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p
              className={`mt-1 text-2xl font-bold tabular-nums ${
                stat.label === "High Risk"
                  ? "text-red-400"
                  : stat.label === "Blocked"
                  ? "text-red-400"
                  : stat.label === "Avg Risk Score"
                  ? "text-amber-400"
                  : "text-foreground"
              }`}
            >
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Filter bar */}
      <Card className="space-y-4 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID, customer, or amount..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={riskFilter}
            onChange={(v) => {
              setRiskFilter(v)
              setCurrentPage(1)
              if (v === "HIGH") {
                setSearchParams({ risk: "high" })
              } else {
                searchParams.delete("risk")
                setSearchParams(searchParams)
              }
            }}
            options={RISK_LEVELS}
            placeholder="Risk Level"
          />
          <Select
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v)
              setCurrentPage(1)
            }}
            options={STATUS_OPTIONS}
            placeholder="Status"
          />
          <Select
            value={paymentFilter}
            onChange={(v) => {
              setPaymentFilter(v)
              setCurrentPage(1)
            }}
            options={PAYMENT_OPTIONS}
            placeholder="Payment Method"
          />
          <Select
            value={categoryFilter}
            onChange={(v) => {
              setCategoryFilter(v)
              setCurrentPage(1)
            }}
            options={CATEGORY_OPTIONS}
            placeholder="Merchant Category"
          />
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last 7 days · Sep 1 – Sep 8, 2026</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredTransactions.length} of {totalCount} transactions
          </p>
        </div>
      </Card>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={pageData}
        onRowClick={(t) => navigate(`/transactions/${t.id}`)}
        selectable
        onSelectionChange={setSelectedRows}
        emptyMessage="No transactions match your filters"
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
        }}
      />

      {selectedRows.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-primary/5 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{selectedRows.length}</span> selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Blocked ${selectedRows.length} transactions`)}
            >
              <Ban className="h-4 w-4" />
              Block
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success("Exported selected transactions")}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
