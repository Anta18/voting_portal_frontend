import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ElectionsPage from "./page";
import "@testing-library/jest-dom";

// Mock AuthGuard to simply render its children.
jest.mock("@/app/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

beforeEach(() => {
  // Set a dummy API URL and access token.
  localStorage.setItem("accessToken", "test-token");
  process.env.NEXT_PUBLIC_API_URL = "http://localhost";
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe("ElectionsPage", () => {
  test("shows loading message then renders eligible elections", async () => {
    // Arrange: Mock successful elections fetch with dummy data that matches the backend.
    const eligibleElections = {
      eligible_elections: [
        {
          _id: "67e40dde602b2a6058ebac5f",
          name: "Election 8",
          election_type: "national",
          start_date: "2025-04-01T14:23:26.951Z",
          end_date: "2025-04-04T14:23:26.951Z",
          required_document: "Roll No",
          valid_voter_ids: [
            "23CS10086",
            "23CS10047",
            "23CS10085",
            "23CS10087",
            "23CS10090",
            "23CS10080",
            "23IM10004",
          ],
          __v: 0,
        },
        {
          _id: "67e40ddf602b2a6058ebac61",
          name: "Election 9",
          election_type: "national",
          start_date: "2025-04-02T14:23:27.178Z",
          end_date: "2025-04-06T14:23:27.178Z",
          required_document: "Roll No",
          valid_voter_ids: [
            "23CS10086",
            "23CS10047",
            "23CS10085",
            "23CS10087",
            "23CS10090",
            "23CS10080",
            "23IM10004",
          ],
          __v: 0,
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => eligibleElections,
    });

    render(<ElectionsPage />);

    // Assert: loading message is shown initially.
    expect(
      screen.getByText(/Loading eligible elections.../i)
    ).toBeInTheDocument();

    // Wait for elections to be rendered.
    expect(await screen.findByText("Election 8")).toBeInTheDocument();
    expect(await screen.findByText("Election 9")).toBeInTheDocument();
  });

  test("displays error message when fetching elections fails", async () => {
    // Arrange: Mock a failed fetch.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch elections" }),
    });

    render(<ElectionsPage />);

    // Wait for the error message.
    expect(
      await screen.findByText("Failed to fetch elections")
    ).toBeInTheDocument();
  });

  test("shows message when no eligible elections are available", async () => {
    // Arrange: Mock fetch returning an empty array.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eligible_elections: [] }),
    });

    render(<ElectionsPage />);

    // Wait for the "No eligible elections" message.
    expect(
      await screen.findByText("No eligible elections")
    ).toBeInTheDocument();
  });

  test("registers for an election and displays a flash message, then removes the election", async () => {
    jest.useFakeTimers();

    // Arrange: Mock eligible elections fetch with one election.
    const eligibleElections = {
      eligible_elections: [
        {
          _id: "67e40dde602b2a6058ebac5f",
          name: "Election 8",
          election_type: "national",
          start_date: "2025-04-01T14:23:26.951Z",
          end_date: "2025-04-04T14:23:26.951Z",
          required_document: "Roll No",
          valid_voter_ids: [
            "23CS10086",
            "23CS10047",
            "23CS10085",
            "23CS10087",
            "23CS10090",
            "23CS10080",
            "23IM10004",
          ],
          __v: 0,
        },
      ],
    };

    global.fetch = jest
      .fn()
      // First fetch: eligible elections.
      .mockResolvedValueOnce({
        ok: true,
        json: async () => eligibleElections,
      })
      // Second fetch: registration API.
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Registration successful!" }),
      });

    render(<ElectionsPage />);

    // Wait for the election to appear.
    expect(await screen.findByText("Election 8")).toBeInTheDocument();

    // Act: Click the "Register" button.
    const registerButton = screen.getByRole("button", { name: /Register/i });
    userEvent.click(registerButton);

    // Assert: Flash message for registration appears.
    await waitFor(() => {
      expect(screen.getByText("Registration successful!")).toBeInTheDocument();
    });

    // Also check that the election is removed from the list.
    await waitFor(() => {
      expect(screen.queryByText("Election 8")).not.toBeInTheDocument();
    });

    // Fast-forward time to clear the flash message (3 seconds).
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    await waitFor(() => {
      expect(
        screen.queryByText("Registration successful!")
      ).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
