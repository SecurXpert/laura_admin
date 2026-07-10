import React, { useState } from "react";
import { Quiz } from "../CreateAdminQuizForm";
import { HelpCircle, BarChart3, Clock, Eye, Trash2, Pencil, Calendar } from "lucide-react";

interface QuizCardProps {
  quiz: Quiz;
  questionCount: number;
  onView: (quiz: Quiz) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, questionCount, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descText = quiz.description || "No description";
  const isLongText = descText.length > 60 || descText.split('\n').length > 2;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border hover:shadow-md transition flex flex-col justify-between h-full w-full min-w-0">
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="mb-4 w-full min-w-0">
          <h2 className="font-bold text-gray-900 text-lg sm:text-xl leading-tight break-words">
            {quiz.title}
          </h2>
          <div className="mt-2">
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
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1.5 focus:outline-none transition-colors cursor-pointer"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 sm:gap-2.5 mb-5 w-full min-w-0">
          <div className="bg-gray-50/80 rounded-xl p-1.5 sm:p-2.5 text-center shadow-sm flex flex-col items-center justify-center min-w-0 flex-1 border border-gray-100/60">
            <HelpCircle className="text-indigo-500 w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">Questions</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">{questionCount}</p>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-1.5 sm:p-2.5 text-center shadow-sm flex flex-col items-center justify-center min-w-0 flex-1 border border-gray-100/60">
            <BarChart3 className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">Course Id</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">{quiz.course_id}</p>
          </div>

          <div className="bg-gray-50/80 rounded-xl p-1.5 sm:p-2.5 text-center shadow-sm flex flex-col items-center justify-center min-w-0 flex-1 border border-gray-100/60">
            <Clock className="text-orange-500 w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 shrink-0" />
            <p className="text-gray-500 text-[10px] sm:text-[11px] md:text-xs font-medium leading-tight block text-center">Duration</p>
            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base mt-1 block text-center break-words">{quiz.timer || quiz.time || 0}m</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 sm:gap-1.5 w-full min-w-0 mt-auto">
        <button
          onClick={() => onView(quiz)}
          className="flex-1 min-w-[62px] flex items-center justify-center gap-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2 sm:py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>View</span>
        </button>
        <button
          onClick={() => onEdit(quiz.id)}
          className="flex-1 min-w-[62px] flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 sm:py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(quiz.id)}
          className="flex-1 min-w-[62px] flex items-center justify-center gap-1 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2 sm:py-2.5 px-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition shadow-sm whitespace-nowrap cursor-pointer"
        >
          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>Delete</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
        <Calendar className="w-4 h-4 text-gray-400" />
        <span>
          Updated {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
        </span>
      </div>
    </div>
  );
};
