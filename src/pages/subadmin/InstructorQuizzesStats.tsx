import React from "react";
import { FiBookOpen } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi";
import { BsCheckCircle } from "react-icons/bs";
import { Quiz } from "./InstructorQuizzes";

interface InstructorQuizzesStatsProps {
  quizStatusLoading: boolean;
  quizStatusCount: {
    total_quizzes: number;
    approved: number;
    pending: number;
  } | null;
  quizzes: Quiz[];
}

const InstructorQuizzesStats: React.FC<InstructorQuizzesStatsProps> = ({
  quizStatusLoading,
  quizStatusCount,
  quizzes,
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden px-0 sm:px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 w-full items-stretch">
        
        {/* ================= TOTAL QUIZZES ================= */}
        <div className="relative w-full min-w-0 max-w-full bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-5 sm:p-6 min-h-[210px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 w-full min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-md sm:text-sm text-gray-500 font-medium leading-tight truncate">
                Total Quizzes
              </p>
              <h2 className="text-2xl sm:text-2xl lg:text-4xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                {quizStatusLoading
                  ? "..."
                  : quizStatusCount?.total_quizzes ?? quizzes.length}
              </h2>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(139,92,246,0.3)]">
              <FiBookOpen className="text-white text-lg sm:text-xl" />
            </div>
          </div>
          <div className="w-full h-[65px] sm:h-[72px] mt-4 overflow-hidden">
            <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25 L 160 50 L 0 50 Z"
                fill="url(#purpleArea)"
              />
              <path
                d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25"
                fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* ================= PENDING APPROVALS ================= */}
        <div className="relative w-full min-w-0 max-w-full bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-5 sm:p-6 min-h-[210px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 w-full min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-md sm:text-sm text-gray-500 font-medium leading-tight truncate">
                Pending Approvals
              </p>
              <h2 className="text-2xl sm:text-2xl lg:text-4xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                {quizStatusLoading
                  ? "..."
                  : quizStatusCount?.pending ??
                  quizzes.filter((q) => q.approved === 0).length}
              </h2>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F97316] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(249,115,22,0.3)]">
              <HiOutlineClock className="text-white text-xl sm:text-2xl" />
            </div>
          </div>
          <div className="w-full h-[70px] sm:h-[78px] flex items-end gap-[6px] mt-4 px-2">
            {[30, 20, 50, 15, 40, 20, 25].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[4px] bg-[#F97316] transition-all duration-300"
                style={{ height: `${(h / 50) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* ================= APPROVED TODAY ================= */}
        <div className="relative w-full min-w-0 max-w-full bg-white rounded-3xl border border-gray-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-5 sm:p-6 min-h-[210px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3 w-full min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-md sm:text-sm text-gray-500 font-medium leading-tight truncate">
                Approved Today
              </p>
              <h2 className="text-2xl sm:text-2xl lg:text-4xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                {quizStatusLoading
                  ? "..."
                  : quizStatusCount?.approved ??
                  quizzes.filter((q) => q.approved === 1).length}
              </h2>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#10B981] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(16,185,129,0.3)]">
              <BsCheckCircle className="text-white text-lg sm:text-xl" />
            </div>
          </div>
          <div className="w-full h-[65px] sm:h-[72px] mt-4 overflow-hidden">
            <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25"
                fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorQuizzesStats;
