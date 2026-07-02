import React from "react";
import { FiFilter, FiSearch } from "react-icons/fi";

interface GuestQuizzesFilterBoxProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const GuestQuizzesFilterBox: React.FC<GuestQuizzesFilterBoxProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow border mb-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4">
        {/* ICON */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white p-3 rounded-xl">
          <FiFilter size={18} />
        </div>

        {/* TEXT */}
        <div>
          <h2 className="font-semibold text-gray-800">Filters & Search</h2>
          <p className="text-sm text-gray-500">Find and filter guest quizzes</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* SEARCH INPUT */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search quizzes by name,id..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border bg-gray-50 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* ICON */}
          <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-lg" />
        </div>
      </div>
    </div>
  );
};
