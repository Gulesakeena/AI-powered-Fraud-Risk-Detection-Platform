
import type { ApiTransaction } from "@/lib/api"
import type { Transaction } from "@/data/mock"

export function mapApiTransaction(t: ApiTransaction): Transaction {
  return {
    id: String(t.id),
    customerId: String(t.customer_id),
    customerName: `Customer #${t.customer_id}`,
    amount: t.amount,
    currency: "USD",
    paymentMethod: {
      type: (t.payment_method_type as Transaction["paymentMethod"]["type"]) ?? "Visa",
      last4: t.payment_method_last4 ?? "0000",
    },
    merchant: t.merchant ?? "Unknown Merchant",
    merchantCategory: (t.merchant_category as Transaction["merchantCategory"]) ?? "Retail",
    location: {
      city: t.city ?? "Unknown",
      country: t.country ?? "Unknown",
      countryCode: (t.country ?? "--").slice(0, 2).toUpperCase(),
    },
    device: {
      id: t.device_id ?? "unknown-device",
      type: (t.device_type as Transaction["device"]["type"]) ?? "Desktop",
      os: "Unknown",
      browser: "Unknown",
      isKnown: false,
    },
    ipAddress: { ip: t.ip_address ?? "0.0.0.0", isVPN: t.is_vpn },
    riskScore: t.risk_score,
    riskLevel: t.risk_level,
    riskFactors: t.risk_factors,
    status: t.status,
    flags: [],
    createdAt: t.occurred_at,
    description: t.merchant ?? "",
  }
}
