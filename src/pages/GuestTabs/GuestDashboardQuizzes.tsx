import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Clock, CheckCircle2 } from "lucide-react";

interface GuestExamResult {
  id?: number;
  guest_id?: number | string;
  exam_id?: number | string;
  exam_title?: string;
  title?: string;
  candidate_name?: string;
  name?: string;
  score?: number;
  total_questions?: number;
  time_taken?: number;
  status?: string;
  badge?: string;
  submitted_at?: string;
  submited_at?: string;
  created_at?: string;
  [key: string]: any;
}

export default function GuestDashboardQuizzes() {
  const [results, setResults] = useState<GuestExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  const fetchExamResults = async () => {
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<GuestExamResult[]>("/guest/exam/results");
      const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const sortedData = [...data].sort((a: any, b: any) => {
        if (a.id && b.id) return b.id - a.id;
        const dateA = new Date(a.submitted_at || a.submited_at || a.created_at || 0).getTime();
        const dateB = new Date(b.submitted_at || b.submited_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setResults(sortedData);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Error fetching guest exam results:", err);
      const errDetail = err.response?.data?.detail || err.message || "Failed to load guest exam results";
      setError(typeof errDetail === "object" ? JSON.stringify(errDetail) : String(errDetail));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamResults();
  }, [token]);

  const renderSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );

  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(results.length / itemsPerPage);

  return (
    <div className="mt-4 space-y-6">
      {/* Header */}
      {/* <div className="flex justify-between items-center bg-gray-50/80 p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Guest Exam Results</h2>
          <p className="text-xs text-gray-500 mt-0.5">View examination performance for guest candidates</p>
        </div>
      </div> */}

      {loading ? (
        renderSkeleton()
      ) : error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="font-medium text-gray-600">No exam results found</p>
          <p className="text-xs text-gray-400 mt-1">Results submitted by guests will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full bg-white text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5"> Guest Name</th>
                <th className="px-4 py-3.5">Exam Title</th>
                <th className="px-4 py-3.5">Total score </th>
                <th className="px-4 py-3.5">Percentage</th>
                <th className="px-4 py-3.5">Submitted At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedResults.map((result, index) => {
                const formatVal = (val: any): string | number => {
                  if (val === null || val === undefined) return "—";
                  if (typeof val === "object") return JSON.stringify(val);
                  return val;
                };

                const extractMetrics = (res: any) => {
                  let totalQ = Number(res.total_questions) || 0;
                  let earnedScore: number | string = "—";
                  let percentageStr: string = "—";

                  if (Array.isArray(res.score)) {
                    if (totalQ === 0) totalQ = res.score.length;
                    if (res.score.length > 0) {
                      let sumScore = 0;
                      let sumPct = 0;
                      res.score.forEach((item: any) => {
                        if (item && typeof item === "object") {
                          if (item.score !== undefined && item.score !== null) {
                            sumScore += Number(item.score) || 0;
                          } else if (item.percentage !== undefined && item.percentage !== null) {
                            sumScore += (Number(item.percentage) || 0) / 100;
                          }
                          sumPct += Number(item.percentage) || 0;
                        } else if (typeof item === "number") {
                          sumScore += item;
                        }
                      });
                      earnedScore = Number.isInteger(sumScore) ? sumScore : Number(sumScore.toFixed(1));
                      percentageStr = `${Math.round(sumPct / res.score.length)}%`;
                    } else {
                      earnedScore = 0;
                      percentageStr = "0%";
                    }
                  } else if (res.score && typeof res.score === "object") {
                    if (res.score.score !== undefined) earnedScore = res.score.score;
                    if (res.score.percentage !== undefined) percentageStr = `${res.score.percentage}%`;
                  } else if (res.score !== undefined && res.score !== null) {
                    earnedScore = res.score;
                  }

                  if (percentageStr === "—" && res.percentage !== undefined && res.percentage !== null) {
                    percentageStr = `${res.percentage}%`;
                  }
                  if (percentageStr === "—" && typeof earnedScore === "number" && totalQ > 0) {
                    percentageStr = `${Math.round((earnedScore / totalQ) * 100)}%`;
                  }

                  let totalDisplay = "—";
                  if (res.total !== undefined && res.total !== null) {
                    totalDisplay = `${res.total}`;
                  } else if (earnedScore !== "—" && totalQ > 0) {
                    totalDisplay = `${earnedScore} / ${totalQ}`;
                  } else if (earnedScore !== "—") {
                    totalDisplay = `${earnedScore}`;
                  } else if (totalQ > 0) {
                    totalDisplay = `${totalQ}`;
                  }

                  return { totalDisplay, percentageDisplay: percentageStr };
                };

                const rawName = result.guest_name || result.candidate_name || result.name;
                const displayName = rawName ? (typeof rawName === "object" ? JSON.stringify(rawName) : String(rawName)) : `Guest #${formatVal(result.guest_id) || 'N/A'}`;
                const rawExam = result.exam_title || result.title;
                const examName = rawExam ? (typeof rawExam === "object" ? JSON.stringify(rawExam) : String(rawExam)) : `Exam #${formatVal(result.exam_id) || 'N/A'}`;
                const submittedDate = result.submitted_at || result.submited_at || result.created_at;
                const { totalDisplay, percentageDisplay } = extractMetrics(result);
                
                const initials = displayName
                  .replace(/[^a-zA-Z0-9 ]/g, "")
                  .split(" ")
                  .filter(Boolean)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "G";

                return (
                  <tr key={result.id ?? index} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0"
                           style={{ background: "linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)" }}>
                        {initials}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{displayName}</div>
                        {/* {result.guest_id && <div className="text-xs text-gray-400">ID: {formatVal(result.guest_id)}</div>} */}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {examName}
                      {/* {result.exam_id && <div className="text-xs text-gray-400 font-normal">Exam ID: {formatVal(result.exam_id)}</div>} */}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        {totalDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {percentageDisplay}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500">
                      {submittedDate && typeof submittedDate === "string" ? new Date(submittedDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-2 mt-2 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-4 sm:mb-0">
            Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, results.length)}</span> of{" "}
            <span className="font-semibold text-gray-700">{results.length}</span> results
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#7c3aed] text-white shadow-sm"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

