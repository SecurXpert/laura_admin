import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Zap, Trophy, Award, Calendar, ArrowLeft, BookOpen, CheckCircle, Clock, User, Layers } from "lucide-react";

interface StudentStreak {
  student_id: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_attendance_date: string;
}

interface CourseProgressModule {
  module_id: number;
  status: string;
  completed_at?: string | null;
  title?: string;
  name?: string;
}

interface CourseProgressData {
  student_id?: number;
  student_name?: string;
  profile_picture?: string;
  course_id: number;
  instructor_name?: string;
  course_name?: string;
  completion_ratio?: number;
  completed_modules?: number;
  total_modules?: number;
  modules?: CourseProgressModule[];
  progress?: number;
  score?: number;
  [key: string]: any;
}

const ViewStreak = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;

  const [streak, setStreak] = useState<StudentStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseProgressList, setCourseProgressList] = useState<CourseProgressData[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  const TOKEN_STORAGE_KEY = 'access_token';
  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
  const axiosConfig = () => ({
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const fetchStreakAndProgress = async () => {
      setLoading(true);
      setProgressLoading(true);
      try {
        // 1. Fetch streak for this specific student only!
        try {
          const res = await api.get<StudentStreak | any>(`/student-streaks/admin/student/${id}`, axiosConfig());
          const myStreak = Array.isArray(res.data) ? res.data[0] : res.data;
          setStreak(myStreak || null);
        } catch (err) {
          console.error("Failed to fetch student streak:", err);
          setStreak(null);
        }

        // 2. Fetch all courses in admin to know available course IDs & names
        let allCourses: any[] = [];
        try {
          const coursesRes = await api.get("/admin/courses", axiosConfig());
          allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes.data?.courses ?? coursesRes.data?.data ?? []);
        } catch (e) {
          console.error("Failed to fetch admin courses:", e);
        }

        // If student wasn't passed in state or to ensure we check all assigned courses
        let currentStudent = student;
        if (!currentStudent || !currentStudent.courses || currentStudent.courses.length === 0) {
          try {
            const studentsRes = await api.get<any[]>("/student/students/list", axiosConfig());
            if (Array.isArray(studentsRes.data)) {
              const found = studentsRes.data.find((s: any) => Number(s.id) === Number(id));
              if (found) {
                currentStudent = { ...currentStudent, ...found };
              }
            }
          } catch (e) {
            console.error("Failed to fetch student list for course matching:", e);
          }
        }

        // Determine course IDs to check for this student
        const targetCourseIds = new Set<number>();
        if (currentStudent) {
          const possibleIds = [
            currentStudent.course_id,
            currentStudent.courseId,
            currentStudent.enrolled_course_id,
            currentStudent.assigned_course_id,
            currentStudent?.course?.id
          ];
          const courseArrays = [
            currentStudent.courses,
            currentStudent.enrolled_courses,
            currentStudent.assigned_courses,
            currentStudent.my_courses
          ];
          courseArrays.forEach((arr: any) => {
            if (Array.isArray(arr)) {
              arr.forEach((c: any) => {
                if (typeof c === "number" || (!isNaN(Number(c)) && Number(c) > 0)) {
                  targetCourseIds.add(Number(c));
                } else if (typeof c === "object" && c !== null) {
                  const cid = c.id ?? c.course_id ?? c.courseId;
                  if (cid && !isNaN(Number(cid))) targetCourseIds.add(Number(cid));
                } else if (typeof c === "string") {
                  const matched = allCourses.find((ac: any) =>
                    (ac.title && ac.title.toLowerCase().trim() === c.toLowerCase().trim()) ||
                    (ac.name && ac.name.toLowerCase().trim() === c.toLowerCase().trim())
                  );
                  if (matched && matched.id) targetCourseIds.add(Number(matched.id));
                }
              });
            }
          });
          possibleIds.forEach((pid: any) => {
            if (pid !== undefined && pid !== null && !isNaN(Number(pid)) && Number(pid) > 0) {
              targetCourseIds.add(Number(pid));
            }
          });

          const courseNames = [
            currentStudent.course_name,
            currentStudent.courseName,
            currentStudent.course_title,
            currentStudent.course?.title,
            currentStudent.course?.name
          ];
          courseNames.forEach((name: any) => {
            if (typeof name === "string" && name.trim()) {
              const matched = allCourses.find((ac: any) =>
                (ac.title && ac.title.toLowerCase().trim() === name.toLowerCase().trim()) ||
                (ac.name && ac.name.toLowerCase().trim() === name.toLowerCase().trim())
              );
              if (matched && matched.id) targetCourseIds.add(Number(matched.id));
            }
          });
        }

        // ONLY fetch progress for courses the student is actually assigned to!
        const idsToFetch = Array.from(targetCourseIds);

        if (idsToFetch.length > 0 && id) {
          const progressPromises = idsToFetch.map(async (cid) => {
            const matchedCourse = allCourses.find((ac: any) => Number(ac.id) === cid);
            const fallbackName = matchedCourse?.title || matchedCourse?.name || `Course #${cid}`;
            const fallbackInstructor = matchedCourse?.instructor_name || matchedCourse?.instructor?.name || 'Not assigned';

            try {
              const progRes = await api.get(`/courses/trainer/students/${id}/courses/${cid}/progress`, axiosConfig());
              if (progRes.data && (progRes.data.course_id || progRes.data.course_name || progRes.data.modules !== undefined || progRes.data.completion_ratio !== undefined || progRes.data.completed_modules !== undefined || progRes.data.progress !== undefined || progRes.data.score !== undefined)) {
                const data = progRes.data;
                if (!data.course_name) {
                  data.course_name = fallbackName;
                }
                if (!data.instructor_name) {
                  data.instructor_name = fallbackInstructor;
                }
                data.course_id = cid;
                return data as CourseProgressData;
              }
            } catch (err) {
              // Ignore API error / 404
            }

            // Fallback: Student is assigned to this course, but no progress recorded yet! Show 0% progress card!
            return {
              student_id: Number(id),
              course_id: cid,
              course_name: fallbackName,
              instructor_name: fallbackInstructor,
              completion_ratio: 0,
              completed_modules: 0,
              total_modules: matchedCourse?.total_modules || matchedCourse?.modules_count || 0,
              modules: [],
              progress: 0,
              score: 0
            } as CourseProgressData;
          });

          const results = await Promise.all(progressPromises);
          const validProgress = results.filter((r): r is CourseProgressData => r !== null);
          setCourseProgressList(validProgress);
        } else {
          setCourseProgressList([]);
        }
      } catch (err) {
        console.error("Failed to load student data:", err);
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };

    if (id) {
      fetchStreakAndProgress();
    }
  }, [id]);

  const renderStatusBadge = (status: boolean | string | null | undefined) => {
    const isEnabled = !!status;
    if (isEnabled) {
      return (
        <span className="inline-block px-[12px] py-[4px] bg-[#E6F8ED] text-[#1E854A] text-[13px] font-semibold rounded-full whitespace-nowrap">
          Enabled
        </span>
      );
    }
    return (
      <span className="inline-block px-[12px] py-[4px] bg-[#F1F5F9] text-[#64748B] text-[13px] font-semibold rounded-full whitespace-nowrap">
        Disabled
      </span>
    );
  };

  const renderCourseProgressSection = () => {
    if (progressLoading) {
      return (
        <div className="mt-8 space-y-4">
          <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Course Progress & Modules</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Course Progress & Module Breakdown</h4>
              <p className="text-xs text-gray-500 font-medium">Real-time learning progress fetched from backend</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold border border-gray-200/60">
            {courseProgressList.length} {courseProgressList.length === 1 ? 'Course' : 'Courses'}
          </span>
        </div>

        {courseProgressList.length === 0 ? (
          <div className="bg-gray-50/80 rounded-2xl p-8 border border-gray-100 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 mb-3 border border-gray-100">
              <Layers className="w-6 h-6" />
            </div>
            <h5 className="text-base font-bold text-gray-800 mb-1">No Course Progress Recorded</h5>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md font-medium">
              There is currently no progress or module completion data returned from the server for this student.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {courseProgressList.map((cp, idx) => {
              let calculatedProgress = 0;
              if (cp.completion_ratio !== undefined && cp.completion_ratio !== null) {
                const ratio = Number(cp.completion_ratio);
                if (!isNaN(ratio)) {
                  calculatedProgress = ratio <= 1 && ratio > 0 ? ratio * 100 : ratio;
                }
              } else if (cp.completed_modules !== undefined && cp.total_modules !== undefined && Number(cp.total_modules) > 0) {
                calculatedProgress = (Number(cp.completed_modules) / Number(cp.total_modules)) * 100;
              } else {
                calculatedProgress = cp.progress ?? cp.score ?? 0;
              }
              const progressPct = Math.min(100, Math.max(0, Math.round(calculatedProgress)));

              return (
                <div
                  key={cp.course_id || idx}
                  className="bg-white rounded-[20px] p-6 border border-gray-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Course Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3.5 overflow-hidden">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-lg">
                          {cp.course_name ? cp.course_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <h5 className="text-base font-bold text-gray-900 truncate">
                            {cp.course_name || `Course #${cp.course_id}`}
                          </h5>
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1 truncate">
                            <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">Instructor: <strong className="text-gray-700">{cp.instructor_name || 'Not assigned'}</strong></span>
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold whitespace-nowrap shrink-0 border border-indigo-100">
                        {progressPct}% Done
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-5">
                      <div className="flex justify-between text-xs font-medium text-gray-600">
                        <span>Overall Completion</span>
                        <span className="font-bold text-gray-900">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
                        <div
                          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 font-medium">
                        <span>Modules Completed: <strong className="text-gray-800">{cp.completed_modules ?? 0}</strong> / {cp.total_modules ?? (cp.modules?.length || 0)}</span>
                        {cp.completion_ratio !== undefined && (
                          <span>Ratio: {Number(cp.completion_ratio).toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    {/* Modules List */}
                    {cp.modules && cp.modules.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h6 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          Module Breakdown ({cp.modules.length})
                        </h6>
                        <div className="max-h-48 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                          {cp.modules.map((m, mIdx) => {
                            const isCompleted = m.status?.toLowerCase() === 'completed' || m.status?.toLowerCase() === 'done';
                            const isInProgress = m.status?.toLowerCase() === 'in_progress' || m.status?.toLowerCase() === 'in progress' || m.status?.toLowerCase() === 'started';

                            return (
                              <div
                                key={m.module_id || mIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 border border-gray-100 transition-colors text-xs"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  {isCompleted ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                  ) : isInProgress ? (
                                    <Clock className="w-4 h-4 text-blue-500 shrink-0 animate-pulse" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                                  )}
                                  <span className="font-semibold text-gray-800 truncate">
                                    {m.title || m.name || `Module #${m.module_id}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-emerald-100 text-emerald-800' :
                                      isInProgress ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                    {m.status || 'Pending'}
                                  </span>
                                  {m.completed_at && (
                                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                                      {new Date(m.completed_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 p-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative w-full max-w-full overflow-hidden pb-4">

      {/* Header Section mimicking Student.tsx */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8"
                title="Back to Students"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
                Student Profile & Performance
              </h2>
            </div>
            <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium ml-11">
              Viewing detailed information and performance streaks
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] w-full p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">

        {/* Profile Info */}
        {student ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-8 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-16 sm:h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl sm:text-2xl font-bold shadow-lg">
              {(student.name || student.first_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="w-full overflow-hidden">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {student.name || (student.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Unknown')}
              </h4>
              <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1 w-full">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{student.email}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-900 break-all">Student ID: {id}</h4>
          </div>
        )}

        {/* Streaks & Points Grid */}
        <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Performance Data</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center w-full">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.current_streak || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-orange-600 mt-1">Current Streak</span>
          </div>

          <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center w-full">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.longest_streak || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-blue-600 mt-1">Longest Streak</span>
          </div>

          <div className="bg-purple-50 p-4 sm:p-5 rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center w-full">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.total_points || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-purple-600 mt-1">Total Points</span>
          </div>

          <div className="bg-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center w-full overflow-hidden">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 mb-2 shrink-0" />
            <span className="text-sm sm:text-lg font-bold text-gray-900 truncate w-full px-1">
              {streak?.last_attendance_date
                ? new Date(streak.last_attendance_date).toLocaleDateString()
                : '-'}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 mt-1">Last Attendance</span>
          </div>
        </div>

        {/* Course Progress Section */}
        {renderCourseProgressSection()}

        {/* Other Details */}
        {student && (
          <>
            <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Additional Details</h4>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 text-xs sm:text-sm w-full">
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Phone Number</span>
                <span className="font-semibold text-gray-900 truncate block">{student.phone || 'Not provided'}</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Gender</span>
                <span className="font-semibold text-gray-900 truncate block">{student.gender || 'Not provided'}</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">MFA Status</span>
                <div className="mt-1">{renderStatusBadge(student.mfa_enabled)}</div>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Enrolled Courses</span>
                <span className="font-semibold text-gray-900 truncate block">{student.courses?.length || 0} courses</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewStreak;
