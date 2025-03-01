'use client';
import { useState } from 'react';

interface Block {
  index: number;
  timestamp: string;
  vote_data: string;
  previous_hash: string;
  hash: string;
}

const dummyBlockchain: Block[] = [
  { index: 0, timestamp: '2025-01-01T00:00:00Z', vote_data: 'Genesis Block', previous_hash: '0', hash: 'abcd1234' },
  { index: 1, timestamp: '2025-03-02T12:34:56Z', vote_data: '{"election_id":"1", "voter_id":"1", "candidate":"1"}', previous_hash: 'abcd1234', hash: 'efgh5678' },
  { index: 2, timestamp: '2025-03-02T12:35:56Z', vote_data: '{"election_id":"1", "voter_id":"2", "candidate":"1"}', previous_hash: 'efgh5678', hash: 'ijkl9012' },
];

export default function CheckIntegrityPage() {
  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Check Vote Integrity</h1>
      <p className="mb-4">Below is a dummy representation of the blockchain:</p>
      <div className="space-y-4">
        {dummyBlockchain.map(block => (
          <div key={block.index} className="p-4 border rounded bg-white">
            <p><span className="font-bold">Block {block.index}</span></p>
            <p>Timestamp: {block.timestamp}</p>
            <p>Vote Data: {block.vote_data}</p>
            <p>Previous Hash: {block.previous_hash}</p>
            <p>Hash: {block.hash}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
