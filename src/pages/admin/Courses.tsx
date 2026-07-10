import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

import { CoursesHeader } from "./CourseComponents/CoursesHeader";
import { CoursesStats } from "./CourseComponents/CoursesStats";
import { CoursesFilters } from "./CourseComponents/CoursesFilters";
import { CourseCard } from "./CourseComponents/CourseCard";
import { CoursesPagination } from "./CourseComponents/CoursesPagination";
import { CourseDeleteDialog } from "./CourseComponents/CourseDeleteDialog";

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

  const uniqueCourses = [...new Map(courses.map((c) => [c.title, c])).values()];
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
    if (typeof course === "number" || typeof course === "string") {
      const id = Number(course);
      const found = instructors.find((i) => i.id === id);
      if (found) return found.name;
      return id === 1
        ? "Arjun kumar"
        : id
        ? `Instructor #${id}`
        : "Not Assigned";
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "This course cannot be deleted because it is assigned to an instructor.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleteCourse(null);
    }
  };

  /* ================= SEARCH ================= */
  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());

    const matchesCourse =
      !courseFilter || c.title?.toLowerCase() === courseFilter.toLowerCase();

    const matchesLevel =
      !levelFilter || c.level?.toLowerCase() === levelFilter.toLowerCase();

    const matchesStatus =
      !statusFilter || c.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCourse && matchesLevel && matchesStatus;
  });

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      <CoursesHeader onAddCourse={() => navigate("../courses/add")} />

      <CoursesStats
        totalCourses={totalCourses}
        activeCourses={activeCourses}
        studentCount={studentCount}
      />

      <CoursesFilters
        search={search}
        onSearchChange={setSearch}
        courseFilter={courseFilter}
        onCourseFilterChange={setCourseFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
        uniqueCourses={uniqueCourses}
        onReset={() => {
          setSearch("");
          setCourseFilter("");
          setLevelFilter("");
          setStatusFilter("");
        }}
      />

      <div className="w-full">
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs sm:text-sm font-medium w-full">
            No courses found matching your filter criteria
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
              ))
            : filteredCourses
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((c) => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    instructorName={getInstructorName(c)}
                    categoryName={getCategoryName(c.category_id)}
                    onEdit={() =>
                      navigate(`../courses/edit/${c.id}`, {
                        state: {
                          course: c,
                          instructorName: getInstructorName(c),
                          instructorId:
                            (c as any).instructor_id ||
                            (c as any).instructorId ||
                            (c as any).instructor?.id,
                        },
                      })
                    }
                    onDelete={() => setDeleteCourse(c)}
                  />
                ))}
        </div>

        {!loading && filteredCourses.length > 0 && (
          <CoursesPagination
            currentPage={currentPage}
            totalFiltered={filteredCourses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CourseDeleteDialog
        deleteCourse={deleteCourse}
        onClose={() => setDeleteCourse(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Courses;
