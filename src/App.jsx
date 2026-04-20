// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component. Sets up:
//   • React Router routes
//   • React.lazy code-splitting for heavy pages
//   • Suspense fallback (PageSpinner)
//   • AuthProvider wrapping everything
//   • Toaster for toast notifications
//
// WHY lazy()? The Customer/Provider dashboards and ProviderDetail
// are large pages that most visitors never need (unauthenticated
// users just see Landing + Providers). Lazy loading splits them
// into separate JS chunks downloaded on-demand, improving the
// initial bundle size and Time-to-Interactive.
// ─────────────────────────────────────────────────────────────

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import Navbar           from './components/layout/Navbar';
import Footer           from './components/layout/Footer';
import ProtectedRoute   from './components/layout/ProtectedRoute';
import { PageSpinner }  from './components/common/Spinner';

// ── Eagerly loaded (small, always needed) ────────────────────
import Landing          from './pages/Landing';
import Login            from './pages/Login';
import Signup           from './pages/Signup';
import Providers        from './pages/Providers';

// ── Lazily loaded (large, role-specific or detail pages) ─────
const ProviderDetail      = lazy(() => import('./pages/ProviderDetail'));
const CustomerDashboard   = lazy(() => import('./pages/CustomerDashboard'));
const ProviderDashboard   = lazy(() => import('./pages/ProviderDashboard'));
const Profile             = lazy(() => import('./pages/Profile'));

// Scrolls to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFCF7',
              color: '#2C1810',
              border: '1px solid #EDD9C0',
              borderRadius: '0.875rem',
              fontSize: '0.875rem',
              boxShadow: '0 4px 16px rgba(44,24,16,0.12)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#3A7250', secondary: '#FFFCF7' } },
            error:   { iconTheme: { primary: '#C2532A', secondary: '#FFFCF7' } },
          }}
        />

        {/* App shell */}
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-1">
            {/* Suspense wraps any lazily-loaded route */}
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* ── Public routes ───────────────────────── */}
                <Route path="/"                  element={<Landing />} />
                <Route path="/login"             element={<Login />} />
                <Route path="/signup"            element={<Signup />} />
                <Route path="/providers"         element={<Providers />} />
                <Route path="/providers/:id"     element={<ProviderDetail />} />

                {/* ── Protected: Customer only ────────────── */}
                <Route
                  path="/dashboard/customer"
                  element={
                    <ProtectedRoute requiredRole="customer">
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Protected: Provider only ────────────── */}
                <Route
                  path="/dashboard/provider"
                  element={
                    <ProtectedRoute requiredRole="provider">
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Protected: Any logged-in user ───────── */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* ── Catch-all ───────────────────────────── */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
