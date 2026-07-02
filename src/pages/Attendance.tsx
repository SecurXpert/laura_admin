import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

import { AttendanceHeader } from "./AttendanceComponents/AttendanceHeader";
import { AttendanceFilterBar } from "./AttendanceComponents/AttendanceFilterBar";
import { AttendanceStudentCard } from "./AttendanceComponents/AttendanceStudentCard";
import { AttendancePagination } from "./AttendanceComponents/AttendancePagination";

interface AttendanceRecord {
  id?: number;
  student_id: number;
  student_name: string;
  course_id: number;
  date: string;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  duration_hours: number;
}

const Attendance = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<
    { student_id: number; student_name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  // Default dates: last 30 days to today
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [courseId, setCourseId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Fetch Courses on mount
  useEffect(() => {
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
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  // ================= FETCH =================
  const fetchAttendance = async () => {
    if (!courseId || !fromDate || !toDate) {
      toast({
        title: "Validation Error",
        description: "Please select course and date range.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/attendance/admin/view-attendance", {
        params: {
          course_id: courseId,
          from_date: fromDate,
          to_date: toDate,
        },
      });

      let data = res.data;
      if (!Array.isArray(data)) data = data.data || data.items || [];
      setAttendanceData(data);

      const uniqueStudents = Array.from(
        new Map(
          data.map((item: AttendanceRecord) => [
            item.student_id,
            { student_id: item.student_id, student_name: item.student_name },
          ])
        ).values()
      ).sort((a: any, b: any) => b.student_id - a.student_id);

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchAttendance();
    }
  }, [courseId, fromDate, toDate]);

  // SEARCH FILTER
  const filteredStudents = students.filter((student) => {
    const nameMatch = student.student_name
      ? student.student_name.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    const idMatch = student.student_id
      ? student.student_id.toString().includes(searchTerm)
      : false;
    return nameMatch || idMatch;
  });

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/attendance/admin/delete/${id}`);

      await fetchAttendance();

      toast({
        title: "Deleted",
        description: "Attendance removed successfully",
        className: "bg-red-500 text-white",
        duration: 2000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete attendance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 relative">
      <div className="space-y-6">
        <AttendanceHeader
          onAdd={() => navigate("/dashboard/attendance/add")}
        />

        <AttendanceFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
          courseId={courseId}
          onCourseIdChange={setCourseId}
          courses={courses}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[90px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {filteredStudents
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((student) => (
                  <AttendanceStudentCard
                    key={student.student_id}
                    student={student}
                    onViewDetails={() =>
                      navigate(
                        `/dashboard/attendance/details/${student.student_id}?course_id=${courseId}&from_date=${fromDate}&to_date=${toDate}`
                      )
                    }
                  />
                ))}
            </div>

            <AttendancePagination
              currentPage={currentPage}
              totalFiltered={filteredStudents.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;