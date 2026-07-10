import React, { useState } from "react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineCalendar,
} from "react-icons/hi";
import { GuestQuiz } from "../GuestQuizzes";

interface GuestQuizCardProps {
  quiz: GuestQuiz;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GuestQuizCard: React.FC<GuestQuizCardProps> = ({
  quiz,
  onView,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descText = quiz.description || "No description";
  const isLongText = descText.length > 60 || descText.split("\n").length > 2;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between w-full min-w-0 h-full">
      <div className="w-full min-w-0">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4 w-full min-w-0">
          {/* LEFT SIDE */}
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight break-words truncate w-full" title={quiz.title}>
              {quiz.title}
            </h2>
            <div className="mt-1.5">
              <div className={`text-xs sm:text-sm text-gray-500 leading-relaxed break-words whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-3" : ""}`}>
                {descText}
              </div>
              {isLongText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1.5 focus:outline-none transition-colors cursor-pointer block"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2.5 mb-5 w-full min-w-0">
          {/* Questions */}
          <div className="bg-gray-50/80 border border-gray-100/60 rounded-xl p-1.5 sm:p-2.5 text-center min-w-0 flex-1 flex flex-col items-center justify-center">
            <HiOutlineQuestionMarkCircle className="text-indigo-500 text-lg sm:text-2xl mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">
              Questions
            </p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">
              {quiz.no_of_questions ?? 0}
            </p>
          </div>

          {/* Course Id */}
          <div className="bg-gray-50/80 border border-gray-100/60 rounded-xl p-1.5 sm:p-2.5 text-center min-w-0 flex-1 flex flex-col items-center justify-center">
            <HiOutlineChartBar className="text-purple-500 text-lg sm:text-2xl mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">
              Course Id
            </p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">
              {quiz.course_id ?? "—"}
            </p>
          </div>

          {/* Duration */}
          <div className="bg-gray-50/80 border border-gray-100/60 rounded-xl p-1.5 sm:p-2.5 text-center min-w-0 flex-1 flex flex-col items-center justify-center">
            <HiOutlineClock className="text-orange-500 text-lg sm:text-2xl mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">
              Duration
            </p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">
              {quiz.timer !== undefined ? `${quiz.timer}m` : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full min-w-0 mt-auto">
        {/* ACTIONS */}
        <div className="flex gap-2 sm:gap-2.5 w-full">
          <button
            onClick={() => onView(quiz.id)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition hover:opacity-95 px-2 cursor-pointer whitespace-nowrap"
          >
            <FiEye className="text-base shrink-0" />
            <span>View</span>
          </button>

          <button
            onClick={() => onDelete(quiz.id)}
            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 bg-[#ff4b4c] hover:bg-[#ef4444] text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition px-2 cursor-pointer whitespace-nowrap"
          >
            <FiTrash2 className="text-base shrink-0" />
            <span>Delete</span>
          </button>
        </div>

        {/* FOOTER */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-3.5 pt-3 border-t border-gray-100 w-full min-w-0">
          <HiOutlineCalendar className="text-gray-400 text-sm shrink-0" />
          <span className="truncate">
            Updated{" "}
            {quiz.created_at
              ? new Date(quiz.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};
