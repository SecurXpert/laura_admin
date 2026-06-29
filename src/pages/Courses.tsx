import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash2,
  BookOpen,
  ChevronDown,
  Calendar,
  Users,
  BarChart,
  BarChart2,
  Clock,
  Globe,
  Layers,
  UserPlus
} from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

/* ================= API ================= */
const COURSE_API = `/admin/courses`;
const CATEGORY_API = `/admin/categories`;
const INSTRUCTOR_API = `/admin/instructors`;

/* ================= TYPES ================= */
interface Course {
  id: number;
  title: string;
  description: string;
  duration: number | string;
  level: string;
  language: string;
  category_id: number;
  image: string;
  status: string;
  schedule: string;
  instructor_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  name: string;
}

/* ================= COMPONENT ================= */
const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, courseFilter, levelFilter, statusFilter]);

  const uniqueCourses = [...new Map(courses.map(c => [c.title, c])).values()];
  const [totalCourses, setTotalCourses] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetchCounts();
    fetchStudentCount();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await api.get(`${COURSE_API}/count`);

      if (typeof res.data === "number") {
        setTotalCourses(res.data);
        setActiveCourses(0);
      } else {
        setTotalCourses(res.data.total || res.data.total_courses || 0);
        setActiveCourses(res.data.total_courses || 0);
      }
    } catch (err) {
      console.error("Error fetching course counts", err);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const res = await api.get(`/student/students/count`);

      setStudentCount(res.data.total_students || 0);
    } catch (err) {
      console.error("Error fetching student count", err);
    }
  };

  const getToken = () => localStorage.getItem("access_token");

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get(CATEGORY_API);
      setCategories(
        res.data.map((c: any) => ({
          id: c.id ?? c.category_id,
          name: c.name ?? c.title,
        }))
      );
    } catch {
      console.error("Failed to fetch categories.");
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await api.get(INSTRUCTOR_API);
      setInstructors(res.data);
    } catch {
      console.error("Failed to fetch instructors.");
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get(COURSE_API);
      const data = res.data;
      let coursesArray: Course[] = [];
      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (data && Array.isArray(data.courses)) {
        coursesArray = data.courses;
      } else if (data && Array.isArray(data.data)) {
        coursesArray = data.data;
      }

      const sortedCourses = [...coursesArray].sort((a, b) => b.id - a.id);
      setCourses(sortedCourses);
    } catch {
      console.error("Failed to fetch live courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchCategories();
    fetchInstructors();
  }, []);

  /* ================= HELPERS ================= */
  const getCategoryName = (id: number) => {
    const found = categories.find((c) => c.id === id);
    if (found) return found.name;
    return id === 101 ? "Web Development" : `Category #${id}`;
  };

  const getInstructorName = (course: any) => {
    if (typeof course === 'number' || typeof course === 'string') {
      const id = Number(course);
      const found = instructors.find((i) => i.id === id);
      if (found) return found.name;
      return id === 1 ? "Arjun kumar" : id ? `Instructor #${id}` : "Not Assigned";
    }
    if (!course) return "Not Assigned";
    if (course.instructor_name) return course.instructor_name;
    if (course.instructorName) return course.instructorName;
    if (course.instructor?.name) return course.instructor.name;
    const id = Number(course.instructor_id || course.instructorId);
    const found = instructors.find((i) => i.id === id);
    if (found) return found.name;
    return id === 1 ? "Arjun kumar" : id ? `Instructor #${id}` : "Not Assigned";
  };

  const confirmDelete = async () => {
    if (!deleteCourse) return;

    try {
      await api.delete(`${COURSE_API}/${deleteCourse.id}`);
      fetchCourses();
      toast({
        title: "Deleted",
        description: "Course removed successfully",
        className: "bg-red-500 text-white",
        duration: 2000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "This course cannot be deleted because it is assigned to an instructor.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteCourse(null);
    }
  };

  const renderSchedule = (sched: string) => {
    if (!sched) return "Jan 25-Jun 25";
    if (sched.includes("-") && !sched.includes("T")) return sched;
    try {
      const d = new Date(sched);
      if (isNaN(d.getTime())) return sched;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return sched;
    }
  };

  /* ================= SEARCH ================= */
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase());

    const matchesCourse =
      !courseFilter ||
      c.title?.toLowerCase() === courseFilter.toLowerCase();

    const matchesLevel =
      !levelFilter ||
      c.level?.toLowerCase() === levelFilter.toLowerCase();

    const matchesStatus =
      !statusFilter ||
      c.status?.toLowerCase() === statusFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesCourse &&
      matchesLevel &&
      matchesStatus
    );
  });

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">

      {/* HEADER ROW */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
            Courses Management
          </h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Manage and monitor your courses
          </p>
        </div>

        <Button
          onClick={() => navigate("../courses/add")}
          className="
            bg-[#3161EB] hover:bg-[#2954d6] text-white font-medium
            px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl
            shadow-sm transition-all active:scale-[0.99] whitespace-nowrap
          "
        >
          + Add Course
        </Button>
      </div>

      {/* SUMMARY 3 COLUMN GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 w-full">
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total Courses</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
            {totalCourses}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Active Courses</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
            {activeCourses}
          </h2>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full sm:col-span-2 lg:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total Enrollments</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
            {studentCount}
          </h2>
        </div>
      </div>

      {/* SEARCH AND FILTER DECK */}
      <div className="w-full bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Search courses by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 sm:h-11 bg-[#F9FAFB] rounded-xl pl-10 sm:pl-11 pr-4 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 outline-none border border-gray-200/60 focus:border-[#5D3EFC] transition-all shadow-sm"
          />
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1 w-full sm:w-auto">
            <div className="relative w-full min-w-0">
              <Select value={courseFilter || "all"} onValueChange={(val) => setCourseFilter(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full h-9 sm:h-10 bg-[#F9FAFB] hover:bg-gray-50 border border-gray-200/60 rounded-xl text-xs font-medium text-gray-700 outline-none transition-all shadow-sm truncate">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((c) => (
                    <SelectItem key={c.id} value={c.title}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full min-w-0">
              <Select value={statusFilter || "all"} onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full h-9 sm:h-10 bg-[#F9FAFB] hover:bg-gray-50 border border-gray-200/60 rounded-xl text-xs font-medium text-gray-700 outline-none transition-all shadow-sm truncate">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-full min-w-0">
              <Select value={levelFilter || "all"} onValueChange={(val) => setLevelFilter(val === "all" ? "" : val)}>
                <SelectTrigger className="w-full h-9 sm:h-10 bg-[#F9FAFB] hover:bg-gray-50 border border-gray-200/60 rounded-xl text-xs font-medium text-gray-700 outline-none transition-all shadow-sm truncate">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCourseFilter("");
              setLevelFilter("");
              setStatusFilter("");
            }}
            className="h-9 sm:h-10 px-4 rounded-xl text-white text-xs font-semibold bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 shadow-sm transition-all w-full sm:w-auto flex-shrink-0"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* COURSES CARD DECK */}
      <div className="w-full">

        {(!loading && filteredCourses.length === 0) && (
          <div className="text-center py-12 text-gray-400 text-xs sm:text-sm font-medium w-full">
            No courses found matching your filter criteria
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
            ))
          ) : (
            filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => {
              const getInitials = (name: string) =>
                name
                  ?.split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

              return (
                <div
                  key={c.id}
                  className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 min-w-0 w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                >
                  {/* IMAGE COVER WITH FLOATING WHITE STATUS PILL MATCHING SCREENSHOT */}
                  <div className="relative w-full h-40 bg-gray-100 flex-shrink-0">
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg tracking-wider bg-gradient-to-br from-gray-50 to-gray-100">
                        {getInitials(c.title)}
                      </div>
                    )}

                    <span className="absolute top-3 right-3 px-3.5 py-1 text-xs font-bold capitalize rounded-full bg-white text-[#10B981] shadow-md tracking-wide">
                      {c.status || "Active"}
                    </span>
                  </div>

                  {/* CARD BODY CONFIGURATION */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 w-full">
                    <div className="w-full min-w-0">
                      <h2 title={c.title} className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem] break-all">
                        {c.title}
                      </h2>

                      <p title={c.description} className="text-[14px] text-gray-500 mt-1 line-clamp-2 min-h-[2rem] break-all">
                        {c.description || "Master modern React patterns with TypeScript and build scalable applications"}
                      </p>
                    </div>

                    {/* 2-COLUMN LABELED ICON GRID PRECISELY REPLICATING SCREENSHOT */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 mt-4 pt-4 w-full min-w-0" style={{ borderTop: "1.4px solid #F3F4F6" }}>

                      {/* SCHEDULE */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <Calendar className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Start date</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
                          {renderSchedule(c.schedule)}
                        </p>
                      </div>

                      {/* INSTRUCTOR NAME */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <Users className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Instructor Name</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
                          {getInstructorName(c)}
                        </p>
                      </div>


                      {/* LEVEL */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <BarChart className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Level</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words capitalize">
                          {c.level || "Easy"}
                        </p>
                      </div>

                      {/* LANGUAGE */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <Globe className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Language</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
                          {c.language || "selenium java"}
                        </p>
                      </div>

                      {/* DURATION */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <Clock className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Duration</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
                          {typeof c.duration === "number" ? `${c.duration} days` : (c.duration || "30 days")}
                        </p>
                      </div>

                      {/* CATEGORY */}
                      <div className="flex flex-col min-w-0 mt-0.5">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
                          <Layers className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
                          <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">Category</span>
                        </div>
                        <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
                          {getCategoryName(c.category_id)}
                        </p>
                      </div>

                    </div>

                    {/* BOTTOM BUTTON BAR PRECISELY MATCHING SCREENSHOT */}
                    <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-6 pt-4 w-full mt-auto" style={{ borderTop: "1.4px solid #F3F4F6" }}>
                      <button
                        onClick={() => navigate(`../courses/edit/${c.id}`, { state: { course: c, instructorName: getInstructorName(c), instructorId: (c as any).instructor_id || (c as any).instructorId || (c as any).instructor?.id } })}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#5a5ce6] text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-colors active:scale-[0.99]"
                      >
                        <Pencil className="w-3.5 h-3.5 stroke-[2]" />
                        <span>Edit Course</span>
                      </button>

                      <button
                        onClick={() => setDeleteCourse(c)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF4747] hover:bg-[#ff3333] text-white text-[13px] sm:text-sm font-medium transition-all shadow-sm active:scale-[0.98] min-w-[120px]"
                      >
                        <Trash2 className="w-4 h-4 stroke-2" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            }))}
        </div>

        {/* ================= PAGINATION ================= */}
        {(!loading && filteredCourses.length > 0) && (
          <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
            <div className="text-[13px] font-medium text-[#6B7280]">
              Showing {filteredCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Previous
              </button>

              {Array.from({ length: Math.ceil(filteredCourses.length / itemsPerPage) }).map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === Math.ceil(filteredCourses.length / itemsPerPage) ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold transition-all ${currentPage === pageNumber
                        ? "bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent"
                        : "bg-white text-[#374151] border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }

                if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                  return <span key={pageNumber} className="text-gray-400 font-bold px-1">...</span>;
                }

                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredCourses.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredCourses.length / itemsPerPage) || filteredCourses.length === 0}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* DELETE DIALOG OVERLAY */}
      <Dialog
        open={!!deleteCourse}
        onOpenChange={() => setDeleteCourse(null)}
      >
        <DialogContent className="w-[92vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete Course</DialogTitle>
          </DialogHeader>

          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Are you sure you want to permanently delete{" "}
            <b className="text-gray-900 font-semibold">{deleteCourse?.title}</b>?
          </p>

          <div className="flex justify-end gap-2.5 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCourse(null)}
              className="text-xs sm:text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="text-xs sm:text-sm rounded-lg"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;
