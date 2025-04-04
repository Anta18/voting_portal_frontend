"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function CreateElectionPage() {
  const [formData, setFormData] = useState({
    name: "",
    election_type: "",
    required_document: "",
    start_date: "",
    end_date: "",
  });
  const [votersFile, setVotersFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
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

  // Predefined election types for dropdown
  const electionTypes = [
    { value: "", label: "Select an election type" },
    { value: "national", label: "National Election" },
    { value: "state", label: "State Election" },
    { value: "local", label: "Local Government" },
    { value: "school", label: "School/University" },
    { value: "organizational", label: "Organizational" },
  ];

  // Document types for dropdown
  const documentTypes = [
    { value: "", label: "Select required document" },
    { value: "id_card", label: "ID Card" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "passport", label: "Passport" },
    { value: "student_id", label: "Student ID" },
    { value: "employee_badge", label: "Employee Badge" },
    { value: "voter_card", label: "Voter Registration Card" },
  ];

  const tooltips = {
    election_type:
      "Select the type of election you're organizing. This helps configure appropriate settings.",
    required_document:
      "Specify what identification voters need to present before casting their vote.",
    votersFile:
      "Upload a .txt file with voter ids of eligible voters (one per line).",
    date_range: "Set the timeframe during which voters can cast their ballots.",
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    const token = localStorage.getItem("accessToken");

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate <= startDate) {
      setMessage("End date must be after start date");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    // Build the payload object based on the form data.
    let payload: ElectionPayload = { ...formData };

    // If a file is provided, read it as text and add to the payload.
    if (votersFile) {
      try {
        const fileContent = await readFileAsText(votersFile);
        payload.votersFile = fileContent;
      } catch (error) {
        setMessage("Error reading the voters file");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/election/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error creating election");
        setMessageType("error");
      } else {
        setMessage(data.message || "Election created successfully!");
        setMessageType("success");
        // Optionally clear the form or navigate away.
        setFormData({
          name: "",
          election_type: "",
          required_document: "",
          start_date: "",
          end_date: "",
        });
        setVotersFile(null);

        // Redirect after a short delay to show success message
        setTimeout(() => {
          // router.push('/elections'); // Uncomment to redirect after creation.
        }, 2000);
      }
    } catch (error) {
      setMessage("Error creating election");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="relative w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-red-600 transition-all duration-300"
            style={{
              width: `${Object.values(formData).filter(Boolean).length * 20}%`,
            }}
          ></div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl mt-4 overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
            <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
              Create New Election
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Configure your election details and settings
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Election name */}
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-gray-300 mb-2 font-medium"
                  >
                    Election Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter a descriptive name for your election"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                    required
                  />
                </div>

                {/* Election type with tooltip */}
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <label
                      htmlFor="election_type"
                      className="block text-gray-300 font-medium"
                    >
                      Election Type
                    </label>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === "election_type"
                            ? null
                            : "election_type"
                        )
                      }
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>

                  {activeTooltip === "election_type" && (
                    <div className="absolute z-10 right-0 mt-0 bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg text-sm w-64 text-gray-300">
                      {tooltips.election_type}
                    </div>
                  )}

                  <select
                    name="election_type"
                    id="election_type"
                    value={formData.election_type}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none transition-all duration-300"
                    required
                  >
                    {electionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-8">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Required document with tooltip */}
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <label
                      htmlFor="required_document"
                      className="block text-gray-300 font-medium"
                    >
                      Required Document
                    </label>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === "required_document"
                            ? null
                            : "required_document"
                        )
                      }
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>

                  {activeTooltip === "required_document" && (
                    <div className="absolute z-10 right-0 mt-0 bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg text-sm w-64 text-gray-300">
                      {tooltips.required_document}
                    </div>
                  )}

                  <select
                    name="required_document"
                    id="required_document"
                    value={formData.required_document}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none transition-all duration-300"
                    required
                  >
                    {documentTypes.map((doc) => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-8">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Date selection with tooltip */}
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <label className="block text-gray-300 font-medium">
                      Election Period
                    </label>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === "date_range" ? null : "date_range"
                        )
                      }
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>

                  {activeTooltip === "date_range" && (
                    <div className="absolute z-10 right-0 mt-0 bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg text-sm w-64 text-gray-300">
                      {tooltips.date_range}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="flex items-center p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg">
                        <Calendar className="h-5 w-5 text-yellow-400 mr-3" />
                        <div className="flex-1">
                          <label
                            htmlFor="start_date"
                            className="block text-xs text-gray-400 mb-1"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="w-full bg-transparent focus:outline-none text-white"
                            required
                          />
                        </div>
                      </div>
                      {formData.start_date && (
                        <p className="text-xs text-gray-400 mt-1 pl-2">
                          {formatDate(formData.start_date)}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <div className="flex items-center p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg">
                        <Calendar className="h-5 w-5 text-red-500 mr-3" />
                        <div className="flex-1">
                          <label
                            htmlFor="end_date"
                            className="block text-xs text-gray-400 mb-1"
                          >
                            End Date
                          </label>
                          <input
                            type="date"
                            name="end_date"
                            id="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="w-full bg-transparent focus:outline-none text-white"
                            required
                          />
                        </div>
                      </div>
                      {formData.end_date && (
                        <p className="text-xs text-gray-400 mt-1 pl-2">
                          {formatDate(formData.end_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Voters file upload with tooltip */}
                <div className="relative">
                  <div className="flex items-center mb-2">
                    <label
                      htmlFor="votersFile"
                      className="block text-gray-300 font-medium"
                    >
                      Upload Voters File
                    </label>
                    <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
                      Optional
                    </span>
                    <button
                      type="button"
                      className="ml-2 text-gray-400 hover:text-yellow-400 transition-colors"
                      onClick={() =>
                        setActiveTooltip(
                          activeTooltip === "votersFile" ? null : "votersFile"
                        )
                      }
                    >
                      <HelpCircle size={16} />
                    </button>
                  </div>

                  {activeTooltip === "votersFile" && (
                    <div className="absolute z-10 right-0 mt-0 bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg text-sm w-64 text-gray-300">
                      {tooltips.votersFile}
                    </div>
                  )}

                  <div className="flex items-center p-4 bg-gray-700 bg-opacity-50 border border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-300">
                    <FileText className="h-6 w-6 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <input
                        type="file"
                        name="votersFile"
                        id="votersFile"
                        onChange={handleFileChange}
                        accept=".txt"
                        className="hidden"
                      />
                      <label htmlFor="votersFile" className="cursor-pointer">
                        <span className="block font-medium text-gray-300">
                          {votersFile
                            ? votersFile.name
                            : "Click to upload voter list"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1 block">
                          {votersFile
                            ? `${(votersFile.size / 1024).toFixed(2)} KB`
                            : "TXT file with one email per line"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status message */}
              {message && (
                <div
                  className={`p-4 rounded-lg flex items-center ${
                    messageType === "success"
                      ? "bg-green-900 bg-opacity-50 border border-green-700"
                      : messageType === "error"
                      ? "bg-red-900 bg-opacity-50 border border-red-700"
                      : ""
                  }`}
                >
                  {messageType === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : messageType === "error" ? (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  ) : null}
                  <p
                    className={`text-sm ${
                      messageType === "success"
                        ? "text-green-400"
                        : messageType === "error"
                        ? "text-red-400"
                        : ""
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                  isSubmitting
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-400 to-red-600 text-gray-900 hover:from-red-600 hover:to-yellow-400 transform hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Create Election"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
