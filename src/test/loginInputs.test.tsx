import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoginScreen from "@/pages/LoginScreen";
import { AuthProvider } from "@/context/AuthContext";

describe("LoginScreen inputs", () => {
  it("does not apply text-transform: uppercase to username/password fields", () => {
    render(
      <AuthProvider>
        <LoginScreen />
      </AuthProvider>
    );
    const inputs = screen.getAllByRole("textbox").concat(
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="password"]'))
    );
    expect(inputs.length).toBeGreaterThanOrEqual(2);
    for (const input of inputs) {
      const tt = window.getComputedStyle(input).textTransform;
      expect(tt).not.toBe("uppercase");
      expect(input.className).not.toMatch(/\bfont-tactical\b/);
    }
  });
});
