HTMLCanvasElement.prototype.getContext = () => {
  return {
    canvas: document.createElement("canvas"),
    fillRect: () => {},
    clearRect: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => ({
      width: 0,
      height: 0,
      data: new Uint8ClampedArray(),
    }),
    setTransform: () => {},
    drawImage: () => {},
    save: () => {},
    fillText: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    arc: () => {},
    fill: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
    globalAlpha: 1.0,
    globalCompositeOperation: "source-over",
    isPointInPath: () => false,
    isPointInStroke: () => false,
    strokeStyle: "#000000",
    fillStyle: "#000000",
    lineWidth: 1,
    lineCap: "butt",
    lineJoin: "miter",
    miterLimit: 10,
    shadowBlur: 0,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: "10px sans-serif",
    textAlign: "start",
    textBaseline: "alphabetic",
  };
};

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LiveResultsPage from "./live/page";
import "@testing-library/jest-dom";

// Use fake timers to control time-dependent code (like setInterval)
jest.useFakeTimers();

// Create a mock socket instance with jest.fn() for its methods.
const mockSocketOn = jest.fn();
const mockSocketEmit = jest.fn();
const mockSocketDisconnect = jest.fn();

const mockSocket = {
  on: mockSocketOn,
  emit: mockSocketEmit,
  disconnect: mockSocketDisconnect,
};

// Mock the socket.io-client module so that io() returns our fake socket.
jest.mock("socket.io-client", () => {
  return {
    io: jest.fn(() => mockSocket),
  };
});

describe("LiveResultsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Provide a dummy access token for localStorage.
    localStorage.setItem("accessToken", "test-token");
    process.env.NEXT_PUBLIC_API_URL = "http://localhost";
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("fetches sidebar elections and displays them", async () => {
    // Arrange: mock fetch for sidebar elections
    const electionsData = {
      ongoing_elections: [{ _id: "1", name: "Election 1" }],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsData,
    });

    // Act: render the component
    render(<LiveResultsPage />);

    // Assert: wait for the election name to appear in the sidebar.
    expect(await screen.findByText("Election 1")).toBeInTheDocument();
  });

  test("displays error message when sidebar elections fetch fails", async () => {
    // Arrange: mock fetch returning an error status.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch ongoing elections" }),
    });

    // Act: render the component
    render(<LiveResultsPage />);

    // Assert: error message appears.
    expect(
      await screen.findByText("Failed to fetch ongoing elections")
    ).toBeInTheDocument();
  });

  test("selecting an election triggers socket subscription and renders live results", async () => {
    // Arrange: mock sidebar elections API.
    const electionsData = {
      ongoing_elections: [{ _id: "1", name: "Election 1" }],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsData,
    });

    render(<LiveResultsPage />);

    // Wait for the sidebar button to appear and then click it.
    const electionButton = await screen.findByRole("button", {
      name: /Election 1/i,
    });
    userEvent.click(electionButton);

    // Assert: socket.emit should have been called to subscribe for live results.
    await waitFor(() => {
      expect(mockSocketEmit).toHaveBeenCalledWith(
        "subscribe_live_results_voter",
        {
          token: "test-token",
          election_id: "1",
        }
      );
    });

    // Simulate the live results socket event.
    const liveResultsData = {
      election_id: "1",
      live_results: [
        {
          candidate_id: "c1",
          candidate_name: "Candidate 1",
          party: "Party A",
          vote_count: 100,
        },
        {
          candidate_id: "c2",
          candidate_name: "Candidate 2",
          party: "Party B",
          vote_count: 50,
        },
      ],
    };

    // Find the callback registered for "live_results_voter" and invoke it.
    const liveResultsCallback = mockSocketOn.mock.calls.find(
      (call) => call[0] === "live_results_voter"
    )?.[1];
    expect(liveResultsCallback).toBeDefined();
    liveResultsCallback(liveResultsData);

    // Assert: Candidate names should now appear in the component.
    expect(await screen.findByText("Candidate 1")).toBeInTheDocument();
    expect(await screen.findByText("Candidate 2")).toBeInTheDocument();
  });

  test("refresh button triggers socket emit for subscription", async () => {
    // Arrange: mock sidebar elections API.
    const electionsData = {
      ongoing_elections: [{ _id: "1", name: "Election 1" }],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsData,
    });

    render(<LiveResultsPage />);

    // Wait for and select an election.
    const electionButton = await screen.findByRole("button", {
      name: /Election 1/i,
    });
    userEvent.click(electionButton);

    // Simulate initial live results event to end the loading state.
    const liveResultsCallback = mockSocketOn.mock.calls.find(
      (call) => call[0] === "live_results_voter"
    )?.[1];
    liveResultsCallback({
      election_id: "1",
      live_results: [],
    });

    // Act: find and click the refresh button.
    const refreshButton = screen.getByRole("button", { name: /Refresh/i });
    userEvent.click(refreshButton);

    // Assert: socket.emit is called to resubscribe for live results.
    await waitFor(() => {
      expect(mockSocketEmit).toHaveBeenCalledWith(
        "subscribe_live_results_voter",
        {
          token: "test-token",
          election_id: "1",
        }
      );
    });
  });

  test('displays "No ongoing elections found" if no elections are available', async () => {
    // Arrange: mock fetch returning an empty array for ongoing elections.
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ongoing_elections: [] }),
    });

    // Act: render the component.
    render(<LiveResultsPage />);

    // Assert: the no elections message is displayed.
    expect(
      await screen.findByText("No ongoing elections found")
    ).toBeInTheDocument();
  });

  test("updates current time display", async () => {
    // Arrange: mock sidebar elections API.
    const electionsData = { ongoing_elections: [] };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => electionsData,
    });

    render(<LiveResultsPage />);

    // Act: fast-forward timers to simulate time passage.
    jest.advanceTimersByTime(1000);

    // Assert: the "Last updated:" label should contain a time.
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });
});
