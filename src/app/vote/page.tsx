// app/elections/vote/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VotePage() {
  const [electionId, setElectionId] = useState('');
  const [voterId, setVoterId] = useState('');
  const [candidate, setCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ election_id: electionId, voter_id: voterId, candidate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Vote failed');
      } else {
        setMessage('Vote recorded successfully!');
        // Optionally redirect or update UI with analytics
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold mb-4">Vote in Election</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      <form onSubmit={handleVote} className="space-y-4 max-w-md">
        <input type="text" placeholder="Election ID" value={electionId} onChange={(e) => setElectionId(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Voter ID" value={voterId} onChange={(e) => setVoterId(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Candidate" value={candidate} onChange={(e) => setCandidate(e.target.value)} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Submit Vote
        </button>
      </form>
    </div>
  );
}
