'use client';
import { useState, useEffect } from 'react';
import { AuthGuard } from '../components/AuthGuard';

export default function DashboardPage() {
  const [ongoing, setOngoing] = useState([]);
  const [future, setFuture] = useState([]);
  const [past, setPast] = useState([]);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  
        const resOngoing = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/ongoing`, { headers });
        const dataOngoing = await resOngoing.json();
        setOngoing(dataOngoing.ongoing_elections || []);
  
        const resFuture = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/future`, { headers });
        const dataFuture = await resFuture.json();
        setFuture(dataFuture.future_elections || []);
  
        const resPast = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/user/past`, { headers });
        const dataPast = await resPast.json();
        setPast(dataPast.past_elections || []);
      } catch (err) {
        console.error('Failed to fetch elections:', err);
      }
    };
  
    fetchElections();
  }, []);
  

  return (
    <AuthGuard>
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          My Elections Dashboard
        </h1>
        
        {ongoing.length === 0 && future.length === 0 && past.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
            <p className="text-2xl">No registered elections found.</p>
          </div>
        ) : (
          <>
            {/* Ongoing Elections */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4">Ongoing Elections</h2>
              {ongoing.length === 0 ? (
                <p className="mb-6">No ongoing elections.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {ongoing.map((election: any) => (
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
            
            {/* Future Elections */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4">Future Elections</h2>
              {future.length === 0 ? (
                <p className="mb-6">No future elections.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {future.map((election: any) => (
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
            
            {/* Past Elections */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold mb-4">Past Elections</h2>
              {past.length === 0 ? (
                <p className="mb-6">No past elections.</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {past.map((election: any) => (
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
          </>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
