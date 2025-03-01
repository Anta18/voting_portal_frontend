'use client';
import { useState } from 'react';

interface Voter {
  id: string;
  name: string;
  election: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  election: string;
  status: string;
}

const dummyElections = [
  { id: '1', name: '2025 School Board Election' },
  { id: '2', name: 'Local Government Election' },
];

const dummyVoters: Voter[] = [
  { id: '1', name: 'John Doe', election: '1' },
  { id: '2', name: 'Jane Smith', election: '1' },
  { id: '3', name: 'Mark Johnson', election: '2' },
];

const dummyCandidates: Candidate[] = [
  { id: '1', name: 'Alice Johnson', party: 'Democratic', election: '1', status: 'approved' },
  { id: '2', name: 'Bob Smith', party: '', election: '2', status: 'pending' },
];

export default function ViewRegistrationsPage() {
  const [selectedElection, setSelectedElection] = useState<string>('');
  const filteredVoters = selectedElection ? dummyVoters.filter(v => v.election === selectedElection) : [];
  const filteredCandidates = selectedElection ? dummyCandidates.filter(c => c.election === selectedElection) : [];
  
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">View Registrations (Voters & Candidates)</h1>
      <div className="max-w-md mb-4">
        <label className="block mb-2 font-semibold">Select Election:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          required
        >
          <option value="">Select an election</option>
          {dummyElections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name}
            </option>
          ))}
        </select>
      </div>
      {selectedElection && (
        <>
          <h2 className="text-xl font-bold mb-2">Registered Voters</h2>
          {filteredVoters.length === 0 ? (
            <p>No voters registered for this election.</p>
          ) : (
            <table className="w-full border-collapse mb-6">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.map(voter => (
                  <tr key={voter.id}>
                    <td className="border p-2">{voter.id}</td>
                    <td className="border p-2">{voter.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h2 className="text-xl font-bold mb-2">Candidate Applications</h2>
          {filteredCandidates.length === 0 ? (
            <p>No candidate applications for this election.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2">ID</th>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Party</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(candidate => (
                  <tr key={candidate.id}>
                    <td className="border p-2">{candidate.id}</td>
                    <td className="border p-2">{candidate.name}</td>
                    <td className="border p-2">{candidate.party || 'Independent'}</td>
                    <td className="border p-2">{candidate.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
