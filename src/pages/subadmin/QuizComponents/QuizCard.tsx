import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2, Calendar, HelpCircle, BarChart3, Clock } from "lucide-react";
import { Quiz } from '../CreateQuizForm';

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '10/03/2026';
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '10/03/2026';
  }
};

interface QuizCardProps {
  quiz: Quiz;
  questionCount: number;
  onView: (quiz: Quiz) => void;
  onEdit: (quizId: number) => void;
  onDelete: (quizId: number) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, questionCount, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descText = quiz.description || "No description provided";
  const isLongText = descText.length > 60 || descText.split('\n').length > 2;

  return (
    <div
      className="relative overflow-hidden p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full w-full min-w-0"
      style={{ borderTop: "1.35px solid #F3F4F6" }}
    >
      <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-between">
        {/* Header */}
        <div className="mb-5 w-full min-w-0">
          <h3 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight leading-tight capitalize break-words">{quiz.title}</h3>
          <div className="mt-2">
            <div className={`text-xs sm:text-sm text-slate-500 leading-relaxed break-words whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-3" : ""}`}>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2.5 mb-5 w-full min-w-0">
          {/* Questions Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Questions</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {questionCount}
            </span>
          </div>

          {/* Course Id Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Course Id</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {quiz.course_id ?? "—"}
            </span>
          </div>

          {/* Duration Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Duration</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {quiz.timer !== undefined ? `${quiz.timer}m` : quiz.time !== undefined ? `${quiz.time}m` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions & Footer */}
      <div className="w-full min-w-0 mt-auto">
        <div className="flex flex-wrap gap-1 sm:gap-1.5 w-full mb-4">
          <Button
            className="flex-1 min-w-[62px] flex items-center justify-center gap-1 rounded-[12px] text-white font-semibold py-2 sm:py-2.5 h-10 sm:h-11 border-0 shadow-sm cursor-pointer transition-all duration-200 hover:opacity-95 text-[11px] sm:text-xs px-1.5 whitespace-nowrap"
            style={{ background: "linear-gradient(90deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)" }}
            onClick={() => onView(quiz)}
          >
            <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>View</span>
          </Button>

          <Button
            className="flex-1 min-w-[62px] flex items-center justify-center gap-1 rounded-[12px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 sm:py-2.5 h-10 sm:h-11 border-0 shadow-sm cursor-pointer transition-all duration-200 text-[11px] sm:text-xs px-1.5 whitespace-nowrap"
            onClick={() => onEdit(quiz.id)}
          >
            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Edit</span>
          </Button>

          <Button
            className="flex-1 min-w-[62px] flex items-center justify-center gap-1 rounded-[12px] bg-[#ff4b4c] hover:bg-[#ef4444] text-white font-semibold py-2 sm:py-2.5 h-10 sm:h-11 border-0 shadow-sm cursor-pointer transition-all duration-200 text-[11px] sm:text-xs px-1.5 whitespace-nowrap"
            onClick={() => onDelete(quiz.id)}
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>Delete</span>
          </Button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3 border-t border-slate-50">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Updated {formatDate(quiz.created_at)}</span>
        </div>
      </div>
    </div>
  );
};
