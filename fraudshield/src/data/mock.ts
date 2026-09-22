// ============================================================================
// FraudShield - Mock Data
// ============================================================================

export interface PaymentMethod {
  type: "Visa" | "Mastercard" | "Amex" | "Bank Transfer" | "PayPal" | "Crypto";
  last4: string;
}

export interface Location {
  city: string;
  country: string;
  countryCode: string;
}

export interface Device {
  id: string;
  type: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  isKnown: boolean;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: "USD";
  paymentMethod: PaymentMethod;
  merchant: string;
  merchantCategory: "Electronics" | "Travel" | "Gaming" | "Crypto Exchange" | "Retail" | "Food & Dining" | "Subscription" | "Financial Services";
  location: Location;
  device: Device;
  ipAddress: { ip: string; isVPN: boolean };
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskFactors: string[];
  status: "COMPLETED" | "PENDING" | "BLOCKED" | "REVIEWING";
  flags: string[];
  createdAt: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  totalTransactions: number;
  totalSpending: number;
  suspiciousTransactions: number;
  devices: string[];
  ipAddresses: string[];
  locations: string[];
  accountAge: number;
  fraudHistory: { confirmedFraud: number; falsePositives: number };
  createdAt: string;
  lastActiveAt: string;
  status: "ACTIVE" | "FLAGGED" | "SUSPENDED";
  tags: string[];
}

export interface Alert {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "new_device" | "unusual_amount" | "velocity" | "location" | "behavioral" | "network";
  title: string;
  description: string;
  riskScore: number;
  reasons: string[];
  status: "NEW" | "INVESTIGATING" | "CONFIRMED_FRAUD" | "FALSE_POSITIVE" | "RESOLVED";
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  priority: number;
}

export interface Investigation {
  id: string;
  title: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED_FRAUD" | "CLOSED_FALSE_POSITIVE" | "CLOSED_RESOLVED";
priority: number;
  assignedTo: string | null;
  customerIds: string[];
  transactionIds: string[];
  findings: string[];
  notes: { author: string; content: string; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  riskScore: number;
}

export interface DeviceRecord {
  id: string;
  customerIds: string[];
  totalTransactions: number;
  suspiciousTransactions: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  locations: Location[];
  lastSeenAt: string;
  firstSeenAt: string;
  type: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  isKnown: boolean;
}

export interface IpRecord {
  ip: string;
  customerIds: string[];
  totalTransactions: number;
  suspiciousTransactions: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  locations: Location[];
  lastSeenAt: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  country: string;
  city: string;
}

export interface LocationRecord {
  city: string;
  country: string;
  countryCode: string;
  transactionCount: number;
  suspiciousCount: number;
  riskScore: number;
  customers: string[];
}

export interface FraudPattern {
  id: string;
  type: string;
  title: string;
  description: string;
  incidentCount: number;
  trend: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "ACTIVE" | "MONITORING" | "MITIGATED" | "CLOSED";
  examples: string[];
}

export interface NetworkNode {
  id: string;
  type: "customer" | "device" | "ip" | "transaction" | "location";
  label: string;
  riskScore: number;
  data: Record<string, unknown>;
}

export interface NetworkEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  condition: string;
  enabled: boolean;
  priority: number;
  triggeredCount: number;
  lastTriggeredAt: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  type: "transaction" | "customer" | "alert" | "investigation" | "fraud_trend" | "network" | "compliance";
  frequency: string;
  lastGenerated: string;
}

export interface AiInsight {
  id: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  relatedEntities: string[];
  investigatedAt: string | null;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: "transaction" | "alert" | "investigation" | "system" | "note";
  title: string;
  description: string;
  author: string | null;
  metadata: Record<string, unknown>;
}

export interface User {
  name: string;
  role: string;
  email: string;
  avatarInitials: string;
}

export const user: User = {
  name: "Gule Sakeena",
  role: "Fraud Analyst",
  email: "gule.sakeena@fraudshield.com",
  avatarInitials: "GS",
};

// ============================================================================
// CUSTOMERS (32)
// ============================================================================

export const customers: Customer[] = [
  {
    id: "CUST-0001",
    name: "James Mitchell",
    email: "james.mitchell@email.com",
    riskScore: 12,
    riskLevel: "LOW",
    totalTransactions: 87,
    totalSpending: 24350.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00A1B2", "DEV-00A1C3"],
    ipAddresses: ["192.168.1.101", "10.0.0.45"],
    locations: ["New York", "Boston"],
    accountAge: 842,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2024-01-15T10:30:00Z",
    lastActiveAt: "2026-09-07T14:22:00Z",
    status: "ACTIVE",
    tags: ["long_term", "high_value", "verified"],
  },
  {
    id: "CUST-0002",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    riskScore: 8,
    riskLevel: "LOW",
    totalTransactions: 124,
    totalSpending: 31200.5,
    suspiciousTransactions: 0,
    devices: ["DEV-00B2D4", "DEV-00B2E5", "DEV-00B2F6"],
    ipAddresses: ["172.16.0.88", "10.0.1.22"],
    locations: ["San Francisco", "Los Angeles"],
    accountAge: 1205,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2022-11-20T08:15:00Z",
    lastActiveAt: "2026-09-08T09:10:00Z",
    status: "ACTIVE",
    tags: ["loyal", "frequent_shopper", "verified"],
  },
  {
    id: "CUST-0003",
    name: "Mohammed Al-Rashid",
    email: "m.alrashid@email.com",
    riskScore: 45,
    riskLevel: "MEDIUM",
    totalTransactions: 34,
    totalSpending: 89200.0,
    suspiciousTransactions: 3,
    devices: ["DEV-00C3G7"],
    ipAddresses: ["45.33.12.87", "185.220.101.42"],
    locations: ["Dubai", "London"],
    accountAge: 156,
    fraudHistory: { confirmedFraud: 0, falsePositives: 2 },
    createdAt: "2026-04-05T12:00:00Z",
    lastActiveAt: "2026-09-06T22:45:00Z",
    status: "FLAGGED",
    tags: ["international", "high_value", "vpn_user"],
  },
  {
    id: "CUST-0004",
    name: "Emily Watson",
    email: "emily.watson@email.com",
    riskScore: 5,
    riskLevel: "LOW",
    totalTransactions: 203,
    totalSpending: 18750.25,
    suspiciousTransactions: 0,
    devices: ["DEV-00D4H8", "DEV-00D4I9"],
    ipAddresses: ["192.168.2.15"],
    locations: ["Chicago"],
    accountAge: 1567,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2021-10-12T16:45:00Z",
    lastActiveAt: "2026-09-08T07:30:00Z",
    status: "ACTIVE",
    tags: ["long_term", "verified", "low_risk"],
  },
  {
    id: "CUST-0005",
    name: "Carlos Rodriguez",
    email: "c.rodriguez@email.com",
    riskScore: 72,
    riskLevel: "HIGH",
    totalTransactions: 28,
    totalSpending: 67800.0,
    suspiciousTransactions: 8,
    devices: ["DEV-00E5J0", "DEV-00E5K1", "DEV-00E5L2", "DEV-00E5M3"],
    ipAddresses: ["203.0.113.45", "198.51.100.22", "185.220.101.99"],
    locations: ["Mexico City", "Miami", "New York"],
    accountAge: 42,
    fraudHistory: { confirmedFraud: 2, falsePositives: 1 },
    createdAt: "2026-07-28T09:00:00Z",
    lastActiveAt: "2026-09-07T23:58:00Z",
    status: "FLAGGED",
    tags: ["new_account", "multi_device", "velocity_flag", "confirmed_fraud_history"],
  },
  {
    id: "CUST-0006",
    name: "Aisha Patel",
    email: "aisha.patel@email.com",
    riskScore: 18,
    riskLevel: "LOW",
    totalTransactions: 56,
    totalSpending: 12400.0,
    suspiciousTransactions: 1,
    devices: ["DEV-00F6N4"],
    ipAddresses: ["10.0.3.77"],
    locations: ["Singapore"],
    accountAge: 365,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2025-09-08T11:20:00Z",
    lastActiveAt: "2026-09-07T16:40:00Z",
    status: "ACTIVE",
    tags: ["verified", "moderate_spender"],
  },
  {
    id: "CUST-0007",
    name: "David Kim",
    email: "david.kim@email.com",
    riskScore: 22,
    riskLevel: "LOW",
    totalTransactions: 41,
    totalSpending: 28900.0,
    suspiciousTransactions: 1,
    devices: ["DEV-00G7O5", "DEV-00G7P6"],
    ipAddresses: ["172.16.1.33"],
    locations: ["Seoul", "Tokyo"],
    accountAge: 490,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-05-07T06:30:00Z",
    lastActiveAt: "2026-09-08T02:15:00Z",
    status: "ACTIVE",
    tags: ["international", "crypto_buyer"],
  },
  {
    id: "CUST-0008",
    name: "Olivia Thompson",
    email: "o.thompson@email.com",
    riskScore: 3,
    riskLevel: "LOW",
    totalTransactions: 312,
    totalSpending: 45600.75,
    suspiciousTransactions: 0,
    devices: ["DEV-00H8Q7"],
    ipAddresses: ["192.168.5.12"],
    locations: ["London"],
    accountAge: 2190,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2019-09-08T14:00:00Z",
    lastActiveAt: "2026-09-08T11:05:00Z",
    status: "ACTIVE",
    tags: ["long_term", "verified", "low_risk", "frequent_shopper"],
  },
  {
    id: "CUST-0009",
    name: "Viktor Petrov",
    email: "v.petrov@email.com",
    riskScore: 88,
    riskLevel: "HIGH",
    totalTransactions: 15,
    totalSpending: 142000.0,
    suspiciousTransactions: 12,
    devices: ["DEV-00I9R8", "DEV-00I9S9", "DEV-00I9T0", "DEV-00I9U1", "DEV-00I9V2"],
    ipAddresses: ["185.220.101.1", "185.220.101.2", "198.51.100.5"],
    locations: ["Moscow", "Berlin", "Amsterdam"],
    accountAge: 28,
    fraudHistory: { confirmedFraud: 5, falsePositives: 0 },
    createdAt: "2026-08-11T03:45:00Z",
    lastActiveAt: "2026-09-07T04:20:00Z",
    status: "SUSPENDED",
    tags: ["confirmed_fraud", "multi_device", "tor_user", "high_risk", "suspended"],
  },
  {
    id: "CUST-0010",
    name: "Lisa Nakamura",
    email: "l.nakamura@email.com",
    riskScore: 15,
    riskLevel: "LOW",
    totalTransactions: 78,
    totalSpending: 19800.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00J0W3"],
    ipAddresses: ["10.0.4.88"],
    locations: ["Tokyo"],
    accountAge: 620,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-01-14T07:00:00Z",
    lastActiveAt: "2026-09-07T19:30:00Z",
    status: "ACTIVE",
    tags: ["verified", "loyal"],
  },
  {
    id: "CUST-0011",
    name: "Marcus Johnson",
    email: "m.johnson@email.com",
    riskScore: 55,
    riskLevel: "MEDIUM",
    totalTransactions: 19,
    totalSpending: 52300.0,
    suspiciousTransactions: 4,
    devices: ["DEV-00K1X4", "DEV-00K1Y5"],
    ipAddresses: ["203.0.113.88", "185.220.101.55"],
    locations: ["Atlanta", "New York", "Chicago"],
    accountAge: 67,
    fraudHistory: { confirmedFraud: 1, falsePositives: 1 },
    createdAt: "2026-07-03T13:15:00Z",
    lastActiveAt: "2026-09-06T21:10:00Z",
    status: "FLAGGED",
    tags: ["new_account", "velocity_flag", "vpn_user"],
  },
  {
    id: "CUST-0012",
    name: "Emma Laurent",
    email: "e.laurent@email.com",
    riskScore: 10,
    riskLevel: "LOW",
    totalTransactions: 95,
    totalSpending: 22100.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00L2Z6"],
    ipAddresses: ["172.16.2.44"],
    locations: ["Paris", "Lyon"],
    accountAge: 930,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2023-12-01T09:45:00Z",
    lastActiveAt: "2026-09-08T08:55:00Z",
    status: "ACTIVE",
    tags: ["verified", "international"],
  },
  {
    id: "CUST-0013",
    name: "Robert Blackwell",
    email: "r.blackwell@email.com",
    riskScore: 62,
    riskLevel: "MEDIUM",
    totalTransactions: 23,
    totalSpending: 98400.0,
    suspiciousTransactions: 5,
    devices: ["DEV-00M3A7", "DEV-00M3B8", "DEV-00M3C9"],
    ipAddresses: ["45.33.12.101", "198.51.100.77"],
    locations: ["Nairobi", "Dubai", "London"],
    accountAge: 35,
    fraudHistory: { confirmedFraud: 0, falsePositives: 2 },
    createdAt: "2026-08-04T15:30:00Z",
    lastActiveAt: "2026-09-07T17:45:00Z",
    status: "FLAGGED",
    tags: ["new_account", "multi_location", "high_value"],
  },
  {
    id: "CUST-0014",
    name: "Hannah Brooks",
    email: "h.brooks@email.com",
    riskScore: 7,
    riskLevel: "LOW",
    totalTransactions: 156,
    totalSpending: 16500.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00N4D0"],
    ipAddresses: ["192.168.3.21"],
    locations: ["Toronto"],
    accountAge: 1100,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2023-04-22T12:00:00Z",
    lastActiveAt: "2026-09-07T12:15:00Z",
    status: "ACTIVE",
    tags: ["verified", "low_risk", "frequent_shopper"],
  },
  {
    id: "CUST-0015",
    name: "Ahmed Hassan",
    email: "a.hassan@email.com",
    riskScore: 38,
    riskLevel: "MEDIUM",
    totalTransactions: 47,
    totalSpending: 67200.0,
    suspiciousTransactions: 3,
    devices: ["DEV-00O5E1", "DEV-00O5F2"],
    ipAddresses: ["45.33.12.55", "10.0.5.12"],
    locations: ["Dubai", "Abu Dhabi"],
    accountAge: 210,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2026-02-10T08:30:00Z",
    lastActiveAt: "2026-09-07T20:00:00Z",
    status: "ACTIVE",
    tags: ["international", "high_value", "crypto_buyer"],
  },
  {
    id: "CUST-0016",
    name: "Jessica Adams",
    email: "j.adams@email.com",
    riskScore: 14,
    riskLevel: "LOW",
    totalTransactions: 67,
    totalSpending: 14200.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00P6G3"],
    ipAddresses: ["172.16.3.66"],
    locations: ["Seattle", "Portland"],
    accountAge: 455,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-06-18T10:00:00Z",
    lastActiveAt: "2026-09-08T10:30:00Z",
    status: "ACTIVE",
    tags: ["verified"],
  },
  {
    id: "CUST-0017",
    name: "Diego Morales",
    email: "d.morales@email.com",
    riskScore: 79,
    riskLevel: "HIGH",
    totalTransactions: 11,
    totalSpending: 89500.0,
    suspiciousTransactions: 9,
    devices: ["DEV-00Q7H4", "DEV-00Q7I5", "DEV-00Q7J6"],
    ipAddresses: ["203.0.113.12", "185.220.101.88"],
    locations: ["Bogota", "Miami", "Las Vegas"],
    accountAge: 19,
    fraudHistory: { confirmedFraud: 3, falsePositives: 0 },
    createdAt: "2026-08-20T22:00:00Z",
    lastActiveAt: "2026-09-07T03:15:00Z",
    status: "SUSPENDED",
    tags: ["confirmed_fraud", "new_account", "multi_device", "suspended"],
  },
  {
    id: "CUST-0018",
    name: "Rachel Green",
    email: "r.green@email.com",
    riskScore: 6,
    riskLevel: "LOW",
    totalTransactions: 189,
    totalSpending: 27600.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00R8K7"],
    ipAddresses: ["192.168.4.88"],
    locations: ["New York"],
    accountAge: 1450,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2022-04-15T14:30:00Z",
    lastActiveAt: "2026-09-08T12:45:00Z",
    status: "ACTIVE",
    tags: ["long_term", "verified", "low_risk"],
  },
  {
    id: "CUST-0019",
    name: "Yuki Tanaka",
    email: "y.tanaka@email.com",
    riskScore: 25,
    riskLevel: "LOW",
    totalTransactions: 38,
    totalSpending: 41800.0,
    suspiciousTransactions: 1,
    devices: ["DEV-00S9L8"],
    ipAddresses: ["10.0.6.44"],
    locations: ["Osaka", "Tokyo"],
    accountAge: 280,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-11-30T05:00:00Z",
    lastActiveAt: "2026-09-07T06:20:00Z",
    status: "ACTIVE",
    tags: ["verified", "gamer"],
  },
  {
    id: "CUST-0020",
    name: "Frank Mueller",
    email: "f.mueller@email.com",
    riskScore: 42,
    riskLevel: "MEDIUM",
    totalTransactions: 31,
    totalSpending: 56700.0,
    suspiciousTransactions: 3,
    devices: ["DEV-00T0M9", "DEV-00T0N0"],
    ipAddresses: ["45.33.12.33", "185.220.101.77"],
    locations: ["Berlin", "Munich"],
    accountAge: 175,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2026-03-16T07:45:00Z",
    lastActiveAt: "2026-09-07T18:30:00Z",
    status: "ACTIVE",
    tags: ["international", "vpn_user", "crypto_buyer"],
  },
  {
    id: "CUST-0021",
    name: "Grace Okafor",
    email: "g.okafor@email.com",
    riskScore: 9,
    riskLevel: "LOW",
    totalTransactions: 72,
    totalSpending: 15300.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00U1O1"],
    ipAddresses: ["172.16.4.99"],
    locations: ["Lagos", "London"],
    accountAge: 520,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-04-03T11:30:00Z",
    lastActiveAt: "2026-09-08T13:10:00Z",
    status: "ACTIVE",
    tags: ["verified", "international"],
  },
  {
    id: "CUST-0022",
    name: "Brandon Lee",
    email: "b.lee@email.com",
    riskScore: 34,
    riskLevel: "MEDIUM",
    totalTransactions: 22,
    totalSpending: 35600.0,
    suspiciousTransactions: 2,
    devices: ["DEV-00V2P2", "DEV-00V2Q3"],
    ipAddresses: ["203.0.113.77"],
    locations: ["Los Angeles", "Las Vegas"],
    accountAge: 89,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2026-06-11T16:00:00Z",
    lastActiveAt: "2026-09-06T23:45:00Z",
    status: "ACTIVE",
    tags: ["new_account", "gamer", "moderate_risk"],
  },
  {
    id: "CUST-0023",
    name: "Sophie Dubois",
    email: "s.dubois@email.com",
    riskScore: 11,
    riskLevel: "LOW",
    totalTransactions: 98,
    totalSpending: 21400.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00W3R4"],
    ipAddresses: ["192.168.6.33"],
    locations: ["Paris"],
    accountAge: 750,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2024-07-20T08:00:00Z",
    lastActiveAt: "2026-09-08T06:50:00Z",
    status: "ACTIVE",
    tags: ["verified", "loyal"],
  },
  {
    id: "CUST-0024",
    name: "Tyler Wright",
    email: "t.wright@email.com",
    riskScore: 91,
    riskLevel: "HIGH",
    totalTransactions: 8,
    totalSpending: 134500.0,
    suspiciousTransactions: 7,
    devices: ["DEV-00X4S5", "DEV-00X4T6", "DEV-00X4U7", "DEV-00X4V8", "DEV-00X4W9", "DEV-00X4X0"],
    ipAddresses: ["185.220.101.5", "185.220.101.6", "198.51.100.88", "203.0.113.99"],
    locations: ["Miami", "New York", "Las Vegas", "London"],
    accountAge: 14,
    fraudHistory: { confirmedFraud: 6, falsePositives: 0 },
    createdAt: "2026-08-25T02:00:00Z",
    lastActiveAt: "2026-09-07T05:30:00Z",
    status: "SUSPENDED",
    tags: ["confirmed_fraud", "new_account", "multi_device", "tor_user", "high_risk", "suspended"],
  },
  {
    id: "CUST-0025",
    name: "Maria Santos",
    email: "m.santos@email.com",
    riskScore: 16,
    riskLevel: "LOW",
    totalTransactions: 63,
    totalSpending: 17900.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00Y5Y1"],
    ipAddresses: ["10.0.7.55"],
    locations: ["Sao Paulo"],
    accountAge: 340,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-09-30T13:00:00Z",
    lastActiveAt: "2026-09-07T15:20:00Z",
    status: "ACTIVE",
    tags: ["verified"],
  },
  {
    id: "CUST-0026",
    name: "Andrew Harrison",
    email: "a.harrison@email.com",
    riskScore: 29,
    riskLevel: "LOW",
    totalTransactions: 45,
    totalSpending: 31200.0,
    suspiciousTransactions: 2,
    devices: ["DEV-00Z6Z2", "DEV-00Z6A3"],
    ipAddresses: ["172.16.5.88"],
    locations: ["Dallas", "Houston"],
    accountAge: 260,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2025-12-15T09:15:00Z",
    lastActiveAt: "2026-09-08T14:00:00Z",
    status: "ACTIVE",
    tags: ["verified", "moderate_risk"],
  },
  {
    id: "CUST-0027",
    name: "Priya Sharma",
    email: "p.sharma@email.com",
    riskScore: 4,
    riskLevel: "LOW",
    totalTransactions: 178,
    totalSpending: 22800.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00AA4"],
    ipAddresses: ["192.168.7.14"],
    locations: ["Mumbai", "Delhi"],
    accountAge: 1320,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2022-05-10T06:00:00Z",
    lastActiveAt: "2026-09-08T04:30:00Z",
    status: "ACTIVE",
    tags: ["long_term", "verified", "low_risk"],
  },
  {
    id: "CUST-0028",
    name: "Nathan Cooper",
    email: "n.cooper@email.com",
    riskScore: 48,
    riskLevel: "MEDIUM",
    totalTransactions: 16,
    totalSpending: 44300.0,
    suspiciousTransactions: 4,
    devices: ["DEV-00AB5", "DEV-00AB6"],
    ipAddresses: ["45.33.12.44", "185.220.101.66"],
    locations: ["Sydney", "Melbourne"],
    accountAge: 55,
    fraudHistory: { confirmedFraud: 1, falsePositives: 0 },
    createdAt: "2026-07-15T04:30:00Z",
    lastActiveAt: "2026-09-07T10:45:00Z",
    status: "FLAGGED",
    tags: ["new_account", "velocity_flag", "vpn_user"],
  },
  {
    id: "CUST-0029",
    name: "Catherine Bell",
    email: "c.bell@email.com",
    riskScore: 13,
    riskLevel: "LOW",
    totalTransactions: 89,
    totalSpending: 19700.0,
    suspiciousTransactions: 0,
    devices: ["DEV-00AC7"],
    ipAddresses: ["172.16.6.77"],
    locations: ["Vancouver"],
    accountAge: 680,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2024-09-28T11:00:00Z",
    lastActiveAt: "2026-09-08T09:40:00Z",
    status: "ACTIVE",
    tags: ["verified", "loyal"],
  },
  {
    id: "CUST-0030",
    name: "Leon Fischer",
    email: "l.fischer@email.com",
    riskScore: 36,
    riskLevel: "MEDIUM",
    totalTransactions: 27,
    totalSpending: 48900.0,
    suspiciousTransactions: 3,
    devices: ["DEV-00AD8", "DEV-00AD9"],
    ipAddresses: ["45.33.12.22"],
    locations: ["Frankfurt", "Vienna"],
    accountAge: 120,
    fraudHistory: { confirmedFraud: 0, falsePositives: 1 },
    createdAt: "2026-05-10T15:00:00Z",
    lastActiveAt: "2026-09-07T21:30:00Z",
    status: "ACTIVE",
    tags: ["international", "crypto_buyer", "moderate_risk"],
  },
  {
    id: "CUST-0031",
    name: "Aaliyah Washington",
    email: "a.washington@email.com",
    riskScore: 19,
    riskLevel: "LOW",
    totalTransactions: 54,
    totalSpending: 13600.0,
    suspiciousTransactions: 1,
    devices: ["DEV-00AE0"],
    ipAddresses: ["192.168.8.55"],
    locations: ["Atlanta", "Charlotte"],
    accountAge: 410,
    fraudHistory: { confirmedFraud: 0, falsePositives: 0 },
    createdAt: "2025-07-22T08:30:00Z",
    lastActiveAt: "2026-09-08T11:20:00Z",
    status: "ACTIVE",
    tags: ["verified"],
  },
  {
    id: "CUST-0032",
    name: "Oscar Lindqvist",
    email: "o.lindqvist@email.com",
    riskScore: 67,
    riskLevel: "MEDIUM",
    totalTransactions: 13,
    totalSpending: 71200.0,
    suspiciousTransactions: 5,
    devices: ["DEV-00AF1", "DEV-00AF2", "DEV-00AF3"],
    ipAddresses: ["185.220.101.33", "203.0.113.55"],
    locations: ["Stockholm", "Copenhagen", "Oslo"],
    accountAge: 40,
    fraudHistory: { confirmedFraud: 1, falsePositives: 1 },
    createdAt: "2026-07-30T06:00:00Z",
    lastActiveAt: "2026-09-07T16:00:00Z",
    status: "FLAGGED",
    tags: ["multi_location", "velocity_flag", "moderate_risk"],
  },
];



// ============================================================================
// TRANSACTIONS (55)
// ============================================================================

export const transactions: Transaction[] = [
  { id: "TXN-00001", customerId: "CUST-0001", customerName: "James Mitchell", amount: 89.99, currency: "USD", paymentMethod: { type: "Visa", last4: "4242" }, merchant: "Amazon", merchantCategory: "Retail", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00A1B2", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "192.168.1.101", isVPN: false }, riskScore: 5, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T10:15:00Z", description: "Electronics purchase - Wireless headphones" },
  { id: "TXN-00002", customerId: "CUST-0001", customerName: "James Mitchell", amount: 32.5, currency: "USD", paymentMethod: { type: "Visa", last4: "4242" }, merchant: "Whole Foods Market", merchantCategory: "Food & Dining", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00A1C3", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.0.45", isVPN: false }, riskScore: 3, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T18:30:00Z", description: "Grocery purchase" },
  { id: "TXN-00003", customerId: "CUST-0002", customerName: "Sarah Chen", amount: 149.99, currency: "USD", paymentMethod: { type: "Mastercard", last4: "8888" }, merchant: "Best Buy", merchantCategory: "Electronics", location: { city: "San Francisco", country: "United States", countryCode: "US" }, device: { id: "DEV-00B2D4", type: "Desktop", os: "macOS 15", browser: "Safari", isKnown: true }, ipAddress: { ip: "172.16.0.88", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T14:00:00Z", description: "USB-C hub and cables" },
  { id: "TXN-00004", customerId: "CUST-0002", customerName: "Sarah Chen", amount: 599, currency: "USD", paymentMethod: { type: "Mastercard", last4: "8888" }, merchant: "Apple Store", merchantCategory: "Electronics", location: { city: "San Francisco", country: "United States", countryCode: "US" }, device: { id: "DEV-00B2E5", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.1.22", isVPN: false }, riskScore: 6, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-06T11:20:00Z", description: "AirPods Pro purchase" },
  { id: "TXN-00005", customerId: "CUST-0003", customerName: "Mohammed Al-Rashid", amount: 4999, currency: "USD", paymentMethod: { type: "Visa", last4: "3333" }, merchant: "Coinbase", merchantCategory: "Crypto Exchange", location: { city: "Dubai", country: "UAE", countryCode: "AE" }, device: { id: "DEV-00C3G7", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "45.33.12.87", isVPN: false }, riskScore: 45, riskLevel: "MEDIUM", riskFactors: ["High amount", "Crypto exchange purchase", "International location"], status: "COMPLETED", flags: ["high_amount", "crypto_exchange"], createdAt: "2026-09-05T09:30:00Z", description: "Cryptocurrency purchase - Bitcoin" },
  { id: "TXN-00006", customerId: "CUST-0003", customerName: "Mohammed Al-Rashid", amount: 2340, currency: "USD", paymentMethod: { type: "Visa", last4: "3333" }, merchant: "Emirates Airlines", merchantCategory: "Travel", location: { city: "Dubai", country: "UAE", countryCode: "AE" }, device: { id: "DEV-00C3G7", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "185.220.101.42", isVPN: true }, riskScore: 62, riskLevel: "MEDIUM", riskFactors: ["VPN detected", "High amount", "Rapid transactions"], status: "REVIEWING", flags: ["vpn_detected", "velocity_check"], createdAt: "2026-09-05T10:15:00Z", description: "Round-trip flight ticket - Dubai to London" },
  { id: "TXN-00007", customerId: "CUST-0005", customerName: "Carlos Rodriguez", amount: 12500, currency: "USD", paymentMethod: { type: "Visa", last4: "7721" }, merchant: "Newegg", merchantCategory: "Electronics", location: { city: "Miami", country: "United States", countryCode: "US" }, device: { id: "DEV-00E5J0", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: true }, ipAddress: { ip: "203.0.113.45", isVPN: false }, riskScore: 82, riskLevel: "HIGH", riskFactors: ["Unusual amount", "New account", "Multi-device", "Multiple IPs in 24h"], status: "BLOCKED", flags: ["unusual_amount", "new_account", "multi_device", "velocity_check"], createdAt: "2026-09-07T02:30:00Z", description: "Bulk electronics purchase - 5x gaming GPUs" },
  { id: "TXN-00008", customerId: "CUST-0005", customerName: "Carlos Rodriguez", amount: 8900, currency: "USD", paymentMethod: { type: "Mastercard", last4: "5566" }, merchant: "Binance", merchantCategory: "Crypto Exchange", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00E5K1", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "198.51.100.22", isVPN: true }, riskScore: 91, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-07T03:10:00Z", description: "Cryptocurrency purchase - Ethereum" },
  { id: "TXN-00009", customerId: "CUST-0005", customerName: "Carlos Rodriguez", amount: 6750, currency: "USD", paymentMethod: { type: "Visa", last4: "7721" }, merchant: "eBay", merchantCategory: "Retail", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00E5L2", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "185.220.101.99", isVPN: true }, riskScore: 88, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions", "New account"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check", "new_account"], createdAt: "2026-09-07T03:45:00Z", description: "Multiple high-value electronics auction wins" },
  { id: "TXN-00010", customerId: "CUST-0005", customerName: "Carlos Rodriguez", amount: 3200, currency: "USD", paymentMethod: { type: "Amex", last4: "9012" }, merchant: "Walmart", merchantCategory: "Retail", location: { city: "Miami", country: "United States", countryCode: "US" }, device: { id: "DEV-00E5M3", type: "Mobile", os: "Android 15", browser: "Firefox", isKnown: false }, ipAddress: { ip: "203.0.113.45", isVPN: false }, riskScore: 75, riskLevel: "HIGH", riskFactors: ["New device", "Unusual amount", "Multiple payment methods", "Rapid transactions"], status: "BLOCKED", flags: ["new_device", "velocity_check", "multi_payment_method"], createdAt: "2026-09-07T04:20:00Z", description: "Electronics and gift card purchases" },
  { id: "TXN-00011", customerId: "CUST-0004", customerName: "Emily Watson", amount: 14.99, currency: "USD", paymentMethod: { type: "Visa", last4: "1111" }, merchant: "Netflix", merchantCategory: "Subscription", location: { city: "Chicago", country: "United States", countryCode: "US" }, device: { id: "DEV-00D4H8", type: "Desktop", os: "Windows 11", browser: "Edge", isKnown: true }, ipAddress: { ip: "192.168.2.15", isVPN: false }, riskScore: 2, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-01T00:00:00Z", description: "Monthly subscription renewal" },
  { id: "TXN-00012", customerId: "CUST-0004", customerName: "Emily Watson", amount: 67.5, currency: "USD", paymentMethod: { type: "Visa", last4: "1111" }, merchant: "Target", merchantCategory: "Retail", location: { city: "Chicago", country: "United States", countryCode: "US" }, device: { id: "DEV-00D4I9", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.2.15", isVPN: false }, riskScore: 3, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T15:00:00Z", description: "Household essentials" },
  { id: "TXN-00013", customerId: "CUST-0009", customerName: "Viktor Petrov", amount: 14999, currency: "USD", paymentMethod: { type: "Visa", last4: "6666" }, merchant: "Coinbase", merchantCategory: "Crypto Exchange", location: { city: "Moscow", country: "Russia", countryCode: "RU" }, device: { id: "DEV-00I9R8", type: "Desktop", os: "Linux", browser: "Tor Browser", isKnown: false }, ipAddress: { ip: "185.220.101.1", isVPN: true }, riskScore: 95, riskLevel: "HIGH", riskFactors: ["Tor browser detected", "VPN detected", "New device", "Unusual amount", "Location anomaly", "Known fraud pattern"], status: "BLOCKED", flags: ["tor_detected", "vpn_detected", "new_device", "velocity_check"], createdAt: "2026-09-06T03:00:00Z", description: "Maximum limit cryptocurrency purchase - BTC" },
  { id: "TXN-00014", customerId: "CUST-0009", customerName: "Viktor Petrov", amount: 12800, currency: "USD", paymentMethod: { type: "Mastercard", last4: "4444" }, merchant: "Binance", merchantCategory: "Crypto Exchange", location: { city: "Berlin", country: "Germany", countryCode: "DE" }, device: { id: "DEV-00I9S9", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "185.220.101.2", isVPN: true }, riskScore: 97, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions", "Different country in 24h"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-06T03:45:00Z", description: "Cryptocurrency purchase - ETH" },
  { id: "TXN-00015", customerId: "CUST-0009", customerName: "Viktor Petrov", amount: 9500, currency: "USD", paymentMethod: { type: "Visa", last4: "6666" }, merchant: "Newegg", merchantCategory: "Electronics", location: { city: "Amsterdam", country: "Netherlands", countryCode: "NL" }, device: { id: "DEV-00I9T0", type: "Desktop", os: "Windows 11", browser: "Firefox", isKnown: false }, ipAddress: { ip: "198.51.100.5", isVPN: true }, riskScore: 93, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Multi-country", "Velocity check failed"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "velocity_check", "location_mismatch"], createdAt: "2026-09-06T05:20:00Z", description: "Bulk GPU and server hardware order" },
  { id: "TXN-00016", customerId: "CUST-0006", customerName: "Aisha Patel", amount: 45, currency: "USD", paymentMethod: { type: "Visa", last4: "2222" }, merchant: "GrabFood", merchantCategory: "Food & Dining", location: { city: "Singapore", country: "Singapore", countryCode: "SG" }, device: { id: "DEV-00F6N4", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.3.77", isVPN: false }, riskScore: 3, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T12:30:00Z", description: "Food delivery order" },
  { id: "TXN-00017", customerId: "CUST-0006", customerName: "Aisha Patel", amount: 199, currency: "USD", paymentMethod: { type: "Visa", last4: "2222" }, merchant: "Lazada", merchantCategory: "Retail", location: { city: "Singapore", country: "Singapore", countryCode: "SG" }, device: { id: "DEV-00F6N4", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.3.77", isVPN: false }, riskScore: 5, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-05T09:00:00Z", description: "Fashion purchase - clothing and accessories" },
  { id: "TXN-00018", customerId: "CUST-0007", customerName: "David Kim", amount: 349.99, currency: "USD", paymentMethod: { type: "Visa", last4: "9999" }, merchant: "Samsung Store", merchantCategory: "Electronics", location: { city: "Seoul", country: "South Korea", countryCode: "KR" }, device: { id: "DEV-00G7O5", type: "Desktop", os: "macOS 15", browser: "Chrome", isKnown: true }, ipAddress: { ip: "172.16.1.33", isVPN: false }, riskScore: 7, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T08:00:00Z", description: "Galaxy Watch purchase" },
  { id: "TXN-00019", customerId: "CUST-0007", customerName: "David Kim", amount: 2500, currency: "USD", paymentMethod: { type: "Bank Transfer", last4: "7788" }, merchant: "Coinbase", merchantCategory: "Crypto Exchange", location: { city: "Tokyo", country: "Japan", countryCode: "JP" }, device: { id: "DEV-00G7P6", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "172.16.1.33", isVPN: false }, riskScore: 22, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-04T14:00:00Z", description: "Crypto investment - Bitcoin purchase" },
  { id: "TXN-00020", customerId: "CUST-0008", customerName: "Olivia Thompson", amount: 9.99, currency: "USD", paymentMethod: { type: "Visa", last4: "3210" }, merchant: "Spotify", merchantCategory: "Subscription", location: { city: "London", country: "United Kingdom", countryCode: "GB" }, device: { id: "DEV-00H8Q7", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.5.12", isVPN: false }, riskScore: 1, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-01T00:00:00Z", description: "Monthly subscription renewal" },
  { id: "TXN-00021", customerId: "CUST-0011", customerName: "Marcus Johnson", amount: 7800, currency: "USD", paymentMethod: { type: "Mastercard", last4: "5555" }, merchant: "Best Buy", merchantCategory: "Electronics", location: { city: "Atlanta", country: "United States", countryCode: "US" }, device: { id: "DEV-00K1X4", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "203.0.113.88", isVPN: false }, riskScore: 52, riskLevel: "MEDIUM", riskFactors: ["Unusual amount", "New account", "Multiple categories"], status: "REVIEWING", flags: ["unusual_amount", "new_account"], createdAt: "2026-09-06T20:00:00Z", description: "Multiple high-end electronics items" },
  { id: "TXN-00022", customerId: "CUST-0011", customerName: "Marcus Johnson", amount: 4500, currency: "USD", paymentMethod: { type: "Visa", last4: "3321" }, merchant: "Expedia", merchantCategory: "Travel", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00K1Y5", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "185.220.101.55", isVPN: true }, riskScore: 68, riskLevel: "MEDIUM", riskFactors: ["VPN detected", "New device", "High amount", "Rapid transactions"], status: "REVIEWING", flags: ["vpn_detected", "new_device", "velocity_check"], createdAt: "2026-09-06T22:30:00Z", description: "Last-minute international flight and hotel booking" },
  { id: "TXN-00023", customerId: "CUST-0010", customerName: "Lisa Nakamura", amount: 78.5, currency: "USD", paymentMethod: { type: "Visa", last4: "4456" }, merchant: "Uniqlo", merchantCategory: "Retail", location: { city: "Tokyo", country: "Japan", countryCode: "JP" }, device: { id: "DEV-00J0W3", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.4.88", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T13:00:00Z", description: "Clothing purchase" },
  { id: "TXN-00024", customerId: "CUST-0012", customerName: "Emma Laurent", amount: 234, currency: "USD", paymentMethod: { type: "Mastercard", last4: "7777" }, merchant: "Amazon France", merchantCategory: "Retail", location: { city: "Paris", country: "France", countryCode: "FR" }, device: { id: "DEV-00L2Z6", type: "Desktop", os: "macOS 15", browser: "Safari", isKnown: true }, ipAddress: { ip: "172.16.2.44", isVPN: false }, riskScore: 5, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T09:00:00Z", description: "Books and home goods purchase" },
  { id: "TXN-00025", customerId: "CUST-0013", customerName: "Robert Blackwell", amount: 8900, currency: "USD", paymentMethod: { type: "Visa", last4: "8811" }, merchant: "Paddle.com", merchantCategory: "Gaming", location: { city: "Nairobi", country: "Kenya", countryCode: "KE" }, device: { id: "DEV-00M3A7", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: false }, ipAddress: { ip: "45.33.12.101", isVPN: false }, riskScore: 65, riskLevel: "MEDIUM", riskFactors: ["Unusual amount", "New account", "New device", "International"], status: "REVIEWING", flags: ["unusual_amount", "new_account", "new_device"], createdAt: "2026-09-07T14:00:00Z", description: "Bulk gaming in-game currency purchase" },
  { id: "TXN-00026", customerId: "CUST-0013", customerName: "Robert Blackwell", amount: 11200, currency: "USD", paymentMethod: { type: "Mastercard", last4: "6644" }, merchant: "Sotheby's", merchantCategory: "Retail", location: { city: "Dubai", country: "UAE", countryCode: "AE" }, device: { id: "DEV-00M3B8", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "198.51.100.77", isVPN: true }, riskScore: 78, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Multi-country", "New account"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-07T16:30:00Z", description: "Online auction - luxury watch bidding" },
  { id: "TXN-00027", customerId: "CUST-0014", customerName: "Hannah Brooks", amount: 22.5, currency: "USD", paymentMethod: { type: "Visa", last4: "1234" }, merchant: "Starbucks", merchantCategory: "Food & Dining", location: { city: "Toronto", country: "Canada", countryCode: "CA" }, device: { id: "DEV-00N4D0", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.3.21", isVPN: false }, riskScore: 2, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T07:45:00Z", description: "Coffee and pastry purchase" },
  { id: "TXN-00028", customerId: "CUST-0015", customerName: "Ahmed Hassan", amount: 15000, currency: "USD", paymentMethod: { type: "Bank Transfer", last4: "9088" }, merchant: "Binance", merchantCategory: "Crypto Exchange", location: { city: "Dubai", country: "UAE", countryCode: "AE" }, device: { id: "DEV-00O5E1", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "45.33.12.55", isVPN: false }, riskScore: 48, riskLevel: "MEDIUM", riskFactors: ["High amount", "Crypto exchange", "Bank transfer"], status: "PENDING", flags: ["high_amount", "crypto_exchange"], createdAt: "2026-09-07T11:00:00Z", description: "Large cryptocurrency investment - BTC" },
  { id: "TXN-00029", customerId: "CUST-0015", customerName: "Ahmed Hassan", amount: 3400, currency: "USD", paymentMethod: { type: "Visa", last4: "5577" }, merchant: "Namshi", merchantCategory: "Retail", location: { city: "Abu Dhabi", country: "UAE", countryCode: "AE" }, device: { id: "DEV-00O5F2", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "10.0.5.12", isVPN: false }, riskScore: 30, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-06T19:00:00Z", description: "Luxury fashion purchase" },
  { id: "TXN-00030", customerId: "CUST-0016", customerName: "Jessica Adams", amount: 54.99, currency: "USD", paymentMethod: { type: "Visa", last4: "6789" }, merchant: "REI", merchantCategory: "Retail", location: { city: "Seattle", country: "United States", countryCode: "US" }, device: { id: "DEV-00P6G3", type: "Desktop", os: "macOS 15", browser: "Safari", isKnown: true }, ipAddress: { ip: "172.16.3.66", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T10:00:00Z", description: "Hiking gear purchase" },
  { id: "TXN-00031", customerId: "CUST-0017", customerName: "Diego Morales", amount: 14200, currency: "USD", paymentMethod: { type: "Visa", last4: "2233" }, merchant: "Walmart", merchantCategory: "Retail", location: { city: "Miami", country: "United States", countryCode: "US" }, device: { id: "DEV-00Q7H4", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: false }, ipAddress: { ip: "203.0.113.12", isVPN: false }, riskScore: 89, riskLevel: "HIGH", riskFactors: ["New device", "Unusual amount", "New account", "High-risk merchant category"], status: "BLOCKED", flags: ["new_device", "unusual_amount", "new_account"], createdAt: "2026-09-06T22:00:00Z", description: "Bulk electronics and gift cards" },
  { id: "TXN-00032", customerId: "CUST-0017", customerName: "Diego Morales", amount: 11800, currency: "USD", paymentMethod: { type: "Mastercard", last4: "4455" }, merchant: "Coinbase", merchantCategory: "Crypto Exchange", location: { city: "Las Vegas", country: "United States", countryCode: "US" }, device: { id: "DEV-00Q7I5", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "185.220.101.88", isVPN: true }, riskScore: 94, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions", "Known fraud pattern"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-06T23:30:00Z", description: "Maximum limit crypto purchase - BTC" },
  { id: "TXN-00033", customerId: "CUST-0017", customerName: "Diego Morales", amount: 8400, currency: "USD", paymentMethod: { type: "Amex", last4: "1122" }, merchant: "Best Buy", merchantCategory: "Electronics", location: { city: "Bogota", country: "Colombia", countryCode: "CO" }, device: { id: "DEV-00Q7J6", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "203.0.113.12", isVPN: false }, riskScore: 91, riskLevel: "HIGH", riskFactors: ["New device", "Unusual amount", "International", "Rapid transactions", "New account", "Stolen card indicators"], status: "BLOCKED", flags: ["new_device", "velocity_check", "location_mismatch"], createdAt: "2026-09-07T01:00:00Z", description: "High-value electronics purchase" },
  { id: "TXN-00034", customerId: "CUST-0018", customerName: "Rachel Green", amount: 125, currency: "USD", paymentMethod: { type: "Visa", last4: "5678" }, merchant: "Nordstrom", merchantCategory: "Retail", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00R8K7", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.4.88", isVPN: false }, riskScore: 3, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T11:30:00Z", description: "Fashion accessories purchase" },
  { id: "TXN-00035", customerId: "CUST-0019", customerName: "Yuki Tanaka", amount: 59.99, currency: "USD", paymentMethod: { type: "Visa", last4: "8901" }, merchant: "PlayStation Store", merchantCategory: "Gaming", location: { city: "Osaka", country: "Japan", countryCode: "JP" }, device: { id: "DEV-00S9L8", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "10.0.6.44", isVPN: false }, riskScore: 6, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T20:00:00Z", description: "Game purchase - new release" },
  { id: "TXN-00036", customerId: "CUST-0020", customerName: "Frank Mueller", amount: 6800, currency: "USD", paymentMethod: { type: "Visa", last4: "3456" }, merchant: "Kraken", merchantCategory: "Crypto Exchange", location: { city: "Berlin", country: "Germany", countryCode: "DE" }, device: { id: "DEV-00T0M9", type: "Desktop", os: "Linux", browser: "Firefox", isKnown: true }, ipAddress: { ip: "45.33.12.33", isVPN: false }, riskScore: 42, riskLevel: "MEDIUM", riskFactors: ["High amount", "Crypto exchange"], status: "PENDING", flags: ["high_amount", "crypto_exchange"], createdAt: "2026-09-07T10:00:00Z", description: "Cryptocurrency investment - Ethereum" },
  { id: "TXN-00037", customerId: "CUST-0020", customerName: "Frank Mueller", amount: 2200, currency: "USD", paymentMethod: { type: "Visa", last4: "3456" }, merchant: "Steam", merchantCategory: "Gaming", location: { city: "Munich", country: "Germany", countryCode: "DE" }, device: { id: "DEV-00T0N0", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: false }, ipAddress: { ip: "185.220.101.77", isVPN: true }, riskScore: 55, riskLevel: "MEDIUM", riskFactors: ["VPN detected", "New device", "High amount"], status: "REVIEWING", flags: ["vpn_detected", "new_device"], createdAt: "2026-09-06T15:00:00Z", description: "Large game library purchase" },
  { id: "TXN-00038", customerId: "CUST-0021", customerName: "Grace Okafor", amount: 42, currency: "USD", paymentMethod: { type: "Visa", last4: "6543" }, merchant: "Jumia", merchantCategory: "Retail", location: { city: "Lagos", country: "Nigeria", countryCode: "NG" }, device: { id: "DEV-00U1O1", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: true }, ipAddress: { ip: "172.16.4.99", isVPN: false }, riskScore: 5, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T08:30:00Z", description: "Electronics accessories purchase" },
  { id: "TXN-00039", customerId: "CUST-0022", customerName: "Brandon Lee", amount: 149.99, currency: "USD", paymentMethod: { type: "Visa", last4: "7890" }, merchant: "Epic Games Store", merchantCategory: "Gaming", location: { city: "Los Angeles", country: "United States", countryCode: "US" }, device: { id: "DEV-00V2P2", type: "Desktop", os: "Windows 11", browser: "Epic Launcher", isKnown: true }, ipAddress: { ip: "203.0.113.77", isVPN: false }, riskScore: 8, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T19:30:00Z", description: "Game bundles and V-Bucks" },
  { id: "TXN-00040", customerId: "CUST-0022", customerName: "Brandon Lee", amount: 599, currency: "USD", paymentMethod: { type: "Mastercard", last4: "1233" }, merchant: "Razer", merchantCategory: "Electronics", location: { city: "Las Vegas", country: "United States", countryCode: "US" }, device: { id: "DEV-00V2Q3", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "203.0.113.77", isVPN: false }, riskScore: 12, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-05T14:00:00Z", description: "Gaming keyboard and mouse purchase" },
  { id: "TXN-00041", customerId: "CUST-0023", customerName: "Sophie Dubois", amount: 89, currency: "USD", paymentMethod: { type: "Visa", last4: "2345" }, merchant: "Sephora", merchantCategory: "Retail", location: { city: "Paris", country: "France", countryCode: "FR" }, device: { id: "DEV-00W3R4", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.6.33", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T10:45:00Z", description: "Beauty products purchase" },
  { id: "TXN-00042", customerId: "CUST-0024", customerName: "Tyler Wright", amount: 14800, currency: "USD", paymentMethod: { type: "Visa", last4: "9988" }, merchant: "Apple Store", merchantCategory: "Electronics", location: { city: "Miami", country: "United States", countryCode: "US" }, device: { id: "DEV-00X4S5", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: false }, ipAddress: { ip: "185.220.101.5", isVPN: true }, riskScore: 96, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "New account", "Velocity check failed", "Known fraud pattern"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "velocity_check", "new_account"], createdAt: "2026-09-06T01:00:00Z", description: "Bulk iPhone purchase - 10x units" },
  { id: "TXN-00043", customerId: "CUST-0024", customerName: "Tyler Wright", amount: 12500, currency: "USD", paymentMethod: { type: "Mastercard", last4: "7766" }, merchant: "Binance", merchantCategory: "Crypto Exchange", location: { city: "New York", country: "United States", countryCode: "US" }, device: { id: "DEV-00X4T6", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "185.220.101.6", isVPN: true }, riskScore: 98, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions", "Money laundering indicators"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-06T01:45:00Z", description: "Full balance crypto conversion - BTC" },
  { id: "TXN-00044", customerId: "CUST-0024", customerName: "Tyler Wright", amount: 10200, currency: "USD", paymentMethod: { type: "Amex", last4: "5544" }, merchant: "Newegg", merchantCategory: "Electronics", location: { city: "London", country: "United Kingdom", countryCode: "GB" }, device: { id: "DEV-00X4U7", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "198.51.100.88", isVPN: false }, riskScore: 94, riskLevel: "HIGH", riskFactors: ["New device", "Unusual amount", "International", "Rapid transactions", "Multiple payment methods", "New account"], status: "BLOCKED", flags: ["new_device", "velocity_check", "location_mismatch"], createdAt: "2026-09-06T02:30:00Z", description: "High-end server hardware and GPUs" },
  { id: "TXN-00045", customerId: "CUST-0025", customerName: "Maria Santos", amount: 67.5, currency: "USD", paymentMethod: { type: "Visa", last4: "3344" }, merchant: "iFood", merchantCategory: "Food & Dining", location: { city: "Sao Paulo", country: "Brazil", countryCode: "BR" }, device: { id: "DEV-00Y5Y1", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: true }, ipAddress: { ip: "10.0.7.55", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-07T20:30:00Z", description: "Restaurant dinner delivery" },
  { id: "TXN-00046", customerId: "CUST-0026", customerName: "Andrew Harrison", amount: 450, currency: "USD", paymentMethod: { type: "Visa", last4: "4433" }, merchant: "Home Depot", merchantCategory: "Retail", location: { city: "Dallas", country: "United States", countryCode: "US" }, device: { id: "DEV-00Z6Z2", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true }, ipAddress: { ip: "172.16.5.88", isVPN: false }, riskScore: 10, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T09:30:00Z", description: "Home improvement supplies" },
  { id: "TXN-00047", customerId: "CUST-0027", customerName: "Priya Sharma", amount: 34.99, currency: "USD", paymentMethod: { type: "Visa", last4: "5566" }, merchant: "Amazon India", merchantCategory: "Retail", location: { city: "Mumbai", country: "India", countryCode: "IN" }, device: { id: "DEV-00AA4", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: true }, ipAddress: { ip: "192.168.7.14", isVPN: false }, riskScore: 3, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T05:30:00Z", description: "Book and stationery purchase" },
  { id: "TXN-00048", customerId: "CUST-0028", customerName: "Nathan Cooper", amount: 5600, currency: "USD", paymentMethod: { type: "Visa", last4: "1122" }, merchant: "Coinbase", merchantCategory: "Crypto Exchange", location: { city: "Sydney", country: "Australia", countryCode: "AU" }, device: { id: "DEV-00AB5", type: "Desktop", os: "macOS 15", browser: "Chrome", isKnown: true }, ipAddress: { ip: "45.33.12.44", isVPN: false }, riskScore: 45, riskLevel: "MEDIUM", riskFactors: ["High amount", "New account", "Crypto exchange"], status: "PENDING", flags: ["high_amount", "new_account"], createdAt: "2026-09-07T03:00:00Z", description: "Cryptocurrency purchase - BTC" },
  { id: "TXN-00049", customerId: "CUST-0028", customerName: "Nathan Cooper", amount: 8900, currency: "USD", paymentMethod: { type: "Mastercard", last4: "8877" }, merchant: "Booking.com", merchantCategory: "Travel", location: { city: "Melbourne", country: "Australia", countryCode: "AU" }, device: { id: "DEV-00AB6", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "185.220.101.66", isVPN: true }, riskScore: 62, riskLevel: "MEDIUM", riskFactors: ["VPN detected", "New device", "High amount", "Velocity check", "Rapid transactions"], status: "REVIEWING", flags: ["vpn_detected", "new_device", "velocity_check"], createdAt: "2026-09-07T04:30:00Z", description: "Luxury resort booking - 2 week stay" },
  { id: "TXN-00050", customerId: "CUST-0029", customerName: "Catherine Bell", amount: 156, currency: "USD", paymentMethod: { type: "Visa", last4: "2211" }, merchant: "Lululemon", merchantCategory: "Retail", location: { city: "Vancouver", country: "Canada", countryCode: "CA" }, device: { id: "DEV-00AC7", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "172.16.6.77", isVPN: false }, riskScore: 5, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T13:15:00Z", description: "Athletic wear purchase" },
  { id: "TXN-00051", customerId: "CUST-0030", customerName: "Leon Fischer", amount: 7200, currency: "USD", paymentMethod: { type: "Visa", last4: "6677" }, merchant: "Kraken", merchantCategory: "Crypto Exchange", location: { city: "Frankfurt", country: "Germany", countryCode: "DE" }, device: { id: "DEV-00AD8", type: "Desktop", os: "Linux", browser: "Firefox", isKnown: true }, ipAddress: { ip: "45.33.12.22", isVPN: false }, riskScore: 40, riskLevel: "MEDIUM", riskFactors: ["High amount", "Crypto exchange"], status: "PENDING", flags: ["high_amount", "crypto_exchange"], createdAt: "2026-09-07T09:00:00Z", description: "Cryptocurrency portfolio rebalancing" },
  { id: "TXN-00052", customerId: "CUST-0031", customerName: "Aaliyah Washington", amount: 78, currency: "USD", paymentMethod: { type: "Mastercard", last4: "3344" }, merchant: "DoorDash", merchantCategory: "Food & Dining", location: { city: "Atlanta", country: "United States", countryCode: "US" }, device: { id: "DEV-00AE0", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true }, ipAddress: { ip: "192.168.8.55", isVPN: false }, riskScore: 4, riskLevel: "LOW", riskFactors: [], status: "COMPLETED", flags: [], createdAt: "2026-09-08T19:00:00Z", description: "Food delivery order" },
  { id: "TXN-00053", customerId: "CUST-0032", customerName: "Oscar Lindqvist", amount: 9800, currency: "USD", paymentMethod: { type: "Visa", last4: "9900" }, merchant: "Binance", merchantCategory: "Crypto Exchange", location: { city: "Stockholm", country: "Sweden", countryCode: "SE" }, device: { id: "DEV-00AF1", type: "Desktop", os: "Linux", browser: "Tor Browser", isKnown: false }, ipAddress: { ip: "185.220.101.33", isVPN: true }, riskScore: 75, riskLevel: "HIGH", riskFactors: ["Tor browser detected", "VPN detected", "New device", "Unusual amount", "Rapid transactions"], status: "BLOCKED", flags: ["tor_detected", "vpn_detected", "new_device", "velocity_check"], createdAt: "2026-09-07T12:00:00Z", description: "Large cryptocurrency purchase - ETH" },
  { id: "TXN-00054", customerId: "CUST-0032", customerName: "Oscar Lindqvist", amount: 5400, currency: "USD", paymentMethod: { type: "Mastercard", last4: "1100" }, merchant: "iHerb", merchantCategory: "Retail", location: { city: "Copenhagen", country: "Denmark", countryCode: "DK" }, device: { id: "DEV-00AF2", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false }, ipAddress: { ip: "203.0.113.55", isVPN: true }, riskScore: 70, riskLevel: "HIGH", riskFactors: ["VPN detected", "New device", "Unusual amount", "Location anomaly", "Rapid transactions"], status: "BLOCKED", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-07T13:30:00Z", description: "Bulk health supplements order" },
  { id: "TXN-00055", customerId: "CUST-0032", customerName: "Oscar Lindqvist", amount: 4200, currency: "USD", paymentMethod: { type: "Visa", last4: "9900" }, merchant: "Steam", merchantCategory: "Gaming", location: { city: "Oslo", country: "Norway", countryCode: "NO" }, device: { id: "DEV-00AF3", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false }, ipAddress: { ip: "185.220.101.33", isVPN: true }, riskScore: 68, riskLevel: "MEDIUM", riskFactors: ["VPN detected", "New device", "Unusual amount", "Multi-country", "Velocity check"], status: "REVIEWING", flags: ["vpn_detected", "new_device", "location_mismatch", "velocity_check"], createdAt: "2026-09-07T15:00:00Z", description: "Massive game library purchase" },
];




// ============================================================================
// ALERTS (24)
// ============================================================================

export const alerts: Alert[] = [
  {
    id: "ALT-00001",
    transactionId: "TXN-00007",
    customerId: "CUST-0005",
    customerName: "Carlos Rodriguez",
    severity: "HIGH",
    type: "unusual_amount",
    title: "Unusually High Transaction Amount",
    description: "Transaction of $12,500 is 47x above the customer's average transaction of $267. New account (< 60 days) with high-value electronics purchase.",
    riskScore: 82,
    reasons: ["Amount exceeds 47x customer average", "Account age < 60 days", "Electronics category with high resale value", "Multiple devices in 24h"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T02:31:00Z",
    updatedAt: "2026-09-07T10:00:00Z",
    priority: 2,
  },
  {
    id: "ALT-00002",
    transactionId: "TXN-00008",
    customerId: "CUST-0005",
    customerName: "Carlos Rodriguez",
    severity: "CRITICAL",
    type: "velocity",
    title: "Rapid Multi-Device Transaction Pattern",
    description: "4 transactions across 4 different devices within 90 minutes. VPN detected on 2 transactions. Crypto exchange involved.",
    riskScore: 91,
    reasons: ["4 transactions in 90 minutes", "4 different devices used", "VPN detected", "Crypto exchange involvement", "Location shift from Miami to New York"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T03:11:00Z",
    updatedAt: "2026-09-07T14:30:00Z",
    priority: 1,
  },
  {
    id: "ALT-00003",
    transactionId: "TXN-00013",
    customerId: "CUST-0009",
    customerName: "Viktor Petrov",
    severity: "CRITICAL",
    type: "behavioral",
    title: "Known Fraud Pattern Match - Account Takeover",
    description: "Transaction matches known account takeover pattern: Tor browser, VPN, multiple new devices, rapid high-value crypto purchases across countries.",
    riskScore: 95,
    reasons: ["Tor browser detected", "VPN detected", "5 new devices in 48h", "3 different countries in 24h", "All amounts above $9,000"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T03:01:00Z",
    updatedAt: "2026-09-06T18:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00004",
    transactionId: "TXN-00014",
    customerId: "CUST-0009",
    customerName: "Viktor Petrov",
    severity: "CRITICAL",
    type: "location",
    title: "Impossible Travel - Berlin to Moscow in 45 min",
    description: "Transaction in Berlin at 03:00 and Moscow at 03:45 on different devices. Physical travel impossible in this timeframe.",
    riskScore: 97,
    reasons: ["Impossible travel detected", "Different devices in each location", "VPN used on both", "Both transactions high-value crypto"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T03:46:00Z",
    updatedAt: "2026-09-06T18:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00005",
    transactionId: "TXN-00031",
    customerId: "CUST-0017",
    customerName: "Diego Morales",
    severity: "CRITICAL",
    type: "new_device",
    title: "New Account with Multiple New Devices",
    description: "Account 19 days old using 3 previously unseen devices for high-value transactions across multiple cities.",
    riskScore: 89,
    reasons: ["Account age < 30 days", "3 new devices in 72h", "Multiple cities used", "High-value electronics + gift cards", "Stolen card indicators"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T22:01:00Z",
    updatedAt: "2026-09-07T09:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00006",
    transactionId: "TXN-00042",
    customerId: "CUST-0024",
    customerName: "Tyler Wright",
    severity: "CRITICAL",
    type: "network",
    title: "Fraud Network Connection Detected",
    description: "Customer shares devices and IP addresses with confirmed fraudster CUST-0009. Connected through device DEV-00X4V8.",
    riskScore: 96,
    reasons: ["Device shared with confirmed fraudster", "IP address overlap with CUST-0009", "Similar transaction pattern", "Same Tor exit node"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T01:01:00Z",
    updatedAt: "2026-09-07T11:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00007",
    transactionId: "TXN-00006",
    customerId: "CUST-0003",
    customerName: "Mohammed Al-Rashid",
    severity: "MEDIUM",
    type: "unusual_amount",
    title: "VPN Usage on High-Value Travel Booking",
    description: "VPN detected during $2,340 airline booking. Combined with $4,999 crypto purchase within same hour.",
    riskScore: 62,
    reasons: ["VPN detected", "Two high-value transactions in 1 hour", "Crypto exchange + travel combination"],
    status: "INVESTIGATING",
    assignedTo: "Raj Mehta",
    createdAt: "2026-09-05T10:16:00Z",
    updatedAt: "2026-09-06T14:00:00Z",
    priority: 3,
  },
  {
    id: "ALT-00008",
    transactionId: "TXN-00022",
    customerId: "CUST-0011",
    customerName: "Marcus Johnson",
    severity: "MEDIUM",
    type: "new_device",
    title: "New Device with VPN - Travel Booking",
    description: "New device used with VPN for $4,500 last-minute international travel booking. Account is 67 days old.",
    riskScore: 68,
    reasons: ["New device", "VPN detected", "High-value travel booking", "Account age < 90 days", "Rapid follow-up to electronics purchase"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-06T22:31:00Z",
    updatedAt: "2026-09-06T22:31:00Z",
    priority: 3,
  },
  {
    id: "ALT-00009",
    transactionId: "TXN-00026",
    customerId: "CUST-0013",
    customerName: "Robert Blackwell",
    severity: "HIGH",
    type: "velocity",
    title: "Rapid Multi-Country High-Value Spending",
    description: "Two transactions totaling $20,100 in different countries (Kenya, UAE) within 2.5 hours using new devices.",
    riskScore: 78,
    reasons: ["$20,100 in 2.5 hours", "Two different countries", "Two new devices", "New account (35 days)", "VPN detected on second txn"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T16:31:00Z",
    updatedAt: "2026-09-08T08:00:00Z",
    priority: 2,
  },
  {
    id: "ALT-00010",
    transactionId: "TXN-00032",
    customerId: "CUST-0017",
    customerName: "Diego Morales",
    severity: "CRITICAL",
    type: "behavioral",
    title: "Crypto Cash-Out Pattern Detected",
    description: "Customer received stolen funds and immediately converted to cryptocurrency. Pattern matches money laundering typology.",
    riskScore: 94,
    reasons: ["Immediate crypto conversion after high-value purchase", "VPN used", "New device", "Different city from first txn"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T23:31:00Z",
    updatedAt: "2026-09-07T08:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00011",
    transactionId: "TXN-00025",
    customerId: "CUST-0013",
    customerName: "Robert Blackwell",
    severity: "MEDIUM",
    type: "unusual_amount",
    title: "Gaming Category - Unusual High Amount",
    description: "$8,900 gaming purchase is 38x above typical gaming transactions for the platform.",
    riskScore: 65,
    reasons: ["Amount 38x platform gaming average", "New account", "New device", "In-game currency has high fraud rate"],
    status: "INVESTIGATING",
    assignedTo: "Raj Mehta",
    createdAt: "2026-09-07T14:01:00Z",
    updatedAt: "2026-09-08T09:00:00Z",
    priority: 3,
  },
  {
    id: "ALT-00012",
    transactionId: "TXN-00053",
    customerId: "CUST-0032",
    customerName: "Oscar Lindqvist",
    severity: "HIGH",
    type: "behavioral",
    title: "Tor Browser + VPN + Crypto Purchase",
    description: "High-anonymity setup (Tor + VPN) used for $9,800 crypto purchase. Matches darknet marketplace withdrawal pattern.",
    riskScore: 75,
    reasons: ["Tor browser detected", "VPN detected", "Crypto exchange", "New device", "High amount"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-07T12:01:00Z",
    updatedAt: "2026-09-07T12:01:00Z",
    priority: 2,
  },
  {
    id: "ALT-00013",
    transactionId: "TXN-00009",
    customerId: "CUST-0005",
    customerName: "Carlos Rodriguez",
    severity: "HIGH",
    type: "location",
    title: "Impossible Travel - Miami to New York in 35 min",
    description: "Transaction in Miami at 02:30 and New York at 03:10. 1,280 miles covered in 35 minutes on different devices.",
    riskScore: 88,
    reasons: ["Impossible travel detected", "Different devices", "Third new device in 24h", "VPN used"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T03:11:00Z",
    updatedAt: "2026-09-07T14:30:00Z",
    priority: 2,
  },
  {
    id: "ALT-00014",
    transactionId: "TXN-00043",
    customerId: "CUST-0024",
    customerName: "Tyler Wright",
    severity: "CRITICAL",
    type: "velocity",
    title: "3 Transactions Over $10K in 90 Minutes",
    description: "Three separate transactions totaling $37,500 within 90 minutes of account creation. All using different devices, VPNs, and payment methods.",
    riskScore: 98,
    reasons: ["$37,500 in 90 minutes", "3 different devices", "3 different VPN IPs", "3 different payment methods", "Account 14 days old"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T01:46:00Z",
    updatedAt: "2026-09-06T18:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00015",
    transactionId: "TXN-00049",
    customerId: "CUST-0028",
    customerName: "Nathan Cooper",
    severity: "MEDIUM",
    type: "unusual_amount",
    title: "VPN + New Device on Travel Booking",
    description: "$8,900 luxury resort booking with VPN on new device. Follows $5,600 crypto purchase 90 minutes prior.",
    riskScore: 62,
    reasons: ["VPN detected", "New device", "Follows crypto purchase", "High-value travel", "Account < 90 days"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-07T04:31:00Z",
    updatedAt: "2026-09-07T04:31:00Z",
    priority: 3,
  },
  {
    id: "ALT-00016",
    transactionId: "TXN-00054",
    customerId: "CUST-0032",
    customerName: "Oscar Lindqvist",
    severity: "HIGH",
    type: "velocity",
    title: "Three Countries in Three Hours",
    description: "Transactions from Sweden, Denmark, and Norway within 3 hours using different new devices with VPNs.",
    riskScore: 70,
    reasons: ["3 countries in 3 hours", "3 different new devices", "VPN used on 2 transactions", "All above average amount"],
    status: "INVESTIGATING",
    assignedTo: "Raj Mehta",
    createdAt: "2026-09-07T13:31:00Z",
    updatedAt: "2026-09-08T10:00:00Z",
    priority: 2,
  },
  {
    id: "ALT-00017",
    transactionId: "TXN-00010",
    customerId: "CUST-0005",
    customerName: "Carlos Rodriguez",
    severity: "HIGH",
    type: "new_device",
    title: "Fourth New Device - Gift Card Purchase",
    description: "Fourth previously unseen device used for $3,200 purchase including gift cards. Classic card testing pattern.",
    riskScore: 75,
    reasons: ["4th new device", "Gift card purchase", "Multiple payment methods", "Rapid sequence"],
    status: "INVESTIGATING",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T04:21:00Z",
    updatedAt: "2026-09-07T14:30:00Z",
    priority: 2,
  },
  {
    id: "ALT-00018",
    transactionId: "TXN-00033",
    customerId: "CUST-0017",
    customerName: "Diego Morales",
    severity: "CRITICAL",
    type: "network",
    title: "Cross-Border Fraud Ring Activity",
    description: "Device DEV-00Q7J6 linked to 2 confirmed fraud cases. Transaction pattern matches organized fraud ring.",
    riskScore: 91,
    reasons: ["Device linked to 2 confirmed fraud cases", "Pattern matches known fraud ring", "Multi-country activity", "Stolen card indicators"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-07T01:01:00Z",
    updatedAt: "2026-09-07T08:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00019",
    transactionId: "TXN-00037",
    customerId: "CUST-0020",
    customerName: "Frank Mueller",
    severity: "MEDIUM",
    type: "unusual_amount",
    title: "VPN Usage on Gaming Purchase",
    description: "$2,200 gaming purchase using VPN on new device. Unusual for this customer profile.",
    riskScore: 55,
    reasons: ["VPN detected", "New device", "Amount above customer average", "Different city from usual"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-06T15:01:00Z",
    updatedAt: "2026-09-06T15:01:00Z",
    priority: 4,
  },
  {
    id: "ALT-00020",
    transactionId: "TXN-00044",
    customerId: "CUST-0024",
    customerName: "Tyler Wright",
    severity: "CRITICAL",
    type: "location",
    title: "Impossible Travel - New York to London in 45 min",
    description: "Transaction in New York at 01:45 and London at 02:30. 3,459 miles impossible travel with different devices.",
    riskScore: 94,
    reasons: ["Impossible travel across Atlantic", "Different devices", "Different payment methods", "VPN used on first txn"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T02:31:00Z",
    updatedAt: "2026-09-06T18:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00021",
    transactionId: "TXN-00028",
    customerId: "CUST-0015",
    customerName: "Ahmed Hassan",
    severity: "LOW",
    type: "unusual_amount",
    title: "Large Bank Transfer - Crypto Purchase",
    description: "$15,000 bank transfer to crypto exchange. Amount is high but within customer's historical pattern.",
    riskScore: 48,
    reasons: ["Large bank transfer", "Crypto exchange", "Higher than recent average"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-07T11:01:00Z",
    updatedAt: "2026-09-07T11:01:00Z",
    priority: 4,
  },
  {
    id: "ALT-00022",
    transactionId: "TXN-00015",
    customerId: "CUST-0009",
    customerName: "Viktor Petrov",
    severity: "CRITICAL",
    type: "velocity",
    title: "Third Country + Third Device in 2 Hours",
    description: "Third transaction from third country (Netherlands) in 2 hours. All devices previously unseen, all VPNs, all above $9K.",
    riskScore: 93,
    reasons: ["3 countries in 2 hours", "3 new devices", "3 VPN connections", "All above $9,000"],
    status: "CONFIRMED_FRAUD",
    assignedTo: "Gule Sakeena",
    createdAt: "2026-09-06T05:21:00Z",
    updatedAt: "2026-09-06T18:00:00Z",
    priority: 1,
  },
  {
    id: "ALT-00023",
    transactionId: "TXN-00048",
    customerId: "CUST-0028",
    customerName: "Nathan Cooper",
    severity: "LOW",
    type: "unusual_amount",
    title: "New Account - Crypto Purchase",
    description: "$5,600 crypto purchase on 55-day-old account. Elevated but within acceptable range.",
    riskScore: 45,
    reasons: ["New account", "Crypto exchange", "Higher than platform average"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-07T03:01:00Z",
    updatedAt: "2026-09-07T03:01:00Z",
    priority: 5,
  },
  {
    id: "ALT-00024",
    transactionId: "TXN-00055",
    customerId: "CUST-0032",
    customerName: "Oscar Lindqvist",
    severity: "MEDIUM",
    type: "location",
    title: "VPN Return - Third City in 3 Hours",
    description: "VPN reconnected from Oslo after Copenhagen transaction. Gaming purchase pattern suggests account testing.",
    riskScore: 68,
    reasons: ["VPN detected", "Third city in 3 hours", "New device", "Gaming category"],
    status: "NEW",
    assignedTo: null,
    createdAt: "2026-09-07T15:01:00Z",
    updatedAt: "2026-09-07T15:01:00Z",
    priority: 3,
  },
];




// ============================================================================
// INVESTIGATIONS (12)
// ============================================================================

export const investigations: Investigation[] = [
  {
    id: "INV-00001",
    title: "Multi-Account Fraud Ring - Petrov & Wright Network",
    status: "IN_PROGRESS",
    priority: 1,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0009", "CUST-0024"],
    transactionIds: ["TXN-00013", "TXN-00014", "TXN-00015", "TXN-00042", "TXN-00043", "TXN-00044"],
    findings: [
      "Devices DEV-00I9V2 and DEV-00X4V8 are the same physical device",
      "Both accounts created within 14 days of each other",
      "Same Tor exit node (185.220.101.x) used by both",
      "Combined fraudulent spend: $74,799",
      "Pattern matches FIN7-style account takeover methodology",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Confirmed device fingerprint match between DEV-00I9V2 and DEV-00X4V8. Escalating to law enforcement referral.", createdAt: "2026-09-06T18:00:00Z" },
      { author: "Gule Sakeena", content: "Cross-referenced IP addresses with known Tor exit node list. Both clusters use the same anonymization infrastructure.", createdAt: "2026-09-07T10:00:00Z" },
      { author: "Raj Mehta", content: "Analyzed transaction timing - both actors coordinate purchases within 30-minute windows.", createdAt: "2026-09-07T15:00:00Z" },
    ],
    createdAt: "2026-09-06T18:30:00Z",
    updatedAt: "2026-09-08T09:00:00Z",
    riskScore: 97,
  },
  {
    id: "INV-00002",
    title: "Card Testing Ring - Rodriguez Account Cluster",
    status: "IN_PROGRESS",
    priority: 1,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0005"],
    transactionIds: ["TXN-00007", "TXN-00008", "TXN-00009", "TXN-00010"],
    findings: [
      "4 devices used within 90 minutes - all previously unseen",
      "Gift card purchases mixed with electronics (classic card testing)",
      "2 of 4 transactions used VPNs from different countries",
      "Card numbers may be from BIN range associated with recent breach",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Confirmed this is a card testing operation. Initial small test transaction followed by escalating amounts.", createdAt: "2026-09-07T10:30:00Z" },
    ],
    createdAt: "2026-09-07T05:00:00Z",
    updatedAt: "2026-09-08T08:00:00Z",
    riskScore: 85,
  },
  {
    id: "INV-00003",
    title: "Account Takeover - Diego Morales",
    status: "IN_PROGRESS",
    priority: 2,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0017"],
    transactionIds: ["TXN-00031", "TXN-00032", "TXN-00033"],
    findings: [
      "Account created 19 days ago with minimal identity verification",
      "First 5 transactions were small ($10-$50), then jumped to $14,200",
      "Device fingerprint analysis shows devices shared with fraud ring INV-00001",
      "Credit card likely stolen - BIN matches recent data breach",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Account takeover confirmed. Legitimate account owner contacted - confirmed they did not make these purchases.", createdAt: "2026-09-07T08:00:00Z" },
    ],
    createdAt: "2026-09-07T06:00:00Z",
    updatedAt: "2026-09-07T08:00:00Z",
    riskScore: 89,
  },
  {
    id: "INV-00004",
    title: "VPN Cluster Analysis - Nordics Region",
    status: "IN_PROGRESS",
    priority: 2,
    assignedTo: "Raj Mehta",
    customerIds: ["CUST-0032", "CUST-0020"],
    transactionIds: ["TXN-00053", "TXN-00054", "TXN-00055", "TXN-00036", "TXN-00037"],
    findings: [
      "3 Scandinavian cities visited in 3 hours by CUST-0032",
      "Same VPN provider (NordVPN) used across both accounts",
      "CUST-0020 showed similar but less extreme pattern",
      "Geographic velocity exceeds 500mph threshold",
    ],
    notes: [
      { author: "Raj Mehta", content: "Analyzing whether CUST-0020 and CUST-0032 are the same person or separate actors.", createdAt: "2026-09-08T09:00:00Z" },
    ],
    createdAt: "2026-09-07T16:00:00Z",
    updatedAt: "2026-09-08T09:00:00Z",
    riskScore: 67,
  },
  {
    id: "INV-00005",
    title: "Travel Fraud Pattern - Johnson & Cooper",
    status: "OPEN",
    priority: 3,
    assignedTo: "Raj Mehta",
    customerIds: ["CUST-0011", "CUST-0028"],
    transactionIds: ["TXN-00021", "TXN-00022", "TXN-00048", "TXN-00049"],
    findings: [
      "Both accounts are 55-67 days old",
      "Both made high-value crypto purchases followed by travel bookings",
      "VPN usage on travel bookings but not crypto purchases",
      "May indicate money laundering through travel vouchers",
    ],
    notes: [],
    createdAt: "2026-09-07T12:00:00Z",
    updatedAt: "2026-09-07T12:00:00Z",
    riskScore: 55,
  },
  {
    id: "INV-00006",
    title: "Multi-Device Abuse - Al-Rashid",
    status: "CLOSED_FALSE_POSITIVE",
    priority: 3,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0003"],
    transactionIds: ["TXN-00005", "TXN-00006"],
    findings: [
      "Customer is a frequent international traveler (business consultant)",
      "VPN usage is legitimate - corporate VPN for work",
      "Crypto purchases are within customer's documented investment pattern",
      "False positive - closing investigation",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Customer provided employment verification showing they travel frequently for consulting. VPN is corporate.", createdAt: "2026-09-06T14:00:00Z" },
    ],
    createdAt: "2026-09-05T12:00:00Z",
    updatedAt: "2026-09-06T14:00:00Z",
    riskScore: 45,
  },
  {
    id: "INV-00007",
    title: "Gifting Card Fraud - Blackwell Account",
    status: "IN_PROGRESS",
    priority: 2,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0013"],
    transactionIds: ["TXN-00025", "TXN-00026"],
    findings: [
      "Account only 35 days old with $98,400 total spending",
      "Mix of high-risk categories (gaming, luxury auction)",
      "Multi-country activity in Kenya and UAE",
      "Possible money mule account",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Checking if account matches money mule recruitment pattern. Social media analysis underway.", createdAt: "2026-09-08T08:00:00Z" },
    ],
    createdAt: "2026-09-07T17:00:00Z",
    updatedAt: "2026-09-08T08:00:00Z",
    riskScore: 62,
  },
  {
    id: "INV-00008",
    title: "Cross-Border Electronics Fraud Ring",
    status: "CLOSED_FRAUD",
    priority: 1,
    assignedTo: "Gule Sakeena",
    customerIds: ["CUST-0005", "CUST-0017", "CUST-0024"],
    transactionIds: ["TXN-00007", "TXN-00031", "TXN-00042"],
    findings: [
      "All three accounts purchased high-value electronics for resale",
      "Devices show overlapping fingerprint characteristics",
      "All accounts funded via different stolen credit cards",
      "Law enforcement referral submitted - case #LE-2026-4412",
    ],
    notes: [
      { author: "Gule Sakeena", content: "Confirmed fraud ring. Law enforcement has been notified. All accounts permanently suspended.", createdAt: "2026-09-07T16:00:00Z" },
    ],
    createdAt: "2026-09-07T08:00:00Z",
    updatedAt: "2026-09-07T16:00:00Z",
    riskScore: 95,
  },
  {
    id: "INV-00009",
    title: "Cryptocurrency Laundering - Hassan Account",
    status: "OPEN",
    priority: 3,
    assignedTo: "Raj Mehta",
    customerIds: ["CUST-0015"],
    transactionIds: ["TXN-00028", "TXN-00029"],
    findings: [
      "Large bank transfers converted to cryptocurrency",
      "Amounts structured just below $15,000 reporting threshold",
      "Customer has made similar pattern 3 times in 6 months",
    ],
    notes: [],
    createdAt: "2026-09-07T14:00:00Z",
    updatedAt: "2026-09-07T14:00:00Z",
    riskScore: 38,
  },
  {
    id: "INV-00010",
    title: "Account Age Anomaly - Santos & Okafor",
    status: "CLOSED_FALSE_POSITIVE",
    priority: 4,
    assignedTo: "Raj Mehta",
    customerIds: ["CUST-0025", "CUST-0021"],
    transactionIds: ["TXN-00045", "TXN-00038"],
    findings: [
      "Both accounts flagged for moderate spending patterns",
      "Investigation determined both are legitimate long-term customers",
      "Location anomalies explained by recent relocations",
    ],
    notes: [
      { author: "Raj Mehta", content: "Both customers confirmed via email verification. False positives due to address changes.", createdAt: "2026-09-08T10:00:00Z" },
    ],
    createdAt: "2026-09-07T18:00:00Z",
    updatedAt: "2026-09-08T10:00:00Z",
    riskScore: 15,
  },
  {
    id: "INV-00011",
    title: "Subscription Fraud Ring Detection",
    status: "OPEN",
    priority: 4,
    assignedTo: null,
    customerIds: [],
    transactionIds: ["TXN-00011", "TXN-00020"],
    findings: [
      "Potential pattern of stolen cards used for recurring subscriptions",
      "Low individual amounts but high volume across platform",
      "Under investigation - more data needed",
    ],
    notes: [],
    createdAt: "2026-09-08T06:00:00Z",
    updatedAt: "2026-09-08T06:00:00Z",
    riskScore: 25,
  },
  {
    id: "INV-00012",
    title: "Payment Method Switching - Harrison Account",
    status: "CLOSED_RESOLVED",
    priority: 4,
    assignedTo: "Raj Mehta",
    customerIds: ["CUST-0026"],
    transactionIds: ["TXN-00046"],
    findings: [
      "Customer switched payment methods mid-transaction",
      "First card was declined, second card succeeded",
      "Investigation revealed first card had insufficient funds",
      "No fraud - legitimate customer behavior",
    ],
    notes: [
      { author: "Raj Mehta", content: "Customer confirmed first card was maxed out. Resolved as false positive.", createdAt: "2026-09-08T12:00:00Z" },
    ],
    createdAt: "2026-09-08T10:00:00Z",
    updatedAt: "2026-09-08T12:00:00Z",
    riskScore: 10,
  },
];




// ============================================================================
// DEVICES (18)
// ============================================================================

export const devices: DeviceRecord[] = [
  { id: "DEV-00A1B2", customerIds: ["CUST-0001"], totalTransactions: 45, suspiciousTransactions: 0, riskScore: 5, riskLevel: "LOW", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T10:15:00Z", firstSeenAt: "2024-01-20T08:00:00Z", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true },
  { id: "DEV-00B2D4", customerIds: ["CUST-0002"], totalTransactions: 60, suspiciousTransactions: 0, riskScore: 4, riskLevel: "LOW", locations: [{ city: "San Francisco", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T14:00:00Z", firstSeenAt: "2022-11-25T10:00:00Z", type: "Desktop", os: "macOS 15", browser: "Safari", isKnown: true },
  { id: "DEV-00C3G7", customerIds: ["CUST-0003"], totalTransactions: 34, suspiciousTransactions: 3, riskScore: 45, riskLevel: "MEDIUM", locations: [{ city: "Dubai", country: "UAE", countryCode: "AE" }], lastSeenAt: "2026-09-05T10:15:00Z", firstSeenAt: "2026-04-10T09:00:00Z", type: "Desktop", os: "Windows 11", browser: "Chrome", isKnown: true },
  { id: "DEV-00D4H8", customerIds: ["CUST-0004"], totalTransactions: 150, suspiciousTransactions: 0, riskScore: 2, riskLevel: "LOW", locations: [{ city: "Chicago", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T07:30:00Z", firstSeenAt: "2021-10-15T12:00:00Z", type: "Desktop", os: "Windows 11", browser: "Edge", isKnown: true },
  { id: "DEV-00E5J0", customerIds: ["CUST-0005"], totalTransactions: 8, suspiciousTransactions: 4, riskScore: 82, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T02:30:00Z", firstSeenAt: "2026-07-30T10:00:00Z", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: true },
  { id: "DEV-00E5K1", customerIds: ["CUST-0005"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 91, riskLevel: "HIGH", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T03:10:00Z", firstSeenAt: "2026-09-07T03:10:00Z", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false },
  { id: "DEV-00I9R8", customerIds: ["CUST-0009"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 95, riskLevel: "HIGH", locations: [{ city: "Moscow", country: "Russia", countryCode: "RU" }], lastSeenAt: "2026-09-06T03:00:00Z", firstSeenAt: "2026-08-12T01:00:00Z", type: "Desktop", os: "Linux", browser: "Tor Browser", isKnown: false },
  { id: "DEV-00I9S9", customerIds: ["CUST-0009"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 97, riskLevel: "HIGH", locations: [{ city: "Berlin", country: "Germany", countryCode: "DE" }], lastSeenAt: "2026-09-06T03:45:00Z", firstSeenAt: "2026-09-06T03:45:00Z", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false },
  { id: "DEV-00I9V2", customerIds: ["CUST-0009", "CUST-0024"], totalTransactions: 8, suspiciousTransactions: 8, riskScore: 98, riskLevel: "HIGH", locations: [{ city: "Amsterdam", country: "Netherlands", countryCode: "NL" }, { city: "London", country: "United Kingdom", countryCode: "GB" }], lastSeenAt: "2026-09-07T05:30:00Z", firstSeenAt: "2026-08-15T02:00:00Z", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: false },
  { id: "DEV-00Q7H4", customerIds: ["CUST-0017"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 89, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T22:00:00Z", firstSeenAt: "2026-08-21T10:00:00Z", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: false },
  { id: "DEV-00Q7I5", customerIds: ["CUST-0017"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 94, riskLevel: "HIGH", locations: [{ city: "Las Vegas", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T23:30:00Z", firstSeenAt: "2026-09-06T23:30:00Z", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false },
  { id: "DEV-00Q7J6", customerIds: ["CUST-0017"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 91, riskLevel: "HIGH", locations: [{ city: "Bogota", country: "Colombia", countryCode: "CO" }], lastSeenAt: "2026-09-07T01:00:00Z", firstSeenAt: "2026-09-07T01:00:00Z", type: "Tablet", os: "iPadOS 19", browser: "Safari", isKnown: false },
  { id: "DEV-00X4S5", customerIds: ["CUST-0024"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 96, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T01:00:00Z", firstSeenAt: "2026-08-26T10:00:00Z", type: "Desktop", os: "Windows 10", browser: "Chrome", isKnown: false },
  { id: "DEV-00X4T6", customerIds: ["CUST-0024"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 98, riskLevel: "HIGH", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T01:45:00Z", firstSeenAt: "2026-09-06T01:45:00Z", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false },
  { id: "DEV-00AF1", customerIds: ["CUST-0032"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 75, riskLevel: "HIGH", locations: [{ city: "Stockholm", country: "Sweden", countryCode: "SE" }], lastSeenAt: "2026-09-07T12:00:00Z", firstSeenAt: "2026-08-01T06:00:00Z", type: "Desktop", os: "Linux", browser: "Tor Browser", isKnown: false },
  { id: "DEV-00AF2", customerIds: ["CUST-0032"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 70, riskLevel: "HIGH", locations: [{ city: "Copenhagen", country: "Denmark", countryCode: "DK" }], lastSeenAt: "2026-09-07T13:30:00Z", firstSeenAt: "2026-09-07T13:30:00Z", type: "Mobile", os: "Android 15", browser: "Chrome Mobile", isKnown: false },
  { id: "DEV-00R8K7", customerIds: ["CUST-0018"], totalTransactions: 120, suspiciousTransactions: 0, riskScore: 3, riskLevel: "LOW", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T11:30:00Z", firstSeenAt: "2022-04-20T10:00:00Z", type: "Mobile", os: "iOS 19", browser: "Safari", isKnown: true },
];

// ============================================================================
// IP ADDRESSES (18)
// ============================================================================

export const ipAddresses: IpRecord[] = [
  { ip: "192.168.1.101", customerIds: ["CUST-0001"], totalTransactions: 45, suspiciousTransactions: 0, riskScore: 5, riskLevel: "LOW", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T10:15:00Z", isVPN: false, isProxy: false, isTor: false, country: "United States", city: "New York" },
  { ip: "172.16.0.88", customerIds: ["CUST-0002"], totalTransactions: 60, suspiciousTransactions: 0, riskScore: 4, riskLevel: "LOW", locations: [{ city: "San Francisco", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-08T14:00:00Z", isVPN: false, isProxy: false, isTor: false, country: "United States", city: "San Francisco" },
  { ip: "45.33.12.87", customerIds: ["CUST-0003", "CUST-0015", "CUST-0030"], totalTransactions: 12, suspiciousTransactions: 3, riskScore: 42, riskLevel: "MEDIUM", locations: [{ city: "Dubai", country: "UAE", countryCode: "AE" }], lastSeenAt: "2026-09-07T10:00:00Z", isVPN: false, isProxy: false, isTor: false, country: "UAE", city: "Dubai" },
  { ip: "185.220.101.1", customerIds: ["CUST-0009"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 98, riskLevel: "HIGH", locations: [{ city: "Moscow", country: "Russia", countryCode: "RU" }], lastSeenAt: "2026-09-06T03:00:00Z", isVPN: true, isProxy: false, isTor: true, country: "Russia", city: "Moscow" },
  { ip: "185.220.101.2", customerIds: ["CUST-0009"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 97, riskLevel: "HIGH", locations: [{ city: "Berlin", country: "Germany", countryCode: "DE" }], lastSeenAt: "2026-09-06T03:45:00Z", isVPN: true, isProxy: false, isTor: true, country: "Germany", city: "Berlin" },
  { ip: "185.220.101.5", customerIds: ["CUST-0024"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 96, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T01:00:00Z", isVPN: true, isProxy: false, isTor: true, country: "United States", city: "Miami" },
  { ip: "185.220.101.6", customerIds: ["CUST-0024"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 98, riskLevel: "HIGH", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T01:45:00Z", isVPN: true, isProxy: false, isTor: true, country: "United States", city: "New York" },
  { ip: "185.220.101.33", customerIds: ["CUST-0032"], totalTransactions: 3, suspiciousTransactions: 3, riskScore: 75, riskLevel: "HIGH", locations: [{ city: "Stockholm", country: "Sweden", countryCode: "SE" }, { city: "Oslo", country: "Norway", countryCode: "NO" }], lastSeenAt: "2026-09-07T15:00:00Z", isVPN: true, isProxy: false, isTor: false, country: "Sweden", city: "Stockholm" },
  { ip: "185.220.101.55", customerIds: ["CUST-0011"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 68, riskLevel: "MEDIUM", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T22:30:00Z", isVPN: true, isProxy: false, isTor: false, country: "United States", city: "New York" },
  { ip: "185.220.101.66", customerIds: ["CUST-0028"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 62, riskLevel: "MEDIUM", locations: [{ city: "Melbourne", country: "Australia", countryCode: "AU" }], lastSeenAt: "2026-09-07T04:30:00Z", isVPN: true, isProxy: false, isTor: false, country: "Australia", city: "Melbourne" },
  { ip: "185.220.101.88", customerIds: ["CUST-0017"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 94, riskLevel: "HIGH", locations: [{ city: "Las Vegas", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-06T23:30:00Z", isVPN: true, isProxy: false, isTor: true, country: "United States", city: "Las Vegas" },
  { ip: "185.220.101.99", customerIds: ["CUST-0005"], totalTransactions: 1, suspiciousTransactions: 1, riskScore: 88, riskLevel: "HIGH", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T03:45:00Z", isVPN: true, isProxy: false, isTor: true, country: "United States", city: "New York" },
  { ip: "198.51.100.22", customerIds: ["CUST-0005"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 91, riskLevel: "HIGH", locations: [{ city: "New York", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T03:10:00Z", isVPN: true, isProxy: false, isTor: false, country: "United States", city: "New York" },
  { ip: "198.51.100.77", customerIds: ["CUST-0013"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 78, riskLevel: "HIGH", locations: [{ city: "Dubai", country: "UAE", countryCode: "AE" }], lastSeenAt: "2026-09-07T16:30:00Z", isVPN: true, isProxy: false, isTor: false, country: "UAE", city: "Dubai" },
  { ip: "198.51.100.88", customerIds: ["CUST-0024"], totalTransactions: 1, suspiciousTransactions: 1, riskScore: 94, riskLevel: "HIGH", locations: [{ city: "London", country: "United Kingdom", countryCode: "GB" }], lastSeenAt: "2026-09-06T02:30:00Z", isVPN: false, isProxy: false, isTor: false, country: "United Kingdom", city: "London" },
  { ip: "203.0.113.45", customerIds: ["CUST-0005"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 82, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T04:20:00Z", isVPN: false, isProxy: false, isTor: false, country: "United States", city: "Miami" },
  { ip: "203.0.113.12", customerIds: ["CUST-0017"], totalTransactions: 2, suspiciousTransactions: 2, riskScore: 89, riskLevel: "HIGH", locations: [{ city: "Miami", country: "United States", countryCode: "US" }], lastSeenAt: "2026-09-07T01:00:00Z", isVPN: false, isProxy: false, isTor: false, country: "United States", city: "Miami" },
];

// ============================================================================
// LOCATIONS (18)
// ============================================================================

export const locations: LocationRecord[] = [
  { city: "New York", country: "United States", countryCode: "US", transactionCount: 18, suspiciousCount: 12, riskScore: 72, customers: ["CUST-0001", "CUST-0005", "CUST-0018", "CUST-0024"] },
  { city: "Miami", country: "United States", countryCode: "US", transactionCount: 8, suspiciousCount: 7, riskScore: 85, customers: ["CUST-0005", "CUST-0017", "CUST-0024"] },
  { city: "San Francisco", country: "United States", countryCode: "US", transactionCount: 6, suspiciousCount: 0, riskScore: 5, customers: ["CUST-0002"] },
  { city: "Dubai", country: "UAE", countryCode: "AE", transactionCount: 8, suspiciousCount: 4, riskScore: 55, customers: ["CUST-0003", "CUST-0013", "CUST-0015"] },
  { city: "Moscow", country: "Russia", countryCode: "RU", transactionCount: 3, suspiciousCount: 3, riskScore: 98, customers: ["CUST-0009"] },
  { city: "Berlin", country: "Germany", countryCode: "DE", transactionCount: 4, suspiciousCount: 3, riskScore: 70, customers: ["CUST-0009", "CUST-0020"] },
  { city: "London", country: "United Kingdom", countryCode: "GB", transactionCount: 5, suspiciousCount: 2, riskScore: 45, customers: ["CUST-0003", "CUST-0008", "CUST-0024"] },
  { city: "Tokyo", country: "Japan", countryCode: "JP", transactionCount: 4, suspiciousCount: 0, riskScore: 3, customers: ["CUST-0007", "CUST-0010", "CUST-0019"] },
  { city: "Singapore", country: "Singapore", countryCode: "SG", transactionCount: 3, suspiciousCount: 0, riskScore: 4, customers: ["CUST-0006"] },
  { city: "Paris", country: "France", countryCode: "FR", transactionCount: 4, suspiciousCount: 0, riskScore: 5, customers: ["CUST-0012", "CUST-0023"] },
  { city: "Las Vegas", country: "United States", countryCode: "US", transactionCount: 4, suspiciousCount: 3, riskScore: 88, customers: ["CUST-0017", "CUST-0022", "CUST-0024"] },
  { city: "Nairobi", country: "Kenya", countryCode: "KE", transactionCount: 2, suspiciousCount: 1, riskScore: 65, customers: ["CUST-0013"] },
  { city: "Stockholm", country: "Sweden", countryCode: "SE", transactionCount: 3, suspiciousCount: 3, riskScore: 75, customers: ["CUST-0032"] },
  { city: "Bogota", country: "Colombia", countryCode: "CO", transactionCount: 2, suspiciousCount: 2, riskScore: 91, customers: ["CUST-0017"] },
  { city: "Sydney", country: "Australia", countryCode: "AU", transactionCount: 2, suspiciousCount: 1, riskScore: 45, customers: ["CUST-0028"] },
  { city: "Seoul", country: "South Korea", countryCode: "KR", transactionCount: 2, suspiciousCount: 0, riskScore: 7, customers: ["CUST-0007"] },
  { city: "Toronto", country: "Canada", countryCode: "CA", transactionCount: 3, suspiciousCount: 0, riskScore: 7, customers: ["CUST-0014"] },
  { city: "Sao Paulo", country: "Brazil", countryCode: "BR", transactionCount: 2, suspiciousCount: 0, riskScore: 4, customers: ["CUST-0025"] },
];




// ============================================================================
// FRAUD PATTERNS (8)
// ============================================================================

export const fraudPatterns: FraudPattern[] = [
  {
    id: "FP-001",
    type: "velocity",
    title: "Rapid Multi-Device Transactions",
    description: "Multiple transactions from different devices within a short timeframe, indicating potential account takeover or card testing.",
    incidentCount: 47,
    trend: 12.5,
    severity: "HIGH",
    status: "ACTIVE",
    examples: ["CUST-0005: 4 devices in 90 minutes", "CUST-0024: 6 devices in 24 hours", "CUST-0009: 5 devices in 48 hours"],
  },
  {
    id: "FP-002",
    type: "location",
    title: "Impossible Travel Detection",
    description: "Transactions occurring in geographically distant locations within timeframes that make physical travel impossible.",
    incidentCount: 23,
    trend: 8.3,
    severity: "CRITICAL",
    status: "ACTIVE",
    examples: ["Moscow to Berlin in 45 min (CUST-0009)", "New York to London in 45 min (CUST-0024)", "Miami to New York in 35 min (CUST-0005)"],
  },
  {
    id: "FP-003",
    type: "anonymization",
    title: "Tor/VPN Anonymization Chain",
    description: "Use of Tor browser combined with VPN services, often followed by high-value cryptocurrency purchases.",
    incidentCount: 31,
    trend: 22.0,
    severity: "HIGH",
    status: "ACTIVE",
    examples: ["Tor + VPN + $14,999 crypto (CUST-0009)", "Tor + VPN + $9,800 crypto (CUST-0032)", "VPN chain across 3 countries (CUST-0032)"],
  },
  {
    id: "FP-004",
    type: "card_testing",
    title: "Card Testing with Escalation",
    description: "Small initial transactions to test card validity, followed by increasingly larger purchases often involving gift cards or electronics.",
    incidentCount: 18,
    trend: -5.2,
    severity: "HIGH",
    status: "MONITORING",
    examples: ["$89.99 -> $12,500 -> $8,900 (CUST-0005)", "Small purchases then $14,200 bulk (CUST-0017)", "Gift card + electronics combo (CUST-0005)"],
  },
  {
    id: "FP-005",
    type: "crypto_laundering",
    title: "Cryptocurrency Cash-Out Pattern",
    description: "High-value purchases funded by stolen cards immediately converted to cryptocurrency for money laundering.",
    incidentCount: 15,
    trend: 35.0,
    severity: "CRITICAL",
    status: "ACTIVE",
    examples: ["$11,800 -> BTC conversion (CUST-0017)", "$12,500 -> ETH (CUST-0024)", "$14,999 -> BTC (CUST-0009)"],
  },
  {
    id: "FP-006",
    type: "account_takeover",
    title: "Account Takeover Sequence",
    description: "Pattern of small test transactions after account creation, followed by high-value fraudulent purchases using the account's stored credentials.",
    incidentCount: 12,
    trend: 15.0,
    severity: "CRITICAL",
    status: "ACTIVE",
    examples: ["Small tests then $14,200 (CUST-0017)", "Small tests then $37,500 in 90 min (CUST-0024)", "35-day-old account with $98K spending (CUST-0013)"],
  },
  {
    id: "FP-007",
    type: "network",
    title: "Organized Fraud Ring",
    description: "Multiple accounts sharing devices, IP addresses, or behavioral patterns, indicating coordinated criminal activity.",
    incidentCount: 8,
    trend: 0.0,
    severity: "CRITICAL",
    status: "ACTIVE",
    examples: ["Petrov-Wright device sharing ring", "Rodriguez-Morales-Wright electronics ring", "Nordics VPN cluster (CUST-0032 + CUST-0020)"],
  },
  {
    id: "FP-008",
    type: "velocity",
    title: "Cross-Border High-Value Velocity",
    description: "Rapid high-value transactions across multiple countries within hours, exceeding normal travel speed thresholds.",
    incidentCount: 14,
    trend: 18.0,
    severity: "HIGH",
    status: "ACTIVE",
    examples: ["Kenya -> UAE in 2.5 hours (CUST-0013)", "Sweden -> Denmark -> Norway in 3 hours (CUST-0032)", "Miami -> NYC -> London in 3 hours (CUST-0024)"],
  },
];

// ============================================================================
// NETWORK NODES (15)
// ============================================================================

export const networkNodes: NetworkNode[] = [
  { id: "CUST-0009", type: "customer", label: "Viktor Petrov", riskScore: 88, data: { status: "SUSPENDED", totalFraud: 37299 } },
  { id: "CUST-0024", type: "customer", label: "Tyler Wright", riskScore: 91, data: { status: "SUSPENDED", totalFraud: 37500 } },
  { id: "CUST-0005", type: "customer", label: "Carlos Rodriguez", riskScore: 72, data: { status: "FLAGGED", totalFraud: 31350 } },
  { id: "CUST-0017", type: "customer", label: "Diego Morales", riskScore: 79, data: { status: "SUSPENDED", totalFraud: 34400 } },
  { id: "DEV-00I9V2", type: "device", label: "Shared Device (CUST-0009/0024)", riskScore: 98, data: { sharedBetween: ["CUST-0009", "CUST-0024"] } },
  { id: "DEV-00I9R8", type: "device", label: "Tor Desktop (Moscow)", riskScore: 95, data: { os: "Linux", browser: "Tor Browser" } },
  { id: "DEV-00X4S5", type: "device", label: "Desktop (Miami)", riskScore: 96, data: { os: "Windows 10", browser: "Chrome" } },
  { id: "DEV-00Q7H4", type: "device", label: "Desktop (Miami)", riskScore: 89, data: { os: "Windows 10", browser: "Chrome" } },
  { id: "185.220.101.1", type: "ip", label: "Tor Exit (Moscow)", riskScore: 98, data: { isTor: true, isVPN: true } },
  { id: "185.220.101.5", type: "ip", label: "Tor Exit (Miami)", riskScore: 96, data: { isTor: true, isVPN: true } },
  { id: "185.220.101.6", type: "ip", label: "Tor Exit (NYC)", riskScore: 98, data: { isTor: true, isVPN: true } },
  { id: "185.220.101.88", type: "ip", label: "VPN Exit (Las Vegas)", riskScore: 94, data: { isTor: true, isVPN: true } },
  { id: "TXN-00013", type: "transaction", label: "TXN-00013 ($14,999)", riskScore: 95, data: { amount: 14999, merchant: "Coinbase" } },
  { id: "TXN-00042", type: "transaction", label: "TXN-00042 ($14,800)", riskScore: 96, data: { amount: 14800, merchant: "Apple Store" } },
  { id: "LOC-miami", type: "location", label: "Miami", riskScore: 85, data: { fraudTransactions: 7 } },
];

// ============================================================================
// NETWORK EDGES (14)
// ============================================================================

export const networkEdges: NetworkEdge[] = [
  { source: "CUST-0009", target: "DEV-00I9V2", relationship: "uses_device", weight: 0.95 },
  { source: "CUST-0024", target: "DEV-00I9V2", relationship: "uses_device", weight: 0.95 },
  { source: "CUST-0009", target: "185.220.101.1", relationship: "uses_ip", weight: 0.9 },
  { source: "CUST-0024", target: "185.220.101.5", relationship: "uses_ip", weight: 0.9 },
  { source: "CUST-0024", target: "185.220.101.6", relationship: "uses_ip", weight: 0.9 },
  { source: "CUST-0009", target: "TXN-00013", relationship: "made_transaction", weight: 0.85 },
  { source: "CUST-0024", target: "TXN-00042", relationship: "made_transaction", weight: 0.85 },
  { source: "CUST-0005", target: "DEV-00Q7H4", relationship: "uses_device", weight: 0.8 },
  { source: "CUST-0017", target: "DEV-00Q7H4", relationship: "shares_device_pattern", weight: 0.7 },
  { source: "CUST-0005", target: "LOC-miami", relationship: "transacts_in", weight: 0.75 },
  { source: "CUST-0017", target: "LOC-miami", relationship: "transacts_in", weight: 0.8 },
  { source: "CUST-0024", target: "LOC-miami", relationship: "transacts_in", weight: 0.85 },
  { source: "185.220.101.88", target: "CUST-0017", relationship: "used_by", weight: 0.85 },
  { source: "DEV-00I9R8", target: "185.220.101.1", relationship: "connected_via", weight: 0.95 },
];

// ============================================================================
// RULES (10)
// ============================================================================

export const rules: Rule[] = [
  {
    id: "RULE-001",
    name: "High-Value Transaction Alert",
    description: "Trigger when a single transaction exceeds the specified threshold.",
    condition: "IF transaction.amount > 10000 THEN alert(severity: HIGH)",
    enabled: true,
    priority: 1,
    triggeredCount: 142,
    lastTriggeredAt: "2026-09-08T10:00:00Z",
    severity: "HIGH",
    action: "Block transaction and create HIGH severity alert",
  },
  {
    id: "RULE-002",
    name: "Velocity Check - Transactions Per Hour",
    description: "Trigger when customer makes more than 3 transactions within 1 hour.",
    condition: "IF customer.transactions_1h > 3 THEN alert(severity: HIGH)",
    enabled: true,
    priority: 1,
    triggeredCount: 89,
    lastTriggeredAt: "2026-09-07T03:10:00Z",
    severity: "HIGH",
    action: "Block remaining transactions and create alert for review",
  },
  {
    id: "RULE-003",
    name: "New Device Detection",
    description: "Trigger when a transaction originates from a previously unseen device.",
    condition: "IF device.isKnown == false THEN flag(new_device) + score(+15)",
    enabled: true,
    priority: 2,
    triggeredCount: 234,
    lastTriggeredAt: "2026-09-08T12:00:00Z",
    severity: "MEDIUM",
    action: "Add risk score +15 and flag transaction for review",
  },
  {
    id: "RULE-004",
    name: "VPN/Tor Detection",
    description: "Trigger when transaction uses VPN or Tor exit node.",
    condition: "IF ip.isVPN == true OR ip.isTor == true THEN flag(vpn_detected) + score(+20)",
    enabled: true,
    priority: 2,
    triggeredCount: 178,
    lastTriggeredAt: "2026-09-07T15:00:00Z",
    severity: "MEDIUM",
    action: "Add risk score +20 and flag for enhanced monitoring",
  },
  {
    id: "RULE-005",
    name: "Impossible Travel Detection",
    description: "Trigger when geographic velocity exceeds 500 mph between transactions.",
    condition: "IF geo_velocity > 500mph THEN alert(severity: CRITICAL)",
    enabled: true,
    priority: 1,
    triggeredCount: 23,
    lastTriggeredAt: "2026-09-06T03:46:00Z",
    severity: "CRITICAL",
    action: "Block transaction and escalate to fraud team immediately",
  },
  {
    id: "RULE-006",
    name: "New Account High-Value Purchase",
    description: "Trigger when account < 30 days old makes purchase > $5,000.",
    condition: "IF customer.accountAge < 30 AND transaction.amount > 5000 THEN alert(severity: HIGH)",
    enabled: true,
    priority: 2,
    triggeredCount: 31,
    lastTriggeredAt: "2026-09-07T02:30:00Z",
    severity: "HIGH",
    action: "Hold transaction for manual review",
  },
  {
    id: "RULE-007",
    name: "Crypto Exchange Threshold",
    description: "Trigger when cumulative crypto exchange purchases exceed $5,000 in 24 hours.",
    condition: "IF crypto_24h_total > 5000 THEN alert(severity: MEDIUM)",
    enabled: true,
    priority: 3,
    triggeredCount: 56,
    lastTriggeredAt: "2026-09-07T12:00:00Z",
    severity: "MEDIUM",
    action: "Flag account for enhanced monitoring and limit crypto purchases",
  },
  {
    id: "RULE-008",
    name: "Multiple Payment Method Switch",
    description: "Trigger when customer uses 3+ different payment methods within 24 hours.",
    condition: "IF distinct_payment_methods_24h > 3 THEN flag(multi_payment_method) + score(+25)",
    enabled: true,
    priority: 2,
    triggeredCount: 45,
    lastTriggeredAt: "2026-09-07T04:20:00Z",
    severity: "MEDIUM",
    action: "Block further transactions and require identity re-verification",
  },
  {
    id: "RULE-009",
    name: "Known Fraud Device Match",
    description: "Trigger when transaction uses a device associated with confirmed fraud.",
    condition: "IF device.fraudAssociation > 0 THEN block() + alert(severity: CRITICAL)",
    enabled: true,
    priority: 1,
    triggeredCount: 8,
    lastTriggeredAt: "2026-09-06T01:00:00Z",
    severity: "CRITICAL",
    action: "Immediately block transaction and suspend account pending investigation",
  },
  {
    id: "RULE-010",
    name: "Gift Card Velocity",
    description: "Trigger when gift card purchases exceed $1,000 in a single transaction.",
    condition: "IF transaction.merchantCategory == 'Gift Cards' AND transaction.amount > 1000 THEN alert(severity: HIGH)",
    enabled: true,
    priority: 2,
    triggeredCount: 22,
    lastTriggeredAt: "2026-09-07T04:21:00Z",
    severity: "HIGH",
    action: "Block gift card purchase and flag for review",
  },
];

// ============================================================================
// REPORTS (8)
// ============================================================================

export const reports: Report[] = [
  { id: "RPT-001", name: "Daily Fraud Summary", description: "Overview of all fraud-related activity for the current day", type: "alert", frequency: "Daily", lastGenerated: "2026-09-08T06:00:00Z" },
  { id: "RPT-002", name: "Weekly Transaction Analysis", description: "Comprehensive analysis of transaction patterns and anomalies", type: "transaction", frequency: "Weekly", lastGenerated: "2026-09-01T06:00:00Z" },
  { id: "RPT-003", name: "High-Risk Customer Report", description: "List of customers with risk scores above 60", type: "customer", frequency: "Daily", lastGenerated: "2026-09-08T06:00:00Z" },
  { id: "RPT-004", name: "Investigation Progress Report", description: "Status update on all open investigations", type: "investigation", frequency: "Weekly", lastGenerated: "2026-09-01T06:00:00Z" },
  { id: "RPT-005", name: "Fraud Trend Analysis", description: "Month-over-month trend analysis of fraud patterns", type: "fraud_trend", frequency: "Monthly", lastGenerated: "2026-09-01T06:00:00Z" },
  { id: "RPT-006", name: "Network Analysis Report", description: "Graph analysis of fraud network connections", type: "network", frequency: "Weekly", lastGenerated: "2026-09-01T06:00:00Z" },
  { id: "RPT-007", name: "PCI DSS Compliance Report", description: "Compliance metrics and audit trail for PCI DSS requirements", type: "compliance", frequency: "Monthly", lastGenerated: "2026-09-01T06:00:00Z" },
  { id: "RPT-008", name: "Geo-Risk Heatmap", description: "Geographic distribution of fraud risk across all locations", type: "transaction", frequency: "Daily", lastGenerated: "2026-09-08T06:00:00Z" },
];

// ============================================================================
// AI INSIGHTS (6)
// ============================================================================

export const aiInsights: AiInsight[] = [
  {
    id: "AI-001",
    title: "Emerging Fraud Ring Detected",
    description: "Machine learning model identified a potential new fraud ring connecting 4 previously unrelated accounts through shared device fingerprints and timing patterns. The ring appears to be testing stolen credentials before making high-value purchases.",
    severity: "CRITICAL",
    category: "Network Analysis",
    relatedEntities: ["CUST-0009", "CUST-0024", "CUST-0005", "CUST-0017", "DEV-00I9V2"],
    investigatedAt: "2026-09-07T15:00:00Z",
  },
  {
    id: "AI-002",
    title: "Cryptocurrency Laundering Pattern Spike",
    description: "Detected 35% increase in crypto exchange purchases immediately following high-value card transactions over the past 7 days. Pattern suggests organized group converting stolen funds to cryptocurrency to evade detection.",
    severity: "HIGH",
    category: "Behavioral Analysis",
    relatedEntities: ["CUST-0009", "CUST-0017", "CUST-0024", "CUST-0032"],
    investigatedAt: "2026-09-08T09:00:00Z",
  },
  {
    id: "AI-003",
    title: "Anomalous Account Age Cluster",
    description: "6 accounts created in the last 60 days collectively spent $428,000, which is 12x the normal rate for new accounts. Cross-referencing with darknet credential dumps suggests these accounts were purchased with stolen identities.",
    severity: "HIGH",
    category: "Account Risk",
    relatedEntities: ["CUST-0005", "CUST-0009", "CUST-0013", "CUST-0017", "CUST-0024", "CUST-0032"],
    investigatedAt: null,
  },
  {
    id: "AI-004",
    title: "Tor Exit Node Correlation",
    description: "3 accounts (CUST-0009, CUST-0024, CUST-0032) are routing through the same cluster of Tor exit nodes in the 185.220.101.x range. Temporal analysis shows synchronized activity windows, suggesting shared infrastructure.",
    severity: "CRITICAL",
    category: "Network Analysis",
    relatedEntities: ["CUST-0009", "CUST-0024", "CUST-0032", "185.220.101.1", "185.220.101.5", "185.220.101.33"],
    investigatedAt: "2026-09-07T10:00:00Z",
  },
  {
    id: "AI-005",
    title: "Predicted Account Compromise Risk",
    description: "Model predicts 78% probability that CUST-0011 (Marcus Johnson) will experience account compromise within the next 7 days based on behavioral drift pattern. Recommend proactive security measures.",
    severity: "MEDIUM",
    category: "Predictive",
    relatedEntities: ["CUST-0011"],
    investigatedAt: null,
  },
  {
    id: "AI-006",
    title: "Geo-Velocity Anomaly Trend",
    description: "Detected increasing trend of impossible travel events (18% increase over 30 days). Most incidents involve Nordics region and UAE, suggesting coordinated fraud operation targeting these corridors.",
    severity: "MEDIUM",
    category: "Geographic Analysis",
    relatedEntities: ["CUST-0032", "CUST-0013", "CUST-0017", "LOC-mumbai", "LOC-stockholm"],
    investigatedAt: null,
  },
];

// ============================================================================
// TIMELINE EVENTS (Investigation INV-00001)
// ============================================================================

export const timelineEvents: TimelineEvent[] = [
  { id: "TE-001", timestamp: "2026-08-11T03:45:00Z", type: "system", title: "Account Created", description: "CUST-0009 (Viktor Petrov) account created via web registration", author: null, metadata: { customerId: "CUST-0009" } },
  { id: "TE-002", timestamp: "2026-08-11T04:00:00Z", type: "transaction", title: "First Transaction", description: "Small test transaction of $45.00 at Amazon", author: null, metadata: { transactionId: "TXN-00056", amount: 45.00 } },
  { id: "TE-003", timestamp: "2026-08-25T02:00:00Z", type: "system", title: "Account Created", description: "CUST-0024 (Tyler Wright) account created via web registration", author: null, metadata: { customerId: "CUST-0024" } },
  { id: "TE-004", timestamp: "2026-09-06T01:00:00Z", type: "transaction", title: "High-Value Transaction Blocked", description: "TXN-00042: $14,800 Apple Store purchase blocked - VPN detected on new device", author: null, metadata: { transactionId: "TXN-00042", amount: 14800, blocked: true } },
  { id: "TE-005", timestamp: "2026-09-06T01:01:00Z", type: "alert", title: "Critical Alert Generated", description: "ALT-00006: Fraud Network Connection Detected - shared device with CUST-0009", author: null, metadata: { alertId: "ALT-00006", severity: "CRITICAL" } },
  { id: "TE-006", timestamp: "2026-09-06T01:45:00Z", type: "transaction", title: "High-Value Transaction Blocked", description: "TXN-00043: $12,500 Binance crypto purchase blocked - VPN + new device", author: null, metadata: { transactionId: "TXN-00043", amount: 12500, blocked: true } },
  { id: "TE-007", timestamp: "2026-09-06T02:30:00Z", type: "transaction", title: "Impossible Travel Detected", description: "TXN-00044: $10,200 purchase in London 45 min after NYC transaction", author: null, metadata: { transactionId: "TXN-00044", amount: 10200, blocked: true } },
  { id: "TE-008", timestamp: "2026-09-06T03:00:00Z", type: "transaction", title: "High-Value Transaction Blocked", description: "TXN-00013: $14,999 Coinbase crypto purchase from Moscow via Tor", author: null, metadata: { transactionId: "TXN-00013", amount: 14999, blocked: true } },
  { id: "TE-009", timestamp: "2026-09-06T03:45:00Z", type: "alert", title: "Critical Alert Generated", description: "ALT-00004: Impossible Travel - Berlin to Moscow in 45 min", author: null, metadata: { alertId: "ALT-00004", severity: "CRITICAL" } },
  { id: "TE-010", timestamp: "2026-09-06T05:20:00Z", type: "transaction", title: "High-Value Transaction Blocked", description: "TXN-00015: $9,500 Newegg order from Amsterdam via VPN", author: null, metadata: { transactionId: "TXN-00015", amount: 9500, blocked: true } },
  { id: "TE-011", timestamp: "2026-09-06T18:00:00Z", type: "investigation", title: "Investigation Created", description: "INV-00001 opened: Multi-Account Fraud Ring - Petrov & Wright Network", author: "Gule Sakeena", metadata: { investigationId: "INV-00001" } },
  { id: "TE-012", timestamp: "2026-09-06T18:00:00Z", type: "note", title: "Analyst Note Added", description: "Confirmed device fingerprint match between DEV-00I9V2 and DEV-00X4V8. Escalating to law enforcement referral.", author: "Gule Sakeena", metadata: { investigationId: "INV-00001" } },
  { id: "TE-013", timestamp: "2026-09-07T10:00:00Z", type: "note", title: "Analyst Note Added", description: "Cross-referenced IP addresses with known Tor exit node list. Both clusters use the same anonymization infrastructure.", author: "Gule Sakeena", metadata: { investigationId: "INV-00001" } },
  { id: "TE-014", timestamp: "2026-09-07T15:00:00Z", type: "note", title: "Analyst Note Added", description: "Analyzed transaction timing - both actors coordinate purchases within 30-minute windows, suggesting real-time communication.", author: "Raj Mehta", metadata: { investigationId: "INV-00001" } },
  { id: "TE-015", timestamp: "2026-09-07T16:00:00Z", type: "system", title: "Accounts Suspended", description: "CUST-0009 and CUST-0024 accounts suspended pending investigation completion", author: "System", metadata: { action: "account_suspension" } },
  { id: "TE-016", timestamp: "2026-09-08T09:00:00Z", type: "investigation", title: "Investigation Updated", description: "Risk score updated to 97. Law enforcement referral in progress.", author: "Gule Sakeena", metadata: { investigationId: "INV-00001", newRiskScore: 97 } },
];





// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getTransaction(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id);
}

export function getCustomer(id: string): Customer | undefined {
  return customers.find((c) => c.id === id);
}

export function getAlert(id: string): Alert | undefined {
  return alerts.find((a) => a.id === id);
}

export function getInvestigation(id: string): Investigation | undefined {
  return investigations.find((i) => i.id === id);
}

export function getCustomerTransactions(customerId: string): Transaction[] {
  return transactions.filter((t) => t.customerId === customerId);
}

export function getAlertsByStatus(status: Alert["status"]): Alert[] {
  return alerts.filter((a) => a.status === status);
}

