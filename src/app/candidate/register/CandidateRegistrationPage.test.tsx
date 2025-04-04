import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CandidateRegistrationPage from "./page";
import "@testing-library/jest-dom";

// Mock Next.js useRouter from next/navigation
const mockRouterPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe("CandidateRegistrationPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost";
  });

  test("displays available elections after successful fetch", async () => {
    // Arrange: mock GET elections fetch with one election
    const mockElection = { _id: "1", name: "Test Election" };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eligible_elections: [mockElection] }),
    });

    // Act: render the component
    render(<CandidateRegistrationPage />);

    // Assert: wait for the election name to be rendered
    expect(await screen.findByText("Test Election")).toBeInTheDocument();
  });

  test("displays error message when elections fetch fails", async () => {
    // Arrange: mock failed GET fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch elections" }),
    });

    // Act: render the component
    render(<CandidateRegistrationPage />);

    // Assert: error message appears
    expect(
      await screen.findByText("Failed to fetch elections")
    ).toBeInTheDocument();
  });

  test("renders registration form upon election selection and submits form", async () => {
    const mockElection = { _id: "1", name: "Test Election" };

    // Arrange: first call fetch returns elections, second call handles registration POST
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ eligible_elections: [mockElection] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    // Act: render the component and select an election
    render(<CandidateRegistrationPage />);
    const electionElement = await screen.findByText("Test Election");
    userEvent.click(electionElement);

    // Verify that the registration form is rendered
    expect(screen.getByText(/Registering for:/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your full name")
    ).toBeInTheDocument();

    // Fill out the form fields
    userEvent.type(
      screen.getByPlaceholderText("Enter your full name"),
      "John Doe"
    );
    userEvent.type(
      screen.getByPlaceholderText("Enter your party affiliation"),
      "Demo Party"
    );
    userEvent.type(
      screen.getByPlaceholderText("Outline your vision, policies, and goals"),
      "My Manifesto"
    );
    userEvent.type(
      screen.getByPlaceholderText(
        "Enter URL to your supporting documents or credentials"
      ),
      "http://docs.example.com"
    );

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /Submit Candidate Registration/i,
    });
    userEvent.click(submitButton);

    // Assert: registration POST is made with expected data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(
        "http://localhost/candidate/register",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            election_id: mockElection._id,
            full_name: "John Doe",
            party: "Demo Party",
            manifesto: "My Manifesto",
            documents: "http://docs.example.com",
          }),
        })
      );
    });

    // Assert: router.push is called to redirect the user
    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  test('displays "No elections available" when elections list is empty', async () => {
    // Arrange: mock GET fetch returning an empty elections list
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eligible_elections: [] }),
    });

    // Act: render the component
    render(<CandidateRegistrationPage />);

    // Assert: the no elections message is shown
    expect(
      await screen.findByText("No elections available")
    ).toBeInTheDocument();
  });
});
