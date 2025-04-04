"use client";
import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function VerifyVotePage() {
  const [receipt, setReceipt] = useState("");
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerificationResult(null);
    setStatus("idle");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vote/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transaction_hash: receipt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setVerificationResult(errorData.error || "Verification failed.");
        setStatus("error");
      } else {
        const data = await response.json();
        setVerificationResult(data.message || "Vote verified successfully.");
        setStatus("success");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult("An error occurred while verifying your vote.");
      setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/90 p-8 rounded-xl shadow-2xl border border-indigo-500/30 backdrop-blur">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-500/20 p-3 rounded-full">
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">
          Verify Your Vote
        </h1>

        <p className="text-slate-400 text-center mb-8 text-sm">
          Enter your blockchain receipt code to confirm your vote was recorded
          securely
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your receipt code"
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              className="w-full p-4 pl-5 rounded-lg border border-indigo-500/30 bg-slate-800/70 placeholder-slate-500 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition shadow-lg"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className="text-indigo-400/40">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg transition shadow-lg flex items-center justify-center space-x-2 font-medium disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Vote</span>
              </>
            )}
          </button>
        </form>

        {verificationResult && (
          <div
            className={`mt-8 p-5 rounded-lg border backdrop-blur transition-all duration-300 animate-fade-in ${
              status === "success"
                ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-200"
                : "bg-rose-900/30 border-rose-500/30 text-rose-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              {status === "success" ? (
                <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-6 w-6 flex-shrink-0 text-rose-400" />
              )}
              <p className="text-sm font-medium">{verificationResult}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 text-center">
          <p>
            Protected by blockchain technology. All votes are securely recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
