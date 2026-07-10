import React from 'react';
import { Users, UserCheck, TrendingUp } from 'lucide-react';

interface StudentStatsProps {
  studentCount: number;
  activeStudentCount: number;
}

const StudentStats: React.FC<StudentStatsProps> = ({ studentCount, activeStudentCount }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
      {/* Card 1: Total Students */}
      <div className="bg-gradient-to-tr from-white to-[#EEF2FF]/40 rounded-3xl p-6 shadow-sm border-2 border-slate-100 hover:border-slate-200 transition-colors duration-300 flex flex-col relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
          <Users className="w-6 h-6 text-[#3B82F6] stroke-[2]" />
        </div>
        <div className="mt-5">
          <h3 className="text-[32px] font-bold text-slate-900 leading-none">
            {studentCount.toLocaleString()}
          </h3>
          <p className="text-[15px] font-medium text-slate-500 mt-1">
            Total Students
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
        </div>
      </div>

      {/* Card 2: Active Students */}
      <div className="bg-gradient-to-tr from-white to-[#ECFDF5]/40 rounded-3xl p-6 shadow-sm border-2 border-slate-100 hover:border-slate-200 transition-colors duration-300 flex flex-col relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
          <UserCheck className="w-6 h-6 text-[#10B981] stroke-[2]" />
        </div>
        <div className="mt-5">
          <h3 className="text-[32px] font-bold text-slate-900 leading-none">
            {activeStudentCount.toLocaleString()}
          </h3>
          <p className="text-[15px] font-medium text-slate-500 mt-1">
            Active Students
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <TrendingUp className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};

export default StudentStats;
