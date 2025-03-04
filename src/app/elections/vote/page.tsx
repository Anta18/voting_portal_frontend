'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar'; // Adjust the import path as needed
import { Pie } from 'react-chartjs-2';
import { io, Socket } from 'socket.io-client';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { AuthGuard } from '@/app/components/AuthGuard';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Election {
  id: string;
  name: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  image: string;
}

export default function VotePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [sidebarElections, setSidebarElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [error, setError] = useState('');

  // Fetch ongoing elections from backend (/election/user/ongoing)
  useEffect(() => {
    async function fetchElections() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/election/user/ongoing`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch elections');
        }
        const data = await res.json();
        setSidebarElections(data.ongoing_elections || []);
        if (data.ongoing_elections && data.ongoing_elections.length > 0) {
          setSelectedElection(data.ongoing_elections[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching elections');
      }
    }
    fetchElections();
  }, [API_URL]);

  // When an election is selected, fetch candidates from backend
  useEffect(() => {
    async function fetchCandidates() {
      if (!selectedElection) return;
      setLoadingCandidates(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(
          `${API_URL}/candidate/list?election_id=${selectedElection}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to fetch candidates');
        }
        const data = await res.json();
        setCandidates(data.candidates || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching candidates');
      } finally {
        setLoadingCandidates(false);
      }
    }
    fetchCandidates();
    setSelectedCandidate(null);
  }, [selectedElection, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElection || !selectedCandidate) return;
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          election_id: selectedElection,
          candidate: selectedCandidate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Vote submission failed');
      }
      const receipt = data.transaction_hash ? data.transaction_hash : 'ABC123XYZ';
      router.push(`/elections/receipt?receipt=${receipt}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error submitting vote');
    }
  };

  // Chart.js setup (as in your code)
  let sortedResults: [string, number][] = [];
  let totalVotes = 0;
  let pieData = null;
  const pieOptions = {
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.chart.data.datasets[0].data.reduce(
              (sum: number, val: number) => sum + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} votes (${percentage}%)`;
          },
        },
      },
    },
  };

  // Dummy data for pie chart (update this with your live results)
  pieData = {
    labels: ['Candidate A', 'Candidate B', 'Candidate C'],
    datasets: [
      {
        data: [10, 15, 5],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <AuthGuard>
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex">
      {/* Sidebar with elections */}
      <Sidebar
        elections={sidebarElections}
        selectedElection={selectedElection}
        onElectionSelect={(id) => {
          setSelectedElection(id);
          // Reset candidates, etc.
        }}
      />
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Vote in Election
        </h1>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {loadingCandidates ? (
          <p className="text-center text-gray-300">Loading candidates...</p>
        ) : candidates.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer transition-all duration-300 bg-gray-700 
                    hover:shadow-xl ${
                      selectedCandidate === candidate.id
                        ? 'border-yellow-400'
                        : 'border-gray-600'
                    }`}
                >
                  <div className="flex items-center mb-4">
                    <input
                      type="radio"
                      name="candidate"
                      value={candidate.id}
                      checked={selectedCandidate === candidate.id}
                      onChange={() => setSelectedCandidate(candidate.id)}
                      required
                      className="hidden peer"
                    />
                    <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors duration-300 peer-checked:border-yellow-400">
                      <div className="w-3 h-3 rounded-full bg-transparent transition-colors duration-300 peer-checked:bg-yellow-400"></div>
                    </div>
                  </div>
                  <img
                    src={candidate.image}
                    alt={candidate.name}
                    className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-yellow-400"
                  />
                  <h2 className="text-xl font-bold text-gray-100 mb-2">
                    {candidate.name}
                  </h2>
                  <p className="text-gray-300">
                    {candidate.party ? candidate.party : 'Independent'}
                  </p>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={!selectedCandidate}
              className="mt-8 w-full bg-gradient-to-r from-yellow-400 to-red-600 text-gray-900 py-3 rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-yellow-400 transition-colors duration-300"
            >
              Submit Vote
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-300">
            No candidates found for the selected election.
          </p>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
