'use client';

const dummyPublishedResults = [
  { election_id: '1', election_name: '2025 School Board Election', details: 'Alice Johnson wins with 45% of the votes.' },
  { election_id: '2', election_name: 'Local Government Election', details: 'Diana Prince wins with 55% of the votes.' },
];

export default function AdminPublishedResultsPage() {
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Published Election Results</h1>
      <ul className="space-y-2">
        {dummyPublishedResults.map(result => (
          <li key={result.election_id} className="p-4 border rounded bg-white">
            <h2 className="font-bold">{result.election_name}</h2>
            <p>{result.details}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
