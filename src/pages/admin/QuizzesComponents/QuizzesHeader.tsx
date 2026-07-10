import React from "react";
import { FiSearch } from "react-icons/fi";

interface QuizzesHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
}

export const QuizzesHeader: React.FC<QuizzesHeaderProps> = ({
  search,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full box-border">
      {/* LEFT */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Instructor Quizzes
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Review, approve, and analyze quizzes created by instructors
        </p>
      </div>

      {/* RIGHT SEARCH */}
      {/* <div className="mt-4 md:mt-0 relative w-full md:w-[350px]">
        <FiSearch className="absolute top-1/2 -translate-y-1/2 left-5 text-[#9CA3AF] text-[16px]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search quizzes, instructors, topics..."
          className="w-full h-[44px] pl-[42px] pr-4 rounded-[100px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[14px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all shadow-sm"
        />
      </div> */}
    </div>
  );
};
