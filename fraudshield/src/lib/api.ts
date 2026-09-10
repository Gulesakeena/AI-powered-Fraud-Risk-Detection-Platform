
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api"

const TOKEN_KEY = "fraudshield_token"

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`)
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options
  const token = getToken()

  const response = await fetch(buildUrl(path, query), {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401) {
    clearToken()
    throw new ApiError(401, "Session expired. Please log in again.")
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const data = await response.json()
      detail = data.detail ?? detail
    } catch {
      // response had no JSON body
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

async function apiFetchBlob(path: string, query?: RequestOptions["query"]): Promise<Blob> {
  const token = getToken()
  const response = await fetch(buildUrl(path, query), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText)
  }

  return response.blob()
}

// ---- Shared / backend-matching types ----

export interface ApiTransaction {
  id: number
  transaction_ref: string
  customer_id: number
  amount: number
  currency: string
  merchant: string | null
  merchant_category: string | null
  payment_method_type: string | null
  payment_method_last4: string | null
  device_id: string | null
  device_type: string | null
  ip_address: string | null
  is_vpn: boolean
  city: string | null
  country: string | null
  risk_score: number
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  decision: "APPROVE" | "REVIEW" | "BLOCK"
  risk_factors: string[]
  status: "PENDING" | "COMPLETED" | "BLOCKED" | "REVIEWING"
  outcome: "PENDING" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE" | "RESOLVED"
  source: "MANUAL" | "API" | "CSV_IMPORT"
  occurred_at: string
  created_at: string
}

export interface PaginatedTransactions {
  items: ApiTransaction[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface DashboardStats {
  total_transactions: number
  high_risk_transactions: number
  medium_risk_transactions: number
  low_risk_transactions: number
  fraud_alerts: number
  confirmed_fraud: number
  false_positives: number
  average_risk_score: number
  total_transaction_value: number
  blocked_transactions: number
}

export interface SuspiciousEntity {
  identifier: string
  label: string
  transaction_count: number
  risk_score: number
}

export interface DashboardOverview {
  stats: DashboardStats
  suspicious_customers: SuspiciousEntity[]
  suspicious_devices: SuspiciousEntity[]
  suspicious_ips: SuspiciousEntity[]
}

export interface RiskTrendPoint {
  label: string
  date: string
  total: number
  high_risk: number
  confirmed_fraud: number
  average_risk_score: number
}

export interface RiskDistributionBucket {
  risk_level: string
  count: number
  percentage: number
  total_value: number
}

export interface ReportPeriodRow {
  period: string
  total_transactions: number
  high_risk_transactions: number
  confirmed_fraud: number
  false_positives: number
  total_value: number
}

export interface FraudTrendRow {
  period: string
  total_transactions: number
  confirmed_fraud: number
  false_positives: number
  fraud_rate: number
  total_value: number
}

export interface RiskStatistics {
  total_transactions: number
  total_value: number
  average_risk_score: number
  high_risk_count: number
  medium_risk_count: number
  low_risk_count: number
  confirmed_
