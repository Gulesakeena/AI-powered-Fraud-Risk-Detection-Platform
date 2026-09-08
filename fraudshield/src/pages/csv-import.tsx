import { useState } from "react"
import {
  Upload,
  FileSpreadsheet,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  FileUp,
  Eye,
  ChevronDown,
  X,
  ShieldCheck,
  Clock,
  Copy,
  Database,
  Wand2,
} from "lucide-react"
import { cn, formatNumber } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { Select } from "@/components/ui/select"

const STEPS = ["Upload", "Map Columns", "Validate", "Import", "Complete"]

interface MappedFile {
  name: string
  size: number
  rows: number
  columns: string[]
  preview: string[][]
}

const sourceColumns = [
  "transaction_id",
  "amount",
  "currency",
  "customer_id",
  "merchant",
  "location",
  "device_id",
  "ip_address",
  "payment_method",
  "timestamp",
]

const previewRows = [
  ["TXN-2026-00421", "129.99", "USD", "CUS-8812", "Acme Corp", "New York, US", "DEV-9921", "203.0.113.42", "visa", "2026-09-08T10:24:11Z"],
  ["TXN-2026-00422", "45.50", "USD", "CUS-7745", "Globex", "London, GB", "DEV-1188", "198.51.100.7", "mastercard", "2026-09-08T10:31:22Z"],
  ["TXN-2026-00423", "1290.00", "USD", "CUS-9031", "Initech", "Berlin, DE", "DEV-7732", "192.0.2.99", "paypal", "2026-09-08T11:02:45Z"],
  ["TXN-2026-00424", "19.99", "USD", "CUS-5520", "Umbrella", "Tokyo, JP", "DEV-3301", "203.0.113.71", "card", "2026-09-08T11:15:08Z"],
  ["TXN-2026-00425", "340.00", "USD", "CUS-1024", "Stark Ind", "Sydney, AU", "DEV-4490", "198.51.100.15", "visa", "2026-09-08T11:40:33Z"],
]

const mappingTargets = [
  { id: "transactionId", label: "Transaction ID", required: true, hint: "transaction_id" },
  { id: "amount", label: "Amount", required: true, hint: "amount" },
  { id: "customerId", label: "Customer ID", required: true, hint: "customer_id" },
  { id: "merchant", label: "Merchant", required: false, hint: "merchant" },
  { id: "location", label: "Location", required: false, hint: "location" },
  { id: "device", label: "Device", required: false, hint: "device_id" },
  { id: "ip", label: "IP", required: false, hint: "ip_address" },
  { id: "paymentMethod", label: "Payment Method", required: false, hint: "payment_method" },
]

const autoMap: Record<string, string> = {
  transactionId: "transaction_id",
  amount: "amount",
  customerId: "customer_id",
  merchant: "merchant",
  location: "location",
  device: "device_id",
  ip: "ip_address",
  paymentMethod: "payment_method",
}

const validationSteps = [
  "Checking data format",
  "Validating transaction IDs",
  "Checking amounts",
  "Validating customer IDs",
  "Running duplicate check",
  "Checking date formats",
]

const rowErrors = [
  { row: "45", message: "Invalid amount format" },
  { row: "127", message: "Missing transaction ID" },
  { row: "203", message: "Invalid date format" },
  { row: "318", message: "Customer ID not found" },
  { row: "455", message: "Amount exceeds max limit" },
  { row: "612", message: "Duplicate transaction ID" },
  { row: "701", message: "Invalid currency code" },
  { row: "899", message: "Missing customer ID" },
]

const rowWarnings = [
  { row: "89", message: "Amount below typical range" },
  { row: "154", message: "IP address from high-risk country" },
  { row: "267", message: "New device for customer" },
  { row: "390", message: "Unusual transaction velocity" },
  { row: "510", message: "Payment method mismatch with history" },
  { row: "643", message: "Card token expired" },
]

export default function CsvImportPage() {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<MappedFile | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [validatedSteps, setValidatedSteps] = useState<boolean[]>([])
  const [showErrors, setShowErrors] = useState(false)
  const [showWarnings, setShowWarnings] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importing, setImporting] = useState(false)

  const handleFile = (name: string, size: number) => {
    const mapped: MappedFile = {
      name,
      size,
      rows: 10284,
      columns: sourceColumns,
      preview: previewRows,
    }
    setFile(mapped)
    setMapping(autoMap)
    setStep(1)
  }

  const runValidation = () => {
    setValidatedSteps([])
    validationSteps.forEach((_, index) => {
      setTimeout(() => {
        setValidatedSteps((prev) => {
          const next = [...prev]
          next[index] = true
          return next
        })
      }, (index + 1) * 600)
    })
    setTimeout(() => setStep(3), validationSteps.length * 600 + 400)
  }

  const startImport = () => {
    setImporting(true)
    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress((prev) => {
        const next = prev + Math.random() * 8 + 3
        if (next >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setImporting(false)
            setStep(5)
          }, 500)
          return 100
        }
        return Math.min(next, 100)
      })
    }, 120)
  }

  const reset = () => {
    setStep(0)
    setFile(null)
    setMapping({})
    setValidatedSteps([])
    setImportProgress(0)
    setImporting(false)
  }

  const mappedCount = mappingTargets.filter((t) => mapping[t.id]).length
  const mappingQuality = Math.round((mappedCount / mappingTargets.length) * 100)
  const requiredMapped = mappingTargets.filter((t) => t.required).every((t) => mapping[t.id])
  const importedCount = Math.round((importProgress / 100) * 10142)
  const eta = Math.round((100 - importProgress) * 0.3)

  return (
    <div className="space-y-6">
      <PageHeader
        title="CSV Import"
        description="Import transaction and customer data via CSV multi-step wizard"
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        }
      />

      {/* Step Indicator */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          {STEPS.map((label, index) => {
            const isCurrent = index === step
            const isDone = index < step
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isDone && "border-emerald-500 bg-emerald-500/15 text-emerald-400",
                      isCurrent && "border-blue-500 bg-blue-500/15 text-blue-400 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]",
                      !isDone && !isCurrent && "border-border/60 text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-medium whitespace-nowrap",
                      isCurrent ? "text-blue-400" : isDone ? "text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full transition-colors duration-300",
                      index < step ? "bg-emerald-500" : "bg-border/60"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Step 1: Upload */}
      {step === 0 && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-0">
            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  const names = Array.from(e.dataTransfer.files).map((f) => f.name)
                  if (names.length > 0) handleFile(names[0], 864213)
                }}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-14 text-center transition-all duration-300",
                  dragOver
                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                    : "border-border/60 bg-muted/20 hover:border-blue-500/50 hover:bg-muted/30"
                )}
              >
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <Upload className="h-9 w-9 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Upload your transaction CSV file</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag &amp; drop your file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">Accepts .csv files up to 50MB</p>
                <div className="mt-6 flex gap-3">
                  <Button onClick={() => handleFile("transactions_sep2026.csv", 864213)}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                      <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB &middot; {formatNumber(file.rows)} rows &middot; {file.columns.length} columns
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Badge variant="risk-low" className="gap-1.5">
                      <CheckCircle2 className="h-3 w-3" />
                      File Ready
                    </Badge>
                    <Badge variant="outline">CSV</Badge>
                    <Badge variant="outline">10,284 rows detected</Badge>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setFile(null)}>
                      Remove
                    </Button>
                    <Button onClick={() => setStep(1)}>
                      Map Columns
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map Columns */}
      {step === 1 && file && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">Map your CSV columns</h3>
                  <p className="text-sm text-muted-foreground">
                    Match source columns to FraudShield target fields
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mapping quality:</span>
                  <ProgressBar
                    value={mappingQuality}
                    color={mappingQuality >= 80 ? "success" : mappingQuality >= 50 ? "warning" : "danger"}
                    size="sm"
                    showLabel
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setMapping(autoMap)}>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Auto-detect
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source CSV Columns</CardTitle>
                <CardDescription>Detected from {file.name}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {file.columns.map((col) => (
                  <div
                    key={col}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                  >
                    <span className="font-mono text-xs text-foreground">{col}</span>
                    <span className="text-xs text-muted-foreground">{file.rows.toLocaleString()} values</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target Fields</CardTitle>
                <CardDescription>FraudShield transaction schema</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {mappingTargets.map((target) => (
                  <div key={target.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{target.label}</span>
                      {target.required && (
                        <Badge variant="risk-high" className="text-[10px] px-1.5">REQUIRED</Badge>
                      )}
                      {mapping[target.id] && (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </div>
                    <Select
                      value={mapping[target.id] || ""}
                      onChange={(value) => setMapping({ ...mapping, [target.id]: value })}
                      options={[
                        { label: "None", value: "" },
                        ...file.columns.map((c) => ({ label: c, value: c })),
                      ]}
                      placeholder="Select source column"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Data Preview
              </CardTitle>
              <CardDescription>First 5 rows of your mapped data</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto rounded-lg border border-border/50">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
                      {mappingTargets.filter((t) => mapping[t.id]).map((t) => (
                        <th key={t.id} className="px-3 py-2 text-left font-medium text-foreground">
                          {t.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-border/30 last:border-0">
                        <td className="px-3 py-2 text-muted-foreground">{rowIndex + 1}</td>
                        {mappingTargets.filter((t) => mapping[t.id]).map((t) => {
                          const colIndex = sourceColumns.indexOf(mapping[t.id])
                          return (
                            <td key={t.id} className="px-3 py-2 font-mono text-muted-foreground">
                              {colIndex >= 0 ? row[colIndex] : "—"}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={runValidation} disabled={!requiredMapped}>
              Validate Data
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Validate */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground">Validating your data...</h3>
            <div className="mt-4 space-y-3">
              {validationSteps.map((label, index) => {
                const isDone = validatedSteps[index]
                const isActive = !isDone && validatedSteps.filter(Boolean).length === index
                return (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-2.5">
                    <span className={cn("text-sm", isDone ? "text-muted-foreground" : "text-foreground")}>{label}</span>
                    {isDone ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          {validatedSteps.length === validationSteps.length && (
            <Card className="p-6 animate-in fade-in duration-500">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{formatNumber(10284)}</p>
                <p className="text-sm text-muted-foreground">records processed</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-400" />
                  <p className="mt-2 text-2xl font-bold text-emerald-400">{formatNumber(10142)}</p>
                  <p className="text-xs text-muted-foreground">valid</p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
                  <AlertTriangle className="mx-auto h-6 w-6 text-amber-400" />
                  <p className="mt-2 text-2xl font-bold text-amber-400">112</p>
                  <p className="text-xs text-muted-foreground">warnings</p>
                </div>
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <XCircle className="mx-auto h-6 w-6 text-red-400" />
                  <p className="mt-2 text-2xl font-bold text-red-400">30</p>
                  <p className="text-xs text-muted-foreground">invalid</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex w-full items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-left transition-colors hover:bg-red-500/15"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">30 Errors</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-red-400 transition-transform", showErrors && "rotate-180")} />
                </button>
                {showErrors && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-red-500/20 space-y-1 p-2 animate-in fade-in">
                    {rowErrors.map((err) => (
                      <div key={err.row} className="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/30">
                        <span className="w-16 shrink-0 font-mono text-xs text-red-400">Row {err.row}</span>
                        <span>{err.message}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowWarnings(!showWarnings)}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left transition-colors hover:bg-amber-500/15"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">112 Warnings</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-amber-400 transition-transform", showWarnings && "rotate-180")} />
                </button>
                {showWarnings && (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-amber-500/20 space-y-1 p-2 animate-in fade-in">
                    {rowWarnings.map((warn) => (
                      <div key={warn.row} className="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/30">
                        <span className="w-16 shrink-0 font-mono text-xs text-amber-400">Row {warn.row}</span>
                        <span>{warn.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Fix errors
                </Button>
                <Button
                  onClick={() => {
                    setStep(3)
                  }}
                >
                  Continue with valid records
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Step 4: Import */}
      {step === 3 && (
        <Card className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <Database className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-foreground">Ready to import {formatNumber(10142)} records</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              30 invalid records will be skipped. 112 warning records will be imported with flags.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
              <Sparkles className="mx-auto h-5 w-5 text-blue-400" />
              <p className="mt-2 text-lg font-bold text-foreground">{formatNumber(10142)}</p>
              <p className="text-xs text-muted-foreground">Records to import</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
              <ShieldCheck className="mx-auto h-5 w-5 text-emerald-400" />
              <p className="mt-2 text-lg font-bold text-foreground">Auto</p>
              <p className="text-xs text-muted-foreground">Risk screening</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
              <Copy className="mx-auto h-5 w-5 text-purple-400" />
              <p className="mt-2 text-lg font-bold text-foreground">30</p>
              <p className="text-xs text-muted-foreground">Skipped invalid</p>
            </div>
          </div>

          {!importing && (
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={startImport}>
                Start Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {importing && (
            <div className="mt-8 animate-in fade-in">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Importing records...</span>
                <span className="text-sm font-bold text-foreground">{Math.round(importProgress)}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-200"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatNumber(importedCount)} / {formatNumber(10142)} records
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ETA: {eta} seconds
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 5 && (
        <Card className="p-8 animate-in fade-in scale-in duration-500">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500 animate-[pop-in_0.5s_ease-out]">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h3 className="mt-6 text-2xl font-bold text-foreground">Import Complete</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your transaction data has been successfully imported into FraudShield.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{formatNumber(10142)}</p>
              <p className="text-xs text-muted-foreground">Records imported</p>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-red-400">247</p>
              <p className="text-xs text-muted-foreground">High-risk flagged</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">12</p>
              <p className="text-xs text-muted-foreground">Duplicates skipped</p>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">1m 23s</p>
              <p className="text-xs text-muted-foreground">Processing time</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>
              View Imported Transactions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={reset}>
              <Sparkles className="mr-2 h-4 w-4" />
              Run Risk Analysis
            </Button>
            <Button variant="outline" onClick={reset}>
              <Upload className="mr-2 h-4 w-4" />
              Import Another File
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
