'use client';
import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Election {
  id: string;
  name: string;
}

const dummyElections: Election[] = [
  { id: '1', name: '2025 School Board Election' },
  { id: '2', name: 'Local Government Election' },
];

const dummyLiveResults: { [key: string]: { [candidate: string]: number } } = {
  '1': {
    'Alice Johnson': 45,
    'Bob Smith': 30,
    'Charles Davis': 15,
    'Diana Prince': 10,
    'Evan Stone': 5,
    'Fiona Clark': 2,
  },
  '2': {
    'Charlie Brown': 25,
    'Diana Prince': 35,
    'George Hill': 20,
    'Helen Troy': 10,
    'Ian Wright': 5,
    'Jasmine Lee': 3,
  },
};

export default function LiveResultsPage() {
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [showAll, setShowAll] = useState(false);

  const results = selectedElection ? dummyLiveResults[selectedElection] : null;

  // Sort results descending by vote count
  let sortedResults: [string, number][] = [];
  if (results) {
    sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);
  }

  // Compute total votes from all candidates for percentage calculations
  const totalVotes = sortedResults.reduce((sum, [, count]) => sum + count, 0);

  // List display: default to top 5 unless showAll is true.
  const displayResults = showAll ? sortedResults : sortedResults.slice(0, 5);

  // Prepare pie chart data: top 4 candidates, with remaining votes as 'Others'
  let pieData = null;
  if (sortedResults.length > 0) {
    const topFour = sortedResults.slice(0, 4);
    const others = sortedResults.slice(4);
    const othersTotal = others.reduce((sum, [, count]) => sum + count, 0);
    const labels = topFour.map(([name]) => name);
    const data = topFour.map(([, count]) => count);
    if (othersTotal > 0) {
      labels.push('Others');
      data.push(othersTotal);
    }
    pieData = {
      labels,
      datasets: [
        {
          data,
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

  // Pie chart options to show count and percentage on hover
  const pieOptions = {
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
    <div className="h-[calc(100vh-72px)] bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-4">
      <div className="h-full flex flex-col md:flex-row">
        {/* Enhanced Sidebar with separate scrollbar */}
        <aside className="md:w-1/4 h-1/2 md:h-full md:mr-4 mb-4 md:mb-0 overflow-y-auto bg-blue-950">
          <div className="h-full p-4 rounded-xl  shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center border-b border-yellow-700 pb-2">
              Elections
            </h2>
            <ul className="space-y-3">
              {dummyElections.map((election) => (
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
          </div>
        </aside>

        {/* Main Content with separate scrollbar */}
        <main className="md:w-3/4 h-1/2 md:h-full overflow-y-auto">
          <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Live Results
          </h1>
          {selectedElection ? (
            <>
              {sortedResults.length > 0 ? (
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
                <p>No results available for this election.</p>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400">
              Please select an election from the sidebar.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
