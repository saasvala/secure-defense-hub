import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/useAuth";
import LicenseScreen from "@/pages/LicenseScreen";
import SetupScreen from "@/pages/SetupScreen";
import LoginScreen from "@/pages/LoginScreen";
import { store, genId, type Role, type User } from "@/lib/store";

function Harness() {
  const { appState } = useAuth();
  if (appState === "license") return <LicenseScreen />;
  if (appState === "setup") return <SetupScreen />;
  if (appState === "login") return <LoginScreen />;
  return <div data-testid="app-root">APP READY</div>;
}

function renderApp() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Harness />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("License activation with existing Super Admin", () => {
  beforeEach(() => {
    store.clearAll();
  });

  it("routes to Login (not Setup) when a Super Admin already exists", async () => {
    // Simulate a prior install: Super Admin role + user present, setup complete,
    // no license yet (fresh device activation).
    const superRole: Role = { id: genId(), name: "Super Admin" };
    store.setRoles([superRole]);
    const superAdmin: User = {
      id: genId(),
      role_id: superRole.id,
      username: "existing_admin",
      password: "existing_pass",
      status: "active",
    };
    store.setUsers([superAdmin]);
    store.setSetupComplete(true);

    renderApp();

    // Starts on License screen
    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    const keyInput = screen.getByPlaceholderText(/DRO-/i) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "SOFTWAREVALA-MASTER-KEY" } });
    fireEvent.click(screen.getByRole("button", { name: /ACTIVATE SYSTEM/i }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });

    // Should land on Login, not Setup
    await waitFor(() => {
      expect(
        screen.queryByText(/First-Time Setup/i)
      ).not.toBeInTheDocument();
    });
    // LoginScreen has username/password inputs — assert at least one password field
    expect(
      document.querySelector('input[type="password"]')
    ).toBeInTheDocument();
    expect(store.getLicense()?.activated).toBe(true);
    expect(store.isSetupComplete()).toBe(true);
    expect(store.getCurrentUser()).toBeNull();
  });
});
