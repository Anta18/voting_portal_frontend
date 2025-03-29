"use client";
import { useState } from "react";

interface IntegrityResponse {
  totalEvents: number;
  integrityResults: {
    electionId: string;
    candidates: {
      candidate: string;
      storedCount: number;
      eventCount: number;
      valid: boolean;
    }[];
  }[];
}

export default function CheckIntegrityPage() {
  const [integrityData, setIntegrityData] = useState<IntegrityResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const verifyIntegrity = async () => {
    setLoading(true);
    setError(null);
    setIntegrityData(null);
    try {
      const res = await fetch(`${backendUrl}/admin/blockchain_integrity`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Error verifying integrity");
      } else {
        const data: IntegrityResponse = await res.json();
        setIntegrityData(data);
      }
    } catch (err: any) {
      setError(err.message || "Error verifying integrity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Check Blockchain Integrity</h1>
      <p className="mb-4">
        Click the button below to verify the integrity of the blockchain using
        the backend route.
      </p>
      <button
        onClick={verifyIntegrity}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        {loading ? "Verifying..." : "Verify Integrity"}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          <p>Error: {error}</p>
        </div>
      )}

      {integrityData && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Integrity Report</h2>
          <p>Total Events: {integrityData.totalEvents}</p>
          {integrityData.integrityResults.map((result) => (
            <div
              key={result.electionId}
              className="mt-4 border p-4 rounded bg-gray-50"
            >
              <p className="font-bold">Election ID: {result.electionId}</p>
              {result.candidates.map((cand) => (
                <div key={cand.candidate} className="ml-4 mb-2">
                  <p>Candidate: {cand.candidate}</p>
                  <p>Stored Count: {cand.storedCount}</p>
                  <p>Event Count: {cand.eventCount}</p>
                  <p>Status: {cand.valid ? "Valid" : "Invalid"}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
