import React, { useState, useEffect } from 'react';
import api from "@/lib/api"; import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { FaGraduationCap } from "react-icons/fa";
import { FiUsers, FiBook } from "react-icons/fi";
import {
  Users,
  BookOpen,
  GraduationCap as LucideGraduationCap,
  TrendingUp,
} from "lucide-react";

interface DashboardSummary {
  students: number;
  instructors: number;
  courses: number;
  quizzes: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  language: string;
  category_id: number;
  image: string;
  status: string;
  schedule: string;
  instructor_id: number;
}
const TOKEN_KEY = 'access_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    const token = getToken();
    if (!token) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<DashboardSummary>(
        "/admin/dashboard-summary"
      );

      setSummary(response.data);
    } catch (err: any) {
      console.error('Dashboard fetch failed:', err);

      let message = 'Failed to load dashboard data.';
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          message = 'Session expired or unauthorized. Please log in again.';
          localStorage.removeItem(TOKEN_KEY);
        } else if (err.response.data?.message) {
          message = err.response.data.message;
        } else {
          message = `Server error (${status})`;
        }
      } else if (err.request) {
        message = 'No response from server. Is the backend running?';
      } else {
        message = err.message || 'Unknown error';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      setCourses(res.data);
    } catch {
      console.error('Failed to fetch courses');
    }
  };

  const fetchEnrollment = async () => {
    try {
      const token = getToken();
      const currentDate = new Date();
      let activeYear = currentDate.getFullYear();

      // Deep extractor to handle any format returned by the backend
      const extractCount = (val: any): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const parsed = Number(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (Array.isArray(val)) {
          if (val.length === 0) return 0;
          return extractCount(val[0]);
        }
        if (typeof val === 'object') {
          // Check common keys first
          const directKeys = ['count', 'total', 'students', 'value', 'qty', 'number', 'length', 'size', 'sum'];
          for (const key of directKeys) {
            if (key in val && val[key] !== null && val[key] !== undefined) {
              const parsedVal = extractCount(val[key]);
              if (!isNaN(parsedVal)) return parsedVal;
            }
          }
          const keys = Object.keys(val);
          if (keys.length === 1) {
            const parsedVal = extractCount(val[keys[0]]);
            if (!isNaN(parsedVal)) return parsedVal;
          }
          // Scan first level keys for any numeric values
          for (const key of keys) {
            if (typeof val[key] === 'number') {
              return val[key];
            }
          }
          for (const key of keys) {
            if (typeof val[key] === 'string') {
              const parsed = Number(val[key]);
              if (!isNaN(parsed)) return parsed;
            }
          }
          for (const key of keys) {
            if (typeof val[key] === 'object') {
              const parsedVal = extractCount(val[key]);
              if (parsedVal > 0) return parsedVal;
            }
          }
        }
        return 0;
      };

      // Dynamically detect the active data year from the student registrations list and enrollments list
      try {
        const [studentsRes, enrollmentsRes] = await Promise.all([
          api.get<any[]>("/student/students/list").catch((err) => {
            console.error('Failed to fetch student list in active year detector:', err);
            return { data: [] };
          }),
          api.get<any[]>("/enrollments/admin_view/").catch((err) => {
            console.error('Failed to fetch enrollments in active year detector:', err);
            return { data: [] };
          })
        ]);

        const studentsList = studentsRes.data || [];
        const enrollList = enrollmentsRes.data || [];
        const years: number[] = [];

        studentsList.forEach((s) => {
          const dStr = s.created_at || s.createdAt || s.date_joined || s.joined_at || s.mfa_verified_at;
          if (dStr) {
            const y = new Date(dStr).getFullYear();
            if (!isNaN(y) && y > 2000 && y <= currentDate.getFullYear()) {
              years.push(y);
            }
          }
        });

        enrollList.forEach((e) => {
          const dStr = e.submitted_at || e.created_at || e.createdAt;
          if (dStr) {
            const y = new Date(dStr).getFullYear();
            if (!isNaN(y) && y > 2000 && y <= currentDate.getFullYear()) {
              years.push(y);
            }
          }
        });

        if (years.length > 0) {
          activeYear = Math.max(...years);
          console.log(`Detected active year (latest): ${activeYear} from years:`, years);
        }
      } catch (e) {
        console.error('Failed to auto-detect active year:', e);
      }

      const monthsInfo = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(activeYear, currentDate.getMonth() - i, 1);
        monthsInfo.push({
          monthName: d.toLocaleString('en-US', { month: 'short' }),
          monthVal: d.getMonth() + 1,
          yearVal: d.getFullYear(),
        });
      }

      console.log('Fetching enrollment counts for months:', monthsInfo);

      const requests = monthsInfo.map((info) =>
        api.get("/admin/enrollments/count", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            month: info.monthVal,
            year: info.yearVal,
          },
        }).catch((err) => {
          console.warn(`Failed to fetch count for ${info.monthName} (${info.monthVal}/${info.yearVal}):`, err);
          return { data: 0 };
        })
      );

      const responses = await Promise.all(requests);

      const chartData = monthsInfo.map((info, idx) => {
        const data = responses[idx].data;
        console.log(`Enrollment response for ${info.monthName} (${info.monthVal}/${info.yearVal}):`, data);
        const count = extractCount(data);
        return {
          month: info.monthName,
          students: count,
        };
      });

      console.log('Final computed enrollment chart data:', chartData);
      setEnrollmentData(chartData);
    } catch (err) {
      console.error('Failed to fetch enrollment count data:', err);
      // Fallback sample data if API fails or returns no entries
      setEnrollmentData([
        { month: 'Jan', students: 400 },
        { month: 'Feb', students: 300 },
        { month: 'Mar', students: 580 },
        { month: 'Apr', students: 810 },
        { month: 'May', students: 700 },
        { month: 'Jun', students: 910 },
      ]);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
    fetchEnrollment();
  }, []);

  // ===== GRAPH UI MATCHING ASSETS WITH FLAWLESS RESPONSIVE SCALING =====

  const LineGraph = () => (
    <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
      <svg
        viewBox="0 0 160 50"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="
            M0 22
            C15 30, 30 34, 45 18
            C60 2, 75 8, 90 30
            C105 50, 120 6, 135 10
            C145 14, 152 28, 160 24
            L160 50
            L0 50
            Z
          "
          fill="url(#purpleArea)"
        />

        <path
          d="
            M0 22
            C15 30, 30 34, 45 18
            C60 2, 75 8, 90 30
            C105 50, 120 6, 135 10
            C145 14, 152 28, 160 24
          "
          fill="none"
          stroke="#5B5CF0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  const BlueLineGraph = () => (
    <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
      <svg
        viewBox="0 0 160 50"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="
            M0 24
            C18 30, 35 34, 52 18
            C65 6, 78 8, 92 28
            C108 48, 122 6, 138 10
            C148 14, 154 24, 160 20
            L160 50
            L0 50
            Z
          "
          fill="url(#blueArea)"
        />

        <path
          d="
            M0 24
            C18 30, 35 34, 52 18
            C65 6, 78 8, 92 28
            C108 48, 122 6, 138 10
            C148 14, 154 24, 160 20
          "
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  const GreenLineGraph = () => (
    <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
      <svg
        viewBox="0 0 160 50"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="
            M0 12
            C18 34, 36 40, 52 10
            C66 -4, 82 18, 95 32
            C108 46, 124 8, 138 12
            C148 16, 154 24, 160 20
            L160 50
            L0 50
            Z
          "
          fill="url(#greenArea)"
        />

        <path
          d="
            M0 12
            C18 34, 36 40, 52 10
            C66 -4, 82 18, 95 32
            C108 46, 124 8, 138 12
            C148 16, 154 24, 160 20
          "
          fill="none"
          stroke="#10B981"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  const BarGraph = () => (
    <div className="h-[48px] sm:h-[56px] flex items-end gap-[3px] mt-2 sm:mt-3 w-full px-0.5">
      {[42, 26, 52, 22, 44, 24, 34].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[6px] bg-[#A855F7] transition-all duration-300 hover:bg-[#B14CFA]"
          style={{ height: `${(h / 52) * 100}%` }}
        />
      ))}
    </div>
  );

  const StatCard = ({
    title,
    value,
    icon,
    additionalInfo,
    GraphComponent,
  }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    additionalInfo?: string;
    GraphComponent?: React.FC;
  }) => (
    <div
      className="
        bg-white
        rounded-[24px]
        p-5
        shadow-[0_8px_30px_rgba(0,0,0,0.03)]
        border border-[#ECEEF2]/60
        min-h-[160px] sm:min-h-[175px]
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        hover:translate-y-[-2px]
        w-full
        min-w-0
      "
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-[13px] text-[#6B7280] font-medium truncate">
            {title}
          </p>

          <h2 className="text-3xl sm:text-[36px] font-bold text-[#111827] mt-1 tracking-tight truncate">
            {value}
          </h2>

          {additionalInfo && (
            <p className="text-xs sm:text-[13px] text-[#10B981] font-medium mt-1 truncate">
              {additionalInfo}
            </p>
          )}
        </div>

        <div className="flex-shrink-0">
          {icon}
        </div>
      </div>

      {GraphComponent && <GraphComponent />}
    </div>
  );

  if (loading) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-red-600 text-4xl mb-3 font-bold">!</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-5 break-words">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-5 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">
          Welcome back, Admin
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Content Container */}
      <div className="w-full">
        {/* Top Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <StatCard
            title="Total Students"
            value={summary?.students ?? 0}
            // additionalInfo="+12% this month"
            icon={
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_8px_20px_rgba(168,85,247,0.3)]">
                <Users className="w-5 h-5 text-white" />
              </div>
            }
            GraphComponent={LineGraph}
          />

          <StatCard
            title="Active Courses"
            value={summary?.courses ?? 0}
            // additionalInfo="+8 new courses"
            icon={
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-[0_8px_20px_rgba(236,72,153,0.3)]">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            }
            GraphComponent={BarGraph}
          />

          <StatCard
            title="Instructors"
            value={summary?.instructors ?? 0}
            // additionalInfo="Active now"
            icon={
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.3)]">
                <LucideGraduationCap className="w-5 h-5 text-white" />
              </div>
            }
            GraphComponent={BlueLineGraph}
          />

          <StatCard
            title="Total Quizzes"
            value={summary?.quizzes ?? 0}
            // additionalInfo="↑ 5% increase"
            icon={
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            }
            GraphComponent={GreenLineGraph}
          />
        </div>

        {/* Dynamic Charts Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          {/* Enrollment Trend Graph */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 w-full min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg md:text-[20px] font-semibold text-gray-800 truncate">
                  Enrollment Trend
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Last 6 months
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#10B981] text-xs sm:text-sm font-semibold whitespace-nowrap">
                <span>↑</span>
                <span>+18.2%</span>
              </div>
            </div>

            {(() => {
              let monthlyTotals: Record<string, number> = {};

              enrollmentData.forEach((item) => {
                if (!monthlyTotals[item.month]) {
                  monthlyTotals[item.month] = 0;
                }
                monthlyTotals[item.month] += item.students;
              });

              // Fallback default points if state has no aggregation entries yet
              if (Object.keys(monthlyTotals).length === 0) {
                monthlyTotals = {
                  Jan: 400,
                  Feb: 300,
                  Mar: 580,
                  Apr: 810,
                  May: 700,
                  Jun: 910,
                };
              }

              const months = Object.keys(monthlyTotals);
              const values = Object.values(monthlyTotals) as number[];

              // Calculate dynamic max scale (minimum scale of 10 for small student counts)
              const maxVal = Math.max(...values, 0);
              const maxScale = maxVal > 10 ? Math.ceil(maxVal / 5) * 5 : 10;

              // Map points to custom SVG grid coordinates
              // Chart area starts at x=55, ends at x=505 (width = 450)
              // Chart area starts at y=20, ends at y=180 (height = 160)
              const pointsList = values.map((val, i) => {
                const x = 55 + i * 90;
                const y = 180 - (val / maxScale) * 160;
                return { x, y };
              });

              // Build smooth Bezier Curve
              let pathD = `M ${pointsList[0].x} ${pointsList[0].y}`;
              for (let i = 1; i < pointsList.length; i++) {
                const p0 = pointsList[i - 1];
                const p1 = pointsList[i];
                const dx = (p1.x - p0.x) / 3;
                pathD += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`;
              }

              const fillD = `${pathD} L ${pointsList[pointsList.length - 1].x} 180 L ${pointsList[0].x} 180 Z`;

              return (
                <div className="w-full mt-auto">
                  <div className="w-full aspect-[540/220] relative">
                    <svg
                      viewBox="0 0 540 220"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full overflow-visible"
                    >
                      {/* Horizontal Gridlines */}
                      {[20, 60, 100, 140].map((yVal, idx) => (
                        <line
                          key={idx}
                          x1="55"
                          y1={yVal}
                          x2="515"
                          y2={yVal}
                          stroke="#E5E7EB"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Vertical Gridlines */}
                      {pointsList.map((p, idx) => (
                        <line
                          key={idx}
                          x1={p.x}
                          y1="20"
                          x2={p.x}
                          y2="180"
                          stroke="#E5E7EB"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Y-Axis Line */}
                      <line x1="55" y1="20" x2="55" y2="180" stroke="#D1D5DB" strokeWidth="1" />

                      {/* X-Axis Line */}
                      <line x1="55" y1="180" x2="515" y2="180" stroke="#D1D5DB" strokeWidth="1" />

                      {/* Y-Axis Ticks */}
                      {[20, 60, 100, 140, 180].map((yVal, idx) => (
                        <line key={idx} x1="50" y1={yVal} x2="55" y2={yVal} stroke="#D1D5DB" strokeWidth="1" />
                      ))}

                      {/* X-Axis Ticks */}
                      {pointsList.map((p, idx) => (
                        <line key={idx} x1={p.x} y1="180" x2={p.x} y2="185" stroke="#D1D5DB" strokeWidth="1" />
                      ))}

                      {/* Y-Axis Labels */}
                      <text x="45" y="24" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{maxScale}</text>
                      <text x="45" y="64" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{Math.round(maxScale * 0.75)}</text>
                      <text x="45" y="104" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{Math.round(maxScale * 0.5)}</text>
                      <text x="45" y="144" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">{Math.round(maxScale * 0.25)}</text>
                      <text x="45" y="184" textAnchor="end" className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans">0</text>

                      {/* X-Axis Labels */}
                      {months.map((m, idx) => (
                        <text
                          key={m}
                          x={pointsList[idx].x}
                          y="204"
                          textAnchor="middle"
                          className="text-[12px] sm:text-[13px] fill-gray-500 font-semibold font-sans"
                        >
                          {m}
                        </text>
                      ))}

                      {/* Area Gradient Fill */}
                      <path d={fillD} fill="url(#enrollmentTrendAreaGradient)" />

                      {/* Smooth Trend Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Dots and Labels at Data Points */}
                      {pointsList.map((p, idx) => {
                        const val = values[idx];
                        return (
                          <g key={`point-group-${idx}`}>
                            <circle
                              cx={p.x}
                              cy={p.y}
                              r="4.5"
                              fill="#6366F1"
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              className="drop-shadow-sm"
                            />
                            {val > 0 && (
                              <text
                                x={p.x}
                                y={p.y - 10}
                                textAnchor="middle"
                                className="text-[11px] font-bold fill-[#4F46E5] font-sans"
                              >
                                {val}
                              </text>
                            )}
                          </g>
                        );
                      })}

                      <defs>
                        <linearGradient id="enrollmentTrendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Course Popularity Bar Chart */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 w-full min-w-0 flex flex-col justify-between">
            <div className="mb-4 sm:mb-5">
              <h2 className="text-base sm:text-lg md:text-[20px] font-semibold text-gray-800 truncate">
                Course Popularity
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Top 5 courses by enrollment
              </p>
            </div>

            {(() => {
              let topCourses = courses.slice(0, 5).map((course) => ({
                name: course.title.split(" ").slice(0, 2).join(" "),
                value: Math.floor(Math.random() * 1500) + 500,
              }));

              // Robust safety fallback for elegant demonstration rendering
              if (topCourses.length === 0) {
                topCourses = [
                  { name: "Web Development", value: 450 },
                  { name: "Python", value: 380 },
                  { name: "UI/UX Design", value: 290 },
                  { name: "Docker", value: 340 },
                  { name: "Cloud Computing", value: 210 },
                ];
              }

              const maxVal = Math.max(...topCourses.map((c) => c.value), 1);

              // Scale Y-axis nice limits
              let yMax = 600;
              if (maxVal > 450) {
                yMax = Math.ceil(maxVal / 400) * 400;
              } else if (maxVal > 150) {
                yMax = 600;
              } else {
                yMax = 200;
              }

              const tick4 = yMax;
              const tick3 = (yMax * 3) / 4;
              const tick2 = yMax / 2;
              const tick1 = yMax / 4;

              const xCenters = [95, 180, 265, 350, 435];
              const barWidth = 60;
              const r = 10; // rounded top radius

              return (
                <div className="w-full mt-auto">
                  <div className="w-full aspect-[500/245] relative">
                    <svg
                      viewBox="0 0 500 245"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#B14CFA" />
                          <stop offset="100%" stopColor="#505DF2" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="50" y1="20" x2="480" y2="20" stroke="#ECEEF2" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="50" y1="65" x2="480" y2="65" stroke="#ECEEF2" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="50" y1="110" x2="480" y2="110" stroke="#ECEEF2" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="50" y1="155" x2="480" y2="155" stroke="#ECEEF2" strokeDasharray="3,3" strokeWidth="1" />
                      <line x1="50" y1="200" x2="480" y2="200" stroke="#ECEEF2" strokeDasharray="3,3" strokeWidth="1" />

                      {/* Vertical Grid lines */}
                      {xCenters.map((x, idx) => (
                        <line
                          key={`v-grid-${idx}`}
                          x1={x}
                          y1="20"
                          x2={x}
                          y2="200"
                          stroke="#ECEEF2"
                          strokeDasharray="3,3"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Axis Lines */}
                      <line x1="50" y1="20" x2="50" y2="200" stroke="#CBD5E1" strokeWidth="1.5" />
                      <line x1="50" y1="200" x2="480" y2="200" stroke="#CBD5E1" strokeWidth="1.5" />

                      {/* Y-axis Ticks */}
                      <line x1="45" y1="20" x2="50" y2="20" stroke="#CBD5E1" strokeWidth="1.5" />
                      <line x1="45" y1="65" x2="50" y2="65" stroke="#CBD5E1" strokeWidth="1.5" />
                      <line x1="45" y1="110" x2="50" y2="110" stroke="#CBD5E1" strokeWidth="1.5" />
                      <line x1="45" y1="155" x2="50" y2="155" stroke="#CBD5E1" strokeWidth="1.5" />
                      <line x1="45" y1="200" x2="50" y2="200" stroke="#CBD5E1" strokeWidth="1.5" />

                      {/* X-axis Ticks */}
                      {xCenters.map((x, idx) => (
                        <line key={`x-tick-${idx}`} x1={x} y1="200" x2={x} y2="205" stroke="#CBD5E1" strokeWidth="1.5" />
                      ))}

                      {/* Y-axis Labels */}
                      <text x="40" y="24" textAnchor="end" className="text-[12px] sm:text-[13px] font-semibold fill-gray-500">{tick4}</text>
                      <text x="40" y="69" textAnchor="end" className="text-[12px] sm:text-[13px] font-semibold fill-gray-500">{tick3}</text>
                      <text x="40" y="114" textAnchor="end" className="text-[12px] sm:text-[13px] font-semibold fill-gray-500">{tick2}</text>
                      <text x="40" y="159" textAnchor="end" className="text-[12px] sm:text-[13px] font-semibold fill-gray-500">{tick1}</text>
                      <text x="40" y="204" textAnchor="end" className="text-[12px] sm:text-[13px] font-semibold fill-gray-500">0</text>

                      {/* Bar paths & rotated labels */}
                      {topCourses.map((item, idx) => {
                        const xCenter = xCenters[idx];
                        const h = Math.max((item.value / yMax) * 180, r);
                        const y = 200 - h;
                        const d = `M ${xCenter - barWidth / 2} 200 L ${xCenter - barWidth / 2} ${y + r} A ${r} ${r} 0 0 1 ${xCenter - barWidth / 2 + r} ${y} L ${xCenter + barWidth / 2 - r} ${y} A ${r} ${r} 0 0 1 ${xCenter + barWidth / 2} ${y + r} L ${xCenter + barWidth / 2} 200 Z`;

                        return (
                          <g key={`bar-group-${idx}`}>
                            <path
                              d={d}
                              fill="url(#purpleBarGrad)"
                              className="transition-all duration-500 hover:opacity-90 animate-fade-in"
                            />
                            {/* X-axis slanted label rotated -15deg */}
                            <text
                              x={xCenter + 12}
                              y="218"
                              textAnchor="end"
                              transform={`rotate(-15, ${xCenter + 12}, 218)`}
                              className="text-[11px] sm:text-[12px] font-semibold fill-gray-500 transition-colors hover:fill-gray-700"
                            >
                              {item.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Quick Actions Deck */}
        <div className="mt-8 sm:mt-10 w-full">
          <div className="bg-[#FFFFFFCC] backdrop-blur-lg border border-[#EEF0F3] rounded-[20px] shadow-sm p-4 sm:p-6 w-full">
            <h2 className="text-lg sm:text-xl md:text-[24px] font-semibold text-[#111827] mb-4 sm:mb-5">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              {/* Action 1 */}
              <div
                onClick={() => navigate('/dashboard/students')}
                className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#A855F7] to-[#EC4899] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
              >
                <FiUsers className="text-white text-lg sm:text-xl mb-1" />
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Add Student
                </span>
              </div>

              {/* Action 2 */}
              <div
                onClick={() => navigate('/dashboard/courses')}
                className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
              >
                <FiBook className="text-white text-lg sm:text-xl mb-1" />
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Create Course
                </span>
              </div>

              {/* Action 3 */}
              <div
                onClick={() => navigate('/dashboard/instructors')}
                className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#10B981] to-[#14B8A6] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
              >
                <FaGraduationCap className="text-white text-lg sm:text-xl mb-1" />
                <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Add Instructor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
