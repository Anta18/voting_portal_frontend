"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Award, Filter } from "lucide-react";

interface Election {
  _id: string;
  name: string;
  status?: "active" | "upcoming" | "completed";
  date?: string;
}

interface SidebarProps {
  elections: Election[];
  selectedElection: string;
  onElectionSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  elections,
  selectedElection,
  onElectionSelect,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Group elections by status for better organization
  const groupedElections = elections.reduce((acc, election) => {
    const status = election.status || "active";
    if (!acc[status]) acc[status] = [];
    acc[status].push(election);
    return acc;
  }, {} as Record<string, Election[]>);

  // Filter elections based on selected filter
  const filteredElections = filterStatus
    ? elections.filter((election) => election.status === filterStatus)
    : elections;

  return (
    <aside className="md:w-1/4 h-[calc(100vh-72px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 overflow-y-auto border-r border-blue-800 shadow-lg">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent mb-2 flex items-center justify-center">
          <Award className="mr-2 text-yellow-500" size={20} />
          Cast Your Vote
        </h2>
        <div className="h-1 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full mb-4"></div>
        <p className="text-sm text-blue-300 text-center opacity-80">
          Select an election to vote
        </p>
      </div>

      {/* Elections List */}
      {filteredElections.length > 0 ? (
        <div className="space-y-4">
          {!filterStatus &&
            Object.entries(groupedElections).map(
              ([status, groupElections]) =>
                groupElections.length > 0 && (
                  <div key={status} className="mb-2">
                    <h3 className="text-xs uppercase tracking-wider text-blue-400 mb-2 pl-2 font-semibold">
                      {status === "active"
                        ? "Current Elections"
                        : status === "upcoming"
                        ? "Upcoming Elections"
                        : "Past Elections"}
                    </h3>
                    <ul className="space-y-2">
                      {groupElections.map((election) => (
                        <li key={election._id}>
                          <button
                            onClick={() => onElectionSelect(election._id)}
                            className={`w-full text-left rounded-lg transition-all duration-300 overflow-hidden group ${
                              selectedElection === election._id
                                ? "bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-md"
                                : "bg-blue-800/40 hover:bg-blue-800/80"
                            }`}
                          >
                            <div className="px-4 py-3">
                              <div className="flex justify-between items-center">
                                <span
                                  className={`font-medium ${
                                    selectedElection === election._id
                                      ? "text-gray-900"
                                      : "text-blue-100 group-hover:text-white"
                                  }`}
                                >
                                  {election.name}
                                </span>
                                {selectedElection === election._id && (
                                  <span className="bg-blue-900/30 text-xs px-2 py-1 rounded text-yellow-200 font-medium">
                                    Selected
                                  </span>
                                )}
                              </div>

                              {election.date && (
                                <div
                                  className={`text-xs flex items-center mt-1 ${
                                    selectedElection === election._id
                                      ? "text-gray-800"
                                      : "text-blue-300"
                                  }`}
                                >
                                  <Calendar size={12} className="mr-1" />
                                  {election.date}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
            )}

          {filterStatus && (
            <ul className="space-y-2">
              {filteredElections.map((election) => (
                <li key={election._id}>
                  <button
                    onClick={() => onElectionSelect(election._id)}
                    className={`w-full text-left rounded-lg transition-all duration-300 overflow-hidden group ${
                      selectedElection === election._id
                        ? "bg-gradient-to-r from-yellow-600 to-yellow-500 shadow-md"
                        : "bg-blue-800/40 hover:bg-blue-800/80"
                    }`}
                  >
                    <div className="px-4 py-3">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-medium ${
                            selectedElection === election._id
                              ? "text-gray-900"
                              : "text-blue-100 group-hover:text-white"
                          }`}
                        >
                          {election.name}
                        </span>
                        {selectedElection === election._id && (
                          <span className="bg-blue-900/30 text-xs px-2 py-1 rounded text-yellow-200 font-medium">
                            Selected
                          </span>
                        )}
                      </div>

                      {election.date && (
                        <div
                          className={`text-xs flex items-center mt-1 ${
                            selectedElection === election._id
                              ? "text-gray-800"
                              : "text-blue-300"
                          }`}
                        >
                          <Calendar size={12} className="mr-1" />
                          {election.date}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-blue-900/30 rounded-lg p-6 text-center border border-blue-800">
          <p className="text-blue-300 mb-2">No elections found</p>
          <p className="text-xs text-blue-400">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
