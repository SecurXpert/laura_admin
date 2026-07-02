import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminQuizHeaderProps {
  onBulkUpload: () => void;
  onAddQuestion: () => void;
  onCreateQuiz: () => void;
}

export const AdminQuizHeader: React.FC<AdminQuizHeaderProps> = ({
  onBulkUpload,
  onAddQuestion,
  onCreateQuiz,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Admin Quizzes
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Create and manage all your admin quizzes
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">
        <Button
          variant="outline"
          onClick={onBulkUpload}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Bulk Upload CSV
        </Button>

        <Button
          variant="outline"
          onClick={onAddQuestion}
          className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </Button>

        <Button
          onClick={onCreateQuiz}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md animate-in fade-in duration-200 text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </Button>
      </div>
    </div>
  );
};
