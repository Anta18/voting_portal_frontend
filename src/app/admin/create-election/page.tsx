'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateElectionPage() {
  const [formData, setFormData] = useState({
    name: '',
    election_type: '',
    required_document: '',
    start_date: '',
    end_date: '',
  });
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New election data:', formData);
    setMessage('Election created successfully!');
    // Optionally, redirect to an elections list page.
  };

  return (
    <div className="mt-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Election</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Election Name"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="election_type"
          placeholder="Election Type (e.g., school, government)"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="required_document"
          placeholder="Required Document"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="start_date"
          placeholder="Start Date"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="date"
          name="end_date"
          placeholder="End Date"
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Create Election
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}
