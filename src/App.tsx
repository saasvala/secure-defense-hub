import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/useAuth";
import { seedData } from "@/lib/seed";
import AppLayout from "@/components/AppLayout";
import LicenseScreen from "@/pages/LicenseScreen";
import SetupScreen from "@/pages/SetupScreen";
import LoginScreen from "@/pages/LoginScreen";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteGuard from "@/components/RouteGuard";
import { APP_ROUTES } from "@/lib/routeRegistry";

const queryClient = new QueryClient();

// Seed data on app boot so default Super Admin / roles exist before login.
seedData();

function AppRoutes() {
  const { appState } = useAuth();

  if (appState === 'license') return <LicenseScreen />;
  if (appState === 'setup') return <SetupScreen />;
  if (appState === 'login') return <LoginScreen />;



  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {APP_ROUTES.map(({ path, component: Component, module }) => (
          <Route
            key={path}
            path={path}
            element={<RouteGuard module={module}><Component /></RouteGuard>}
          />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
