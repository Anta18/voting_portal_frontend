'use client';
import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, ChartOptions,
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

export default function FinalResultsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Sidebar elections fetched from backend (/election/user/past)
  const [sidebarElections, setSidebarElections] = useState<Election[]>([]);
  const [sidebarError, setSidebarError] = useState<string>('');

  // Final results fetched from backend (/results/final?election_id=...)
  const [finalResult, setFinalResult] = useState<any>(null);
  const [resultsError, setResultsError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Currently selected election from sidebar
  const [selectedElection, setSelectedElection] = useState<string>('');
  // Toggle to show all results vs top 5
  const [showAll, setShowAll] = useState(false);

  // Fetch sidebar elections (past elections) from backend
  useEffect(() => {
    async function fetchSidebarElections() {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/election/user/past`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Failed to fetch past elections');
        }
        const data = await res.json();
        setSidebarElections(data.past_elections || []);
        if (data.past_elections && data.past_elections.length > 0) {
          setSelectedElection(data.past_elections[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setSidebarError(err.message || 'Error fetching elections');
      }
    }
    fetchSidebarElections();
  }, [API_URL]);

  // Fetch final results for the selected election from backend
  useEffect(() => {
    async function fetchFinalResults() {
      if (!selectedElection) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const res = await fetch(
          `${API_URL}/results/final?election_id=${selectedElection}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error('Failed to fetch final results');
        }
        const data = await res.json();
        // When an election id is provided, backend returns a flat object.
        setFinalResult(data.final_results);
      } catch (err: any) {
        console.error(err);
        setResultsError(err.message || 'Error fetching final results');
      } finally {
        setLoading(false);
      }
    }
    fetchFinalResults();
  }, [API_URL, selectedElection]);

  // Process final result data if available
  let resultsForElection = finalResult ? finalResult.results : null;
  let sortedResults: [string, number][] = [];
  if (resultsForElection) {
    sortedResults = Object.entries(resultsForElection).map(
      ([key, value]) => [key, value] as [string, number]
    ).sort((a, b) => b[1] - a[1]);
  }
  const totalVotes = sortedResults.reduce((sum, [, count]) => sum + count, 0);
  const displayResults = showAll ? sortedResults : sortedResults.slice(0, 5);

  // Prepare pie chart data: top 4 candidates and aggregate remaining as 'Others'
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
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
        },
      ],
    };
  }

  const pieOptions: ChartOptions<'pie'> = {
    plugins: {
      legend: { position: 'bottom' },
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
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
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
            Final Results
          </h1>
          {loading ? (
            <p className="text-center">Loading final results...</p>
          ) : resultsError ? (
            <p className="text-center text-red-500">{resultsError}</p>
          ) : selectedElection ? (
            finalResult && resultsForElection ? (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Result Details and Leaderboard */}
                <div className="lg:w-1/2 space-y-6">
                  <div
                    className="p-6 rounded-lg bg-gray-700 shadow-lg border-t-4 border-transparent bg-clip-padding"
                    style={{
                      borderImage:
                        'linear-gradient(to right, #f6d365, #fda085) 1',
                    }}
                  >
                    <h2 className="text-2xl font-bold mb-2">
                      {finalResult.election_name}
                    </h2>
                    <p className="text-lg">
                      Final vote tally is available below.
                    </p>
                  </div>
                  <div className="p-6 rounded-lg bg-gray-700 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">
                      Leaderboard (Top 5)
                    </h3>
                    <ul className="space-y-3">
                      {displayResults.map(([candidate, count]) => (
                        <li
                          key={candidate}
                          className="flex justify-between items-center border-b border-gray-600 pb-2"
                        >
                          <span className="font-medium">{candidate}</span>
                          <span className="font-semibold">{count} votes</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Right Column: Pie Chart */}
                <div className="lg:w-1/2 flex justify-center items-center">
                  {pieData && (
                    <div className="max-w-md w-full">
                      <Pie data={pieData} options={pieOptions} />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center">
                No results available for this election.
              </p>
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
