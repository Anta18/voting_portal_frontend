'use client';
import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  election: string;
  status: string;
}

const dummyCandidates: Candidate[] = [
  { id: '1', name: 'Alice Johnson', party: 'Democratic', election: '2025 School Board Election', status: 'pending' },
  { id: '2', name: 'Bob Smith', party: 'Independent', election: 'Local Government Election', status: 'pending' },
];

export default function ApproveCandidatesPage() {
  const [candidates, setCandidates] = useState(dummyCandidates);

  const handleApprove = (id: string) => {
    setCandidates(candidates.map(c => (c.id === id ? { ...c, status: 'approved' } : c)));
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Approve Candidates</h1>
      {candidates.length === 0 ? (
        <p>No candidate applications found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Candidate Name</th>
              <th className="border p-2">Party</th>
              <th className="border p-2">Election</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id}>
                <td className="border p-2">{candidate.name}</td>
                <td className="border p-2">{candidate.party || 'Independent'}</td>
                <td className="border p-2">{candidate.election}</td>
                <td className="border p-2">{candidate.status}</td>
                <td className="border p-2">
                  {candidate.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(candidate.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
