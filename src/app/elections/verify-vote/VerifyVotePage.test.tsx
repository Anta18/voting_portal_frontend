import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VerifyVotePage from "./page";
import "@testing-library/jest-dom";

// Set up a dummy API URL and accessToken in localStorage.
beforeEach(() => {
  localStorage.setItem("accessToken", "test-token");
  process.env.NEXT_PUBLIC_API_URL = "http://localhost";
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("VerifyVotePage", () => {
  test("renders the verification form", () => {
    render(<VerifyVotePage />);
    expect(
      screen.getByPlaceholderText("Enter your receipt code")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Verify Vote/i })
    ).toBeInTheDocument();
  });

  test("submits verification successfully and displays success message", async () => {
    const successMessage = "Vote verified successfully.";
    // Arrange: Set up a delayed successful fetch response.
    jest.spyOn(global, "fetch").mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ message: successMessage }),
              } as Response),
            50
          )
        )
    );

    render(<VerifyVotePage />);

    // Act: Fill in the receipt and submit.
    const input = screen.getByPlaceholderText("Enter your receipt code");
    userEvent.type(input, "RECEIPT123");
    const submitButton = screen.getByRole("button", { name: /Verify Vote/i });
    userEvent.click(submitButton);

    // Assert: The loading state ("Verifying...") should appear.
    expect(await screen.findByText(/Verifying/i)).toBeInTheDocument();

    // Wait for the success message.
    await waitFor(() => {
      expect(screen.getByText(successMessage)).toBeInTheDocument();
    });

    // Check that the success icon container has success styling (e.g., bg-emerald).
    expect(screen.getByText(successMessage).parentElement).toHaveClass(
      expect.stringContaining("bg-emerald")
    );
  });

  test("displays error message when verification fails", async () => {
    const errorMessage = "Verification failed.";
    // Arrange: Set up a delayed failed fetch response.
    jest.spyOn(global, "fetch").mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: false,
                json: async () => ({ error: errorMessage }),
              } as Response),
            50
          )
        )
    );

    render(<VerifyVotePage />);

    // Act: Enter a receipt and submit.
    const input = screen.getByPlaceholderText("Enter your receipt code");
    userEvent.type(input, "INVALID_RECEIPT");
    const submitButton = screen.getByRole("button", { name: /Verify Vote/i });
    userEvent.click(submitButton);

    // Assert: The loading state ("Verifying...") should appear.
    expect(await screen.findByText(/Verifying/i)).toBeInTheDocument();

    // Wait for the error message.
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Check that the error styling (e.g., red classes) are applied.
    expect(screen.getByText(errorMessage).parentElement).toHaveClass(
      expect.stringContaining("bg-rose")
    );
  });

  test("displays error message when fetch throws an exception", async () => {
    // Arrange: Simulate a fetch error.
    jest
      .spyOn(global, "fetch")
      .mockRejectedValueOnce(new Error("Network Error"));

    render(<VerifyVotePage />);

    // Act: Enter a receipt and submit.
    const input = screen.getByPlaceholderText("Enter your receipt code");
    userEvent.type(input, "RECEIPT_ERROR");
    const submitButton = screen.getByRole("button", { name: /Verify Vote/i });
    userEvent.click(submitButton);

    // Assert: Wait for the error message to be rendered.
    await waitFor(() =>
      expect(
        screen.getByText("An error occurred while verifying your vote.")
      ).toBeInTheDocument()
    );
  });
});
