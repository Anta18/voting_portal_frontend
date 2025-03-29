import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./page";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("RegisterPage", () => {
  let pushMock: jest.Mock;
  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    localStorage.clear();
    // Cast global as any to avoid TypeScript error regarding fetch
    (global as any).fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the registration form", () => {
    render(<RegisterPage />);
    expect(
      screen.getByPlaceholderText(/Enter your full name/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your voter ID\/roll number/i)
    ).toBeInTheDocument();
    // Additional expectations for other fields can be added here.
  });

  it("shows an error when passwords do not match", async () => {
    render(<RegisterPage />);
    // Fill in personal information fields
    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Enter your voter ID\/roll number/i),
      {
        target: { value: "12345" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText(/Enter your address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "1990-01-01" },
    });
    // Fill in account information with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText(/Choose a username/i), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), {
      target: { value: "password1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), {
      target: { value: "password2" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    const errorMessage = await screen.findByText(/Passwords do not match/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("redirects to /dashboard on successful registration", async () => {
    const fakeData = {
      access_token: "new_token",
      user: { role: "user" },
    };
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeData,
    });
    render(<RegisterPage />);
    // Fill in personal information fields
    fireEvent.change(screen.getByPlaceholderText(/Enter your full name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/Enter your voter ID\/roll number/i),
      {
        target: { value: "12345" },
      }
    );
    fireEvent.change(screen.getByPlaceholderText(/Enter your address/i), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "1990-01-01" },
    });
    // Fill in account information with matching passwords
    fireEvent.change(screen.getByPlaceholderText(/Choose a username/i), {
      target: { value: "johndoe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Create a password/i), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Confirm your password/i), {
      target: { value: "password" },
    });

    fireEvent.submit(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("new_token");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
