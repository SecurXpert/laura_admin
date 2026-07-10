import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award, Users, List, Clock, CalendarCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { Trophy } from "lucide-react";

const API_BASE_URL = "https://lauratek.in:8000";

// ── Interface for quiz results ──
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

// ── Interface for exam results ──
interface GuestExamResult {
  id?: number;
  guest_id?: number | string;
  exam_id?: number | string;
  title?: string;
  exam_title?: string;
  name?: string;
  guest_name?: string;
  candidate_name?: string;
  score?: number;
  total_questions?: number;
  percentage?: number;
  status?: string;
  submitted_at?: string;
  submited_at?: string;
  created_at?: string;
  time_taken?: number | string;
  [key: string]: any;
}

// ── Interface for attendance records ──
interface AttendanceRecord {
  id?: number;
  guest_id: number;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  name: string;
  duration_hours: number;
}

export default function Guest() {
  // ── Active tab state ──
  const [activeTab, setActiveTab] = useState<"attendance" | "results" | "exam_results">("attendance");

  // ── Date Filters for Attendance ──
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  // ── Attendance states ──
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // ── Quiz Results states ──
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // ── Exam Results states ──
  const [examResults, setExamResults] = useState<GuestExamResult[]>([]);
  const [examResultsLoading, setExamResultsLoading] = useState(true);
  const [examResultsError, setExamResultsError] = useState<string | null>(null);

  // ── Pagination & Search states ──
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  // Reset page on tab or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // ── Fetch Attendance Records ──
  const fetchAttendance = async () => {
    if (!token) {
      setAttendanceError("No authentication token found. Please log in again.");
      setAttendanceLoading(false);
      return;
    }

    setAttendanceLoading(true);
    setAttendanceError(null);

    try {
      const response = await axios.get<AttendanceRecord[]>(
        `${API_BASE_URL}/guest/attendance/sub_admin/view-attendance`,
        {
          params: {
            from_date: fromDate,
            to_date: toDate
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendance(response.data);
    } catch (err: any) {
      console.error(err);
      setAttendanceError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load attendance records"
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  // ── Fetch Guest Quiz Results ──
  const fetchResults = async () => {
    if (!token) {
      setResultsError("No authentication token found. Please log in again.");
      setResultsLoading(false);
      return;
    }

    setResultsLoading(true);
    setResultsError(null);

    try {
      const response = await axios.get<QuizResult[]>(
        `${API_BASE_URL}/guest/sub_admin-view-quiz/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(response.data);
    } catch (err: any) {
      console.error(err);
      setResultsError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load quiz results"
      );
    } finally {
      setResultsLoading(false);
    }
  };

  // ── Fetch Guest Exam Results ──
  const fetchExamResults = async () => {
    if (!token) {
      setExamResultsError("No authentication token found. Please log in again.");
      setExamResultsLoading(false);
      return;
    }

    setExamResultsLoading(true);
    setExamResultsError(null);

    try {
      const response = await axios.get<GuestExamResult[]>(
        `${API_BASE_URL}/guest/exam/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      setExamResults(data);
    } catch (err: any) {
      console.error(err);
      setExamResultsError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load exam results"
      );
    } finally {
      setExamResultsLoading(false);
    }
  };

  // Fetch data only for the active tab
  useEffect(() => {
    if (activeTab === "attendance" && fromDate && toDate) {
      fetchAttendance();
    } else if (activeTab === "results") {
      fetchResults();
    } else if (activeTab === "exam_results") {
      fetchExamResults();
    }
  }, [activeTab, fromDate, toDate]);

  const getBadgeVariant = (badge: string) => {
    switch (badge.toLowerCase()) {
      case "no badge":
        return "secondary";
      case "beginner":
      case "bronze":
        return "default";
      case "intermediate":
      case "silver":
        return "outline";
      case "expert":
      case "gold":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const renderSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredAttendance = attendance.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.date?.includes(searchTerm)
  );

  const filteredResults = results.filter((r) =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.badge?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExamResults = examResults.filter((r) =>
    (r.name || r.guest_name || r.candidate_name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.title || r.exam_title || "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.guest_id || "").includes(searchTerm) ||
    String(r.exam_id || "").includes(searchTerm)
  );

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Guest Management</h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">Manage guest attendance, quizzes, and results</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search current tab..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-sm"
          />
        </div>
      </div>

      {/* 🔹 Tabs */}
      <div className="w-full mb-6">
        <div className="flex items-center gap-8 text-sm border-b border-gray-200 px-4 md:px-6 pt-4">

          {[
            { key: "attendance", label: "Attendance", icon: CalendarCheck },
            { key: "results", label: "Quiz Results", icon: Trophy },
            { key: "exam_results", label: "Exam Results", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative flex items-center gap-2 pb-3 transition ${activeTab === tab.key
                  ? "text-[#7c3aed] font-semibold"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}

                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#7c3aed] rounded-full"></span>
                )}
              </button>
            );
          })}

        </div>
      </div>

      {/* 🔹 CONTENT */}
      <div className="w-full">

        {/* ================= Attendance ================= */}
        {activeTab === "attendance" && (
          <div className="mt-4">
            
            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end bg-white p-4 rounded-[14px] border border-gray-100 shadow-sm">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-sm font-semibold text-gray-700">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  max={today}
                  onChange={(e) => {
                    if (e.target.value <= today) setFromDate(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] text-sm text-gray-700 w-full sm:w-[160px]"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-sm font-semibold text-gray-700">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  max={today}
                  onChange={(e) => {
                    if (e.target.value <= today) setToDate(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] text-sm text-gray-700 w-full sm:w-[160px]"
                />
              </div>
            </div>

            {attendanceError && (
              <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl font-medium">
                {attendanceError}
              </div>
            )}

            <div className="overflow-x-auto rounded-[14px] border shadow-md">

              <table className="w-full bg-white">

                <thead className="bg-gradient-to-r from-[#7616AC] to-[#1907AD]">
                  <tr>
                     <th className="px-4 py-3 text-left text-sm text-white">Guest</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Date</th>
                   
                    <th className="px-4 py-3 text-left text-sm text-white">Check-in</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Check-out</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Status</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Duration</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((record, index) => {
                    const initials = record.name
                      ?.split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={record.id ?? index} className="border-b hover:bg-gray-50 transition">

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
                          {record.name}
                        </td>
                        <td className="px-4 py-4 font-medium text-gray-700">
                          {record.date}
                        </td>

                      

                        <td className="px-4 py-4">
                          {formatDateTime(record.check_in_time)}
                        </td>

                        <td className="px-4 py-4">
                          {record.check_out_time ? formatDateTime(record.check_out_time) : "—"}
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            className={
                              record.status?.toLowerCase() === "absent"
                                ? "bg-red-100 text-red-700 hover:bg-red-100"
                                : "bg-green-100 text-green-700 hover:bg-green-100"
                            }
                          >
                            {record.status?.toUpperCase() || "UNKNOWN"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4 font-medium text-gray-700">
                          {record.duration_hours?.toFixed(2)} hrs
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

            {/* Pagination Controls */}
            {filteredAttendance.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-start py-4 gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-[14px] font-bold text-gray-700">{currentPage}</span>
                    <span className="text-[14px] font-medium text-gray-500">/ {Math.ceil(filteredAttendance.length / itemsPerPage) || 1}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredAttendance.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredAttendance.length / itemsPerPage) || filteredAttendance.length === 0}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="text-[14px] text-gray-500 font-medium hidden sm:block">
                  Showing <span className="font-bold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAttendance.length)}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAttendance.length)}</span> of <span className="font-bold text-gray-900">{filteredAttendance.length}</span> records
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= Results ================= */}
        {activeTab === "results" && (
          <div className="mt-4">
            <div className="overflow-x-auto rounded-[14px] border shadow-md">

              <table className="w-full bg-white">

                <thead className="bg-gradient-to-r from-[#7616AC] to-[#1907AD]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm text-white">Guest</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Quiz</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Score</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Questions</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Time</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Badge</th>
                    <th className="px-4 py-3 text-left text-sm text-white">Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((result, index) => (
                    <tr key={result.id ?? index} className="border-b hover:bg-gray-50 transition">

                      <td className="px-4 py-4">{result.name}</td>

                      <td className="px-4 py-4">{result.title}</td>

                      <td className="px-4 py-4 font-semibold text-purple-700">
                        {typeof result.score === "object" && result.score !== null ? (
                          result.score.score !== undefined ? `${result.score.score} (${result.score.percentage || ''}%)` : (result.score.percentage !== undefined ? `${result.score.percentage}%` : JSON.stringify(result.score))
                        ) : result.score}
                      </td>

                      <td className="px-4 py-4">{result.total_questions}</td>

                      <td className="px-4 py-4">{result.time_taken}s</td>

                      <td className="px-4 py-4">
                        <Badge variant={getBadgeVariant(result.badge)} className="capitalize">
                          {result.badge}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {new Date(result.submitted_at).toLocaleString()}
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Pagination Controls */}
            {filteredResults.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-start py-4 gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-[14px] font-bold text-gray-700">{currentPage}</span>
                    <span className="text-[14px] font-medium text-gray-500">/ {Math.ceil(filteredResults.length / itemsPerPage) || 1}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredResults.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredResults.length / itemsPerPage) || filteredResults.length === 0}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="text-[14px] text-gray-500 font-medium hidden sm:block">
                  Showing <span className="font-bold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredResults.length)}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredResults.length)}</span> of <span className="font-bold text-gray-900">{filteredResults.length}</span> results
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= Exam Results ================= */}
        {activeTab === "exam_results" && (
          <div className="mt-4">
            {examResultsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : examResultsError ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{examResultsError}</span>
              </div>
            ) : filteredExamResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-[14px] border border-dashed text-gray-500">
                No exam results found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[14px] border shadow-md">
                <table className="w-full bg-white">
                  <thead className="bg-gradient-to-r from-[#7616AC] to-[#1907AD]">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-white">Guest Name</th>
                      <th className="px-4 py-3 text-left text-sm text-white">Exam Title</th>
                      <th className="px-4 py-3 text-left text-sm text-white">Total score</th>
                      <th className="px-4 py-3 text-left text-sm text-white">Percentage</th>
                      <th className="px-4 py-3 text-left text-sm text-white">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExamResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((resItem, index) => {
                      const guestName = resItem.guest_name || resItem.name || resItem.candidate_name || `Guest #${resItem.guest_id || '--'}`;
                      const examTitle = resItem.exam_title || resItem.title || `Exam #${resItem.exam_id || '--'}`;
                      const submittedDate = resItem.submitted_at || resItem.submited_at || resItem.created_at;

                      let totalQ = Number(resItem.total_questions) || 0;
                      let earnedScore: number | string = "--";
                      let percentageStr: string = "--";

                      if (Array.isArray(resItem.score)) {
                        if (totalQ === 0) totalQ = resItem.score.length;
                        if (resItem.score.length > 0) {
                          let sumScore = 0;
                          let sumPct = 0;
                          resItem.score.forEach((item: any) => {
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
                          percentageStr = `${Math.round(sumPct / resItem.score.length)}%`;
                        } else {
                          earnedScore = 0;
                          percentageStr = "0%";
                        }
                      } else if (resItem.score && typeof resItem.score === "object") {
                        if (resItem.score.score !== undefined) earnedScore = resItem.score.score;
                        if (resItem.score.percentage !== undefined) percentageStr = `${resItem.score.percentage}%`;
                      } else if (resItem.score !== undefined && resItem.score !== null) {
                        earnedScore = resItem.score;
                      }

                      if (percentageStr === "--" && resItem.percentage !== undefined && resItem.percentage !== null) {
                        percentageStr = `${resItem.percentage}%`;
                      }
                      if (percentageStr === "--" && typeof earnedScore === "number" && totalQ > 0) {
                        percentageStr = `${Math.round((earnedScore / totalQ) * 100)}%`;
                      }

                      let totalDisplay = "--";
                      if (resItem.total !== undefined && resItem.total !== null) {
                        totalDisplay = `${resItem.total}`;
                      } else if (earnedScore !== "--" && totalQ > 0) {
                        totalDisplay = `${earnedScore} / ${totalQ}`;
                      } else if (earnedScore !== "--") {
                        totalDisplay = `${earnedScore}`;
                      } else if (totalQ > 0) {
                        totalDisplay = `${totalQ}`;
                      }

                      return (
                        <tr key={resItem.id ?? index} className="border-b hover:bg-gray-50 transition">
                          <td className="px-4 py-4 font-medium text-gray-800">{guestName}</td>
                          <td className="px-4 py-4 text-gray-600">{examTitle}</td>
                          <td className="px-4 py-4 font-semibold text-purple-700">
                            {totalDisplay}
                          </td>
                          <td className="px-4 py-4 font-semibold text-indigo-600">
                            {percentageStr}
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs">
                            {submittedDate ? new Date(submittedDate).toLocaleString() : '--'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredExamResults.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-start py-4 gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-[14px] font-bold text-gray-700">{currentPage}</span>
                    <span className="text-[14px] font-medium text-gray-500">/ {Math.ceil(filteredExamResults.length / itemsPerPage) || 1}</span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredExamResults.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredExamResults.length / itemsPerPage) || filteredExamResults.length === 0}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <div className="text-[14px] text-gray-500 font-medium hidden sm:block">
                  Showing <span className="font-bold text-gray-900">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredExamResults.length)}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredExamResults.length)}</span> of <span className="font-bold text-gray-900">{filteredExamResults.length}</span> results
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}