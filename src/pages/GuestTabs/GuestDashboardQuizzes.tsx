import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizItem {
  quiz_title: string;
  no_of_questions: number;
  created_at: string;
}

export default function GuestDashboardQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!token) {
        setQuizzesError("No authentication token found. Please log in again.");
        setQuizzesLoading(false);
        return;
      }

      setQuizzesLoading(true);
      setQuizzesError(null);

      try {
        const response = await api.get<QuizItem[]>("/guest/admin-view/quiz_listing");
        const sortedData = [...(response.data || [])].sort((a: any, b: any) => {
          if (a.id && b.id) return b.id - a.id;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setQuizzes(sortedData);
      } catch (err: any) {
        console.error(err);
        setQuizzesError(err.response?.data?.detail || err.message || "Failed to load quiz listing");
      } finally {
        setQuizzesLoading(false);
      }
    };

    fetchQuizzes();
  }, [token]);

  const renderSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      {quizzesLoading ? (
        renderSkeleton()
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-100">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Title</th>
                <th className="px-4 py-3 text-left text-sm">Questions</th>
                <th className="px-4 py-3 text-left text-sm">Created</th>
              </tr>
            </thead>

            <tbody>
              {quizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((quiz, index) => (
                <tr key={quiz.id ?? index} className="border-b">
                  <td className="px-4 py-4">{quiz.quiz_title}</td>
                  <td className="px-4 py-4">{quiz.no_of_questions}</td>
                  <td className="px-4 py-4">
                    {new Date(quiz.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!quizzesLoading && quizzes.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 mt-2">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, quizzes.length)} of {quizzes.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(quizzes.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(quizzes.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(quizzes.length / itemsPerPage)}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
