import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import api from "@/API/axiosInstance";
import CourseStats from "./CourseComponents/CourseStats";
import CourseFilters from "./CourseComponents/CourseFilters";
import CourseGrid from "./CourseComponents/CourseGrid";
import CoursePagination from "./CourseComponents/CoursePagination";
import CourseDeleteModal from "./CourseComponents/CourseDeleteModal";
import { CourseItem } from "./CourseComponents/CourseCard";

/* ================= API ================= */
const COURSE_API = `/admin/courses`;
const CATEGORY_API = `/admin/categories`;
const INSTRUCTOR_API = `/admin/instructors`;

/* ================= TYPES ================= */
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
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [deleteCourse, setDeleteCourse] = useState<CourseItem | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, courseFilter, levelFilter, statusFilter]);

  const uniqueCourses = [...new Map((Array.isArray(courses) ? courses : []).map(c => [c.title, c])).values()];
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
      if (Array.isArray(res.data)) {
        setCourses([...res.data].reverse());
      } else if (res.data && Array.isArray(res.data.courses)) {
        setCourses([...res.data.courses].reverse());
      } else if (res.data && Array.isArray(res.data.data)) {
        setCourses([...res.data.data].reverse());
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error("Failed to fetch live courses", err);
      setCourses([]);
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

  const getInstructorName = (id: number) => {
    const found = instructors.find((i) => i.id === id);
    if (found) return found.name;
    return id === 1 ? "Arjun kumar" : `Instructor #${id}`;
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete course",
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
  const filteredCourses = (Array.isArray(courses) ? courses : []).filter((c) => {
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
          onClick={() => navigate(formatNav("/dashboard/courses/add"))}
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
      <CourseStats
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        studentCount={studentCount}
      />

      {/* SEARCH AND FILTER DECK */}
      <CourseFilters
        search={search}
        setSearch={setSearch}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
        uniqueCourses={uniqueCourses}
        onReset={() => {
          setSearch("");
          setCourseFilter("");
          setLevelFilter("");
          setStatusFilter("");
        }}
      />

      {/* COURSES CARD DECK */}
      <CourseGrid
        loading={loading}
        filteredCourses={filteredCourses}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        getCategoryName={getCategoryName}
        getInstructorName={getInstructorName}
        renderSchedule={renderSchedule}
        onDelete={(c) => setDeleteCourse(c)}
      />

      {/* PAGINATION */}
      <CoursePagination
        loading={loading}
        totalFiltered={filteredCourses.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />

      {/* DELETE DIALOG OVERLAY */}
      <CourseDeleteModal
        deleteCourse={deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Courses;
