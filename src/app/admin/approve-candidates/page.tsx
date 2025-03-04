'use client';
import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  election: string;
  applicationDate: string;
}

const dummyCandidates: Candidate[] = [
  { 
    id: '1', 
    name: 'Alice Johnson', 
    party: 'Democratic', 
    election: '2025 School Board Election', 
    applicationDate: '2024-02-15'
  },
  { 
    id: '2', 
    name: 'Bob Smith', 
    party: 'Independent', 
    election: 'Local Government Election', 
    applicationDate: '2024-02-20'
  },
];

export default function ApproveCandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(dummyCandidates);

  const handleApprove = (id: string) => {
    // Remove the approved candidate from the list
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const handleReject = (id: string) => {
    // Remove the rejected candidate from the list
    setCandidates(candidates.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex items-center justify-center">
      <div className="rounded-2xl shadow-2xl p-8 w-full max-w-5xl border border-gray-700 bg-gray-800">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Pending Candidate Applications
        </h1>

        {candidates.length === 0 ? (
          <p className="text-center text-gray-400 text-xl py-8">
            No pending candidate applications.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-600">
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-200 uppercase tracking-wider">
                    Candidate Name
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-200 uppercase tracking-wider">
                    Party
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-200 uppercase tracking-wider">
                    Election
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-200 uppercase tracking-wider">
                    Application Date
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-black">
              {candidates.map(candidate => (
  <tr 
    key={candidate.id} 
    className="hover:bg-gray-700 transition ease-in-out duration-150 even:bg-gray-900 odd:bg-black"
  >
    <td className="px-6 py-4 whitespace-nowrap text-center">{candidate.name}</td>
    <td className="px-6 py-4 whitespace-nowrap text-center">
      {candidate.party || 'Independent'}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-center">{candidate.election}</td>
    <td className="px-6 py-4 whitespace-nowrap text-center">{candidate.applicationDate}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => handleApprove(candidate.id)}
          className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          <CheckCircle2 className="mr-2 w-4 h-4" /> Approve
        </button>
        <button
          onClick={() => handleReject(candidate.id)}
          className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          <XCircle className="mr-2 w-4 h-4" /> Reject
        </button>
      </div>
    </td>
  </tr>
))}

              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
