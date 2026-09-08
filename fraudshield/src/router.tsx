import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AppLayout } from "@/layouts/app-layout"
import { PageLoader } from "@/components/ui/page-loader"

const LoginPage = lazy(() => import("@/pages/login"))
const DashboardPage = lazy(() => import("@/pages/dashboard"))
const TransactionsPage = lazy(() => import("@/pages/transactions"))
const TransactionDetailPage = lazy(() => import("@/pages/transaction-detail"))
const AlertsPage = lazy(() => import("@/pages/alerts"))
const AlertDetailPage = lazy(() => import("@/pages/alert-detail"))
const InvestigationsPage = lazy(() => import("@/pages/investigations"))
const InvestigationDetailPage = lazy(() => import("@/pages/investigation-detail"))
const CustomersPage = lazy(() => import("@/pages/customers"))
const CustomerRiskProfilePage = lazy(() => import("@/pages/customer-risk-profile"))
const DevicesPage = lazy(() => import("@/pages/devices"))
const IpIntelligencePage = lazy(() => import("@/pages/ip-intelligence"))
const LocationsPage = lazy(() => import("@/pages/locations"))
const FraudPatternsPage = lazy(() => import("@/pages/fraud-patterns"))
const FraudNetworkPage = lazy(() => import("@/pages/fraud-network"))
const AiAssistantPage = lazy(() => import("@/pages/ai-assistant"))
const AiInsightsPage = lazy(() => import("@/pages/ai-insights"))
const RulesEnginePage = lazy(() => import("@/pages/rules-engine"))
const ReportsPage = lazy(() => import("@/pages/reports"))
const CsvImportPage = lazy(() => import("@/pages/csv-import"))
const ApiIntegrationsPage = lazy(() => import("@/pages/api-integrations"))
const UsersRolesPage = lazy(() => import("@/pages/users-roles"))
const AuditLogsPage = lazy(() => import("@/pages/audit-logs"))
const SettingsPage = lazy(() => import("@/pages/settings"))

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route
          path="/*"
          element={
            <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="transactions" element={<TransactionsPage />} />
                  <Route path="transactions/:id" element={<TransactionDetailPage />} />
                  <Route path="alerts" element={<AlertsPage />} />
                  <Route path="alerts/:id" element={<AlertDetailPage />} />
                  <Route path="investigations" element={<InvestigationsPage />} />
                  <Route path="investigations/:id" element={<InvestigationDetailPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="customers/:id" element={<CustomerRiskProfilePage />} />
                  <Route path="devices" element={<DevicesPage />} />
                  <Route path="ip-intelligence" element={<IpIntelligencePage />} />
                  <Route path="locations" element={<LocationsPage />} />
                  <Route path="fraud-patterns" element={<FraudPatternsPage />} />
                  <Route path="fraud-network" element={<FraudNetworkPage />} />
                  <Route path="ai-assistant" element={<AiAssistantPage />} />
                  <Route path="ai-insights" element={<AiInsightsPage />} />
                  <Route path="rules-engine" element={<RulesEnginePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="csv-import" element={<CsvImportPage />} />
                  <Route path="api-integrations" element={<ApiIntegrationsPage />} />
                  <Route path="users-roles" element={<UsersRolesPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </AppLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}