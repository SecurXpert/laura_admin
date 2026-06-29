import React, { useState } from "react";
import { Quiz } from "../CreateAdminQuizForm";
import { ArrowLeft, Loader2, Search, FileText, CheckCircle2 } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

interface ViewQuestionsProps {
  quiz: Quiz | null;
  questions: any[];
  loading: boolean;
  onBack: () => void;
  onQuestionsUpdate?: () => void;
}

export const ViewQuestions: React.FC<ViewQuestionsProps> = ({ quiz, questions, loading, onBack, onQuestionsUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const filteredQuestions = questions.filter(q =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 w-fit px-3 py-1.5 mb-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </button>

        <div className="flex items-center gap-2 mb-2 text-sm">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium border border-indigo-100">
            {quiz?.title || "Quiz"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          Questions Management
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between border border-gray-200 rounded-xl bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 border-l border-gray-200 pl-4 ml-4 whitespace-nowrap">
          <span className="font-semibold text-gray-700">{filteredQuestions.length}</span> questions
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <FileText className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">No questions found</h3>
          <p className="text-gray-500 mt-1 text-sm">
            This quiz does not have any questions yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Panel: Question List */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1 pb-4 custom-scrollbar">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                onClick={() => {
                  setSelectedQuestion(q);
                  setIsEditing(false); // Reset edit state when changing question
                }}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedQuestion?.id === q.id
                    ? 'border-indigo-400 shadow-md ring-1 ring-indigo-400 bg-indigo-50/10'
                    : 'bg-white hover:border-gray-300 border-gray-200 shadow-sm'
                  }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-indigo-400 font-semibold text-sm mt-0.5">{idx + 1}</span>
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                    {q.question_text}
                  </h3>
                </div>

                {/* Tags (Mocked to match mockup as real data lacks these distinct fields) */}
                <div className="flex flex-wrap gap-2 text-[11px] font-medium ml-5">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Category</span>
                  <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">Medium</span>
                  <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">Multiple Choice</span>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500 bg-white border border-dashed rounded-xl">
                No questions match your search.
              </div>
            )}
          </div>

          {/* Right Panel: Detailed View */}
          <div className="w-full lg:w-2/3">
            {selectedQuestion ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 min-h-[400px]">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">
                    {selectedQuestion.question_text}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'a', text: selectedQuestion.option_a },
                    { id: 'b', text: selectedQuestion.option_b },
                    { id: 'c', text: selectedQuestion.option_c },
                    { id: 'd', text: selectedQuestion.option_d },
                  ].map((option) => {
                    if (!option.text) return null;
                    const isCorrect = selectedQuestion.correct_option === option.id;
                    
                    return (
                      <div 
                        key={option.id}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          isCorrect 
                            ? 'bg-green-50/50 border-green-500' 
                            : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                            isCorrect ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {option.id.toUpperCase()}
                          </div>
                          <div className={`text-sm font-medium pt-1 ${isCorrect ? 'text-green-900' : 'text-gray-700'}`}>
                            {option.text}
                          </div>
                        </div>
                        {isCorrect && (
                          <div className="absolute top-4 right-4 text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {selectedQuestion.explanation && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Explanation</h4>
                    <p className="text-sm text-blue-800">{selectedQuestion.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-gray-400 h-full">
                <FileText className="w-16 h-16 mb-4 text-gray-200" strokeWidth={1.5} />
                <p className="text-sm font-medium">Select a question from the left panel to view details.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
