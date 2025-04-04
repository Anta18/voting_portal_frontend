"use client";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { AuthGuard } from "@/app/components/AuthGuard";

interface DummyIntegrityResponse {
  message: string;
  details: string;
  status?: "success" | "warning" | "error";
  timestamp?: string;
}

export default function CheckIntegrityPage() {
  const [dummyData, setDummyData] = useState<DummyIntegrityResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  const verifyIntegrity = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/admin/dummy_integration_check`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Error verifying integration integrity");
        setDummyData(null);
      } else {
        const data: DummyIntegrityResponse = await res.json();
        if (!data.status) {
          data.status = data.message.toLowerCase().includes("success")
            ? "success"
            : data.message.toLowerCase().includes("warning")
            ? "warning"
            : "error";
        }
        data.timestamp = new Date().toISOString();
        setDummyData(data);
        setLastChecked(new Date().toLocaleTimeString());
      }
    } catch (err: any) {
      setError(err.message || "Error verifying integration integrity");
      setDummyData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "error":
        return "text-red-500";
      default:
        return "text-blue-500";
    }
  };

  const StatusIcon = () => {
    if (!dummyData) return null;

    switch (dummyData.status) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-b from-gray-900 via-gray-900 to-black text-gray-100 flex items-center">
      <div className="max-w-6xl w-full mx-auto px-4">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
            Integration Integrity Check
          </h1>
          <p className="text-gray-300">Verify your voting system is secure.</p>
          {lastChecked && (
            <span className="text-sm text-gray-400 block mt-2">
              Last checked: {lastChecked}
            </span>
          )}
        </header>

        {/* Action Card */}
        <div className="bg-gray-800/50 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-gray-200 mb-4 sm:mb-0">
              Click the button below to perform an integrity check.
            </p>
            <button
              onClick={verifyIntegrity}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-600 hover:from-red-600 hover:to-yellow-500 text-white font-medium rounded-md shadow transition-all disabled:opacity-70 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>Verify Integrity</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 flex items-center mb-6">
            <AlertCircle
              size={20}
              className="text-red-500 mr-3 flex-shrink-0"
            />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Results Card */}
        {dummyData && (
          <div className="bg-gray-800/50 rounded-lg shadow-lg overflow-hidden animate-fadeIn">
            <div
              className={`px-6 py-4 flex items-center justify-between border-b border-gray-700 bg-gray-900`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon />
                <h2 className="text-xl font-semibold text-gray-200">
                  Integration Check Report
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-lg font-medium ${getStatusColor(
                  dummyData.status
                )}`}
              >
                {dummyData.message}
              </span>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Details
                </h3>
                <p className="text-gray-400 whitespace-pre-line">
                  {dummyData.details}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-700">
                <div className="bg-gray-700/70 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Request Status
                  </h4>
                  <p className="text-gray-200 font-medium">
                    Completed Successfully
                  </p>
                </div>
                <div className="bg-gray-700/70 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Timestamp
                  </h4>
                  <p className="text-gray-200 font-medium">
                    {new Date(dummyData.timestamp || "").toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
