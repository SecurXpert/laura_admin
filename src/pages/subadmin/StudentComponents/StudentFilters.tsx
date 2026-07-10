import React from 'react';
import { Filter, Search, ChevronDown, RefreshCw } from 'lucide-react';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  courseFilter: string;
  setCourseFilter: (value: string) => void;
  allUniqueCourses: string[];
  onReset: () => void;
}

const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  courseFilter,
  setCourseFilter,
  allUniqueCourses,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-[24px] p-5 mb-8 flex flex-col gap-5 shadow-sm border border-slate-200">
      <div className="flex items-center gap-4 pl-1">
        <div className="w-[48px] h-[48px] rounded-[14px] bg-[#5B4AE0] text-white flex items-center justify-center shadow-sm">
          <Filter className="w-5 h-5 stroke-[2]" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-[600] text-slate-800 text-[15px] leading-tight mb-0.5">Filters & Search</h3>
          <p className="text-[12px] text-[#94A3B8] font-medium">Find & filter student</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] stroke-[2]" />
          <input
            type="text"
            placeholder="Search quizzes by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 placeholder-[#94A3B8] font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors"
          />
        </div>
        <div className="flex w-full sm:w-auto gap-3 md:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors cursor-pointer appearance-none pr-10"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors cursor-pointer appearance-none pr-10"
            >
              {allUniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
          </div>
          <button
            onClick={onReset}
            className="px-5 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-[#64748B] font-medium hover:bg-[#F1F5F9] flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <RefreshCw className="w-[16px] h-[16px] text-[#94A3B8] stroke-[2]" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentFilters;
