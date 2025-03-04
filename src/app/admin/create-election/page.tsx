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
  const [votersFile, setVotersFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  interface FormData {
    name: string;
    election_type: string;
    required_document: string;
    start_date: string;
    end_date: string;
  }

  interface FileChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList };
  }

  interface ElectionPayload {
    name: string;
    election_type: string;
    required_document: string;
    start_date: string;
    end_date: string;
    votersFile?: string | ArrayBuffer | null;
  }
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVotersFile(e.target.files[0]);
    }
  };

  // Helper function to read the file as text
  const readFileAsText = (file: File): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    
    // Build the payload object based on the form data.
    let payload:ElectionPayload = { ...formData };

    // If a file is provided, read it as text and add to the payload.
    if (votersFile) {
      try {
        const fileContent = await readFileAsText(votersFile);
        payload.votersFile = fileContent;
      } catch (error) {
        setMessage('Error reading the voters file');
        return;
      }
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/election/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Error creating election');
      } else {
        setMessage(data.message || 'Election created successfully!');
        // Optionally clear the form or navigate away.
        setFormData({
          name: '',
          election_type: '',
          required_document: '',
          start_date: '',
          end_date: '',
        });
        setVotersFile(null);
        // router.push('/elections'); // Uncomment to redirect after creation.
      }
    } catch (error) {
      setMessage('Error creating election');
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg shadow-2xl pt-8 pb-6 px-8 w-full max-w-lg">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
          Create Election
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-1">
              Election Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter election name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="election_type" className="block text-gray-300 mb-1">
              Election Type
            </label>
            <input
              type="text"
              name="election_type"
              id="election_type"
              placeholder="e.g., school, government"
              value={formData.election_type}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div>
            <label htmlFor="required_document" className="block text-gray-300 mb-1">
              Required Document
            </label>
            <input
              type="text"
              name="required_document"
              id="required_document"
              placeholder="Enter required document"
              value={formData.required_document}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="votersFile" className="block text-gray-300 mb-1">
              Upload Voters File (optional)
            </label>
            <input
              type="file"
              name="votersFile"
              id="votersFile"
              onChange={handleFileChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              accept=".txt"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-red-600 text-gray-900 rounded-md font-bold transition-colors duration-300 hover:from-red-600 hover:to-yellow-400"
          >
            Create Election
          </button>
        </form>
        {message && (
          <div className="mt-6 text-center">
            <p className="text-green-400 font-semibold">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
