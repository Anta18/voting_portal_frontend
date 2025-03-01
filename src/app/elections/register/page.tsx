// app/elections/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const dummyEligibleElections = [
  { id: '1', name: '2025 School Board Election', election_type: 'school' },
  { id: '2', name: 'Local Government Election', election_type: 'government' },
];

export default function ElectionRegistrationPage() {
  const [selectedElection, setSelectedElection] = useState('');
  const constRouter = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registering for election:', selectedElection);
    constRouter.push('/dashboard');
  };

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold mb-4">Register for an Election</h1>
      <form onSubmit={handleRegister} className="space-y-4 max-w-md">
        <select
          className="w-full p-2 border rounded"
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          required
        >
          <option value="">Select an election</option>
          {dummyEligibleElections.map((election) => (
            <option key={election.id} value={election.id}>
              {election.name} ({election.election_type})
            </option>
          ))}
        </select>
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Register
        </button>
      </form>
    </div>
  );
}
