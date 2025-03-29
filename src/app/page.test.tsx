// HomePage.test.tsx
import { render, waitFor } from "@testing-library/react";
import HomePage from "./page";
import { useRouter } from "next/navigation";

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("HomePage", () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    localStorage.clear();
  });

  it("redirects to /login when no token is present", async () => {
    render(<HomePage />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it('redirects to /admin when token exists and userRole is "admin"', async () => {
    localStorage.setItem("accessToken", "some_token");
    localStorage.setItem("userRole", '"admin"');
    render(<HomePage />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/admin");
    });
  });

  it('redirects to /dashboard when token exists and userRole is not "admin" or "root"', async () => {
    localStorage.setItem("accessToken", "some_token");
    localStorage.setItem("userRole", '"user"');
    render(<HomePage />);
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
