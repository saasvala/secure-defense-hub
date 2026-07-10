import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/useAuth";
import LicenseScreen from "@/pages/LicenseScreen";
import SetupScreen from "@/pages/SetupScreen";
import LoginScreen from "@/pages/LoginScreen";
import { store } from "@/lib/store";

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

describe("Invalid license key", () => {
  beforeEach(() => {
    store.clearAll();
  });

  it("keeps the app on the License screen and shows an error", async () => {
    renderApp();

    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    const keyInput = screen.getByPlaceholderText(/DRO-/i) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "NOT-A-REAL-KEY-0000" } });
    fireEvent.click(screen.getByRole("button", { name: /ACTIVATE SYSTEM/i }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });

    // Error visible, still on License screen
    expect(screen.getByText(/Invalid License Key/i)).toBeInTheDocument();
    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    // No transition to Setup / Login / App
    expect(screen.queryByText(/First-Time Setup/i)).not.toBeInTheDocument();
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByTestId("app-root")).not.toBeInTheDocument();

    // Store untouched
    expect(store.getLicense()).toBeNull();
    expect(store.getCurrentUser()).toBeNull();
  });

  it("still blocks access to login even when a Super Admin already exists", async () => {
    // Pre-seed a completed setup so only a valid license would gate login
    store.setRoles([{ id: "r1", name: "Super Admin" }]);
    store.setUsers([{
      id: "u1", role_id: "r1", username: "existing_admin",
      password: "pw", status: "active",
    }]);
    store.setSetupComplete(true);

    renderApp();

    const keyInput = screen.getByPlaceholderText(/DRO-/i) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "BOGUS-KEY" } });
    fireEvent.click(screen.getByRole("button", { name: /ACTIVATE SYSTEM/i }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });

    expect(screen.getByText(/Invalid License Key/i)).toBeInTheDocument();
    // Login UI must NOT be reachable
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(store.getLicense()).toBeNull();
  });
});
