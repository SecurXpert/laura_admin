import React, { useState, useEffect } from "react";
import { GuestQuiz } from "./GuestQuizzes";
import { FiArrowLeft, FiSearch, FiCheckCircle, FiFileText } from "react-icons/fi";

interface ViewGuestQuizModalProps {
  quiz: GuestQuiz | undefined;
  quizId: number;
  questions: any[];
  onClose: () => void;
}

const ViewGuestQuizModal: React.FC<ViewGuestQuizModalProps> = ({
  quiz,
  quizId,
  questions,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  // Filter questions based on search term
  const filteredQuestions = questions.filter((q) =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Currently selected question object (evaluates to undefined if no question is explicitly clicked)
  const selectedQuestion = selectedQuestionId !== null
    ? questions.find((q) => String(q.id) === String(selectedQuestionId))
    : undefined;

  // Options mapping for easy access
  const optionsMap: Record<string, string> = selectedQuestion
    ? {
      A: selectedQuestion.option_a,
      B: selectedQuestion.option_b,
      C: selectedQuestion.option_c,
      D: selectedQuestion.option_d,
    }
    : {};

  return (
    <div className="bg-[#F8FAFC] p-4 sm:p-6 rounded-xl mt-4 animate-fadeIn min-h-[calc(100vh-100px)] flex flex-col justify-start">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Quiz ID: {quizId}
            </span>
            <span className="text-sm font-medium text-gray-500">•</span>
            <span className="text-sm font-medium text-gray-700">
              {quiz?.title || `Guest Quiz`}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mt-1">Questions Management</h1>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl shadow-sm text-sm font-medium transition"
        >
          <FiArrowLeft className="text-base" />
          <span>Back to Quizzes</span>
        </button>
      </div>

      {/* SEARCH BAR (Matching User Screenshot Top Bar) */}
      <div className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm mb-6">
        <div className="flex items-center gap-2.5 flex-1">
          <FiSearch className="text-gray-400 text-lg flex-shrink-0" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap border-l pl-4 py-0.5">
          {filteredQuestions.length} questions
        </span>
      </div>

      {/* MAIN LAYOUT: TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* LEFT COLUMN: LIST OF QUESTIONS */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto flex flex-col justify-start divide-y divide-gray-100">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No matching questions found.
            </div>
          ) : (
            filteredQuestions.map((q: any, index: number) => {
              const isSelected = selectedQuestion != null && String(selectedQuestion.id) === String(q.id);

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className={`p-4 cursor-pointer transition select-none ${isSelected
                      ? "bg-[#EEF5FF]"
                      : "bg-white hover:bg-gray-50/60"
                    }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs text-gray-400 font-semibold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2 break-words">
                      {q.question_text || <span className="italic text-gray-400">Untitled Question</span>}
                    </span>
                  </div>

                  {/* Sample Static Badges matching the requested screenshot perfectly */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pl-4">
                    <span className="bg-blue-100/80 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                      React
                    </span>
                    <span className="bg-amber-100/80 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Medium
                    </span>
                    <span className="bg-purple-100/80 text-purple-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Multiple Choice
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT COLUMN: DETAILED VIEW OF SELECTED QUESTION */}
        <div className="lg:col-span-7 sticky top-4">
          {selectedQuestion ? (
            <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
              <div>
                {/* Top Badges */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                    React
                  </span>
                  <span className="bg-amber-100 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full">
                    Medium
                  </span>
                  <span className="bg-purple-100 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full">
                    Multiple Choice
                  </span>
                </div>

                {/* Question Heading */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 leading-relaxed break-words">
                  {selectedQuestion.question_text || <span className="italic text-gray-400">Untitled Question</span>}
                </h2>

                {/* Options List */}
                <div className="space-y-3">
                  {(["A", "B", "C", "D"] as const).map((optKey) => {
                    const optText = optionsMap[optKey];
                    const isCorrect =
                      selectedQuestion.correct_option?.toUpperCase() === optKey;

                    return (
                      <div
                        key={optKey}
                        className={`rounded-xl p-3.5 flex items-center justify-between transition border ${isCorrect
                            ? "bg-[#E8F8EE] border-[#BBE5C9]"
                            : "bg-white border-gray-200"
                          }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden pr-2">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCorrect
                                ? "bg-[#1A8A44] text-white"
                                : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {optKey}
                          </span>
                          <span
                            className={`text-sm truncate ${isCorrect ? "font-medium text-gray-800" : "text-gray-700"
                              }`}
                          >
                            {optText || (
                              <span className="text-gray-400 italic">Empty Option</span>
                            )}
                          </span>
                        </div>

                        {isCorrect && (
                          <div className="flex items-center gap-1 text-[#1A8A44] text-xs font-semibold flex-shrink-0 pl-2">
                            <FiCheckCircle className="text-sm" />
                            <span>Correct</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl bg-white p-12 text-center text-gray-400 shadow-sm flex flex-col items-center justify-center min-h-[450px]">
              <FiFileText className="text-4xl text-gray-300 mb-2" />
              <p>Select a question from the left panel to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGuestQuizModal;
