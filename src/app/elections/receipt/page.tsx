'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

function ReceiptContent() {
  const searchParams = useSearchParams();
  const receipt = searchParams.get('receipt');

  return (
    <div className="min-h-[calc(100vh-72px)] h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div
        className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border-t-4 border-transparent bg-clip-padding backdrop-filter backdrop-blur-sm"
        style={{ borderImage: 'linear-gradient(to right, #f6d365, #fda085) 1' }}
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
          Vote Receipt
        </h1>
        {receipt ? (
          <div className="p-6 rounded-lg bg-gray-700 shadow-lg">
            <div className="flex flex-col items-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-xl font-semibold text-green-400 mb-8">
                Vote Recorded Successfully!
              </p>
            </div>
            <p className="font-mono text-xl text-gray-100 text-center">
              Receipt Code: <span className="font-bold">{receipt}</span>
            </p>
          </div>
        ) : (
          <p className="text-lg text-gray-300 text-center">
            No receipt information found.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div>Loading receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}
