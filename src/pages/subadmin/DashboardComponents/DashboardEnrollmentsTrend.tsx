import React from "react";

interface DashboardEnrollmentsTrendProps {
  trendData: any[];
}

const DashboardEnrollmentsTrend: React.FC<DashboardEnrollmentsTrendProps> = ({ trendData }) => {
  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Enrollments Trend</h2>
          <p className="text-sm text-slate-500 mt-1">Monthly student enrollments (Last 6 Months)</p>
        </div>
      </div>

      <div className="space-y-4">
        {trendData.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-8 text-slate-500 text-sm font-medium">{item.month}</div>

            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 bg-slate-50/50 h-6 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all duration-1000"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <div className="w-24 text-slate-700 font-semibold text-sm whitespace-nowrap">
                {item.students} Students
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-[#6366F1]"></div>
          <span className="text-sm text-slate-500 font-medium">Students</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnrollmentsTrend;
