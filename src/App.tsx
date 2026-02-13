import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/prototypes" element={<Prototypes />} />
        <Route path="/field-tests" element={<FieldTests />} />
        <Route path="/clearance" element={<ClearanceRecords />} />
        <Route path="/compliance" element={<Compliance />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/backup" element={<Backup />} />
        <Route path="/users" element={<UserManagement />} />
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
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
