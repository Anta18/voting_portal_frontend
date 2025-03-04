'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/app/components/AuthGuard';

interface Election {
  id: string;
  name: string;
  election_type?: string;
  start_date?: string;
  end_date?: string;
}

export default function ElectionsPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [elections, setElections] = useState<Election[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch eligible elections from backend (/election/eligible_for_registration)
  useEffect(() => {
    async function fetchEligibleElections() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('User not authenticated');
        const res = await fetch(`${API_URL}/election/eligible_for_registration`, {
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
        setElections(data.eligible_elections || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching elections');
      } finally {
        setLoading(false);
      }
    }
    fetchEligibleElections();
  }, [API_URL]);

  const handleRegister = async (electionId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('User not authenticated');
      const res = await fetch(`${API_URL}/election/register_for_election`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ election_id: electionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      console.log('Registration successful:', data);
      // Optionally, navigate to a confirmation page or refresh eligible elections.
      router.push('/elections/confirmation');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error registering for election');
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-24 mt-12 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Elections
        </h1>
        {loading ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
            <p className="text-2xl">Loading eligible elections...</p>
          </div>
        ) : error ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
            <p className="text-2xl text-red-500">{error}</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center shadow-2xl">
            <p className="text-2xl">No eligible elections</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <div
                key={election.id}
                className="flex flex-col h-full bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6"
              >
                <div>
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-center text-transparent">
                    {election.name}
                  </h2>
                </div>
                <div className="mt-auto text-center">
                  <p className="mb-2 capitalize">
                    <span className="font-bold">Type: </span>
                    <span className="text-green-800">
                      {election.election_type}
                    </span>
                  </p>
                  <button
                    onClick={() => handleRegister(election.id)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-red-600 hover:from-red-600 hover:to-yellow-400 text-white py-2 rounded-full font-medium transition-colors duration-300"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
