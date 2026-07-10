import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, ChevronDown, Check, RefreshCw } from "lucide-react";

interface QuizMin {
  id: number;
  title: string;
}

interface AdminQuizFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedQuiz: string;
  onSelectQuiz: (val: string) => void;
  quizzes: QuizMin[];
  onReset: () => void;
}

export const AdminQuizFilters: React.FC<AdminQuizFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedQuiz,
  onSelectQuiz,
  quizzes,
  onReset,
}) => {
  const [isQuizMenuOpen, setIsQuizMenuOpen] = useState(false);

  return (
    <div className="p-6 rounded-2xl border shadow-sm mb-8 bg-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <Filter className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold">Filters & Search</h3>
          <p className="text-sm text-muted-foreground">
            Refine your quiz list
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Search quizzes by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="relative w-full sm:w-[220px] shrink-0">
            <div
              onClick={() => setIsQuizMenuOpen(!isQuizMenuOpen)}
              className="w-full h-10 px-3 border rounded-lg text-sm bg-white text-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-all select-none shadow-sm"
            >
              <span className="truncate">
                {selectedQuiz === "all"
                  ? "All Quizzes"
                  : quizzes.find(
                      (q) => q.id.toString() === selectedQuiz.toString()
                    )?.title || `Quiz ${selectedQuiz}`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${
                  isQuizMenuOpen ? "rotate-180" : ""
                }`}
              />
            </div>

            {isQuizMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsQuizMenuOpen(false)}
                />
                <div className="absolute right-0 sm:left-0 top-[calc(100%+6px)] w-full min-w-[260px] max-h-[320px] overflow-y-auto scrollbar-hide bg-white rounded-xl border border-gray-200 shadow-[0_10px_35px_rgba(0,0,0,0.12)] z-50 py-2 animate-fade-in">
                  <div
                    onClick={() => {
                      onSelectQuiz("all");
                      setIsQuizMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                      selectedQuiz === "all"
                        ? "text-slate-900 font-semibold bg-slate-50"
                        : "text-slate-700 font-normal hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                      {selectedQuiz === "all" && (
                        <Check className="w-4 h-4 text-slate-800" />
                      )}
                    </div>
                    <span className="truncate">All Quizzes</span>
                  </div>

                  {quizzes.map((quiz) => {
                    const quizIdStr = quiz.id.toString();
                    const isSelected = selectedQuiz.toString() === quizIdStr;
                    return (
                      <div
                        key={quiz.id}
                        onClick={() => {
                          onSelectQuiz(quizIdStr);
                          setIsQuizMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          isSelected
                            ? "text-slate-900 font-semibold bg-slate-50"
                            : "text-slate-700 font-normal hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                          {isSelected && (
                            <Check className="w-4 h-4 text-slate-800" />
                          )}
                        </div>
                        <span className="truncate">{quiz.title}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 shrink-0"
            onClick={onReset}
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
