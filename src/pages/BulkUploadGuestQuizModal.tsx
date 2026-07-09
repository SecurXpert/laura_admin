import React, { useState } from "react";
import api from "@/lib/api"; import { GuestQuiz } from "./GuestQuizzes";
import { FiUpload, FiInfo, FiArrowLeft } from "react-icons/fi";
interface BulkUploadGuestQuizModalProps {
  quizzes: GuestQuiz[];
  onClose: () => void;
}

const BulkUploadGuestQuizModal: React.FC<BulkUploadGuestQuizModalProps> = ({
  quizzes,
  onClose,
}) => {
  const [bulkQuizId, setBulkQuizId] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append("title", bulkQuizId);
    formData.append("file", csvFile);

    try {
      await api.post(
        "/admin/guest-quiz/upload-mcq-csv",
        formData
      );

      alert("Bulk Uploaded");
      onClose();
    } catch (error) {
      console.error("Failed to bulk upload:", error);
      alert("Failed to bulk upload");
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      {/* HEADER */}
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB]/95 backdrop-blur-md py-4 px-4 sm:px-6 -mx-4 sm:-mx-6 -mt-3 sm:-mt-4 border-b border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 transition-all">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Guest Quizzes
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            Bulk Upload CSV
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Upload multiple questions via CSV file
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleBulkUpload}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md transition-all w-full sm:w-auto cursor-pointer"
          >
            <FiUpload className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800">Upload Details</h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* QUIZ ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Quiz ID <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={bulkQuizId}
                  onChange={(e) => setBulkQuizId(e.target.value)}
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id.toString()}>
                      {quiz.id} - {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* CSV FILE */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  CSV File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv"
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit lg:sticky lg:top-[160px] z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.694.694 1.74.694 2.434 0l5.139-5.139a2.25 2.25 0 000-3.182L10.11 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-800">Upload Info</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Quiz ID</span>
              <span className="font-medium">{bulkQuizId || "--"}</span>
            </div>

            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>File</span>
              <span className="font-medium">
                {csvFile ? csvFile.name : "No file selected"}
              </span>
            </div>

            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Format</span>
              <span className="font-medium">CSV</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p className="font-semibold text-gray-700">Quick Tips</p>
            <p>✔ Select the quiz to upload questions to</p>
            <p>✔ Upload a valid CSV file with questions</p>
            <p>✔ CSV must include question, options, and correct answer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadGuestQuizModal;
