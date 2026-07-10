import React from "react";
import { FiUpload, FiPlus } from "react-icons/fi";

interface GuestQuizzesHeaderProps {
  onBulkUpload: () => void;
  onAddQuestion: () => void;
  onCreateQuiz: () => void;
}

export const GuestQuizzesHeader: React.FC<GuestQuizzesHeaderProps> = ({
  onBulkUpload,
  onAddQuestion,
  onCreateQuiz,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      {/* LEFT SIDE */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Guest Quizzes
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Manage public quizzes accessible without login
        </p>
      </div>

      {/* RIGHT SIDE BUTTONS */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">
        {/* BULK UPLOAD */}
        <button
          onClick={onBulkUpload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
        >
          <FiUpload className="text-base" />
          Bulk Upload
        </button>

        {/* ADD QUESTION */}
        <button
          onClick={onAddQuestion}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
        >
          <FiPlus className="text-base" />
          Add Question
        </button>

        {/* CREATE QUIZ */}
        <button
          onClick={onCreateQuiz}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-md bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-95 transition"
        >
          <FiPlus className="text-base" />
          Create Quiz
        </button>
      </div>
    </div>
  );
};
