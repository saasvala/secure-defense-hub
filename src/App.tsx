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
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import Projects from "@/pages/Projects";
import Prototypes from "@/pages/Prototypes";
import FieldTests from "@/pages/FieldTests";
import ClearanceRecords from "@/pages/ClearanceRecords";
import Compliance from "@/pages/Compliance";
import Assets from "@/pages/Assets";
import Reports from "@/pages/Reports";
import AuditLogs from "@/pages/AuditLogs";
import Backup from "@/pages/Backup";
import UserManagement from "@/pages/UserManagement";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/ErrorBoundary";
import RouteGuard from "@/components/RouteGuard";

const queryClient = new QueryClient();

function AppRoutes() {
  const { appState } = useAuth();

  if (appState === 'license') return <LicenseScreen />;
  if (appState === 'setup') return <SetupScreen />;
  if (appState === 'login') return <LoginScreen />;

  // Seed data on first app access
  seedData();

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RouteGuard module="dashboard"><Dashboard /></RouteGuard>} />
        <Route path="/programs" element={<RouteGuard module="programs"><Programs /></RouteGuard>} />
        <Route path="/projects" element={<RouteGuard module="projects"><Projects /></RouteGuard>} />
        <Route path="/prototypes" element={<RouteGuard module="prototypes"><Prototypes /></RouteGuard>} />
        <Route path="/field-tests" element={<RouteGuard module="field-tests"><FieldTests /></RouteGuard>} />
        <Route path="/clearance" element={<RouteGuard module="clearance"><ClearanceRecords /></RouteGuard>} />
        <Route path="/compliance" element={<RouteGuard module="compliance"><Compliance /></RouteGuard>} />
        <Route path="/assets" element={<RouteGuard module="assets"><Assets /></RouteGuard>} />
        <Route path="/reports" element={<RouteGuard module="reports"><Reports /></RouteGuard>} />
        <Route path="/audit" element={<RouteGuard module="audit"><AuditLogs /></RouteGuard>} />
        <Route path="/backup" element={<RouteGuard module="backup"><Backup /></RouteGuard>} />
        <Route path="/users" element={<RouteGuard module="users"><UserManagement /></RouteGuard>} />
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
