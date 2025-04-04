import { render, screen } from "@testing-library/react";
import ReceiptPage from "./page";
import "@testing-library/jest-dom";

// Mock useSearchParams from next/navigation.
const mockUseSearchParams = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("ReceiptPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("displays receipt content when a receipt code is provided", async () => {
    // Arrange: simulate that the search parameter "receipt" returns a code.
    mockUseSearchParams.mockReturnValue({
      get: (key: string) => (key === "receipt" ? "RECEIPT123ABC" : null),
    });

    // Act: render the component.
    render(<ReceiptPage />);

    // Assert: check that the success message and receipt code are rendered.
    expect(
      await screen.findByText("Vote Recorded Successfully!")
    ).toBeInTheDocument();
    expect(screen.getByText(/Receipt Code:/i)).toHaveTextContent(
      "RECEIPT123ABC"
    );
  });

  test("displays fallback message when no receipt is provided", async () => {
    // Arrange: simulate that no receipt search parameter is provided.
    mockUseSearchParams.mockReturnValue({
      get: () => null,
    });

    // Act: render the component.
    render(<ReceiptPage />);

    // Assert: check that the fallback text is rendered.
    expect(
      await screen.findByText("No receipt information found.")
    ).toBeInTheDocument();
  });
});
