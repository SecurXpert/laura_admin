import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummary, Course } from "./DashboardComponents/types";
import StatCardsGrid from "./DashboardComponents/StatCardsGrid";
import EnrollmentTrendChart from "./DashboardComponents/EnrollmentTrendChart";
import CoursePopularityChart from "./DashboardComponents/CoursePopularityChart";
import QuickActions from "./DashboardComponents/QuickActions";

const TOKEN_KEY = "access_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [allEnrollments, setAllEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    const token = getToken();
    if (!token) {
      setError("Authentication token not found. Please log in.");
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
      console.error("Dashboard fetch failed:", err);

      let message = "Failed to load dashboard data.";
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          message = "Session expired or unauthorized. Please log in again.";
          localStorage.removeItem(TOKEN_KEY);
        } else if (err.response.data?.message) {
          message = err.response.data.message;
        } else {
          message = `Server error (${status})`;
        }
      } else if (err.request) {
        message = "No response from server. Is the backend running?";
      } else {
        message = err.message || "Unknown error";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      const data = res.data;
      if (Array.isArray(data)) {
        setCourses(data);
      } else if (data && Array.isArray(data.courses)) {
        setCourses(data.courses);
      } else if (data && Array.isArray(data.data)) {
        setCourses(data.data);
      } else {
        setCourses([]);
      }
    } catch {
      console.error("Failed to fetch courses");
      setCourses([]);
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
        if (typeof val === "number") return val;
        if (typeof val === "string") {
          const parsed = Number(val);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (Array.isArray(val)) {
          if (val.length === 0) return 0;
          return extractCount(val[0]);
        }
        if (typeof val === "object") {
          // Check common keys first
          const directKeys = [
            "count",
            "total",
            "students",
            "value",
            "qty",
            "number",
            "length",
            "size",
            "sum",
          ];
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
            if (typeof val[key] === "number") {
              return val[key];
            }
          }
          for (const key of keys) {
            if (typeof val[key] === "string") {
              const parsed = Number(val[key]);
              if (!isNaN(parsed)) return parsed;
            }
          }
          for (const key of keys) {
            if (typeof val[key] === "object") {
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
            console.error(
              "Failed to fetch student list in active year detector:",
              err
            );
            return { data: [] };
          }),
          api.get<any[]>("/enrollments/admin_view/").catch((err) => {
            console.error(
              "Failed to fetch enrollments in active year detector:",
              err
            );
            return { data: [] };
          }),
        ]);

        const studentsList = studentsRes.data || [];
        const enrollList = enrollmentsRes.data || [];
        setAllEnrollments(enrollList);
        const years: number[] = [];

        studentsList.forEach((s) => {
          const dStr =
            s.created_at ||
            s.createdAt ||
            s.date_joined ||
            s.joined_at ||
            s.mfa_verified_at;
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
          console.log(
            `Detected active year (latest): ${activeYear} from years:`,
            years
          );
        }
      } catch (e) {
        console.error("Failed to auto-detect active year:", e);
      }

      const monthsInfo = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(activeYear, currentDate.getMonth() - i, 1);
        monthsInfo.push({
          monthName: d.toLocaleString("en-US", { month: "short" }),
          monthVal: d.getMonth() + 1,
          yearVal: d.getFullYear(),
        });
      }

      console.log("Fetching enrollment counts for months:", monthsInfo);

      const requests = monthsInfo.map((info) =>
        api
          .get("/admin/enrollments/count", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              month: info.monthVal,
              year: info.yearVal,
            },
          })
          .catch((err) => {
            console.warn(
              `Failed to fetch count for ${info.monthName} (${info.monthVal}/${info.yearVal}):`,
              err
            );
            return { data: 0 };
          })
      );

      const responses = await Promise.all(requests);

      const chartData = monthsInfo.map((info, idx) => {
        const data = responses[idx].data;
        console.log(
          `Enrollment response for ${info.monthName} (${info.monthVal}/${info.yearVal}):`,
          data
        );
        const count = extractCount(data);
        return {
          month: info.monthName,
          students: count,
        };
      });

      console.log("Final computed enrollment chart data:", chartData);
      setEnrollmentData(chartData);
    } catch (err) {
      console.error("Failed to fetch enrollment count data:", err);
      setEnrollmentData([]);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
    fetchEnrollment();
  }, []);

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
          <p className="text-xs sm:text-sm text-gray-600 mb-5 break-words">
            {error}
          </p>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Welcome back, Admin
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Content Container */}
      <div className="w-full">
        {/* Top Summary Cards Grid */}
        <StatCardsGrid summary={summary} />

        {/* Dynamic Charts Section */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
          <EnrollmentTrendChart enrollmentData={enrollmentData} />
          <CoursePopularityChart
            courses={courses}
            allEnrollments={allEnrollments}
          />
        </div>

        {/* Quick Actions Deck */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
