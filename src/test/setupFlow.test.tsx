import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/useAuth";
import LicenseScreen from "@/pages/LicenseScreen";
import SetupScreen from "@/pages/SetupScreen";
import LoginScreen from "@/pages/LoginScreen";
import { store } from "@/lib/store";

function Harness() {
  const { appState, currentUser } = useAuth();
  if (appState === "license") return <LicenseScreen />;
  if (appState === "setup") return <SetupScreen />;
  if (appState === "login") return <LoginScreen />;
  return (
    <div>
      <div data-testid="app-root">APP READY</div>
      <div data-testid="current-user">{currentUser?.username ?? ""}</div>
    </div>
  );
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

describe("First-time install flow", () => {
  beforeEach(() => {
    store.clearAll();
  });

  it("routes to Setup after License Activation on a fresh install", async () => {
    renderApp();

    // License screen visible
    expect(screen.getByText(/License Activation Required/i)).toBeInTheDocument();

    const keyInput = screen.getByPlaceholderText(/DRO-/i) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: "SOFTWAREVALA-MASTER-KEY" } });
    fireEvent.click(screen.getByRole("button", { name: /ACTIVATE SYSTEM/i }));

    // activateLicense uses a 800ms setTimeout inside the screen
    await act(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });

    await waitFor(() =>
      expect(screen.getByText(/First-Time Setup/i)).toBeInTheDocument()
    );
    expect(store.getLicense()?.activated).toBe(true);
    expect(store.isSetupComplete()).toBe(false);
    expect(store.getCurrentUser()).toBeNull();
  });

  it("auto-logs in and routes to the app after completing Setup", async () => {
    // Pre-activate license so we start on the Setup screen
    store.setLicense({
      id: "test-license",
      key: "SOFTWAREVALA-MASTER-KEY",
      device: "test-device",
      expiry: "2026-12-31",
      modules: ["all"],
      seats: 50,
      activated: true,
    });

    renderApp();

    expect(screen.getByText(/First-Time Setup/i)).toBeInTheDocument();

    const [usernameInput, passwordInput, confirmInput] =
      screen.getAllByRole("textbox").concat(
        Array.from(document.querySelectorAll<HTMLInputElement>('input[type="password"]'))
      );
    fireEvent.change(usernameInput, { target: { value: "commander" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.change(confirmInput, { target: { value: "secret123" } });

    fireEvent.click(screen.getByRole("button", { name: /CREATE SUPER ADMIN/i }));

    await waitFor(() =>
      expect(screen.getByTestId("app-root")).toBeInTheDocument()
    );
    expect(screen.getByTestId("current-user").textContent).toBe("commander");
    expect(store.isSetupComplete()).toBe(true);
    expect(store.getCurrentUser()?.username).toBe("commander");
  });
});
