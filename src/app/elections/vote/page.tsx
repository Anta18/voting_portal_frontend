'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const dummyElections: Election[] = [
  { id: '1', name: '2025 School Board Election' },
  { id: '2', name: 'Local Government Election' },
];

const dummyCandidatesByElection: { [key: string]: Candidate[] } = {
  '1': [
    { id: '1', name: 'Alice Johnson', party: 'Democratic', image: '/images/candidate1.jpg' },
    { id: '2', name: 'Bob Smith', party: '', image: '/images/candidate2.jpg' },
  ],
  '2': [
    { id: '3', name: 'Charlie Brown', party: 'Republican', image: '/images/candidate3.jpg' },
    { id: '4', name: 'Diana Prince', party: 'Independent', image: '/images/candidate4.jpg' },
  ],
};

export default function VotePage() {
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Selected candidate:', selectedCandidate);
    const dummyReceipt = 'ABC123XYZ';
    router.push(`/elections/receipt?receipt=${dummyReceipt}`);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-850 rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Vote in Election
        </h1>
        <div className="max-w-md mx-auto mb-6">
          <label className="block mb-2 font-semibold text-gray-200">Select Election:</label>
          <select
            className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            value={selectedElection}
            onChange={(e) => {
              setSelectedElection(e.target.value);
              setSelectedCandidate(null);
            }}
            required
          >
            <option value="">Select an election</option>
            {dummyElections.map((election) => (
              <option key={election.id} value={election.id}>
                {election.name}
              </option>
            ))}
          </select>
        </div>
        {selectedElection && (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dummyCandidatesByElection[selectedElection]?.map((candidate) => (
                <label
                  key={candidate.id}
                  className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer transition-all duration-300 bg-gray-700 
                  hover:shadow-xl ${
                    selectedCandidate === candidate.id ? 'border-yellow-400' : 'border-gray-600'
                  }`}
                >
                  {/* Custom Radio Button */}
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
                  <h2 className="text-xl font-bold text-gray-100 mb-2">{candidate.name}</h2>
                  <p className="text-gray-300">{candidate.party ? candidate.party : 'Independent'}</p>
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
        )}
      </div>
    </div>
  );
}
