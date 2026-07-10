import React, { useState, useEffect } from 'react';
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, Filter, CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface QuizResult {
  id: number;
  quiz_id: number;
  quiz_title?: string;
  score: number;
  total_questions: number;
  time_taken: number;
  submitted_at: string;
  percentage?: number;
  candidate_name?: string;
  candidate_id?: string;
  status?: string;
  [key: string]: any;
}

interface ExamResult {
  id?: number;
  candidate_id?: string;
  exam_id?: string;
  exam_title?: string;
  score?: number;
  total_questions?: number;
  status?: string;
  created_at?: string;
  submited_at?: string;
  candidate_name?: string;
  [key: string]: any;
}

// Helper colors for avatars
const AVATAR_COLORS = [
  "bg-purple-500", "bg-pink-500", "bg-orange-500",
  "bg-teal-500", "bg-red-500", "bg-cyan-500",
  "bg-blue-500", "bg-emerald-500", "bg-amber-500"
];

const Results = () => {
  const [activeTab, setActiveTab] = useState<'exam' | 'quiz'>('exam');

  // Quiz State
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Exam State
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === 'quiz') {
      fetchQuizResults();
    } else {
      fetchExamResults();
    }
  }, [activeTab]);

  const fetchQuizResults = async () => {
    try {
      setLoadingQuiz(true);
      setQuizError(null);
      const res = await api.get('/student/admin/quiz-results');
      const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      const sorted = [...data].sort((a: any, b: any) => b.id - a.id);
      setQuizResults(sorted);
    } catch (err: any) {
      console.error('Failed to fetch quiz results', err);
      setQuizError(err.response?.data?.message || 'Failed to fetch quiz results');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const fetchExamResults = async () => {
    try {
      setLoadingExam(true);
      setExamError(null);
      const res = await api.get('/exam/results');
      const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
      const sorted = [...data].sort((a: any, b: any) => b.id - a.id);
      setExamResults(sorted);
    } catch (err: any) {
      console.error('Failed to fetch exam results', err);
      setExamError(err.response?.data?.message || 'Failed to fetch exam results');
      setExamResults([]);
    } finally {
      setLoadingExam(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "C";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusDisplay = (status: string | undefined, percent: number) => {
    const s = (status || "").toLowerCase();
    if (s.includes('pass') || percent >= 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
        </span>
      );
    }
    if (s.includes('fail') || percent < 50) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-red-50 text-red-600 border border-red-200">
          <XCircle className="w-3.5 h-3.5" /> Failed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
        <Clock className="w-3.5 h-3.5" /> Pending Evaluation
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 pb-8 relative">
      {/* Top Page Header */}
      <div>
        <h1 className="text-[28px] font-black text-[#0f172a] tracking-tight">
          Results Management
        </h1>
        <p className="text-[15px] text-[#64748b] mt-1 font-medium max-w-3xl">
          Monitor all examination results, evaluate candidate performance, and access detailed scorecards for both MCQ and Coding assessments.
        </p>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-[#f1f5f9] overflow-hidden">

        {/* Card Header Section */}
        <div className="p-6 border-b border-[#f1f5f9] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">Examination Results</h2>
            <p className="text-[14px] font-medium text-[#94a3b8] mt-1">
              {activeTab === 'exam' ? examResults.length : quizResults.length} results found
            </p>
          </div>

          <div className="flex bg-[#f8fafc] p-1 rounded-xl border border-[#f1f5f9]">
            <button
              onClick={() => setActiveTab('exam')}
              className={`px-8 py-2.5 text-[14px] font-bold transition-all rounded-[10px] ${activeTab === 'exam'
                  ? 'bg-[#5f5ce6] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
            >
              Exam Results
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-8 py-2.5 text-[14px] font-bold transition-all rounded-[10px] ${activeTab === 'quiz'
                  ? 'bg-[#5f5ce6] text-white shadow-sm'
                  : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
            >
              Quiz Results
            </button>
          </div>
        </div>


        {/* Table Section */}
        <div className="overflow-x-auto">
          {activeTab === 'exam' && examError && (
            <div className="m-6 p-4 text-[14px] font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">{examError}</div>
          )}
          {activeTab === 'quiz' && quizError && (
            <div className="m-6 p-4 text-[14px] font-medium text-red-600 bg-red-50 rounded-xl border border-red-100">{quizError}</div>
          )}

          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                <th className="py-5 px-6 text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest">{activeTab === 'exam' ? 'CANDIDATE' : 'STUDENT NAME'}</th>
                <th className="py-5 px-6 text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest">{activeTab === 'exam' ? 'EXAM TITLE' : 'QUIZ NAME'}</th>
                <th className="py-5 px-6 text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest">{activeTab === 'exam' ? 'TOTAL score ' : 'SCORE'}</th>
                {activeTab === 'exam' && <th className="py-5 px-6 text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest">PERCENTAGE</th>}
                <th className="py-5 px-6 text-[12px] font-bold text-[#94a3b8] uppercase tracking-widest">SUBMITTED</th>
              </tr>
            </thead>
            <tbody>
              {((activeTab === 'exam' && loadingExam) || (activeTab === 'quiz' && loadingQuiz)) ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-[#f8fafc]">
                    {[...Array(activeTab === 'exam' ? 5 : 4)].map((_, j) => (
                      <td key={j} className="py-6 px-6"><Skeleton className="h-5 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : activeTab === 'exam' ? (
                examResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((result, idx) => {
                  const totalDisplay = result.total !== undefined && result.total !== null 
                    ? result.total 
                    : (typeof result.score === 'number' ? result.score : 0);

                  let percent = 0;
                  if (result.percentage !== undefined && result.percentage !== null) {
                    percent = Number(result.percentage);
                  } else if (Array.isArray(result.score) && result.score.length > 0) {
                    const sumPercent = result.score.reduce((acc: number, item: any) => acc + (Number(item?.percentage) || 0), 0);
                    percent = sumPercent / result.score.length;
                  } else if (typeof result.score === 'number' && result.total_questions && result.total_questions > 0) {
                    percent = (result.score / result.total_questions) * 100;
                  } else if (typeof result.total === 'number' && result.total_questions && result.total_questions > 0) {
                    percent = (result.total / result.total_questions) * 100;
                  } else if (typeof result.total === 'number') {
                    percent = Number(result.total);
                  }

                  const name = result.candidate_name || `Candidate ${result.candidate_id || result.id || idx}`;
                  const cid = result.candidate_id || result.id || 'N/A';
                  const initials = getInitials(name);
                  const avatarColor = AVATAR_COLORS[(result.id || idx) % AVATAR_COLORS.length];

                  return (
                    <tr key={idx} className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold ${avatarColor} shadow-sm`}>
                            {initials}
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-[#0f172a] group-hover:text-[#5f5ce6] transition-colors">{name}</div>
                           
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[15px] font-bold text-[#334155]">{result.exam_title || result.exam_id || result.id || '-'}</td>
                      <td className="py-4 px-6">
                        <div className="text-[15px] font-bold text-[#0f172a]">
                          {typeof totalDisplay === 'number' && !Number.isInteger(totalDisplay) ? totalDisplay.toFixed(1) : totalDisplay}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5 w-fit">
                          <div className={`text-[14px] font-bold tracking-tight ${percent >= 50 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{percent.toFixed(1)}%</div>
                          <div className="w-16 h-[4px] rounded-full overflow-hidden bg-[#f1f5f9]">
                            <div className={`h-full ${percent >= 50 ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[14px] font-medium text-[#64748b] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#cbd5e1]" />
                        {formatDate(result.submitted_at || result.submited_at || result.created_at || '')}
                      </td>
                    </tr>
                  )
                })
              ) : (
                quizResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((result, idx) => {
                  const scoreDisplay = result.score || 0;
                  // If no total questions provided from backend, fallback to 10 for better percentage representation if scores are low, or 100 otherwise.
                  // For now we'll stick to a fallback of 100 if undefined to match previous logic, or you can supply it from backend.
                  const totalQ = result.total_questions || 10; 
                  const percent = result.percentage !== undefined ? result.percentage : (totalQ > 0 ? (scoreDisplay / totalQ) * 100 : 0);

                  const name = result.student_name || result.candidate_name || `User ${idx}`;
                  const cid = result.email || result.candidate_id || result.id || 'N/A';
                  const quizTitle = result.quiz_name || result.quiz_title || result.quiz_id || '-';
                  const date = result.date || result.submitted_at || result.submited_at || result.created_at || '';

                  const initials = getInitials(name);
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <tr key={idx} className="border-b border-[#f8fafc] hover:bg-[#f8fafc] transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-[14px] font-bold ${avatarColor} shadow-sm`}>
                            {initials}
                          </div>
                          <div>
                            <div className="text-[15px] font-bold text-[#0f172a] group-hover:text-[#5f5ce6] transition-colors">{name}</div>
                            <div className="text-[13px] font-medium text-[#94a3b8] mt-0.5">Contact: {cid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[15px] font-bold text-[#334155]">{quizTitle}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${Math.min(100, percent)}%` }}></div>
                          </div>
                          <div className="text-[14px] font-bold text-[#334155] tracking-tight">{scoreDisplay}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[14px] font-medium text-[#64748b] flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#cbd5e1]" />
                        {formatDate(date)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Empty State */}
          {(!loadingExam && activeTab === 'exam' && examResults.length === 0) && (
            <div className="py-16 text-center text-[#94a3b8] font-medium text-[15px]">No exam results found.</div>
          )}
          {(!loadingQuiz && activeTab === 'quiz' && quizResults.length === 0) && (
            <div className="py-16 text-center text-[#94a3b8] font-medium text-[15px]">No quiz results found.</div>
          )}

          {/* Pagination */}
          {((activeTab === 'exam' && examResults.length > 0) || (activeTab === 'quiz' && quizResults.length > 0)) && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 border-t border-[#f1f5f9] gap-4">
              <div className="text-[13px] font-medium text-[#6B7280]">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, activeTab === 'exam' ? examResults.length : quizResults.length)} of {activeTab === 'exam' ? examResults.length : quizResults.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Previous
                </button>

                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                  {currentPage}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil((activeTab === 'exam' ? examResults.length : quizResults.length) / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil((activeTab === 'exam' ? examResults.length : quizResults.length) / itemsPerPage)}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
