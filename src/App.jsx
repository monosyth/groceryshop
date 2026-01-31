import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { lazy, Suspense } from 'react';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { ReceiptProvider } from './context/ReceiptContext';

// Auth components
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout
import MainLayout from './components/layout/MainLayout';

// Landing (not lazy loaded as it's the entry point)
import LandingPage from './components/landing/LandingPage';

// Lazy load pages for code splitting
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const SearchPage = lazy(() => import('./components/search/SearchPage'));
const Analytics = lazy(() => import('./components/analytics/Analytics'));
const RecipePage = lazy(() => import('./components/recipe/RecipePage'));
const MyRecipesPage = lazy(() => import('./components/recipe/MyRecipesPage'));
const ShoppingListPage = lazy(() => import('./components/shopping/ShoppingListPage'));
const PantryPage = lazy(() => import('./components/pantry/PantryPage'));

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress size={60} sx={{ color: '#10B981' }} />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ReceiptProvider>
          <Router>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <RecipePage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-recipes"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <MyRecipesPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shopping-list"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <ShoppingListPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pantry"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <PantryPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <SearchPage />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Analytics />
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        </ReceiptProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
