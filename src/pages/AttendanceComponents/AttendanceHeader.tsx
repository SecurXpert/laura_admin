import React from "react";

interface AttendanceHeaderProps {
  onAdd: () => void;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({ onAdd }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      {/* LEFT TITLE */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Student Attendance
        </h1>
        <h3 className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Track and manage student attendance records efficiently
        </h3>
      </div>

      {/* RIGHT SIDE (BUTTON) */}
      <div className="flex items-center gap-3">
        {/* Add Button */}
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-5 py-2.5 
           rounded-full border border-transparent
           bg-gradient-to-r from-[#615FFF] to-[#AD46FF] 
           text-white 
           hover:from-[#514EF0] hover:to-[#9333EA]
           transition shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add Attendance
        </button>
      </div>
    </div>
  );
};
