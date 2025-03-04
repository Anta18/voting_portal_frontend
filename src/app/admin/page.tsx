'use client';
import { useState, useEffect } from 'react';
import { AuthGuard } from '../components/AuthGuard';

export default function Admin() {
  interface Election {
    id: number;
    name: string;
    election_type: string;
    start_date: Date;
    end_date: Date;
  }

  const [ongoing, setOngoing] = useState<Election[]>([]);
  const [future, setFuture] = useState<Election[]>([]);
  const [past, setPast] = useState<Election[]>([]);

  useEffect(() => {
    // Dummy data for elections
    const dummyOngoing = [
      {
        id: 1,
        name: 'Ongoing Election 1',
        election_type: 'presidential',
        start_date: new Date(),
        end_date: new Date(new Date().setDate(new Date().getDate() + 5)),
      },
    ];
    const dummyFuture = [
      {
        id: 2,
        name: 'Future Election 1',
        election_type: 'parliamentary',
        start_date: new Date(new Date().setDate(new Date().getDate() + 10)),
        end_date: new Date(new Date().setDate(new Date().getDate() + 15)),
      },
    ];
    const dummyPast = [
      {
        id: 3,
        name: 'Past Election 1',
        election_type: 'local',
        start_date: new Date(new Date().setDate(new Date().getDate() - 20)),
        end_date: new Date(new Date().setDate(new Date().getDate() - 15)),
      },
    ];

    setOngoing(dummyOngoing);
    setFuture(dummyFuture);
    setPast(dummyPast);
  }, []);

  return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6">
        <div className="w-full mx-auto">
          <h1 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
            Admin Dashboard
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
                    {ongoing.map((election) => (
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
                    {future.map((election) => (
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
                    {past.map((election) => (
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
  );
}
