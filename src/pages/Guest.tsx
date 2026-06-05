import React, { useState, useEffect } from "react";
import api from "@/lib/api"; import {
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
import { AlertCircle, Award, Users, List, Clock, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Trophy, Target } from "lucide-react";
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

// ── Interface for quiz listing ──
interface QuizItem {
  quiz_title: string;
  no_of_questions: number;
  created_at: string;
}

// ── Interface for attendance records ──
interface AttendanceRecord {
  id: number;
  guest_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  name: string;
  duration_hours: number;
}

export default function GuestDashboard() {
  // ── Active tab state ──
  const [activeTab, setActiveTab] = useState<"attendance" | "results" | "quizzes">("attendance");

  // ── Attendance states ──
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // ── Quiz Results states ──
  const [results, setResults] = useState<QuizResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // ── Quiz Listing states ──
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [quizzesError, setQuizzesError] = useState<string | null>(null);

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
      const response = await api.get<AttendanceRecord[]>(
        "/guest/attendance/admin/view-attendance"
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
      const response = await api.get<QuizResult[]>(
        "/guest/admin-view-quiz/results"
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

  // ── Fetch Available Quizzes ──
  const fetchQuizzes = async () => {
    if (!token) {
      setQuizzesError("No authentication token found. Please log in again.");
      setQuizzesLoading(false);
      return;
    }

    setQuizzesLoading(true);
    setQuizzesError(null);

    try {
      const response = await api.get<QuizItem[]>(
        "/guest/admin-view/quiz_listing"
      );
      setQuizzes(response.data);
    } catch (err: any) {
      console.error(err);
      setQuizzesError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load quiz listing"
      );
    } finally {
      setQuizzesLoading(false);
    }
  };

  // Fetch data ONLY for the active tab (lazy loading)
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendance();
    } else if (activeTab === "results") {
      fetchResults();
    } else if (activeTab === "quizzes") {
      fetchQuizzes();
    }
  }, [activeTab]);

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

  const getDurationBadgeClass = (minutes: number) => {
    return minutes < 10
      ? "bg-red-100 text-red-700"
      : "bg-emerald-100 text-emerald-700";
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

  return (
    <div className="w-full space-y-6 pb-8">

      {/* 🔹 Tabs Section */}
      <div className="w-full mb-6">
        <div className="px-4 md:px-6 pt-4 border-b border-gray-200">
          <div className="flex items-center gap-8 text-sm">

            <button
              onClick={() => setActiveTab("attendance")}
              className={`relative flex items-center gap-2 pb-3 ${activeTab === "attendance"
                ? "text-[#7c3aed] font-medium"
                : "text-gray-600"
                }`}
            >
              <CalendarCheck className="h-4 w-4" />
              Attendance
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`relative flex items-center gap-2 pb-3 ${activeTab === "results"
                ? "text-[#7c3aed] font-medium"
                : "text-gray-600"
                }`}
            >
              <Trophy className="h-4 w-4" />
              Results
            </button>

            <button
              onClick={() => setActiveTab("quizzes")}
              className={`relative flex items-center gap-2 pb-3 ${activeTab === "quizzes"
                ? "text-[#7c3aed] font-medium"
                : "text-gray-600"
                }`}
            >
              <Target className="h-4 w-4" />
              Quiz Listing
            </button>

          </div>
        </div>
      </div>

      {/* 🔹 CONTENT SECTION (Separate Div) */}
      <div className="w-full">

        {/* ================= Attendance Section ================= */}
        {activeTab === "attendance" && (
          <div className="mt-4">
            {attendanceLoading ? (
              renderSkeleton()
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white border border-gray-100">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">Guest</th>
                      <th className="px-4 py-3 text-left text-sm">Check-in</th>
                      <th className="px-4 py-3 text-left text-sm">Check-out</th>
                      <th className="px-4 py-3 text-left text-sm">Duration</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendance.map((record, index) => {
                      const initials = record.name
                        ?.split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr key={record.id ?? index} className="border-b">
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

                          <td className="px-4 py-4">
                            {formatDateTime(record.check_in_time)}
                          </td>

                          <td className="px-4 py-4">
                            {record.check_out_time || "In Progress"}
                          </td>

                          <td className="px-4 py-4">
                            {(() => {
                              const durationMinutes = Math.round(Number(record.duration_hours || 0) * 60);
                              return (
                                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getDurationBadgeClass(durationMinutes)}`}>
                                  {durationMinutes} min
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === "results" && (
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
                    {results.map((result, index) => {
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
                          {/* <td className="px-4 py-4">{result.name}</td> */}
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
          </div>
        )}

        {activeTab === "quizzes" && (
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
                    {quizzes.map((quiz, index) => (
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
          </div>
        )}

      </div>
    </div>
  );
}
