'use client';
import { useState } from 'react';

const dummyLiveResults = {
  'Alice Johnson': 45,
  'Bob Smith': 30,
};

export default function AdminLiveResultsPage() {
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Live Election Results</h1>
      <div className="space-y-2">
        {Object.entries(dummyLiveResults).map(([name, count]) => (
          <div key={name} className="p-2 border rounded bg-white">
            <p className="font-bold">{name}</p>
            <p>Votes: {count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
