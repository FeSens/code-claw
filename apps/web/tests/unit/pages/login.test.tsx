import LoginPage from "@/app/(auth)/login/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("LoginPage", () => {
  it("renders the login heading", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link to register", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /create an account/i })).toBeInTheDocument();
  });
});
