// LoginPage.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginPage from "./page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LoginPage", () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the login form", () => {
    render(<LoginPage />);
    expect(
      screen.getByPlaceholderText(/Enter your username/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your password/i)
    ).toBeInTheDocument();
  });

  it("shows an error when login fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign In/i }));

    const errorMessage = await screen.findByText(/Invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("redirects to /dashboard on successful login", async () => {
    const fakeData = {
      access_token: "fake_token",
      user: { role: "user" },
    };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => fakeData,
    });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "correctpass" },
    });
    fireEvent.submit(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("fake_token");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
