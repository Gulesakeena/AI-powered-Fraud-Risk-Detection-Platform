import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  Zap,
  Shield,
  Clock,
  Copy,
  Trash2,
  Pencil,
  Play,
  ChevronDown,
  X,
  Target,
  Activity,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog } from "@/components/ui/dialog"
import { Tooltip } from "@/components/ui/tooltip"
import { ProgressBar } from "@/components/ui/progress-bar"
import { rules as mockRules } from "@/data/mock"
import type { Rule } from "@/data/mock"
import { cn, formatNumber, timeAgo } from "@/lib/utils"

const severityConfig: Record<
  Rule["severity"],
  { border: string; bg: string; text: string; label: string; dot: string }
> = {
  CRITICAL: {
    border: "border-l-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
    label: "CRITICAL",
    dot: "bg-red-500",
  },
  HIGH: {
    border: "border-l-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    label: "HIGH",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "MEDIUM",
    dot: "bg-amber-500",
  },
  LOW: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    label: "LOW",
    dot: "bg-emerald-500",
  },
}

const statusFilterOptions = [
  { label: "All Rules", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const sortOptions = [
  { label: "Priority", value: "priority" },
  { label: "Triggered Count", value: "triggered" },
  { label: "Name", value: "name" },
]

const fieldOptions = [
  { label: "Transaction Amount", value: "transaction.amount" },
  { label: "Transaction Count (1h)", value: "customer.transactions_1h" },
  { label: "Transaction Count (24h)", value: "customer.transactions_24h" },
  { label: "Device Risk Score", value: "device.riskScore" },
  { label: "Device Is Known", value: "device.isKnown" },
  { label: "Customer Account Age", value: "customer.accountAge" },
  { label: "IP Risk Score", value: "ip.riskScore" },
  { label: "IP Is VPN", value: "ip.isVPN" },
  { label: "IP Is Tor", value: "ip.isTor" },
  { label: "Location Change", value: "geo.locationChange" },
  { label: "Geo Velocity (mph)", value: "geo_velocity" },
  { label: "Merchant Category", value: "transaction.merchantCategory" },
  { label: "Distinct Payment Methods (24h)", value: "distinct_payment_methods_24h" },
  { label: "Crypto 24h Total", value: "crypto_24h_total" },
  { label: "Device Fraud Association", value: "device.fraudAssociation" },
]

const operatorOptions = [
  { label: ">", value: ">" },
  { label: "<", value: "<" },
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
  { label: "=", value: "==" },
  { label: "!=", value: "!=" },
  { label: "contains", value: "contains" },
  { label: "within", value: "within" },
]

const actionOptions = [
  { label: "Increase Risk Score", value: "increase_risk_score" },
  { label: "Flag as Suspicious", value: "flag_suspicious" },
  { label: "Block Transaction", value: "block_transaction" },
  { label: "Create Alert", value: "create_alert" },
  { label: "Require Review", value: "require_review" },
]

const severityOptions = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
  { label: "Critical", value: "CRITICAL" },
]

interface Condition {
  field: string
  operator: string
  value: string
  logic: "AND" | "OR"
}

interface RuleFormData {
  name: string
  description: string
  conditions: Condition[]
  action: string
  actionValue: string
  severity: string
  priority: number
  enabled: boolean
}

const emptyForm: RuleFormData = {
  name: "",
  description: "",
  conditions: [{ field: "transaction.amount", operator: ">", value: "", logic: "AND" }],
  action: "increase_risk_score",
  actionValue: "30",
  severity: "HIGH",
  priority: 2,
  enabled: true,
}

export default function RulesEnginePage() {
  const [localRules, setLocalRules] = useState<Rule[]>(mockRules)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("priority")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<RuleFormData>(emptyForm)

  const counts = useMemo(
    () => ({
      total: localRules.length,
      active: localRules.filter((r) => r.enabled).length,
      triggeredToday: localRules.reduce((sum, r) => sum + Math.floor(r.triggeredCount * 0.12), 0),
      topPerformer: localRules.reduce((max, r) => (r.triggeredCount > max.triggeredCount ? r : max), localRules[0]),
    }),
    [localRules]
  )

  const filteredRules = useMemo(() => {
    let result = [...localRules]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      )
    }

    if (statusFilter === "active") result = result.filter((r) => r.enabled)
    if (statusFilter === "inactive") result = result.filter((r) => !r.enabled)

    if (sortBy === "priority") result.sort((a, b) => a.priority - b.priority)
    if (sortBy === "triggered") result.sort((a, b) => b.triggeredCount - a.triggeredCount)
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name))

    return result
  }, [localRules, search, statusFilter, sortBy])

  const topTriggered = useMemo(
    () => [...localRules].sort((a, b) => b.triggeredCount - a.triggeredCount).slice(0, 5),
    [localRules]
  )

  const maxTriggered = topTriggered[0]?.triggeredCount || 1

  const toggleRule = (id: string) => {
    setLocalRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const deleteRule = (id: string) => {
    setLocalRules((prev) => prev.filter((r) => r.id !== id))
  }

  const duplicateRule = (rule: Rule) => {
    const newRule: Rule = {
      ...rule,
      id: `RULE-${String(localRules.length + 1).padStart(3, "0")}`,
      name: `${rule.name} (Copy)`,
      triggeredCount: 0,
      lastTriggeredAt: new Date().toISOString(),
    }
    setLocalRules((prev) => [...prev, newRule])
  }

  const addCondition = () => {
    setFormData((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        { field: "transaction.amount", operator: ">", value: "", logic: "AND" },
      ],
    }))
  }

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const updateCondition = (index: number, key: keyof Condition, value: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) =>
        i === index ? { ...c, [key]: value } : c
      ),
    }))
  }

  const handleSaveRule = () => {
    const newRule: Rule = {
      id: `RULE-${String(localRules.length + 1).padStart(3, "0")}`,
      name: formData.name,
      description: formData.description,
      condition: `IF ${formData.conditions
        .map((c, i) => {
          const prefix = i > 0 ? ` ${c.logic} ` : ""
          return `${prefix}${c.field} ${c.operator} ${c.value}`
        })
        .join("")} THEN ${formData.action}(${formData.actionValue})`,
      enabled: formData.enabled,
      priority: formData.priority,
      triggeredCount: 0,
      lastTriggeredAt: new Date().toISOString(),
      severity: formData.severity as Rule["severity"],
      action: `${formData.action} ${formData.actionValue}`,
    }
    setLocalRules((prev) => [...prev, newRule])
    setFormData(emptyForm)
    setShowCreateModal(false)
  }

  const getActionLabel = (action: string) => {
    return actionOptions.find((o) => o.value === action)?.label || action
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rules Engine"
        description="Create and manage detection rules for automated fraud screening"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Rules", value: counts.total, icon: Shield, color: "text-foreground" },
          { label: "Active", value: counts.active, icon: Zap, color: "text-emerald-400" },
          { label: "Triggered Today", value: counts.triggeredToday, icon: Activity, color: "text-blue-400" },
          {
            label: "Top Performing",
            value: counts.topPerformer?.triggeredCount || 0,
            icon: Target,
            color: "text-amber-400",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("rounded-lg bg-muted/50 p-2", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatNumber(stat.value)}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusFilterOptions}
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
          />
        </div>
      </div>

      {filteredRules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-foreground">No rules found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or create a new rule
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule) => {
            const sev = severityConfig[rule.severity]
            return (
              <Card
                key={rule.id}
                className={cn(
                  "border-l-4 hover:shadow-lg transition-all duration-200",
                  sev.border
                )}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-wider border-transparent",
                              sev.bg,
                              sev.text
                            )}
                          >
                            {sev.label} Priority
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            P{rule.priority}
                          </Badge>
                          {!rule.enabled && (
                            <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground border-transparent">
                              DISABLED
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {rule.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/30 bg-muted/20 p-4 space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-500/15 text-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          IF
                        </span>
                        <span className="text-xs text-muted-foreground">Conditions:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rule.condition
                          .replace(/^IF\s+/, "")
                          .split(/\s+AND\s+|\s+OR\s+/)
                          .filter((part) => !part.startsWith("THEN") && !part.startsWith("alert") && !part.startsWith("flag") && !part.startsWith("block") && !part.startsWith("score"))
                          .map((part, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5"
                            >
                              {i > 0 && (
                                <span className="text-[10px] font-bold text-muted-foreground/60">
                                  AND
                                </span>
                              )}
                              <div className="flex items-center gap-1 rounded-md border border-border/30 bg-background px-2 py-1 text-xs">
                                <span className="text-muted-foreground">
                                  {part.split(/[><=!]+/)[0]?.trim() || part}
                                </span>
                                <span className="font-mono text-primary text-[10px] font-bold">
                                  {part.match(/[><=!]+/)?.[0] || ""}
                                </span>
                                <span className="font-semibold text-foreground">
                                  {part.split(/[><=!]+/).slice(1).join("").trim()}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="h-px bg-border/30" />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          THEN
                        </span>
                        <span className="text-xs text-muted-foreground">Action:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 rounded-md border border-border/30 bg-background px-2 py-1 text-xs">
                          <span className="text-muted-foreground">Action:</span>
                          <span className="font-semibold text-foreground">
                            {getActionLabel(rule.action.split(" ")[0])}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 rounded-md border border-border/30 bg-background px-2 py-1 text-xs">
                          <span className="text-muted-foreground">Severity:</span>
                          <span className={cn("font-semibold", sev.text)}>
                            {rule.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3" />
                        <span>
                          <span className="font-semibold text-foreground">
                            {formatNumber(rule.triggeredCount)}
                          </span>{" "}
                          triggered
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Last: {timeAgo(new Date(rule.lastTriggeredAt))}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tooltip content="Edit Rule">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Test Rule">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Duplicate">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => duplicateRule(rule)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-400"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Rule Performance</h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">Top 5 rules by trigger count</p>
            <div className="space-y-4">
              {topTriggered.map((rule, i) => {
                const sev = severityConfig[rule.severity]
                const pct = (rule.triggeredCount / maxTriggered) * 100
                return (
                  <div key={rule.id} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-muted-foreground w-4">
                          {i + 1}.
                        </span>
                        <span className="truncate font-medium text-foreground">
                          {rule.name}
                        </span>
                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", sev.dot)} />
                      </div>
                      <span className="font-semibold text-foreground shrink-0 ml-2">
                        {formatNumber(rule.triggeredCount)}
                      </span>
                    </div>
                    <ProgressBar
                      value={pct}
                      color={
                        rule.severity === "CRITICAL"
                          ? "danger"
                          : rule.severity === "HIGH"
                          ? "warning"
                          : "default"
                      }
                      size="sm"
                      animated={false}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Detection Rule"
        size="lg"
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rule Name</label>
              <Input
                placeholder="e.g., High Amount Transaction"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                placeholder="e.g., Flag transactions over $5,000"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-500/15 text-blue-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  IF
                </span>
                <span className="text-sm font-medium text-foreground">Conditions</span>
              </div>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="mr-1 h-3 w-3" />
                Add Condition
              </Button>
            </div>

            <div className="space-y-3">
              {formData.conditions.map((condition, index) => (
                <div key={index} className="space-y-2">
                  {index > 0 && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() =>
                          updateCondition(
                            index,
                            "logic",
                            condition.logic === "AND" ? "OR" : "AND"
                          )
                        }
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                          condition.logic === "AND"
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-amber-500/15 text-amber-400"
                        )}
                      >
                        {condition.logic}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={condition.field}
                        onChange={(e) => updateCondition(index, "field", e.target.value)}
                        className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {fieldOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    <div className="relative w-20">
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(index, "operator", e.target.value)}
                        className="flex h-9 w-full items-center justify-center rounded-lg border border-border/60 bg-background px-2 py-2 text-sm font-mono font-bold text-primary appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {operatorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, "value", e.target.value)}
                      className="w-28"
                    />
                    {formData.conditions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-400 shrink-0"
                        onClick={() => removeCondition(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                THEN
              </span>
              <span className="text-sm font-medium text-foreground">Action</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={formData.action}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, action: e.target.value }))
                  }
                  className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {actionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <Input
                placeholder="Value"
                value={formData.actionValue}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, actionValue: e.target.value }))
                }
                className="w-24"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Severity</label>
              <div className="relative">
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, severity: e.target.value }))
                  }
                  className="flex h-9 w-full items-center rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {severityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Priority</label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enabled</label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={formData.enabled}
                  onChange={(checked) =>
                    setFormData((prev) => ({ ...prev, enabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule} disabled={!formData.name.trim()}>
              Save Rule
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
