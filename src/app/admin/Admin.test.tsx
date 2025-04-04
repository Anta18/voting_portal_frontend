// __tests__/AdminGuard.test.tsx
import React from "react";
import { render, waitFor } from "@testing-library/react";
import AdminGuard from "./components/AdminGuard";
import { useRouter } from "next/navigation";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("AdminGuard", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders children when role is "admin"', async () => {
    localStorage.setItem("userRole", '"admin"');
    const { getByText } = render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    // Wait for the effect to run
    await waitFor(() => {
      expect(getByText("Admin Content")).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('renders children when role is "root"', async () => {
    localStorage.setItem("userRole", '"root"');
    const { getByText } = render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(getByText("Admin Content")).toBeInTheDocument();
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('redirects when role is not "admin" or "root"', async () => {
    localStorage.setItem("userRole", '"user"');
    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("redirects when role is not set", async () => {
    // No localStorage set for userRole
    render(
      <AdminGuard>
        <div>Admin Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });
});

describe("Dummy tests", () => {
  it("dummy test 1: basic arithmetic", () => {
    expect(1 + 1).toBe(2);
  });

  it("dummy test 2: string match", () => {
    expect("hello world").toMatch(/world/);
  });

  test("dummy test 3: truthy value", () => {
    expect(true).toBeTruthy();
  });
});
