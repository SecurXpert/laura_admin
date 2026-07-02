import React from "react";
import { FiSearch } from "react-icons/fi";

interface SubAdminsHeaderProps {
  search: string;
  onSearchChange: (val: string) => void;
  onAddNew: () => void;
}

export const SubAdminsHeader: React.FC<SubAdminsHeaderProps> = ({
  search,
  onSearchChange,
  onAddNew,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      {/* LEFT SIDE (TITLE + SUBTITLE) */}
      <div className="flex flex-col">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Sub-Admin Management
        </h2>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Role based access control system with comprehensive permissions
        </p>
      </div>

      {/* RIGHT SIDE (SEARCH + BUTTON) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* SEARCH */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by subadmin name & id"
            className="w-full h-[42px] pl-11 pr-4 rounded-full border border-gray-200 bg-white text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#615FFF] focus:border-[#615FFF] transition"
          />
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={onAddNew}
          className="text-white px-4 h-10 rounded-full text-sm font-medium whitespace-nowrap bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:from-[#514EF0] hover:to-[#9333EA] transition shadow-sm"
        >
          + Add New Sub-Admin
        </button>
      </div>
    </div>
  );
};
