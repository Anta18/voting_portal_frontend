'use client';
import { useState, useEffect } from 'react';
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
  election_type?: string;
  start_date?: string;
  end_date?: string;
}

export default function LiveResultsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Sidebar elections fetched from backend (/election/user/ongoing)
  const [sidebarElections, setSidebarElections] = useState<Election[]>([]);
  const [sidebarError, setSidebarError] = useState<string>('');

  // Live results received via SocketIO
  const [liveResults, setLiveResults] = useState<any>(null);
  const [resultsError, setResultsError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Currently selected election ID from sidebar
  const [selectedElection, setSelectedElection] = useState<string>('');
  // Toggle for showing all results vs. top 5
  const [showAll, setShowAll] = useState(false);

  // Socket instance
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch sidebar elections from backend
  useEffect(() => {
    async function fetchSidebarElections() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/election/user/ongoing`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch ongoing elections');
        }
        const data = await res.json();
        setSidebarElections(data.ongoing_elections || []);
        // Auto-select the first election if available
        if (data.ongoing_elections && data.ongoing_elections.length > 0) {
          setSelectedElection(data.ongoing_elections[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setSidebarError(err.message || 'Error fetching elections');
      }
    }
    fetchSidebarElections();
  }, [API_URL]);

  // Establish Socket.IO connection and subscribe to live results
  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setResultsError('User not authenticated');
      setLoading(false);
      return;
    }
    const newSocket = io(API_URL, {
      transports: ['websocket'],
      auth: { token },
    });
    setSocket(newSocket);

    // Listen for live results event
    newSocket.on('live_results_voter', (data: any) => {
      // data.live_results is expected to be an object keyed by candidate names
      setLiveResults(data.live_results);
      setLoading(false);
    });
    newSocket.on('error', (data: any) => {
      console.error('Socket error:', data);
      setResultsError(data.error || 'Socket error');
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [API_URL]);

  // When selectedElection changes, emit socket event to subscribe to that election's live results
  useEffect(() => {
    if (socket && selectedElection) {
      const token = localStorage.getItem('accessToken');
      // Emit subscription event with token and selected election
      socket.emit('subscribe_live_results_voter', { token, election_id: selectedElection });
      setLoading(true);
    }
  }, [socket, selectedElection]);

  // Get the live results for the selected election
  let resultsForElection = selectedElection && liveResults ? liveResults[selectedElection] : null;

  // Sort results descending by vote count
  let sortedResults: [string, number][] = [];
  if (resultsForElection) {
    sortedResults = Object.entries(resultsForElection).map(([key, value]) => [key, value] as [string, number]).sort((a, b) => b[1] - a[1]);
  }

  // Compute total votes for percentage calculations
  const totalVotes = sortedResults.reduce((sum, [, count]) => sum + count, 0);

  // List display: default to top 5 unless "View All" is toggled
  const displayResults = showAll ? sortedResults : sortedResults.slice(0, 5);

  // Prepare pie chart data: top 4 candidates with remaining as 'Others'
  let pieData = null;
  if (sortedResults.length > 0) {
    const topFour = sortedResults.slice(0, 4);
    const others = sortedResults.slice(4);
    const othersTotal = others.reduce((sum, [, count]) => sum + count, 0);
    const labels = topFour.map(([name]) => name);
    const dataValues = topFour.map(([, count]) => count);
    if (othersTotal > 0) {
      labels.push('Others');
      dataValues.push(othersTotal);
    }
    pieData = {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };
  }

  // Pie chart options to display count and percentage on hover
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

  return (
    <AuthGuard>
    <div className="h-[calc(100vh-72px)] bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-1/4 h-1/2 md:h-full md:mr-4 mb-4 md:mb-0 overflow-y-auto bg-blue-950">
          <div className="h-full p-4 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center border-b border-yellow-700 pb-2">
              Elections
            </h2>
            {sidebarError ? (
              <p className="text-center text-red-500">{sidebarError}</p>
            ) : (
              <ul className="space-y-3">
                {sidebarElections.map((election) => (
                  <li key={election.id}>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                        selectedElection === election.id
                          ? 'bg-yellow-500 text-gray-900'
                          : 'bg-red-950 text-gray-200 hover:bg-yellow-500 hover:text-gray-900'
                      }`}
                      onClick={() => {
                        setSelectedElection(election.id);
                        setShowAll(false);
                      }}
                    >
                      {election.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:w-3/4 h-1/2 md:h-full overflow-y-auto">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Live Results
          </h1>
          {loading ? (
            <p className="text-center">Loading live results...</p>
          ) : resultsError ? (
            <p className="text-center text-red-500">{resultsError}</p>
          ) : selectedElection ? (
            resultsForElection ? (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Results List */}
                <div className="lg:w-1/2">
                  <div className="space-y-4 mb-4">
                    {displayResults.map(([candidate, count]) => {
                      const percentage = totalVotes
                        ? ((count / totalVotes) * 100).toFixed(1)
                        : '0.0';
                      return (
                        <div
                          key={candidate}
                          className="p-4 border rounded bg-gray-800 flex flex-col sm:flex-row justify-between items-center"
                        >
                          <div className="font-bold">{candidate}</div>
                          <div className="text-sm sm:text-base">
                            Votes: {count} <span className="ml-2 text-red">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {sortedResults.length > 5 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-4 py-2 rounded bg-yellow-500 text-gray-900 font-semibold transition-colors duration-300"
                    >
                      {showAll ? 'Show Top 5' : 'View All'}
                    </button>
                  )}
                </div>

                {/* Pie Chart */}
                <div className="lg:w-1/2 flex justify-center items-center">
                  {pieData && (
                    <div className="max-w-md w-full">
                      <Pie data={pieData} options={pieOptions} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center">No results available for this election.</p>
            )
          ) : (
            <p className="text-center text-gray-400">
              Please select an election from the sidebar.
            </p>
          )}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
