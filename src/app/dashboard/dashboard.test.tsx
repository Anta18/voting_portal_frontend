// src/app/dashboard/dashboard.test.tsx
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import DashboardPage from "./page";

// Mock the AuthGuard to simply render children
jest.mock("../components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Set a fake API URL for testing
process.env.NEXT_PUBLIC_API_URL = "https://fakeapi.com";

// Fake election data for each endpoint
const fakeElections = {
  ongoing: [
    {
      _id: "1",
      name: "Ongoing Election",
      election_type: "general",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
    },
  ],
  future: [
    {
      _id: "2",
      name: "Future Election",
      election_type: "local",
      start_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
      end_date: new Date(Date.now() + 2 * 86400000).toISOString(), // +2 days
    },
  ],
  past: [
    {
      _id: "3",
      name: "Past Election",
      election_type: "federal",
      start_date: new Date(Date.now() - 2 * 86400000).toISOString(), // -2 days
      end_date: new Date(Date.now() - 86400000).toISOString(), // -1 day
    },
  ],
  eligible: [
    {
      _id: "4",
      name: "Eligible Election",
      election_type: "state",
      start_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
      end_date: new Date(Date.now() + 2 * 86400000).toISOString(), // +2 days
    },
  ],
};

beforeEach(() => {
  // Stub fetch for election endpoints. Extract the URL whether input is string or Request.
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation((input: string | Request, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/election/user/ongoing")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ ongoing_elections: fakeElections.ongoing }),
        } as Response);
      }
      if (url.includes("/election/user/future")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ future_elections: fakeElections.future }),
        } as Response);
      }
      if (url.includes("/election/user/past")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ past_elections: fakeElections.past }),
        } as Response);
      }
      if (url.includes("/election/eligible_for_registration")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ eligible_elections: fakeElections.eligible }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown endpoint"));
    });
});

afterEach(() => {
  jest.restoreAllMocks();
  localStorage.clear();
});

describe("DashboardPage", () => {
  // it("renders loading state initially then displays election data", async () => {
  //   render(<DashboardPage />);

  //   // Check that the dashboard header is rendered
  //   expect(screen.getByText(/Elections Dashboard/i)).toBeInTheDocument();

  //   // Initially, a spinner (or loading indicator) should be visible.
  //   expect(document.querySelector(".animate-spin")).toBeInTheDocument();

  //   // Wait for the loading spinner to disappear
  //   await waitFor(() => {
  //     expect(document.querySelector(".animate-spin")).toBeNull();
  //   });

  //   // Verify that election cards are rendered for each category.
  //   expect(screen.getByText(/Ongoing Election/i)).toBeInTheDocument();
  //   expect(screen.getByText(/Future Election/i)).toBeInTheDocument();
  //   expect(screen.getByText(/Past Election/i)).toBeInTheDocument();
  //   expect(screen.getByText(/Eligible Election/i)).toBeInTheDocument();
  // });

  it("switches tabs when a tab button is clicked", async () => {
    render(<DashboardPage />);
    // Wait for data to load
    await waitFor(() => {
      expect(document.querySelector(".animate-spin")).toBeNull();
    });

    // Click the "Future" tab button.
    const futureTabButton = screen.getByRole("button", { name: /Future/i });
    fireEvent.click(futureTabButton);

    // Expect the future election to be visible in the UI.
    expect(screen.getByText(/Future Election/i)).toBeInTheDocument();
  });

  // it("shows flash message when registration fails", async () => {
  //   // Stub the registration endpoint to return an error
  //   jest
  //     .spyOn(globalThis, "fetch")
  //     .mockImplementationOnce((input: string | Request, init?: RequestInit) => {
  //       const url = typeof input === "string" ? input : input.url;
  //       if (url.includes("/election/register_for_election")) {
  //         return Promise.resolve({
  //           ok: false,
  //           json: () => Promise.resolve({ error: "Registration error" }),
  //         } as Response);
  //       }
  //       return Promise.reject(new Error("Unknown endpoint"));
  //     });

  //   // Ensure a token exists so that registration is attempted
  //   localStorage.setItem("accessToken", "dummy-token");

  //   render(<DashboardPage />);

  //   // Wait for data load
  //   await waitFor(() => {
  //     expect(document.querySelector(".animate-spin")).toBeNull();
  //   });

  //   // Switch to the "Eligible" tab to see registration buttons
  //   const eligibleTabButton = screen.getByRole("button", { name: /Eligible/i });
  //   fireEvent.click(eligibleTabButton);

  //   // Now the eligible election card should be rendered with a "Register Now" button.
  //   const registerButton = screen.getByRole("button", {
  //     name: /Register Now/i,
  //   });
  //   fireEvent.click(registerButton);

  //   // Wait for the flash message to appear with the error text.
  //   await waitFor(() => {
  //     expect(screen.getByText(/Registration error/i)).toBeInTheDocument();
  //   });
  // });
});
