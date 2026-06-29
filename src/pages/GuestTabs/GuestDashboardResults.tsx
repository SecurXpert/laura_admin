import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizResult {
  id: number;
  guest_id: number;
  title: string;
  total_questions: number;
  score: number;
  time_taken: number;
  submitted_at: string;
  badge: string;
  name: string;
}

export default function GuestDashboardResults() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) {
        setResultsError("No authentication token found. Please log in again.");
        setResultsLoading(false);
        return;
      }

      setResultsLoading(true);
      setResultsError(null);

      try {
        const response = await api.get<QuizResult[]>("/guest/admin-view-quiz/results");
        const sortedData = [...(response.data || [])].sort((a: any, b: any) => b.id - a.id);
        setResults(sortedData);
      } catch (err: any) {
        console.error(err);
        setResultsError(err.response?.data?.detail || err.message || "Failed to load quiz results");
      } finally {
        setResultsLoading(false);
      }
    };

    fetchResults();
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
      {resultsLoading ? (
        renderSkeleton()
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-100">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Guest</th>
                <th className="px-4 py-3 text-left text-sm">Quiz</th>
                <th className="px-4 py-3 text-left text-sm">Score</th>
                <th className="px-4 py-3 text-left text-sm">Questions</th>
                <th className="px-4 py-3 text-left text-sm">Time</th>
                <th className="px-4 py-3 text-left text-sm">Badge</th>
                <th className="px-4 py-3 text-left text-sm">Submitted</th>
              </tr>
            </thead>

            <tbody>
              {results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((result, index) => {
                const initials = result.name
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={result.id ?? index} className="border-b">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #615FFF 0%, #AD46FF 100%)",
                          }}
                        >
                          {initials}
                        </div>
                      </div>
                      {result.name}
                    </td>
                    <td className="px-4 py-4">{result.title}</td>
                    <td className="px-4 py-4">
                      {result.score}/{result.total_questions}
                    </td>
                    <td className="px-4 py-4">{result.total_questions}</td>
                    <td className="px-4 py-4">
                      {result.time_taken === 0 ? "—" : `${result.time_taken}s`}
                    </td>
                    <td className="px-4 py-4">
                      {result.badge || "No Badge"}
                    </td>
                    <td className="px-4 py-4">
                      {new Date(result.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!resultsLoading && results.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 mt-2">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, results.length)} of {results.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(results.length / itemsPerPage) }).map((_, i) => (
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(results.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(results.length / itemsPerPage)}
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
