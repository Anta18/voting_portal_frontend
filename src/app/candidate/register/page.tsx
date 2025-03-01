// app/candidate/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CandidateRegistrationPage() {
  const [formData, setFormData] = useState({
    election_id: '',
    full_name: '',
    party: '',
    manifesto: '',
    documents: '',
  });
  const constRouter = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleCandidateRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Candidate registration data:', formData);
    constRouter.push('/dashboard');
  };

  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold mb-4">Candidate Registration</h1>
      <form onSubmit={handleCandidateRegister} className="space-y-4 max-w-md">
        <input type="text" name="election_id" placeholder="Election ID" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="full_name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded" required />
        <input type="text" name="party" placeholder="Party" onChange={handleChange} className="w-full p-2 border rounded" required />
        <textarea name="manifesto" placeholder="Manifesto (optional)" onChange={handleChange} className="w-full p-2 border rounded" rows={4} />
        <input type="text" name="documents" placeholder="Documents URL or metadata (optional)" onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Register as Candidate
        </button>
      </form>
    </div>
  );
}
