import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { AdminSystemPage } from '@/pages/admin/AdminSystemPage'
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage'
import { AdminMonitoringPage } from '@/pages/admin/AdminMonitoringPage'
import { AdminEditProductPage } from '@/pages/admin/AdminEditProductPage'

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
              <Route path="systeme" element={<AdminSystemPage />} />
              <Route path="parametres" element={<AdminSettingsPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/:id/edit" element={<AdminEditProductPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="daily" element={<AdminDailyPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="monitoring" element={<AdminMonitoringPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
