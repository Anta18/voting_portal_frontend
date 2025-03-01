'use client';
import { useState } from 'react';

const dummyElections = [
  { id: '1', name: '2025 School Board Election', election_type: 'school', start_date: '2025-03-01', end_date: '2025-03-05' },
  { id: '2', name: 'Local Government Election', election_type: 'government', start_date: '2025-04-10', end_date: '2025-04-15' },
];

export default function DashboardPage() {
  const [elections] = useState(dummyElections);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          My Elections Dashboard
        </h1>
        
        {elections.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
            <p className="text-2xl">No registered elections found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {elections.map((election) => (
              <div 
                key={election.id} 
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border-l-8 border-transparent transition-transform duration-300 hover:scale-105 hover:shadow-2xl hover:border-l-8 hover:border-gradient-to-br hover:from-yellow-400 hover:to-red-600"
              >
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                    {election.name}
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Type:</span>
                      <span className="capitalize">{election.election_type}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Starts:</span>
                      <span>{new Date(election.start_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Ends:</span>
                      <span>{new Date(election.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 px-6 py-4 flex justify-center">
                  <button className="bg-gradient-to-r from-yellow-400 to-red-600 hover:from-red-600 hover:to-yellow-400 text-white px-6 py-2 rounded-full font-medium transition-colors duration-300">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
