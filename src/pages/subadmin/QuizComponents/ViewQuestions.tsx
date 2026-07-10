import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, FileText, Search, HelpCircle, CheckCircle2 } from "lucide-react";
import { Quiz } from '../CreateQuizForm';

interface ViewQuestionsProps {
  quiz: Quiz | null;
  questions: any[];
  loading: boolean;
  onBack: () => void;
}

export const ViewQuestions: React.FC<ViewQuestionsProps> = ({ quiz, questions, loading, onBack }) => {
  const [search, setSearch] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Set the initial selected question if available and none selected
  useEffect(() => {
    if (!selectedQuestionId && questions.length > 0) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  useEffect(() => {
    if (selectedQuestionId !== null && window.innerWidth < 1024 && previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedQuestionId]);

  const filteredQuestions = questions.filter((q) =>
    q.question_text?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 capitalize">
            {quiz?.title || "Quiz Questions"}
          </h1>
          <p className="text-md text-gray-600 mt-1">
            View questions and correct answers for this quiz
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading questions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: QUESTIONS LIST & SEARCH */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="bg-indigo-500 text-white p-2 rounded-lg shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  Questions ({filteredQuestions.length})
                </h3>
              </div>

              {/* SEARCH */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 p-2.5 pl-9 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                />
                <Search className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
              </div>

              {/* QUESTIONS LIST */}
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {filteredQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <HelpCircle className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-slate-400 text-sm">No questions found</p>
                  </div>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuestionId(q.id)}
                      className={`p-3 rounded-xl border text-sm cursor-pointer transition duration-150 ${
                        String(selectedQuestionId) === String(q.id)
                          ? "bg-indigo-50/80 border-indigo-200 text-indigo-900 font-semibold shadow-sm"
                          : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
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
          <div ref={previewRef} className="lg:col-span-2">
            {(() => {
              const selectedQuestion = selectedQuestionId !== null
                ? questions.find((q) => String(q.id) === String(selectedQuestionId))
                : undefined;

              return selectedQuestion ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6 animate-in fade-in duration-150">
                  <div>
                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                      Multiple Choice Details
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-3 leading-relaxed">
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
                          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border transition-all duration-200 ${
                            isCorrect
                              ? "bg-emerald-50 border-emerald-200 shadow-sm text-emerald-950"
                              : "bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                                isCorrect
                                  ? "bg-emerald-200 text-emerald-800"
                                  : "bg-white border border-slate-200 text-slate-500"
                              }`}
                            >
                              {letter}
                            </div>
                            <span className="text-sm font-medium flex-1">
                              {optionText}
                            </span>
                          </div>
                          {isCorrect && (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct Answer
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                  <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-700">No Question Selected</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-sm">
                    Select a question from the list on the left to view its details and options
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
