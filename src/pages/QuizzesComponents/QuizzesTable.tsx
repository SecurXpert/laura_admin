import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  approved: number;
  model_type: string | null;
  no_of_questions: number;
  instructor_name: string;
  timer: number;
  created_at: string;
  updated_at: string;
}

interface QuizzesTableProps {
  loading: boolean;
  quizzesSlice: Quiz[];
  getCourseName: (courseId: number) => string;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  updatingId: number | null;
  onUpdateStatus: (quizId: number, approved: boolean) => Promise<void>;
  paginationComponent: React.ReactNode;
}

export const QuizzesTable: React.FC<QuizzesTableProps> = ({
  loading,
  quizzesSlice,
  getCourseName,
  formatDate,
  formatTime,
  updatingId,
  onUpdateStatus,
  paginationComponent,
}) => {
  return (
    <div className="w-full box-border max-w-full">
      <h1 className="text-2xl font-bold mb-6">Quizzes Approval</h1>

      {loading ? (
        <div className="space-y-4 mt-6 w-full">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-x-auto shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="min-w-[1000px] w-full border-collapse text-sm">
            <thead className="bg-[#F9FAFB80]">
              <tr className="border-t-2 border-b-2 border-gray-100">
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Quiz
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Instructor
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Questions
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Timer
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y-2 divide-gray-100">
              {quizzesSlice.map((quiz) => {
                return (
                  <tr
                    key={quiz.id}
                    className="hover:bg-gray-50/50 transition-colors bg-white"
                  >
                    {/* QUIZ */}
                    <td className="px-6 py-5 align-top">
                      <div className="font-bold text-[#1F2937] text-[16px] leading-tight max-w-[200px]">
                        {quiz.title}
                      </div>
                      <div className="text-[#6B7280] text-[16px] mt-1.5 max-w-[200px] truncate">
                        Topic: {quiz.description || "N/A"}
                      </div>
                    </td>

                    {/* INSTRUCTOR */}
                    <td className="px-6 py-5 align-top">
                      <div className="font-semibold text-[#1F2937] text-[16px]">
                        {quiz.instructor_name
                          ? String(quiz.instructor_name).trim()
                          : ""}
                      </div>
                    </td>

                    {/* COURSE */}
                    <td className="px-6 py-5 align-top">
                      <div className="font-semibold text-[#1F2937] text-[16px]">
                        {getCourseName(quiz.course_id)}
                      </div>
                    </td>

                    {/* QUESTIONS */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col items-start">
                        <div className="font-bold text-[#1F2937] text-[16px] leading-none">
                          {quiz.no_of_questions}
                        </div>
                        <div className="font-bold text-[#1F2937] text-[16px] mt-1 leading-none">
                          Questions
                        </div>
                        <div className="w-12 h-1.5 flex rounded-full overflow-hidden mt-2.5">
                          <div className="bg-[#10B981] flex-1"></div>
                          <div className="bg-[#F59E0B] flex-1"></div>
                          <div className="bg-[#EF4444] flex-1"></div>
                        </div>
                      </div>
                    </td>

                    {/* TIMER */}
                    <td className="px-6 py-5 align-top">
                      <div className="inline-flex items-center justify-center px-[12px] py-[5px] rounded-full text-[16px] font-bold bg-[#EFF6FF] text-[#3B82F6] mt-0.5 whitespace-nowrap">
                        {quiz.timer} Min
                      </div>
                    </td>

                    {/* CREATED AT */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col items-start text-[#6B7280] text-[16px] font-medium whitespace-nowrap mt-1">
                        <span>{formatDate(quiz.created_at)}</span>
                        <span className="text-[#9CA3AF] text-[16px] mt-0.5">
                          {formatTime(quiz.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* SUBMITTED */}
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col items-start text-[#6B7280] text-[16px] font-medium whitespace-nowrap mt-1">
                        <span>
                          {formatDate(quiz.updated_at || quiz.created_at)}
                        </span>
                        <span className="text-[#9CA3AF] text-[16px] mt-0.5">
                          {formatTime(quiz.updated_at || quiz.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5 align-top">
                      <div
                        className={`inline-flex items-center justify-center px-[12px] py-[5px] rounded-full text-[16px] font-bold mt-0.5 ${
                          quiz.approved === 1
                            ? "bg-[#D1FAE5] text-[#059669]"
                            : "bg-[#FEF3C7] text-[#D97706]"
                        }`}
                      >
                        {quiz.approved === 1 ? "Approved" : "Pending"}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5 align-top">
                      <div className="relative inline-block w-[110px]">
                        <select
                          value={quiz.approved === 1 ? "approved" : "pending"}
                          disabled={updatingId === quiz.id}
                          onChange={async (e) => {
                            const approvedValue = e.target.value === "approved";
                            await onUpdateStatus(quiz.id, approvedValue);
                          }}
                          className="appearance-none w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] text-[16px] font-semibold outline-none cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all shadow-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B7280]">
                          <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginationComponent}
        </div>
      )}
    </div>
  );
};
