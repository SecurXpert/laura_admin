import React from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  search: string;
  setSearch: (val: string) => void;
}

export default function InstructorHeader({ search, setSearch }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8 w-full">
      {/* Left Section */}
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">
          Instructors
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Manage your teaching staff
        </p>
      </div>

      {/* Right Section Controls Stack */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
        {/* Search Bar - dynamically fluid width */}
        <div className="relative w-full sm:w-[280px] md:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search instructors by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#615FFF] focus:bg-white placeholder:text-gray-400 text-xs sm:text-sm transition-all shadow-sm"
          />
        </div>

        {/* Add Instructor Button */}
        <button
          onClick={() => navigate("add")}
          className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-medium bg-gradient-to-r from-[#615FFF] to-[#8B5CF6] hover:opacity-95 transition-opacity shadow-sm flex-shrink-0 active:scale-[0.99]"
        >
          <span className="text-base sm:text-lg leading-none">+</span>
          <span className="text-xs sm:text-sm whitespace-nowrap">Add Instructor</span>
        </button>
      </div>
    </div>
  );
}
