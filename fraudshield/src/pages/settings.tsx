import * as React from "react"
import {
  Building2,
  ShieldCheck,
  Bell,
  Lock,
  Palette,
  Globe,
  Save,
  Check,
  Plus,
  Trash2,
  Brain,
  Zap,
  Users,
  Send,
  Webhook,
  KeyRound,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tooltip } from "@/components/ui/tooltip"

const timezones = [
  { label: "UTC (Coordinated Universal Time)", value: "UTC" },
  { label: "US / Pacific (PT)", value: "America/Los_Angeles" },
  { label: "US / Eastern (ET)", value: "America/New_York" },
  { label: "Europe / London (GMT)", value: "Europe/London" },
  { label: "Europe / Berlin (CET)", value: "Europe/Berlin" },
  { label: "Asia / Singapore (SGT)", value: "Asia/Singapore" },
  { label: "Asia / Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Australia / Sydney (AEST)", value: "Australia/Sydney" },
]

const dateFormats = [
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
]

const currencies = [
  { label: "USD – US Dollar", value: "USD" },
  { label: "EUR – Euro", value: "EUR" },
  { label: "GBP – British Pound", value: "GBP" },
  { label: "SGD – Singapore Dollar", value: "SGD" },
  { label: "JPY – Japanese Yen", value: "JPY" },
]

const sessionTimeouts = [
  { label: "15 minutes", value: "15" },
  { label: "30 minutes", value: "30" },
  { label: "60 minutes", value: "60" },
  { label: "4 hours", value: "240" },
  { label: "8 hours", value: "480" },
]

const retentionOptions = [
  { label: "30 days", value: "30" },
  { label: "60 days", value: "60" },
  { label: "90 days", value: "90" },
  { label: "180 days", value: "180" },
  { label: "1 year", value: "365" },
]

const accentColors = [
  { id: "blue", color: "#3B82F6", label: "Blue" },
  { id: "purple", color: "#8B5CF6", label: "Purple" },
  { id: "teal", color: "#14B8A6", label: "Teal" },
]

interface Recipient {
  id: string
  email: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general")

  // General
  const [orgName, setOrgName] = React.useState("FraudShield Demo")
  const [timezone, setTimezone] = React.useState("UTC")
  const [dateFormat, setDateFormat] = React.useState("MM/DD/YYYY")
  const [currency, setCurrency] = React.useState("USD")
  const [businessHours, setBusinessHours] = React.useState("Mon-Fri 9:00-17:00 UTC")

  // Detection
  const [lowRiskMax, setLowRiskMax] = React.useState(30)
  const [autoBlockEnabled, setAutoBlockEnabled] = React.useState(true)
  const [autoBlockThreshold, setAutoBlockThreshold] = React.useState(90)
  const [modelVersion, setModelVersion] = React.useState("v2.4")
  const [modelAutoUpdate, setModelAutoUpdate] = React.useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = React.useState(80)
  const [maxPerHour, setMaxPerHour] = React.useState(10)
  const [maxPerDay, setMaxPerDay] = React.useState(50)

  // Notifications
  const [highRiskAlerts, setHighRiskAlerts] = React.useState(true)
  const [confirmedFraud, setConfirmedFraud] = React.useState(true)
  const [dailySummary, setDailySummary] = React.useState(true)
  const [weeklyReport, setWeeklyReport] = React.useState(false)
  const [recipients, setRecipients] = React.useState<Recipient[]>([
    { id: "1", email: "fraud-team@fraudshield.ai" },
    { id: "2", email: "compliance@fraudshield.ai" },
    { id: "3", email: "risk-ops@fraudshield.ai" },
  ])
  const [newRecipient, setNewRecipient] = React.useState("")
  const [slackWebhook, setSlackWebhook] = React.useState("https://hooks.slack.com/services/T0000/B0000/XXXX")
  const [slackChannel, setSlackChannel] = React.useState("#fraud-alerts")
  const [slackEnabled, setSlackEnabled] = React.useState(true)

  // Security
  const [twoFactor, setTwoFactor] = React.useState(true)
  const [sessionTimeout, setSessionTimeout] = React.useState("30")
  const [minPassword, setMinPassword] = React.useState(true)
  const [ipAllowlist, setIpAllowlist] = React.useState("192.168.1.0/24\n10.0.0.0/8")
  const [retention, setRetention] = React.useState("90")

  // Appearance
  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  const [accent, setAccent] = React.useState("blue")
  const [compactMode, setCompactMode] = React.useState(false)
  const [autoCollapse, setAutoCollapse] = React.useState(true)

  // API Settings
  const [rateLimit, setRateLimit] = React.useState("1000")
  const [webhookRetry, setWebhookRetry] = React.useState("3")
  const [apiVersion] = React.useState("v1")
  const [corsOrigins, setCorsOrigins] = React.useState("https://app.fraudshield.ai\nhttps://*.fraudshield.ai")
  const [apiLogging, setApiLogging] = React.useState(true)

  const handleSave = () => {
    toast.success("Settings saved successfully")
  }

  const addRecipient = () => {
    const email = newRecipient.trim()
    if (!email) {
      toast.error("Please enter a valid email address")
      return
    }
    setRecipients((prev) => [...prev, { id: String(Date.now()), email }])
    setNewRecipient("")
    toast.success(`${email} added to notification recipients`)
  }

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  const tabs = [
    { id: "general", label: "General" },
    { id: "detection", label: "Detection" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "appearance", label: "Appearance" },
    { id: "api", label: "API Settings" },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure platform preferences, security, and integrations"
        actions={
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ============ GENERAL ============ */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Organization
              </CardTitle>
              <CardDescription>Basic organization and regional preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Organization name</label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    value={timezone}
                    onChange={setTimezone}
                    options={timezones}
                    label="Default timezone"
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    value={dateFormat}
                    onChange={setDateFormat}
                    options={dateFormats}
                    label="Date format"
                  />
                </div>
                <div className="space-y-2">
                  <Select
                    value={currency}
                    onChange={setCurrency}
                    options={currencies}
                    label="Currency"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Business hours</label>
                <Input
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  placeholder="e.g. Mon-Fri 9:00-17:00"
                />
                <p className="text-xs text-muted-foreground">
                  Used for scheduling reports and calculating operating windows in UTC.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Preview of your configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label="Organization" value={orgName || "—"} />
              <Row label="Timezone" value={timezone} />
              <Row label="Date format" value={dateFormat} />
              <Row label="Currency" value={currency} />
              <Row label="Business hours" value={businessHours || "—"} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ DETECTION ============ */}
      {activeTab === "detection" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Risk Score Thresholds
              </CardTitle>
              <CardDescription>Define the boundaries for each risk classification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Low Risk</span>
                    <span className="text-xs text-muted-foreground">0 – {lowRiskMax}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={40}
                    value={lowRiskMax}
                    onChange={(e) => setLowRiskMax(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-xs text-emerald-400">Scores below this threshold are considered low risk</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Medium Risk</span>
                    <span className="text-xs text-muted-foreground">{lowRiskMax + 1} – 70</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                    <div className="flex h-full">
                      <div className="bg-emerald-500/60" style={{ width: `${lowRiskMax}%` }} />
                      <div className="bg-amber-500/60" style={{ width: `${70 - lowRiskMax}%` }} />
                      <div className="bg-red-500/60" style={{ width: `${100 - 70}%` }} />
                    </div>
                  </div>
                  <p className="text-xs text-amber-400">Scores in this range require review</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">High Risk</span>
                    <span className="text-xs text-muted-foreground">71 – 100</span>
                  </div>
                  <p className="text-xs text-red-400">Scores above 70 are flagged as high risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Auto Response
              </CardTitle>
              <CardDescription>Automatic actions based on risk thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-block transaction</p>
                  <p className="text-xs text-muted-foreground">Automatically block transactions above the score</p>
                </div>
                <Switch checked={autoBlockEnabled} onChange={setAutoBlockEnabled} />
              </div>

              {autoBlockEnabled && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Auto-block threshold</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={autoBlockThreshold}
                        onChange={(e) => setAutoBlockThreshold(Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Review threshold</p>
                  <p className="text-xs text-muted-foreground">Flag transactions above score 70 for manual review</p>
                </div>
                <Badge variant="risk-medium" className="font-mono">&gt; 70</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Model Settings
              </CardTitle>
              <CardDescription>Configure the machine learning detection models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ML Model version</label>
                  <div className="relative">
                    <Input value={modelVersion} onChange={(e) => setModelVersion(e.target.value)} className="font-mono" />
                    <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">latest</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confidence threshold</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-update model</p>
                  <p className="text-xs text-muted-foreground">Automatically deploy new model versions when available</p>
                </div>
                <Switch checked={modelAutoUpdate} onChange={setModelAutoUpdate} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Velocity Limits
              </CardTitle>
              <CardDescription>Rate limits to detect abnormal transaction velocity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Max transactions per hour</label>
                  <Input
                    type="number"
                    min={1}
                    value={maxPerHour}
                    onChange={(e) => setMaxPerHour(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Max transactions per day</label>
                  <Input
                    type="number"
                    min={1}
                    value={maxPerDay}
                    onChange={(e) => setMaxPerDay(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-400">
                Velocity limits apply per customer account. Exceeding these limits triggers a risk flag.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ NOTIFICATIONS ============ */}
      {activeTab === "notifications" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Email Notifications
              </CardTitle>
              <CardDescription>Control which events trigger email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationRow
                label="High-risk alerts"
                description="Get notified when a transaction is flagged as high risk"
                checked={highRiskAlerts}
                onChange={setHighRiskAlerts}
              />
              <NotificationRow
                label="Confirmed fraud"
                description="Alert when fraud is confirmed on an investigation"
                checked={confirmedFraud}
                onChange={setConfirmedFraud}
              />
              <NotificationRow
                label="Daily summary"
                description="Receive a daily summary of platform activity"
                checked={dailySummary}
                onChange={setDailySummary}
              />
              <NotificationRow
                label="Weekly report"
                description="Receive a weekly fraud and risk report"
                checked={weeklyReport}
                onChange={setWeeklyReport}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Notification Recipients
              </CardTitle>
              <CardDescription>Who should receive email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {recipients.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5"
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                        <AtIcon />
                      </span>
                      {r.email}
                    </span>
                    <button
                      onClick={() => removeRecipient(r.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  type="email"
                  onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                />
                <Button variant="outline" onClick={addRecipient}>
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-[#4A154B]/20 p-2">
                      <Send className="h-4 w-4 text-[#E01E5A]" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">Slack Integration</p>
                      <p className="text-xs text-muted-foreground">Post alerts to a Slack channel</p>
                    </div>
                  </div>
                  <Switch checked={slackEnabled} onChange={setSlackEnabled} />
                </div>

                {slackEnabled && (
                  <div className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Webhook URL</label>
                      <Input
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Channel</label>
                      <Input
                        value={slackChannel}
                        onChange={(e) => setSlackChannel(e.target.value)}
                        placeholder="#fraud-alerts"
                        className="font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ SECURITY ============ */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Authentication
              </CardTitle>
              <CardDescription>Manage authentication and access security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationRow
                label="Two-Factor Authentication"
                description="Require all users to enable 2FA"
                checked={twoFactor}
                onChange={setTwoFactor}
              />
              <div className="space-y-2 pt-2">
                <Select
                  value={sessionTimeout}
                  onChange={setSessionTimeout}
                  options={sessionTimeouts}
                  label="Session timeout"
                />
                <p className="text-xs text-muted-foreground">Users are automatically logged out after this period of inactivity.</p>
              </div>
              <NotificationRow
                label="Minimum 12 character passwords"
                description="Enforce stronger password requirements"
                checked={minPassword}
                onChange={setMinPassword}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Access & Retention
              </CardTitle>
              <CardDescription>Network and data retention controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">IP Allowlist</label>
                <textarea
                  value={ipAllowlist}
                  onChange={(e) => setIpAllowlist(e.target.value)}
                  rows={4}
                  placeholder="Enter allowed IP addresses or CIDR blocks, one per line"
                  className="flex w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                  Users outside these ranges will be blocked. Empty = allow all.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <Select
                  value={retention}
                  onChange={setRetention}
                  options={retentionOptions}
                  label="Audit log retention"
                />
                <p className="text-xs text-muted-foreground">
                  Audit logs older than this period are automatically purged.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ APPEARANCE ============ */}
      {activeTab === "appearance" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Theme
              </CardTitle>
              <CardDescription>Customize the look and feel of the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                        theme === t
                          ? "border-primary/60 bg-primary/5"
                          : "border-border/50 hover:bg-muted/20"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-16 w-full items-center justify-center rounded-lg border border-border/50",
                          t === "dark" ? "bg-slate-900" : "bg-slate-100"
                        )}
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className={cn("h-1.5 w-16 rounded-full", t === "dark" ? "bg-slate-700" : "bg-slate-300")} />
                          <div className={cn("h-1.5 w-10 rounded-full", t === "dark" ? "bg-slate-700" : "bg-slate-300")} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 items-center justify-center rounded-full border",
                            theme === t ? "border-primary bg-primary" : "border-border"
                          )}
                        >
                          {theme === t && <Check className="h-3 w-3 text-primary-foreground" />}
                        </span>
                        <span className="text-sm font-medium text-foreground capitalize">{t}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Accent color</label>
                <div className="flex items-center gap-3">
                  {accentColors.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAccent(a.id)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <Tooltip content={a.label} side="top">
                        <span
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                            accent === a.id ? "border-foreground scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: a.color }}
                        >
                          {accent === a.id && <Check className="h-4 w-4 text-white" />}
                        </span>
                      </Tooltip>
                      <span className="text-[11px] capitalize text-muted-foreground">{a.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
              <CardDescription>Adjust the sidebar and density preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationRow
                label="Compact mode"
                description="Reduce spacing to show more data on screen"
                checked={compactMode}
                onChange={setCompactMode}
              />
              <NotificationRow
                label="Auto-collapse sidebar"
                description="Automatically collapse the sidebar on smaller screens"
                checked={autoCollapse}
                onChange={setAutoCollapse}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ API SETTINGS ============ */}
      {activeTab === "api" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-4 w-4 text-primary" />
                API Limits
              </CardTitle>
              <CardDescription>Configure rate limits and retry behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rate limit</label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      value={rateLimit}
                      onChange={(e) => setRateLimit(e.target.value)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">req/min</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Webhook retry attempts</label>
                  <Input
                    type="number"
                    min={0}
                    value={webhookRetry}
                    onChange={(e) => setWebhookRetry(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input value={apiVersion} onChange={() => {}} readOnly className="font-mono pr-16" />
                  <Badge variant="risk-low" className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]">current</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  API version is managed by the platform. Requests must target the current version.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                CORS & Logging
              </CardTitle>
              <CardDescription>Allowed origins and request logging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Allowed CORS origins</label>
                <textarea
                  value={corsOrigins}
                  onChange={(e) => setCorsOrigins(e.target.value)}
                  rows={4}
                  placeholder="https://app.fraudshield.ai"
                  className="flex w-full resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
                />
                <p className="text-xs text-muted-foreground">One origin per line. Use * to allow all.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable API request logging</p>
                  <p className="text-xs text-muted-foreground">Log all API requests for audit purposes</p>
                </div>
                <Switch checked={apiLogging} onChange={setApiLogging} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function NotificationRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
      <div className="pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

function AtIcon() {
  return <span className="text-sm font-semibold">@</span>
}
