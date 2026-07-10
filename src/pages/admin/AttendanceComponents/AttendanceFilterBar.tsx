import React from "react";
import { Search } from "lucide-react";

interface AttendanceFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  fromDate: string;
  onFromDateChange: (val: string) => void;
  toDate: string;
  onToDateChange: (val: string) => void;
  courseId: string;
  onCourseIdChange: (val: string) => void;
  courses: any[];
}

export const AttendanceFilterBar: React.FC<AttendanceFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  courseId,
  onCourseIdChange,
  courses,
}) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col xl:flex-row gap-4">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
        <input
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 h-11 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] focus:ring-1 focus:ring-[#6366F1] outline-none"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
        <div className="relative w-full sm:w-[150px]">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full h-11 px-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] text-gray-600 focus:ring-1 focus:ring-[#6366F1] outline-none"
            title="From Date"
          />
        </div>
        <div className="relative w-full sm:w-[150px]">
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full h-11 px-3 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] text-gray-600 focus:ring-1 focus:ring-[#6366F1] outline-none"
            title="To Date"
          />
        </div>
        <div className="relative w-full sm:w-[180px]">
          <select
            value={courseId}
            onChange={(e) => onCourseIdChange(e.target.value)}
            className="w-full h-11 pl-3 pr-10 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] text-gray-700 outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none cursor-pointer"
          >
            <option value="" disabled>
              Select Course
            </option>
            {courses.map((course) => (
              <option key={course.id} value={course.id.toString()}>
                {course.name || course.title || `Course ${course.id}`}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
