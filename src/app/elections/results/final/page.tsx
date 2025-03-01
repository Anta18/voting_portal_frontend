'use client';
import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Election {
  id: string;
  name: string;
}

const dummyElections: Election[] = [
  { id: '1', name: '2025 School Board Election' },
  { id: '2', name: 'Local Government Election' },
];

const dummyFinalResults: { [key: string]: { election_name: string; details: string } } = {
  '1': {
    election_name: '2025 School Board Election',
    details: 'Alice Johnson wins with 45% of the votes.',
  },
  '2': {
    election_name: 'Local Government Election',
    details: 'Diana Prince wins with 55% of the votes.',
  },
};

// Dummy data for the final results pie chart (candidate breakdown)
const dummyFinalChartData: { [key: string]: { labels: string[]; data: number[] } } = {
  '1': { labels: ['Alice Johnson', 'Bob Smith', 'Charles Davis', 'Diana Prince', 'Evan Stone'], data: [45, 30, 15, 10, 5] },
  '2': { labels: ['Diana Prince', 'Charlie Brown', 'George Hill', 'Helen Troy', 'Ian Wright'], data: [55, 25, 20, 10, 5] },
};

// Dummy leaderboard data with candidate votes (more than 5 entries for demonstration)
const dummyFinalLeaderboard: { [key: string]: { candidate: string; votes: number }[] } = {
  '1': [
    { candidate: 'Alice Johnson', votes: 45 },
    { candidate: 'Bob Smith', votes: 30 },
    { candidate: 'Charles Davis', votes: 15 },
    { candidate: 'Diana Prince', votes: 10 },
    { candidate: 'Evan Stone', votes: 5 },
    { candidate: 'Fiona Clark', votes: 2 },
  ],
  '2': [
    { candidate: 'Diana Prince', votes: 55 },
    { candidate: 'Charlie Brown', votes: 25 },
    { candidate: 'George Hill', votes: 20 },
    { candidate: 'Helen Troy', votes: 10 },
    { candidate: 'Ian Wright', votes: 5 },
    { candidate: 'Jasmine Lee', votes: 3 },
  ],
};

export default function FinalResultsPage() {
  const [selectedElection, setSelectedElection] = useState<string>('');
  const result = selectedElection ? dummyFinalResults[selectedElection] : null;
  const chartInfo = selectedElection ? dummyFinalChartData[selectedElection] : null;
  const leaderboardData = selectedElection ? dummyFinalLeaderboard[selectedElection] : null;

  // Prepare pie chart data if available
  let pieData = null;
  if (chartInfo) {
    pieData = {
      labels: chartInfo.labels,
      datasets: [
        {
          data: chartInfo.data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };
  }

  // Get top 5 leaderboard entries sorted descending by votes
  const topFive = leaderboardData
    ? leaderboardData.sort((a, b) => b.votes - a.votes).slice(0, 5)
    : [];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="h-full flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-1/4 h-full mr-4 overflow-y-auto">
          <div className="h-full p-4 rounded-xl bg-blue-900 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center border-b border-blue-700 pb-2">
              Elections
            </h2>
            <ul className="space-y-3">
              {dummyElections.map((election) => (
                <li key={election.id}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-300 font-medium ${
                      selectedElection === election.id
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-blue-800 text-gray-200 hover:bg-yellow-500 hover:text-gray-900'
                    }`}
                    onClick={() => setSelectedElection(election.id)}
                  >
                    {election.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:w-3/4 h-full overflow-y-auto">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Final Results
          </h1>
          {selectedElection ? (
            result ? (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Result Details and Leaderboard */}
                <div className="lg:w-1/2 space-y-6">
                  {/* Result Details Card */}
                  <div
                    className="p-6 rounded-lg bg-gray-700 shadow-lg border-t-4 border-transparent bg-clip-padding"
                    style={{ borderImage: 'linear-gradient(to right, #f6d365, #fda085) 1' }}
                  >
                    <h2 className="text-2xl font-bold mb-2">{result.election_name}</h2>
                    <p className="text-lg">{result.details}</p>
                  </div>

                  {/* Leaderboard */}
                  <div className="p-6 rounded-lg bg-gray-700 shadow-lg">
                    <h3 className="text-xl font-bold mb-4">Leaderboard (Top 5)</h3>
                    <ul className="space-y-3">
                      {topFive.map((entry, index) => (
                        <li key={entry.candidate} className="flex justify-between items-center border-b border-gray-600 pb-2">
                          <span className="font-medium">
                            {index + 1}. {entry.candidate}
                          </span>
                          <span className="font-semibold">{entry.votes} votes</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Column: Pie Chart */}
                <div className="lg:w-1/2 flex justify-center items-center">
                  {pieData && (
                    <div className="max-w-md w-full">
                      <Pie
                        data={pieData}
                        options={{
                          plugins: {
                            legend: { position: 'bottom' },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p>No results available for this election.</p>
            )
          ) : (
            <p className="text-center">Please select an election from the sidebar.</p>
          )}
        </main>
      </div>
    </div>
  );
}
