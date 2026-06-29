import React from "react";
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
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-2">
          <h2 className="font-bold text-gray-900 text-lg leading-6 break-words">
            {quiz.title}
          </h2>
          <p className="text-base text-gray-500 mt-1 leading-6 break-words max-h-[72px] overflow-hidden">
            {quiz.description || "No description"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
          <HelpCircle className="text-indigo-500 w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
          <p className="text-gray-500 text-xs sm:text-sm font-medium">Questions</p>
          <p className="font-bold text-gray-900 text-base sm:text-xl">{questionCount}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
          <BarChart3 className="text-purple-500 w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
          <p className="text-gray-500 text-xs sm:text-sm font-medium">Course Id</p>
          <p className="font-bold text-gray-900 text-base sm:text-xl">{quiz.course_id}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
          <Clock className="text-orange-500 w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2" />
          <p className="text-gray-500 text-xs sm:text-sm font-medium">Duration</p>
          <p className="font-bold text-gray-900 text-base sm:text-xl">{quiz.timer || quiz.time || 0}m</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onView(quiz)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={() => onEdit(quiz.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(quiz.id)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
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
