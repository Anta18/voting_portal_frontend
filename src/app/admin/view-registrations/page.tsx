"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter,
  X,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Users,
  UserCheck,
  FileText,
} from "lucide-react";

interface Voter {
  id: string;
  full_name: string;
  username: string;
  voter_document?: string;
  email?: string;
  registration_date?: string;
  last_login?: string;
  status?: "active" | "inactive" | "pending";
}

interface Candidate {
  id: string;
  election_id: string;
  election_name?: string;
  full_name: string;
  party: string;
  manifesto?: string;
  documents?: any[];
  status?: "approved" | "pending" | "rejected";
  voter_username?: string;
  created_at?: string;
  votes_count?: number;
}

interface ElectionRegistration {
  id: string;
  election_id?: string;
  election_name?: string;
  voter_name?: string;
  voter_document?: string;
  registration_date?: string;
  vote_casted?: boolean;
  status?: "approved" | "pending" | "rejected";
}

interface Stats {
  votersCount: number;
  candidatesCount: number;
  registrationsCount: number;
  activeVoters: number;
  pendingCandidates: number;
  approvedRegistrations: number;
}

interface ModalProps {
  title: string;
  data: any;
  modalType: string;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDeapproved?: () => void;
}

const DetailsModal: React.FC<ModalProps> = ({
  title,
  data,
  modalType,
  onClose,
  onDeapproved,
}) => {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deapprovalError, setDeapprovalError] = useState<string>("");

  const handleConfirmDeapprove = async () => {
    setIsSubmitting(true);
    setDeapprovalError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/candidate/admin/deapprove/${data.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deapprove candidate");
      }
      if (onDeapproved) onDeapproved();
      setShowConfirm(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      setDeapprovalError(err.message || "Error deapproving candidate");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-gray-800 text-white rounded-lg shadow-xl w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {data?.full_name && (
            <div className="mb-6 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">{data.full_name}</h3>
              {data.email && (
                <p className="text-gray-300">Email: {data.email}</p>
              )}
              {data.username && (
                <p className="text-gray-300">Username: {data.username}</p>
              )}
              {data.party && (
                <p className="text-gray-300">Party: {data.party}</p>
              )}
              {data.status && (
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      data.status.toLowerCase() === "active" ||
                      data.status.toLowerCase() === "approved"
                        ? "bg-green-800 text-green-200"
                        : data.status.toLowerCase() === "pending"
                        ? "bg-yellow-800 text-yellow-200"
                        : "bg-red-800 text-red-200"
                    }`}
                  >
                    {data.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="bg-gray-700 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm whitespace-pre-wrap break-words">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
          {data.manifesto && (
            <div className="mt-6 bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Manifesto</h3>
              <p className="text-gray-300 whitespace-pre-wrap">
                {data.manifesto}
              </p>
            </div>
          )}
          {/* Candidate-specific deapproval option */}
          {modalType === "candidate" &&
            data.status?.toLowerCase() === "approved" && (
              <div className="mt-6">
                {!showConfirm ? (
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-500 transition"
                  >
                    Deapprove Candidate
                  </button>
                ) : (
                  <div className="bg-red-900 p-4 rounded-lg">
                    <p className="mb-4">
                      Are you sure you want to deapprove this candidate?
                    </p>
                    {deapprovalError && (
                      <p className="text-red-300 mb-4">{deapprovalError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="mr-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDeapprove}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
                      >
                        {isSubmitting ? "Deapproving..." : "Confirm"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
        <div className="flex justify-end items-center p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable card for summary stats
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  bgColor: string;
}> = ({ title, value, icon, bgColor }) => (
  <div className={`${bgColor} p-6 rounded-lg shadow-lg flex items-center`}>
    <div className="rounded-full bg-white bg-opacity-20 p-3 mr-4">{icon}</div>
    <div>
      <h2 className="text-lg font-semibold text-white opacity-90">{title}</h2>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  </div>
);

// Placeholder Analytics Chart
const AnalyticsChart: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Registration Trends</h2>
      <div className="h-64 flex items-end justify-around">
        {[0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.8].map((height, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-8 bg-indigo-500 rounded-t-md transition-all duration-500"
              style={{ height: `${height * 200}px` }}
            ></div>
            <span className="text-xs mt-2">Day {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main AdminDashboard component
const AdminDashboard: React.FC = () => {
  // Active tab options: voters, candidates, registrations
  const [activeTab, setActiveTab] = useState<
    "voters" | "candidates" | "registrations"
  >("voters");

  // Data states
  const [voters, setVoters] = useState<Voter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [registrations, setRegistrations] = useState<ElectionRegistration[]>(
    []
  );
  const [stats, setStats] = useState<Stats>({
    votersCount: 0,
    candidatesCount: 0,
    registrationsCount: 0,
    activeVoters: 0,
    pendingCandidates: 0,
    approvedRegistrations: 0,
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchState, setSearchState] = useState({
    voters: "",
    candidates: "",
    registrations: "",
  });
  // For candidates, additional filters: election, party, status.
  const [filterState, setFilterState] = useState({
    voters: "All",
    candidates: { election: "All", party: "All", status: "All" },
    // For registrations, all filters as dropdowns.
    registrations: {
      election: "All",
      date: "All",
      voterName: "All",
      voterDocument: "All",
    },
  });
  const [sortState, setSortState] = useState({
    voters: { field: "full_name", asc: true },
    candidates: { field: "full_name", asc: true },
    registrations: { field: "id", asc: true },
  });

  // Pagination states
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState({
    voters: 1,
    candidates: 1,
    registrations: 1,
  });

  // Modal state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    data: any;
    type: string;
  }>({
    isOpen: false,
    title: "",
    data: null,
    type: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Helper to format date strings
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // CSV conversion utility
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    for (const row of data) {
      const values = headers.map((header) => {
        let val = row[header];
        if (val === null || val === undefined) {
          val = "";
        }
        val = val.toString().replace(/"/g, '""');
        return `"${val}"`;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };

  // Export functionality (CSV)
  const handleExport = (type: "voters" | "candidates" | "registrations") => {
    const data = getFilteredData[type];
    const csvString = convertToCSV(data);
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch all data from endpoints and update stats
  const fetchData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Authorization token is missing. Please log in again.");
      return;
    }
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    setLoading(true);
    setError(null);
    try {
      const [votersRes, candidatesRes, registrationsRes] = await Promise.all([
        fetch(`${API_URL}/admin/voters`, { headers }),
        fetch(`${API_URL}/admin/candidates`, { headers }),
        fetch(`${API_URL}/admin/election_registrations`, { headers }),
      ]);
      if (!votersRes.ok || !candidatesRes.ok || !registrationsRes.ok) {
        throw new Error("Failed to fetch data from one or more endpoints");
      }
      const votersData = await votersRes.json();
      const candidatesData = await candidatesRes.json();
      const registrationsData = await registrationsRes.json();

      setVoters(votersData);
      setCandidates(candidatesData);
      setRegistrations(registrationsData);

      setStats({
        votersCount: votersData.length,
        candidatesCount: candidatesData.length,
        registrationsCount: registrationsData.length,
        activeVoters: votersData.filter((v: Voter) => v.status === "active")
          .length,
        pendingCandidates: candidatesData.filter(
          (c: Candidate) => c.status === "pending"
        ).length,
        approvedRegistrations: registrationsData.filter(
          (r: ElectionRegistration) => r.status === "approved"
        ).length,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when active tab changes (summary cards remain always visible)
  useEffect(() => {
    setSearchState((prev) => ({ ...prev, [activeTab]: "" }));
    if (activeTab === "candidates") {
      setFilterState((prev) => ({
        ...prev,
        candidates: { election: "All", party: "All", status: "All" },
      }));
    }
    if (activeTab === "registrations") {
      setFilterState((prev) => ({
        ...prev,
        registrations: {
          election: "All",
          date: "All",
          voterName: "All",
          voterDocument: "All",
        },
      }));
    }
    setCurrentPage((prev) => ({ ...prev, [activeTab]: 1 }));
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Compute unique dropdown options for candidates and registrations
  const candidateElectionOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(candidates.map((c) => c.election_name).filter(Boolean))
      ),
    ];
  }, [candidates]);

  const candidatePartyOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(new Set(candidates.map((c) => c.party).filter(Boolean))),
    ];
  }, [candidates]);

  const candidateStatusOptions = ["All", "approved", "pending", "rejected"];

  const registrationElectionOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(registrations.map((r) => r.election_name).filter(Boolean))
      ),
    ];
  }, [registrations]);

  const registrationDateOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          registrations
            .map((r) => formatDate(r.registration_date))
            .filter((val) => val !== "-")
        )
      ),
    ];
  }, [registrations]);

  const registrationVoterNameOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(registrations.map((r) => r.voter_name).filter(Boolean))
      ),
    ];
  }, [registrations]);

  const registrationVoterDocumentOptions = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(registrations.map((r) => r.voter_document).filter(Boolean))
      ),
    ];
  }, [registrations]);

  // Filtering, searching, and sorting
  const getFilteredData = useMemo(() => {
    // Voters: filter on full_name, username, voter_document.
    const filteredVoters = voters.filter((item) => {
      return (
        item.full_name
          .toLowerCase()
          .includes(searchState.voters.toLowerCase()) ||
        item.username
          .toLowerCase()
          .includes(searchState.voters.toLowerCase()) ||
        (item.voter_document || "")
          .toLowerCase()
          .includes(searchState.voters.toLowerCase())
      );
    });

    // Candidates: filter on full_name search and additional dropdown filters.
    const filteredCandidates = candidates.filter((item) => {
      const searchMatch = item.full_name
        .toLowerCase()
        .includes(searchState.candidates.toLowerCase());
      const electionMatch =
        filterState.candidates.election === "All" ||
        item.election_name === filterState.candidates.election;
      const partyMatch =
        filterState.candidates.party === "All" ||
        item.party === filterState.candidates.party;
      const statusMatch =
        filterState.candidates.status === "All" ||
        item.status === filterState.candidates.status;
      return searchMatch && electionMatch && partyMatch && statusMatch;
    });

    // Registrations: filter on dropdown values.
    const filteredRegistrations = registrations.filter((item) => {
      const searchMatch = (item.voter_name || "")
        .toLowerCase()
        .includes(searchState.registrations.toLowerCase());
      const electionMatch =
        filterState.registrations.election === "All" ||
        item.election_name === filterState.registrations.election;
      const dateMatch =
        filterState.registrations.date === "All" ||
        formatDate(item.registration_date) === filterState.registrations.date;
      const voterNameMatch =
        filterState.registrations.voterName === "All" ||
        item.voter_name === filterState.registrations.voterName;
      const voterDocumentMatch =
        filterState.registrations.voterDocument === "All" ||
        item.voter_document === filterState.registrations.voterDocument;
      return (
        searchMatch ||
        (electionMatch && dateMatch && voterNameMatch && voterDocumentMatch)
      );
    });

    // Sorting helper
    const sortData = (data: any[], field: string, asc: boolean) => {
      return data.sort((a, b) => {
        const aVal = (a[field] || "").toString().toLowerCase();
        const bVal = (b[field] || "").toString().toLowerCase();
        if (aVal < bVal) return asc ? -1 : 1;
        if (aVal > bVal) return asc ? 1 : -1;
        return 0;
      });
    };

    return {
      voters: sortData(
        filteredVoters,
        sortState.voters.field,
        sortState.voters.asc
      ),
      candidates: sortData(
        filteredCandidates,
        sortState.candidates.field,
        sortState.candidates.asc
      ),
      registrations: sortData(
        filteredRegistrations,
        sortState.registrations.field,
        sortState.registrations.asc
      ),
    };
  }, [voters, candidates, registrations, searchState, filterState, sortState]);

  // Pagination helpers
  const getPaginatedData = (
    type: "voters" | "candidates" | "registrations"
  ) => {
    const data = getFilteredData[type];
    const page = currentPage[type];
    const start = (page - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };
  const getTotalPages = (type: "voters" | "candidates" | "registrations") => {
    return Math.ceil(getFilteredData[type].length / itemsPerPage);
  };

  // Sorting handler
  const handleSort = (
    type: "voters" | "candidates" | "registrations",
    field: string
  ) => {
    setSortState((prev) => {
      const currentSort = prev[type];
      return {
        ...prev,
        [type]: {
          field,
          asc: currentSort.field === field ? !currentSort.asc : true,
        },
      };
    });
  };

  // Helper: render sort icon
  const renderSortIcon = (
    type: "voters" | "candidates" | "registrations",
    field: string
  ) => {
    const currentSort = sortState[type];
    if (currentSort.field !== field) return null;
    return currentSort.asc ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  // Open modal
  const openModal = (title: string, data: any, type: string) => {
    setModalState({
      isOpen: true,
      title,
      data,
      type,
    });
  };
  const closeModal = () => {
    setModalState({ isOpen: false, title: "", data: null, type: "" });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 py-4 border-b border-gray-700">
        <nav className="flex space-x-1">
          {[
            { id: "voters", label: "Voters", icon: <Users size={18} /> },
            {
              id: "candidates",
              label: "Candidates",
              icon: <UserCheck size={18} />,
            },
            {
              id: "registrations",
              label: "Registrations",
              icon: <FileText size={18} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as "voters" | "candidates" | "registrations"
                )
              }
              className={`px-4 py-3 font-medium text-sm rounded-t-lg flex items-center transition-all ${
                activeTab === tab.id
                  ? "bg-gray-800 text-indigo-400 border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content with summary cards */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Voters"
            value={stats.votersCount}
            icon={<Users size={24} className="text-indigo-800" />}
            bgColor="bg-gradient-to-br from-indigo-600 to-indigo-800"
          />
          <StatCard
            title="Total Candidates"
            value={stats.candidatesCount}
            icon={<UserCheck size={24} className="text-green-800" />}
            bgColor="bg-gradient-to-br from-green-600 to-green-800"
          />
          <StatCard
            title="Total Registrations"
            value={stats.registrationsCount}
            icon={<FileText size={24} className="text-blue-800" />}
            bgColor="bg-gradient-to-br from-blue-600 to-blue-800"
          />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 text-white p-4 rounded-lg mb-6">
            <h3 className="font-bold text-lg">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Voters Tab */}
            {activeTab === "voters" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">
                    Voters Management
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleExport("voters")}
                      className="inline-flex items-center px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded transition-colors"
                    >
                      <Download size={16} className="mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search voters..."
                          value={searchState.voters}
                          onChange={(e) =>
                            setSearchState((prev) => ({
                              ...prev,
                              voters: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search
                          className="absolute left-3 top-2.5 text-gray-400"
                          size={18}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() => handleSort("voters", "full_name")}
                          >
                            <div className="flex items-center">
                              Full Name {renderSortIcon("voters", "full_name")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() => handleSort("voters", "username")}
                          >
                            <div className="flex items-center">
                              Username {renderSortIcon("voters", "username")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() =>
                              handleSort("voters", "voter_document")
                            }
                          >
                            <div className="flex items-center">
                              Voter Document{" "}
                              {renderSortIcon("voters", "voter_document")}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {getPaginatedData("voters").map((voter: Voter) => (
                          <tr key={voter.id} className="hover:bg-gray-750">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium">
                                {voter.full_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {voter.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {voter.voter_document || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() =>
                                  openModal("Voter Details", voter, "voter")
                                }
                                className="text-indigo-400 hover:text-indigo-300 ml-2"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {getFilteredData.voters.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-6 py-8 text-center text-gray-400"
                            >
                              No voters found matching your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {getFilteredData.voters.length > 0 && (
                    <div className="px-6 py-4 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Showing {(currentPage.voters - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage.voters * itemsPerPage,
                          getFilteredData.voters.length
                        )}{" "}
                        of {getFilteredData.voters.length} voters
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              voters: prev.voters - 1,
                            }))
                          }
                          disabled={currentPage.voters === 1}
                          className={`p-2 rounded ${
                            currentPage.voters === 1
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-400">
                          Page {currentPage.voters} of {getTotalPages("voters")}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              voters: prev.voters + 1,
                            }))
                          }
                          disabled={
                            currentPage.voters >= getTotalPages("voters")
                          }
                          className={`p-2 rounded ${
                            currentPage.voters >= getTotalPages("voters")
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Candidates Tab */}
            {activeTab === "candidates" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">
                    Candidates Management
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleExport("candidates")}
                      className="inline-flex items-center px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded transition-colors"
                    >
                      <Download size={16} className="mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                {/* Filter controls for candidates */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4 p-4">
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Election
                      </label>
                      <select
                        value={filterState.candidates.election}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            candidates: {
                              ...prev.candidates,
                              election: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {candidateElectionOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Party
                      </label>
                      <select
                        value={filterState.candidates.party}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            candidates: {
                              ...prev.candidates,
                              party: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {candidatePartyOptions.map((party) => (
                          <option key={party} value={party}>
                            {party}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={filterState.candidates.status}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            candidates: {
                              ...prev.candidates,
                              status: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {candidateStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search candidates..."
                          value={searchState.candidates}
                          onChange={(e) =>
                            setSearchState((prev) => ({
                              ...prev,
                              candidates: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search
                          className="absolute left-3 top-2.5 text-gray-400"
                          size={18}
                        />
                      </div>
                      <div className="flex items-center">
                        <Filter size={18} className="text-gray-400 mr-2" />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() =>
                              handleSort("candidates", "full_name")
                            }
                          >
                            <div className="flex items-center">
                              Full Name{" "}
                              {renderSortIcon("candidates", "full_name")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() =>
                              handleSort("candidates", "election_name")
                            }
                          >
                            <div className="flex items-center">
                              Election{" "}
                              {renderSortIcon("candidates", "election_name")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() => handleSort("candidates", "party")}
                          >
                            <div className="flex items-center">
                              Party {renderSortIcon("candidates", "party")}
                            </div>
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-600"
                            onClick={() => handleSort("candidates", "status")}
                          >
                            <div className="flex items-center">
                              Status {renderSortIcon("candidates", "status")}
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {getPaginatedData("candidates").map(
                          (candidate: Candidate) => (
                            <tr
                              key={candidate.id}
                              className="hover:bg-gray-750"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">
                                  {candidate.full_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {candidate.election_name || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {candidate.party || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    candidate.status?.toLowerCase() ===
                                    "approved"
                                      ? "bg-green-900 text-green-200"
                                      : candidate.status?.toLowerCase() ===
                                        "pending"
                                      ? "bg-yellow-900 text-yellow-200"
                                      : "bg-red-900 text-red-200"
                                  }`}
                                >
                                  {candidate.status || "Unknown"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() =>
                                    openModal(
                                      "Candidate Details",
                                      candidate,
                                      "candidate"
                                    )
                                  }
                                  className="text-indigo-400 hover:text-indigo-300 ml-2"
                                >
                                  <Eye size={18} />
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                        {getFilteredData.candidates.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-400"
                            >
                              No candidates found matching your search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {getFilteredData.candidates.length > 0 && (
                    <div className="px-6 py-4 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Showing{" "}
                        {(currentPage.candidates - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage.candidates * itemsPerPage,
                          getFilteredData.candidates.length
                        )}{" "}
                        of {getFilteredData.candidates.length} candidates
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              candidates: prev.candidates - 1,
                            }))
                          }
                          disabled={currentPage.candidates === 1}
                          className={`p-2 rounded ${
                            currentPage.candidates === 1
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-400">
                          Page {currentPage.candidates} of{" "}
                          {getTotalPages("candidates")}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              candidates: prev.candidates + 1,
                            }))
                          }
                          disabled={
                            currentPage.candidates >=
                            getTotalPages("candidates")
                          }
                          className={`p-2 rounded ${
                            currentPage.candidates >=
                            getTotalPages("candidates")
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registrations Tab */}
            {activeTab === "registrations" && (
              <div>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                  <h2 className="text-xl font-bold mb-4 md:mb-0">
                    Election Registrations
                  </h2>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={() => handleExport("registrations")}
                      className="inline-flex items-center px-4 py-2 bg-indigo-700 hover:bg-indigo-600 rounded transition-colors"
                    >
                      <Download size={16} className="mr-2" />
                      Export
                    </button>
                  </div>
                </div>
                {/* Additional dropdown filters for registrations */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-4 p-4">
                  <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Election
                      </label>
                      <select
                        value={filterState.registrations.election}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            registrations: {
                              ...prev.registrations,
                              election: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {registrationElectionOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Registration Date
                      </label>
                      <select
                        value={filterState.registrations.date}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            registrations: {
                              ...prev.registrations,
                              date: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {registrationDateOptions.map((date) => (
                          <option key={date} value={date}>
                            {date}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Voter Name
                      </label>
                      <select
                        value={filterState.registrations.voterName}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            registrations: {
                              ...prev.registrations,
                              voterName: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {registrationVoterNameOptions.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Voter Document
                      </label>
                      <select
                        value={filterState.registrations.voterDocument}
                        onChange={(e) =>
                          setFilterState((prev) => ({
                            ...prev,
                            registrations: {
                              ...prev.registrations,
                              voterDocument: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600"
                      >
                        {registrationVoterDocumentOptions.map((doc) => (
                          <option key={doc} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search registrations..."
                          value={searchState.registrations}
                          onChange={(e) =>
                            setSearchState((prev) => ({
                              ...prev,
                              registrations: e.target.value,
                            }))
                          }
                          className="w-full pl-10 pr-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Search
                          className="absolute left-3 top-2.5 text-gray-400"
                          size={18}
                        />
                      </div>
                      <div className="flex items-center">
                        <Filter size={18} className="text-gray-400 mr-2" />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Election
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Voter Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Voter Document
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Registration Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Vote Casted
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {getPaginatedData("registrations").map(
                          (registration: ElectionRegistration) => (
                            <tr
                              key={registration.id}
                              className="hover:bg-gray-750"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.election_name || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.voter_name || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.voter_document || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {formatDate(registration.registration_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {registration.vote_casted ? "Yes" : "No"}
                              </td>
                            </tr>
                          )
                        )}
                        {getFilteredData.registrations.length === 0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-6 py-8 text-center text-gray-400"
                            >
                              No registrations found matching your search
                              criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  {getFilteredData.registrations.length > 0 && (
                    <div className="px-6 py-4 bg-gray-750 border-t border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        Showing{" "}
                        {(currentPage.registrations - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage.registrations * itemsPerPage,
                          getFilteredData.registrations.length
                        )}{" "}
                        of {getFilteredData.registrations.length} registrations
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              registrations: prev.registrations - 1,
                            }))
                          }
                          disabled={currentPage.registrations === 1}
                          className={`p-2 rounded ${
                            currentPage.registrations === 1
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-400">
                          Page {currentPage.registrations} of{" "}
                          {getTotalPages("registrations")}
                        </span>
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => ({
                              ...prev,
                              registrations: prev.registrations + 1,
                            }))
                          }
                          disabled={
                            currentPage.registrations >=
                            getTotalPages("registrations")
                          }
                          className={`p-2 rounded ${
                            currentPage.registrations >=
                            getTotalPages("registrations")
                              ? "text-gray-600 cursor-not-allowed"
                              : "text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {modalState.isOpen && (
          <DetailsModal
            title={modalState.title}
            data={modalState.data}
            modalType={modalState.type}
            onClose={closeModal}
            onDeapproved={
              modalState.type === "candidate" ? fetchData : undefined
            }
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
