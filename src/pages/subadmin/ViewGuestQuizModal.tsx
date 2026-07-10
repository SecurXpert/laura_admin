import React, { useState, useEffect } from "react";
import { GuestQuiz } from "./GuestQuiz";
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

  // Auto-select the first question when questions list loads or changes
  useEffect(() => {
    if (questions && questions.length > 0) {
      setSelectedQuestionId(questions[0].id);
    } else {
      setSelectedQuestionId(null);
    }
  }, [questions]);

  // Filter questions based on search term
  const filteredQuestions = questions.filter((q) =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Currently selected question object (evaluates to undefined if no question is explicitly clicked)
  const selectedQuestion = selectedQuestionId !== null
    ? questions.find((q) => String(q.id) === String(selectedQuestionId))
    : undefined;

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Guest Quizzes
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            {quiz?.title || "Quiz Questions"}
          </h1>
          <p className="text-md text-gray-600 mt-1">
            {quiz?.description || "View questions for this guest quiz"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: QUESTIONS LIST & SEARCH */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <div className="bg-indigo-500 text-white p-2 rounded-lg shadow-sm">
                <FiFileText className="text-base" />
              </div>
              <h3 className="font-semibold text-gray-800">
                Questions ({filteredQuestions.length})
              </h3>
            </div>

            {/* SEARCH */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border bg-gray-50 p-2.5 pl-9 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-base" />
            </div>

            {/* QUESTIONS LIST */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filteredQuestions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No questions found</p>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-3 rounded-xl border text-sm cursor-pointer transition ${String(selectedQuestionId) === String(q.id)
                      ? "bg-indigo-50 border-indigo-300 text-indigo-900 font-medium"
                      : "bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <p className="line-clamp-2">
                      {idx + 1}. {q.question_text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <div className="bg-white rounded-2xl p-6 border shadow-sm space-y-6">
              <div>
                <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  MCQ Question Details
                </span>
                <h3 className="text-lg font-semibold text-gray-800 mt-3 leading-relaxed">
                  {selectedQuestion.question_text}
                </h3>
              </div>

              {/* OPTIONS */}
              <div className="space-y-3">
                {["A", "B", "C", "D"].map((letter) => {
                  const optionKey = `option_${letter.toLowerCase()}`;
                  const optionText = selectedQuestion[optionKey];
                  const isCorrect =
                    selectedQuestion.correct_option?.toLowerCase() === letter.toLowerCase();

                  if (!optionText) return null;

                  return (
                    <div
                      key={letter}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-3 transition-all ${isCorrect
                        ? "bg-green-50 border-green-300 shadow-sm"
                        : "bg-gray-50 border-gray-100"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-full font-semibold text-sm ${isCorrect
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        >
                          {letter}
                        </div>
                        <span className={`text-sm break-words ${isCorrect ? "text-green-900 font-medium" : "text-gray-700"}`}>
                          {optionText}
                        </span>
                      </div>

                      {isCorrect && (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs bg-green-100/50 px-2.5 py-1 rounded-full w-fit shrink-0">
                          <FiCheckCircle />
                          Correct Answer
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="bg-gray-100 p-4 rounded-full text-gray-400 mb-3">
                <FiFileText size={32} />
              </div>
              <h3 className="font-semibold text-gray-700">No Question Selected</h3>
              <p className="text-gray-400 text-sm max-w-xs mt-1">
                Select a question from the left sidebar to view its multiple-choice options and correct answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewGuestQuizModal;
