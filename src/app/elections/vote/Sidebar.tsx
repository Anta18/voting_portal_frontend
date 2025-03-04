'use client';

import React from 'react';

interface Election {
  id: string;
  name: string;
}

interface SidebarProps {
  elections: Election[];
  selectedElection: string;
  onElectionSelect: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ elections, selectedElection, onElectionSelect }) => {
  return (
    <aside className="md:w-1/4 h-full bg-blue-950 p-6 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-center border-b border-yellow-700 pb-2">
        Elections
      </h2>
      {elections.length > 0 ? (
        <ul className="space-y-3">
          {elections.map((election) => (
            <li key={election.id}>
              <button
                onClick={() => onElectionSelect(election.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                  selectedElection === election.id
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-red-950 text-gray-200 hover:bg-yellow-500 hover:text-gray-900'
                }`}
              >
                {election.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-300">No ongoing elections found.</p>
      )}
    </aside>
  );
};

export default Sidebar;
