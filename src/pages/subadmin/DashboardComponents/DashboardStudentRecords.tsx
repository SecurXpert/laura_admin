import React from "react";
import DashboardStudentRow from "./DashboardStudentRow";

interface DashboardStudentRecordsProps {
  studentSearchTerm: string;
  setStudentSearchTerm: (val: string) => void;
  studentCourseFilter: string;
  setStudentCourseFilter: (val: string) => void;
  allUniqueCourses: string[];
  filteredStudents: any[];
}

const DashboardStudentRecords: React.FC<DashboardStudentRecordsProps> = ({
  studentSearchTerm,
  setStudentSearchTerm,
  studentCourseFilter,
  setStudentCourseFilter,
  allUniqueCourses,
  filteredStudents,
}) => {
  return (
    <div className="bg-white rounded-3xl pt-4 sm:pt-6 md:pt-8 pb-4 sm:pb-6 md:pb-8 border shadow-sm">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Student Records</h2>
            <p className="text-sm text-slate-500 mt-1">Recent student activity and performance</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              className="pl-10 w-full h-10 border border-slate-200 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={studentCourseFilter}
              onChange={(e) => setStudentCourseFilter(e.target.value)}
              className="h-10 border border-slate-200 rounded-xl bg-white px-4 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none pr-10 relative cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '10px' }}
            >
              {allUniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((s, i) => (
            <DashboardStudentRow key={i} s={s} />
          ))
        ) : (
          <p className="text-gray-500 py-4">No students found</p>
        )}
      </div>
    </div>
  );
};

export default DashboardStudentRecords;
