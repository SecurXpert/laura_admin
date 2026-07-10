import React from "react";
import ScrollableDropdown from "@/components/subadmin/ScrollableDropdown";
import { FiSearch } from "react-icons/fi";

interface CourseFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  courseFilter: string;
  setCourseFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  levelFilter: string;
  setLevelFilter: (val: string) => void;
  uniqueCourses: { title: string }[];
  onReset: () => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({
  search,
  setSearch,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
  levelFilter,
  setLevelFilter,
  uniqueCourses,
  onReset,
}) => {
  return (
    <div className="w-full bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6">
      <div className="relative w-full mb-3 sm:mb-4">
        <input
          type="text"
          placeholder="Search courses by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 sm:h-11 bg-[#F9FAFB] rounded-xl pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 outline-none border border-gray-200/60 focus:border-[#5D3EFC] transition-all shadow-sm"
        />
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1 w-full sm:w-auto">
          <div className="w-full min-w-0">
            <ScrollableDropdown
              value={courseFilter}
              onChange={(e: any) => setCourseFilter(e.target.value)}
              options={uniqueCourses.map((c) => ({ value: c.title, label: c.title }))}
              placeholder="All Courses"
              buttonClassName="!h-9 sm:!h-10 !bg-[#F9FAFB] !rounded-xl !text-xs !font-medium"
            />
          </div>

          <div className="w-full min-w-0">
            <ScrollableDropdown
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
              placeholder="All Status"
              buttonClassName="!h-9 sm:!h-10 !bg-[#F9FAFB] !rounded-xl !text-xs !font-medium"
            />
          </div>

          <div className="w-full min-w-0">
            <ScrollableDropdown
              value={levelFilter}
              onChange={(e: any) => setLevelFilter(e.target.value)}
              options={[
                { value: "Beginner", label: "Beginner" },
                { value: "Intermediate", label: "Intermediate" },
                { value: "Advanced", label: "Advanced" }
              ]}
              placeholder="All Levels"
              buttonClassName="!h-9 sm:!h-10 !bg-[#F9FAFB] !rounded-xl !text-xs !font-medium"
            />
          </div>
        </div>

        <button
          onClick={onReset}
          className="h-9 sm:h-10 px-4 rounded-xl text-white text-xs font-semibold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 shadow-sm transition-all w-full sm:w-auto flex-shrink-0"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default CourseFilters;
