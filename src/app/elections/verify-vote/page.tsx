'use client';
import { useState } from 'react';

export default function VerifyVotePage() {
  const [receipt, setReceipt] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy logic: if receipt matches a preset value, we assume it is valid.
    if (receipt === 'ABC123XYZ') {
      setVerificationResult('Vote verified: Your vote for Alice Johnson has been recorded.');
    } else {
      setVerificationResult('Invalid receipt. Please check your receipt code.');
    }
  };

  return (
    <div className="mt-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verify Your Vote</h1>
      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your receipt code"
          value={receipt}
          onChange={(e) => setReceipt(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Verify Vote
        </button>
      </form>
      {verificationResult && (
        <div className="mt-4 p-4 border rounded bg-white">
          <p>{verificationResult}</p>
        </div>
      )}
    </div>
  );
}
