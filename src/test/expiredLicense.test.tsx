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

describe("Expired license key", () => {
  beforeEach(() => {
    store.clearAll();
  });

  it("keeps the app on the License screen and blocks login UI", async () => {
    // Pre-seed a Super Admin so that only license gating stands between
    // the user and the login screen.
    store.setRoles([{ id: "r1", name: "Super Admin" }]);
    store.setUsers([{
      id: "u1", role_id: "r1", username: "existing_admin",
      password: "pw", status: "active",
    }]);
    store.setSetupComplete(true);

    renderApp();

    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    const keyInput = screen.getByPlaceholderText(/DRO-/i) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "DRO-EXPIRED-TEST-KEY" } });
    fireEvent.click(screen.getByRole("button", { name: /ACTIVATE SYSTEM/i }));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });

    // "Expired" error shown, still on License screen
    expect(screen.getByText(/License Expired/i)).toBeInTheDocument();
    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    // Login UI must NOT be reachable
    expect(document.querySelector('input[type="password"]')).toBeNull();
    expect(screen.queryByText(/Secure Login/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("app-root")).not.toBeInTheDocument();

    // License must not be persisted
    expect(store.getLicense()).toBeNull();
  });
});
