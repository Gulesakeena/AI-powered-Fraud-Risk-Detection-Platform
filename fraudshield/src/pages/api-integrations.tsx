import { useState } from "react"
import {
  KeyRound,
  Plus,
  RefreshCw,
  ShieldOff,
  Zap,
  BookOpen,
  Webhook,
  AlertTriangle,
  Activity,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Send,
  Clock,
  TrendingUp,
  CircleDot,
  Loader2,
} from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Dialog } from "@/components/ui/dialog"

interface ApiKey {
  id: string
  name: string
  secret: string
  permissions: string[]
  rateLimit: string
  lastUsed: string
  created: string
  environment: string
}

const apiKeys: ApiKey[] = [
  {
    id: "key-1",
    name: "Production API Key",
    secret: "••••••••••••••••••••••••••••4f2a",
    permissions: ["read", "write"],
    rateLimit: "1,000 requests/min",
    lastUsed: "2 minutes ago",
    created: "Jan 15, 2026",
    environment: "production",
  },
  {
    id: "key-2",
    name: "Development API Key",
    secret: "••••••••••••••••••••••••••••8c1d",
    permissions: ["read"],
    rateLimit: "100 requests/min",
    lastUsed: "3 days ago",
    created: "Feb 2, 2026",
    environment: "development",
  },
]

const endpoints = [
  { method: "POST", path: "/api/v1/transactions", desc: "Create transaction", usage: "2.4K" },
  { method: "POST", path: "/api/v1/risk-check", desc: "Check transaction risk", usage: "18.7K" },
  { method: "GET", path: "/api/v1/transactions/{id}", desc: "Get transaction details", usage: "9.1K" },
  { method: "GET", path: "/api/v1/risk/{id}", desc: "Get risk assessment", usage: "6.3K" },
  { method: "POST", path: "/api/v1/alerts/{id}/review", desc: "Review alert", usage: "412" },
  { method: "POST", path: "/api/v1/webhooks", desc: "Register webhook", usage: "38" },
  { method: "GET", path: "/api/v1/customers/{id}", desc: "Get customer profile", usage: "4.8K" },
  { method: "GET", path: "/api/v1/analytics/summary", desc: "Get analytics summary", usage: "1.1K" },
]

interface WebhookConfig {
  id: string
  url: string
  events: string[]
  status: "active" | "inactive"
}

const webhookConfigs: WebhookConfig[] = [
  {
    id: "wh-1",
    url: "https://api.merchant.com/hooks/fraudshield",
    events: ["transaction.flagged", "transaction.high_risk"],
    status: "active",
  },
  {
    id: "wh-2",
    url: "https://hooks.slack.com/services/T0X9/BRQ/webhook",
    events: ["alert.created", "alert.updated"],
    status: "active",
  },
  {
    id: "wh-3",
    url: "https://sentry.io/api/123/fraudshield/",
    events: ["transaction.flagged"],
    status: "inactive",
  },
]

interface LogEntry {
  id: string
  timestamp: string
  method: string
  endpoint: string
  status: number
  responseTime: string
}

const logEntries: LogEntry[] = [
  { id: "req_8f2c", timestamp: "2026-09-08 11:42:07", method: "POST", endpoint: "/api/v1/risk-check", status: 200, responseTime: "38ms" },
  { id: "req_8f2d", timestamp: "2026-09-08 11:42:03", method: "GET", endpoint: "/api/v1/transactions/txn_9921", status: 200, responseTime: "21ms" },
  { id: "req_8f2e", timestamp: "2026-09-08 11:41:58", method: "POST", endpoint: "/api/v1/transactions", status: 201, responseTime: "45ms" },
  { id: "req_8f2f", timestamp: "2026-09-08 11:41:52", method: "GET", endpoint: "/api/v1/customers/cus_8812", status: 404, responseTime: "12ms" },
  { id: "req_8f30", timestamp: "2026-09-08 11:41:47", method: "POST", endpoint: "/api/v1/alerts/alt_102/review", status: 200, responseTime: "66ms" },
  { id: "req_8f31", timestamp: "2026-09-08 11:41:39", method: "GET", endpoint: "/api/v1/analytics/summary", status: 500, responseTime: "204ms" },
  { id: "req_8f32", timestamp: "2026-09-08 11:41:31", method: "GET", endpoint: "/api/v1/risk/rsk_445", status: 200, responseTime: "29ms" },
  { id: "req_8f33", timestamp: "2026-09-08 11:41:24", method: "POST", endpoint: "/api/v1/risk-check", status: 429, responseTime: "18ms" },
  { id: "req_8f34", timestamp: "2026-09-08 11:41:16", method: "GET", endpoint: "/api/v1/transactions/txn_9918", status: 200, responseTime: "19ms" },
  { id: "req_8f35", timestamp: "2026-09-08 11:41:09", method: "POST", endpoint: "/api/v1/webhooks", status: 201, responseTime: "52ms" },
]

const usageData = [3200, 4100, 3800, 5200, 4700, 6100, 5800, 7200, 6800, 8400, 7900, 9300]
const topEndpoints = [
  { name: "/api/v1/risk-check", method: "POST", requests: 18742 },
  { name: "/api/v1/transactions/{id}", method: "GET", requests: 9120 },
  { name: "/api/v1/analytics/summary", method: "GET", requests: 1104 },
  { name: "/api/v1/customers/{id}", method: "GET", requests: 4820 },
  { name: "/api/v1/risk/{id}", method: "GET", requests: 6305 },
]

const methodBadge = (method: string) =>
  method === "GET"
    ? "border-blue-500/30 bg-blue-500/15 text-blue-400"
    : "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"

const statusColor = (status: number) =>
  status >= 200 && status < 300
    ? "text-emerald-400"
    : status >= 400 && status < 500
    ? "text-amber-400"
    : "text-red-400"

export default function ApiIntegrationsPage() {
  const [activeTab, setActiveTab] = useState("api-keys")
  const [keys, setKeys] = useState<ApiKey[]>(apiKeys)
  const [showGenerate, setShowGenerate] = useState(false)
  const [showAddWebhook, setShowAddWebhook] = useState(false)
  const [showCreateLog, setShowCreateLog] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyEnv, setNewKeyEnv] = useState("development")
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(["read"])
  const [hookUrl, setHookUrl] = useState("")
  const [hookEvents, setHookEvents] = useState<string[]>(["transaction.flagged"])
  const [webhooks, setWebhooks] = useState(webhookConfigs)
  const [testing, setTesting] = useState<string | null>(null)
  const [regenTarget, setRegenTarget] = useState<string | null>(null)
  const [logs, setLogs] = useState(logEntries)

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: w.status === "active" ? "inactive" : "active" } : w))
    )
  }

  const generateKey = () => {
    const last = `${newKeyName.toLowerCase().split(" ").join("-") || "api"}-${Math.random().toString(36).slice(2, 6)}`
    setKeys((prev) => [
      ...prev,
      {
        id: `key-${Date.now()}`,
        name: newKeyName || `New ${newKeyEnv} Key`,
        secret: `••••••••••••••••••••••••••••${last}`,
        permissions: newKeyPerms,
        rateLimit: newKeyEnv === "production" ? "1,000 requests/min" : "100 requests/min",
        lastUsed: "Never",
        created: "Sep 8, 2026",
        environment: newKeyEnv,
      },
    ])
    setShowGenerate(false)
    setNewKeyName("")
  }

  const regenerateKey = (id: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, secret: `••••••••••••••••••••••••••••${Math.random().toString(36).slice(2, 6)}` }
          : k
      )
    )
    setRegenTarget(null)
  }

  const revokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  const addWebhook = () => {
    if (!hookUrl) return
    setWebhooks((prev) => [
      ...prev,
      { id: `wh-${Date.now()}`, url: hookUrl, events: hookEvents, status: "active" },
    ])
    setShowAddWebhook(false)
    setHookUrl("")
  }

  const testWebhook = (id: string) => {
    setTesting(id)
    setTimeout(() => setTesting(null), 1500)
  }

  const addLog = (log: LogEntry) => {
    setLogs((prev) => [log, ...prev])
  }

  const tabs = [
    { id: "api-keys", label: "API Keys" },
    { id: "endpoints", label: "Endpoints" },
    { id: "webhooks", label: "Webhooks", count: webhooks.length },
    { id: "logs", label: "Request Logs", count: logs.length },
    { id: "usage", label: "Usage" },
  ]

  const maxUsage = Math.max(...usageData)

  return (
    <div className="space-y-6">
      <PageHeader
        title="API & Integrations"
        description="Manage API access, webhooks, and third-party integrations"
      />

      {/* Status Banner */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">API Status: Operational</p>
              <p className="text-xs text-emerald-400">All systems nominal</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">99.97%</p>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">42ms</p>
              <p className="text-xs text-muted-foreground">Response time</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">1.2M</p>
              <p className="text-xs text-muted-foreground">Requests / day</p>
            </div>
          </div>
        </div>
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* API Keys */}
      {activeTab === "api-keys" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-end">
            <Button onClick={() => setShowGenerate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {keys.map((key) => (
              <Card key={key.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        key.environment === "production" ? "bg-blue-500/15" : "bg-purple-500/15"
                      )}
                    >
                      <KeyRound
                        className={cn(
                          "h-5 w-5",
                          key.environment === "production" ? "text-blue-400" : "text-purple-400"
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{key.name}</h3>
                      <Badge
                        variant={key.environment === "production" ? "risk-high" : "outline"}
                        className="mt-1 text-[10px] uppercase"
                      >
                        {key.environment}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Copy">
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Hide">
                      <EyeOff className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
                  <code className="font-mono text-sm tracking-widest text-foreground">{key.secret}</code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(key.secret)}
                    className="ml-auto rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Permissions</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {key.permissions.map((p) => (
                        <Badge key={p} variant="outline" className="text-[10px]">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate Limit</p>
                    <p className="font-medium text-foreground">{key.rateLimit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Used</p>
                    <p className="font-medium text-foreground">{key.lastUsed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">{key.created}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border/50 pt-4">
                  <Button variant="outline" size="sm" onClick={() => setRegenTarget(key.id)}>
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:text-red-400 hover:bg-red-500/10 border-red-500/30"
                    onClick={() => revokeKey(key.id)}
                  >
                    <ShieldOff className="mr-2 h-3.5 w-3.5" />
                    Revoke
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    Edit Permissions
                  </Button>
                </div>
              </Card>
            ))}

            {keys.length === 0 && (
              <Card className="p-10 text-center lg:col-span-2">
                <KeyRound className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium text-foreground">No API keys</p>
                <p className="text-sm text-muted-foreground">Generate a key to get started</p>
                <Button className="mt-4" onClick={() => setShowGenerate(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate New Key
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Endpoints */}
      {activeTab === "endpoints" && (
        <Card className="p-4 animate-in fade-in duration-300">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">API Endpoints</h3>
              <p className="text-sm text-muted-foreground">Browse and interact with available endpoints</p>
            </div>
            <Button variant="outline" size="sm">
              <BookOpen className="mr-2 h-4 w-4" />
              View Docs
            </Button>
          </div>
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <div
                key={`${ep.method}-${ep.path}`}
                className="group flex items-center gap-4 rounded-lg border border-border/50 bg-muted/10 px-4 py-3 transition-colors hover:border-blue-500/40 hover:bg-muted/20"
              >
                <Badge className={cn("w-16 justify-center font-mono text-[11px]", methodBadge(ep.method))}>
                  {ep.method}
                </Badge>
                <div className="min-w-0 flex-1">
                  <code className="block font-mono text-sm text-foreground truncate">{ep.path}</code>
                  <p className="text-xs text-muted-foreground">{ep.desc}</p>
                </div>
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="tabular-nums">{formatNumber(Number(ep.usage.replace(/[^0-9]/g, "") || 0))} req</span>
                </div>
                <button className="rounded-lg p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-400 hover:bg-blue-500/10">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="rounded-lg p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground hover:bg-accent">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Webhooks */}
      {activeTab === "webhooks" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Webhook Endpoints</h3>
              <p className="text-sm text-muted-foreground">Deliver real-time events to your services</p>
            </div>
            <Button onClick={() => setShowAddWebhook(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-3">
            {webhooks.map((hook) => (
              <Card key={hook.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        hook.status === "active" ? "bg-emerald-500/15" : "bg-muted/50"
                      )}
                    >
                      <Webhook
                        className={cn("h-4.5 w-4.5", hook.status === "active" ? "text-emerald-400" : "text-muted-foreground")}
                      />
                    </div>
                    <div className="min-w-0">
                      <code className="block font-mono text-sm text-foreground truncate">{hook.url}</code>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {hook.events.map((ev) => (
                          <Badge key={ev} variant={hook.status === "active" ? "outline" : "secondary"} className="font-mono text-[10px]">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Switch checked={hook.status === "active"} onChange={() => toggleWebhook(hook.id)} label="Active" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-3">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium",
                      hook.status === "active" ? "text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    <CircleDot className="h-3 w-3" />
                    {hook.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-muted-foreground">Last delivery: 5 min ago</span>
                  <div className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={hook.status !== "active"}
                      onClick={() => testWebhook(hook.id)}
                    >
                      {testing === hook.id ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-3.5 w-3.5" />
                      )}
                      {testing === hook.id ? "Testing..." : "Test Webhook"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Request Logs */}
      {activeTab === "logs" && (
        <Card className="p-0 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <div>
              <h3 className="font-semibold text-foreground">Request Logs</h3>
              <p className="text-sm text-muted-foreground">Recent API requests across all keys</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowCreateLog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Simulate Request
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                  <th className="px-4 py-3 font-medium">Method</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Response</th>
                  <th className="px-4 py-3 font-medium">Request ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <Badge className={cn("font-mono text-[10px]", methodBadge(log.method))}>{log.method}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-foreground">{log.endpoint}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-mono text-sm font-semibold", statusColor(log.status))}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {log.responseTime}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="font-mono text-xs text-muted-foreground">{log.id}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Usage */}
      {activeTab === "usage" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">API Usage (30 days)</h3>
                <p className="text-sm text-muted-foreground">Total requests across all endpoints</p>
              </div>
              <Select
                value="30d"
                onChange={() => undefined}
                options={[
                  { label: "Last 30 days", value: "30d" },
                  { label: "Last 7 days", value: "7d" },
                  { label: "Today", value: "1d" },
                ]}
              />
            </div>
            <div className="flex h-44 items-end gap-2">
              {usageData.map((value, index) => (
                <div key={index} className="group relative flex-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-600/50 to-blue-400 transition-all duration-300 group-hover:from-blue-500 group-hover:to-blue-300"
                    style={{ height: `${(value / maxUsage) * 100}%` }}
                  />
                  <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-card px-2 py-1 text-xs shadow border border-border/50 group-hover:block">
                    {formatNumber(value)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-400" />
                Current Rate Limit
              </h4>
              <div className="mt-3">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-foreground">64%</p>
                  <p className="text-xs text-muted-foreground">of 1,000 req/min</p>
                </div>
                <div className="mt-2">
                  <ProgressBar value={64} color="info" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">640 requests in the last minute</p>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Error Rate
              </h4>
              <p className="mt-3 text-2xl font-bold text-foreground">1.24%</p>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">4xx</Badge> 0.98%
                </p>
                <p className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">5xx</Badge> 0.26%
                </p>
              </div>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                Daily Requests
              </h4>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-2xl font-bold text-foreground">1.2M</p>
                <Badge variant="risk-low" className="text-[10px]">
                  <TrendingUp className="h-3 w-3 mr-1" /> +12% vs last week
                </Badge>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h4 className="mb-4 font-semibold text-foreground">Top Endpoints by Usage</h4>
            <div className="space-y-3">
              {topEndpoints.map((ep) => (
                <div key={ep.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <code className="font-mono text-xs text-foreground">{ep.name}</code>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(ep.requests)} req</span>
                  </div>
                  <ProgressBar
                    value={(ep.requests / topEndpoints[0].requests) * 100}
                    color="success"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Generate Key Dialog */}
      <Dialog isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generate New API Key">
        <div className="space-y-4">
          <Input
            placeholder="Key name (e.g. Staging Key)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
          <Select
            label="Environment"
            value={newKeyEnv}
            onChange={setNewKeyEnv}
            options={[
              { label: "Development", value: "development" },
              { label: "Production", value: "production" },
            ]}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Permissions</p>
            <div className="space-y-2">
              {["read", "write"].map((perm) => (
                <Switch
                  key={perm}
                  checked={newKeyPerms.includes(perm)}
                  onChange={(checked) =>
                    setNewKeyPerms((prev) =>
                      checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                    )
                  }
                  label={perm}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowGenerate(false)}>
              Cancel
            </Button>
            <Button onClick={generateKey} disabled={!newKeyName}>
              Generate Key
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Webhook Dialog */}
      <Dialog isOpen={showAddWebhook} onClose={() => setShowAddWebhook(false)} title="Add Webhook">
        <div className="space-y-4">
          <Input
            placeholder="https://your-service.com/hooks/fraudshield"
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Events</p>
            <div className="space-y-2">
              {[
                "transaction.flagged",
                "transaction.high_risk",
                "alert.created",
                "alert.updated",
                "investigation.completed",
              ].map((ev) => (
                <Switch
                  key={ev}
                  checked={hookEvents.includes(ev)}
                  onChange={(checked) =>
                    setHookEvents((prev) => (checked ? [...prev, ev] : prev.filter((e) => e !== ev)))
                  }
                  label={ev}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddWebhook(false)}>
              Cancel
            </Button>
            <Button onClick={addWebhook} disabled={!hookUrl}>
              Add Webhook
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Regenerate Key Dialog */}
      <Dialog
        isOpen={regenTarget !== null}
        onClose={() => setRegenTarget(null)}
        title="Regenerate API Key"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will invalidate the current key and generate a new one immediately. Any services using this key will
            need to be updated.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRegenTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => regenerateKey(regenTarget!)}>
              Regenerate
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Simulate Log Dialog */}
      <Dialog isOpen={showCreateLog} onClose={() => setShowCreateLog(false)} title="Simulate API Request">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a sample request log entry for the selected endpoint.
          </p>
          <Button
            onClick={() => {
              const methods = ["GET", "POST"] as const
              const method = methods[Math.floor(Math.random() * methods.length)]
              const ep = endpoints[Math.floor(Math.random() * endpoints.length)]
              const statuses = [200, 201, 400, 404, 429, 500]
              const status = statuses[Math.floor(Math.random() * statuses.length)]
              addLog({
                id: `req_${Math.random().toString(36).slice(2, 6)}`,
                timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
                method: method,
                endpoint: ep.path,
                status,
                responseTime: `${Math.floor(Math.random() * 180 + 10)}ms`,
              })
              setShowCreateLog(false)
            }}
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Generate Random Request
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
