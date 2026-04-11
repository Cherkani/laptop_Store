import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { AuthContext, useAuthState } from '@/features/auth/hooks/useAuth'
import { MainLayout } from '@/components/layout/MainLayout'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import { LandingPage } from '@/pages/LandingPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { WorkflowAdvisorPage } from '@/pages/WorkflowAdvisorPage'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { SignupForm } from '@/features/auth/components/SignupForm'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage'
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage'
import { AdminInventoryPage } from '@/pages/admin/AdminInventoryPage'
import { AdminDailyPage } from '@/pages/admin/AdminDailyPage'
import { AdminSalesPage } from '@/pages/admin/AdminSalesPage'
import { AdminQuotesPage } from '@/pages/admin/AdminQuotesPage'
import { AdminInvoicesPage } from '@/pages/admin/AdminInvoicesPage'
import { AdminDeliveryNotesPage } from '@/pages/admin/AdminDeliveryNotesPage'
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage'
import { AdminSystemPage } from '@/pages/admin/AdminSystemPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminClientsPage } from '@/pages/admin/AdminClientsPage'
import { AdminSuppliersPage } from '@/pages/admin/AdminSuppliersPage'
import { AdminCompaniesPage } from '@/pages/admin/AdminCompaniesPage'
import { AdminCashSalesPage } from '@/pages/admin/AdminCashSalesPage'
import { AdminBalancePage } from '@/pages/admin/AdminBalancePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const authState = useAuthState()
  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/advisor/:workflow" element={<WorkflowAdvisorPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Route>

            {/* Auth routes without main header/footer */} 
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignupForm />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="ventes" element={<AdminSalesPage />} />
              <Route path="devis" element={<AdminQuotesPage />} />
              <Route path="factures" element={<AdminInvoicesPage />} />
              <Route path="bons-livraison" element={<AdminDeliveryNotesPage />} />
              <Route path="paiements" element={<AdminPaymentsPage />} />
              <Route path="clients" element={<AdminClientsPage />} />
              <Route path="entreprises" element={<AdminCompaniesPage />} />
              <Route path="fournisseurs" element={<AdminSuppliersPage />} />
              <Route path="cash" element={<AdminCashSalesPage />} />
              <Route path="treasury" element={<AdminBalancePage />} />
              <Route path="systeme" element={<AdminSystemPage />} />
              <Route path="parametres" element={<AdminSettingsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="daily" element={<AdminDailyPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
