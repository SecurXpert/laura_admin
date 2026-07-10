import { useEffect, useState } from "react";
import { BASE_URL, getUniqueCourses } from "./DashboardComponents/DashboardCoursesList";
import DashboardKpiCards from "./DashboardComponents/DashboardKpiCards";
import DashboardEnrollmentsTrend from "./DashboardComponents/DashboardEnrollmentsTrend";
import DashboardStudentRecords from "./DashboardComponents/DashboardStudentRecords";

const Dashboard = () => {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [courseCount, setCourseCount] = useState<number>(0);
  const [quizCount, setQuizCount] = useState<number>(0);
  const [students, setStudents] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await fetch(
          `${BASE_URL}/student/students/count`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              Accept: "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setStudentCount(data.total_students);
        }
      } catch (error) {
        console.error("Failed to fetch student count", error);
      }
    };

    fetchStudentCount();
  }, []);

  const fetchQuizCount = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${BASE_URL}/subadmin/quizzes/count`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        // handle string or number response
        if (typeof data === "number") {
          setQuizCount(data);
        } else if (typeof data === "string") {
          setQuizCount(Number(data));
        } else {
          setQuizCount(data.total_quizzes || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch quiz count", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${BASE_URL}/student/students/list`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const fetchCourseCount = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${BASE_URL}/admin/courses/count`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();

        if (typeof data === "number") {
          setCourseCount(data);
        } else {
          setCourseCount(data.total_courses || 0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch course count", error);
    }
  };

  const fetchTrendData = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const extractCount = (data: any): number => {
        if (typeof data === 'number') return data;
        if (typeof data === 'string' && !isNaN(Number(data))) return Number(data);
        if (Array.isArray(data)) return data.length > 0 ? extractCount(data[0]) : 0;
        if (data && typeof data === 'object') {
          const possibleKeys = ['total_students', 'totalStudents', 'student_count', 'studentCount', 'count', 'total', 'enrollments', 'enrollment_count', 'data'];
          for (const key of possibleKeys) {
            if (data[key] !== undefined && data[key] !== null) {
              const val = extractCount(data[key]);
              if (val > 0) return val;
            }
          }
          for (const key in data) {
            if (key !== 'month' && key !== 'year' && typeof data[key] === 'number') {
              if (data[key] > 0) return data[key];
            }
          }
        }
        return 0;
      };

      try {
        const resAll = await fetch(`${BASE_URL}/admin/enrollments/count`, {
          headers: { Authorization: token ? `Bearer ${token}` : "", Accept: "application/json" }
        });
        if (resAll.ok) {
          const dataAll = await resAll.json();
          const arr = Array.isArray(dataAll) ? dataAll : (Array.isArray(dataAll?.data) ? dataAll.data : null);
          if (arr && arr.length > 0) {
            const formatted = arr.map((item: any) => {
              let m = item.month || item.name || 'Unknown';
              if (typeof m === 'number') {
                const d = new Date(); d.setMonth(m - 1);
                m = d.toLocaleString('default', { month: 'short' });
              }
              const count = extractCount(item);
              return { month: m, students: count };
            });
            const maxStudents = Math.max(...formatted.map(r => r.students), 100);
            setTrendData(formatted.map(r => ({ ...r, score: Math.round((r.students / maxStudents) * 100) || 0 })));
            return;
          }
        }
      } catch (e) {
        console.warn("Array fetch failed, falling back to individual months", e);
      }

      const currentDate = new Date();
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        last6Months.push({
          monthName: d.toLocaleString('default', { month: 'short' }),
          monthNum: d.getMonth() + 1,
          yearNum: d.getFullYear()
        });
      }

      const promises = last6Months.map(async (m) => {
        try {
          const res = await fetch(`${BASE_URL}/admin/enrollments/count?year=${m.yearNum}&month=${m.monthNum}`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
              Accept: "application/json",
            },
          });

          let count = 0;
          if (res.ok) {
            const data = await res.json();
            count = extractCount(data);
          }
          return { month: m.monthName, students: count };
        } catch (e) {
          console.error(`Error fetching data for month ${m.monthName}:`, e);
          return { month: m.monthName, students: 0 };
        }
      });

      const results = await Promise.all(promises);

      const maxStudents = Math.max(...results.map(r => r.students), 100);

      const formattedData = results.map(r => ({
        ...r,
        score: Math.round((r.students / maxStudents) * 100) || 0
      }));

      setTrendData(formattedData);
    } catch (error) {
      console.error("Failed to fetch trend data", error);
    }
  };

  useEffect(() => {
    fetchCourseCount();
    fetchQuizCount();
    fetchStudents();
    fetchTrendData();
  }, []);

  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentCourseFilter, setStudentCourseFilter] = useState('All Courses');

  const allUniqueCourses = ['All Courses', ...Array.from(new Set(students.flatMap(s => getUniqueCourses(s.courses, s.course_name))))];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearchTerm.toLowerCase());

    const sCourses = getUniqueCourses(s.courses, s.course_name);
    const matchesCourse = studentCourseFilter === 'All Courses' || sCourses.includes(studentCourseFilter);

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">Overview of platform performance</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <DashboardKpiCards
        studentCount={studentCount}
        courseCount={courseCount}
        quizCount={quizCount}
      />

      {/* PERFORMANCE TREND */}
      <DashboardEnrollmentsTrend trendData={trendData} />

      {/* STUDENT RECORDS */}
      <DashboardStudentRecords
        studentSearchTerm={studentSearchTerm}
        setStudentSearchTerm={setStudentSearchTerm}
        studentCourseFilter={studentCourseFilter}
        setStudentCourseFilter={setStudentCourseFilter}
        allUniqueCourses={allUniqueCourses}
        filteredStudents={filteredStudents}
      />
    </div>
  );
};

export default Dashboard;