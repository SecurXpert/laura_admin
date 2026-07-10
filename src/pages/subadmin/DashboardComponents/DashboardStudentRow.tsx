import React, { useEffect, useState } from "react";
import DashboardCoursesList, { BASE_URL, getUniqueCourses } from "./DashboardCoursesList";

let cachedCoursesList: any[] | null = null;
let coursesPromise: Promise<any[]> | null = null;

const getAdminCourses = async (): Promise<any[]> => {
  if (cachedCoursesList !== null) return cachedCoursesList;
  if (coursesPromise !== null) return coursesPromise;

  coursesPromise = (async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/courses`, {
        headers: { Authorization: token ? `Bearer ${token}` : "", Accept: "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (data?.courses ?? data?.data ?? []);
        cachedCoursesList = arr;
        return arr;
      }
    } catch (e) {
      console.error("Failed fetching courses for cache", e);
    }
    return [];
  })();

  return coursesPromise;
};

interface DashboardStudentRowProps {
  s: any;
}

const DashboardStudentRow: React.FC<DashboardStudentRowProps> = ({ s }) => {
  const [progressData, setProgressData] = useState({ progress: 0, score: 0 });

  useEffect(() => {
    const fetchStudentProgress = async () => {
      try {
        let numericCourseId: number | null = null;

        const possibleIds = [
          s.course_id,
          s.courseId,
          s.enrolled_course_id,
          s.course?.id,
          s.course?.course_id,
        ];

        if (Array.isArray(s.courses) && s.courses.length > 0) {
          const first = s.courses[0];
          if (typeof first === "number" || (!isNaN(Number(first)) && Number(first) > 0)) {
            possibleIds.push(Number(first));
          } else if (typeof first === "object" && first !== null) {
            possibleIds.push(first.id ?? first.course_id ?? first.courseId);
          }
        }

        for (const pid of possibleIds) {
          if (pid !== undefined && pid !== null && !isNaN(Number(pid)) && Number(pid) > 0) {
            numericCourseId = Number(pid);
            break;
          }
        }

        // If numeric course ID is still not found (e.g. s.courses has ["web development"]), lookup by title
        if (numericCourseId === null) {
          const courseName = s.course_name ?? (Array.isArray(s.courses) && typeof s.courses[0] === "string" ? s.courses[0] : null);
          if (courseName) {
            const allCourses = await getAdminCourses();
            const target = allCourses.find((c: any) =>
              (c.title && c.title.toLowerCase().trim() === courseName.toLowerCase().trim()) ||
              (c.name && c.name.toLowerCase().trim() === courseName.toLowerCase().trim())
            );
            if (target && target.id && !isNaN(Number(target.id))) {
              numericCourseId = Number(target.id);
            }
          }
        }

        if (!numericCourseId) return;

        const token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/courses/trainer/students/${s.id}/courses/${numericCourseId}/progress`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const data = await res.json();
          let calculatedProgress = 0;
          if (data?.completion_ratio !== undefined && data?.completion_ratio !== null) {
            const ratio = Number(data.completion_ratio);
            if (!isNaN(ratio)) {
              calculatedProgress = ratio <= 1 && ratio > 0 ? ratio * 100 : ratio;
            }
          } else if (data?.completed_modules !== undefined && data?.total_modules !== undefined && Number(data.total_modules) > 0) {
            calculatedProgress = (Number(data.completed_modules) / Number(data.total_modules)) * 100;
          } else {
            calculatedProgress = data?.progress ?? data?.completion_percentage ?? data?.percentage ?? 0;
          }

          let calculatedScore = data?.score ?? data?.percentage ?? data?.total_score ?? calculatedProgress;

          setProgressData({
            progress: Math.round(calculatedProgress),
            score: Math.round(calculatedScore),
          });
        }
      } catch (err) {
        console.error("Failed to fetch student progress", err);
      }
    };
    if (s?.id) {
      fetchStudentProgress();
    }
  }, [s]);

  const displayProgress = progressData.progress !== 0 ? progressData.progress : Math.round(s.progress ?? 0);
  const displayScore = progressData.score !== 0 ? progressData.score : Math.round(s.score ?? displayProgress);

  let scoreBg = "bg-blue-50 text-blue-600";
  if (displayScore >= 90) {
    scoreBg = "bg-green-50 text-green-600";
  }

  const initials = s.name ? s.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : "NA";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-5 px-4 sm:px-6 md:px-8 hover:bg-slate-50/50 transition-colors">
      {/* Left: Avatar + Details */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-full bg-[#4F46E5] shadow-lg shadow-indigo-500/20 text-white flex items-center justify-center font-semibold text-lg shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-gray-900 truncate">{s.name}</p>
          <p className="text-sm text-gray-500 truncate">{s.email}</p>
        </div>
      </div>

      {/* Right: Courses, Score, Progress & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-4 sm:gap-6 md:gap-8 lg:gap-10 w-full lg:w-auto">
        {/* Courses Tag List */}
        <div className="flex flex-wrap gap-1.5 max-w-full sm:max-w-[280px]">
          <DashboardCoursesList allCourses={getUniqueCourses(s.courses, s.course_name)} />
        </div>

        {/* Score, Progress and Eye Icon */}
        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-8 shrink-0">
          {/* Score */}
          <div className="text-left sm:text-right shrink-0">
            <span className={`px-3 py-1.5 rounded-xl font-bold text-sm ${scoreBg}`}>
              {displayScore}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-32 md:w-40 shrink-0">
            <div className="flex justify-between items-center text-[14px] font-medium text-gray-500 mb-1.5">
              <span className="tracking-wide">Progress</span>
              <span className="font-bold text-gray-900">{displayProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStudentRow;
