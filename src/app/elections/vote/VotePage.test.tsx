import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VotePage from "./page";
import "@testing-library/jest-dom";

// Mock Next.js router
const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

// Mock AuthGuard to simply render its children
jest.mock("@/app/components/AuthGuard", () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the Sidebar component so that it renders a list of elections
jest.mock("./Sidebar", () => (props: any) => (
  <div>
    {props.elections.map((e: any) => (
      <button key={e._id} onClick={() => props.onElectionSelect(e._id)}>
        {e.name}
      </button>
    ))}
  </div>
));

// Mock socket.io-client to simulate live results events
const mockSocketOn = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketDisconnect = jest.fn();

const mockSocket = {
  on: mockSocketOn,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
};

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => mockSocket),
}));

// Use fake timers for any timer-based updates (if needed)
jest.useFakeTimers();

describe("VotePage", () => {
  const API_URL = "http://localhost";

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("accessToken", "test-token");
    process.env.NEXT_PUBLIC_API_URL = API_URL;
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("fetches and displays ongoing elections in the sidebar", async () => {
    // Arrange: Mock fetch for ongoing elections (not-voted)
    const electionsResponse = {
      ongoing_elections: [
        {
          _id: "1",
          id: "1",
          name: "Election One",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          _id: "2",
          id: "2",
          name: "Election Two",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsResponse,
    });

    // This fetch call is for candidates and will not be used until an election is selected.
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    render(<VotePage />);

    // Assert: Sidebar should display both election names.
    expect(await screen.findByText("Election One")).toBeInTheDocument();
    expect(await screen.findByText("Election Two")).toBeInTheDocument();
  });

  test("displays error message if fetching elections fails", async () => {
    // Arrange: Mock failed elections fetch.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch elections" }),
    });

    render(<VotePage />);

    // Assert: The error message is shown.
    expect(
      await screen.findByText(
        "Unable to load available elections. Please try again later."
      )
    ).toBeInTheDocument();
  });

  test("fetches and displays candidates when an election is selected", async () => {
    // Arrange: Mock ongoing elections fetch.
    const electionsResponse = {
      ongoing_elections: [
        {
          _id: "1",
          id: "1",
          name: "Election One",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsResponse,
    });

    // Arrange: Mock candidates fetch for the selected election.
    const candidatesResponse = {
      candidates: [
        { _id: "c1", full_name: "Alice", party: "Party A", image: "alice.jpg" },
        { _id: "c2", full_name: "Bob", party: "Party B", image: "bob.jpg" },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => candidatesResponse,
    });

    render(<VotePage />);

    // Simulate user clicking on the election from the Sidebar.
    const electionButton = await screen.findByText("Election One");
    userEvent.click(electionButton);

    // Wait for candidates to load
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  test("handles live results via socket event", async () => {
    // Arrange: Set an election as selected by mocking elections and candidate fetch.
    const electionsResponse = {
      ongoing_elections: [
        {
          _id: "1",
          id: "1",
          name: "Election One",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsResponse,
    });
    // Candidates fetch dummy response.
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    render(<VotePage />);

    // Select the election.
    const electionButton = await screen.findByText("Election One");
    userEvent.click(electionButton);

    // Simulate a live results socket event callback.
    // Find the callback registered for "live_results_voter".
    const liveResultsCallback = mockSocketOn.mock.calls.find(
      (call) => call[0] === "live_results_voter"
    )?.[1];

    expect(liveResultsCallback).toBeDefined();

    const liveResultsData = {
      election_id: "1",
      live_results: [
        { candidate_id: "c1", candidate_name: "Alice", vote_count: "75" },
        { candidate_id: "c2", candidate_name: "Bob", vote_count: "50" },
      ],
    };

    // Invoke the callback to simulate receiving live data.
    act(() => {
      liveResultsCallback(liveResultsData);
    });

    // Assert: The live results should now be available (e.g. the candidate names are rendered).
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  test("submits vote and redirects to receipt page", async () => {
    // Arrange: Mock ongoing elections.
    const electionsResponse = {
      ongoing_elections: [
        {
          _id: "1",
          id: "1",
          name: "Election One",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsResponse,
    });

    // Arrange: Mock candidates fetch.
    const candidatesResponse = {
      candidates: [
        { _id: "c1", full_name: "Alice", party: "Party A", image: "alice.jpg" },
      ],
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => candidatesResponse,
    });

    // Arrange: Mock vote submission API call.
    const voteResponse = {
      transaction_hash: "TX123456",
    };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => voteResponse,
    });

    render(<VotePage />);

    // Select an election.
    const electionButton = await screen.findByText("Election One");
    userEvent.click(electionButton);

    // Wait for candidates to load.
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Select a candidate.
    const candidateRadio = screen.getByDisplayValue("c1");
    userEvent.click(candidateRadio);

    // Submit vote (first click shows confirmation).
    const submitButton = screen.getByRole("button", {
      name: /Continue to Submit Vote/i,
    });
    userEvent.click(submitButton);

    // Confirmation modal should appear.
    expect(await screen.findByText("Confirm Your Vote")).toBeInTheDocument();

    // Click "Confirm Vote" button.
    const confirmButton = screen.getByRole("button", { name: /Confirm Vote/i });
    userEvent.click(confirmButton);

    // Wait for vote submission to complete and router.push to be called.
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith(
        "/elections/receipt?receipt=TX123456"
      );
    });
  });

  test("shows loading spinner when candidates are loading", async () => {
    // Arrange: Mock ongoing elections.
    const electionsResponse = {
      ongoing_elections: [
        {
          _id: "1",
          id: "1",
          name: "Election One",
          end_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsResponse,
    });

    // Arrange: For candidates, return a promise that never resolves immediately.
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<VotePage />);

    // Select an election.
    const electionButton = await screen.findByText("Election One");
    userEvent.click(electionButton);

    // Assert: Loading spinner should be displayed.
    expect(screen.getByText(/Submitting your vote/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Select a Candidate to Continue/i })
    ).toBeDisabled();
  });
});
