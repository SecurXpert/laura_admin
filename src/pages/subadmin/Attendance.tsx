import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle2, Pencil, Trash2, Search, Eye, User, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/api/axiosInstance";
import { toast } from "@/components/ui/use-toast";

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
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<{ student_id: number; student_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

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

  // ================= FETCH COURSES =================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/admin/courses");
        let data = res.data;
        if (!Array.isArray(data)) data = data.courses || data.data || [];
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    };
    fetchCourses();
  }, []);

  // ================= FETCH =================
  const fetchAttendance = async () => {
    if (!courseId || !fromDate || !toDate) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/attendance/admin/view-attendance", {
        params: {
          course_id: courseId,
          from_date: fromDate,
          to_date: toDate
        }
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
      setAttendanceData([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [courseId, fromDate, toDate]);

  //  SEARCH FILTER
  const filteredStudents = students.filter((student) => {
    const nameMatch = student.student_name ? student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const idMatch = student.student_id ? student.student_id.toString().includes(searchTerm) : false;
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

        {/* RESPONSIVE HEADER CONTAINER */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          {/* LEFT TITLE */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
              Student Attendance
            </h1>
            <h3 className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">Track and manage student attendance records efficiently</h3>
          </div>

          {/* RIGHT SIDE (BUTTON) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(formatNav("/dashboard/attendance/add"))}
              className="flex items-center gap-2 px-5 py-2.5 
               rounded-full border border-transparent
               bg-gradient-to-r from-[#615FFF] to-[#AD46FF] 
               text-white 
               hover:from-[#514EF0] hover:to-[#9333EA]
               transition shadow-sm"
            >
              <span className="text-lg leading-none">+</span>
              Add Attendance
            </button>
          </div>
        </div>

        {/* FILTERS CONTAINER */}
        <div className="flex flex-col sm:flex-row gap-4 w-full bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-4 mb-4 items-end">
          <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
            <label className="text-sm font-semibold text-gray-700">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#615FFF] text-sm w-full bg-white"
            >
              <option value="">Select Course...</option>
              {courses.map((c: any) => (
                <option key={c.id || c.course_id} value={c.id || c.course_id}>
                  {c.name || c.title || `Course ${c.id || c.course_id}`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
            <label className="text-sm font-semibold text-gray-700">From Date</label>
            <input
              type="date"
              value={fromDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const today = new Date().toISOString().split("T")[0];
                const val = e.target.value > today ? today : e.target.value;
                setFromDate(val);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#615FFF] text-sm w-full bg-white"
            />
          </div>
          <div className="flex flex-col gap-1.5 w-full sm:w-1/3">
            <label className="text-sm font-semibold text-gray-700">To Date</label>
            <input
              type="date"
              value={toDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const today = new Date().toISOString().split("T")[0];
                const val = e.target.value > today ? today : e.target.value;
                setToDate(val);
              }}
              className="px-3 py-2.5 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#615FFF] text-sm w-full bg-white"
            />
          </div>
        </div>

        {/* SEARCH BAR CONTAINER */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
            <input
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] focus:ring-1 focus:ring-[#6366F1] outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[90px] w-full rounded-xl" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {!courseId ? "Please select a course to view attendance." : "No attendance records found for this criteria."}
          </div>
        ) : (
          <div className="w-full">
            {/* Grid (2 per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((student, index) => (
                <div
                  key={student.student_id}
                  className="flex flex-wrap items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition bg-white gap-4"
                >
                  {/* LEFT */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Avatar with dynamic color */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center 
             text-white font-semibold flex-shrink-0
             bg-gradient-to-r from-[#615FFF] to-[#AD46FF]"
                    >
                      {student.student_name?.charAt(0)?.toUpperCase()}
                    </div>

                    {/* Name + ID */}
                    <div>
                      <p
                        className="font-bold text-[#101828]"
                        style={{
                          fontFamily: "Inter",
                          fontSize: "25px",
                          lineHeight: "45.3px",
                          letterSpacing: "-0.74px",
                        }}
                      >
                        {student.student_name}
                      </p>
                      <p
                        className="text-gray-500"
                        style={{
                          fontFamily: "Inter",
                          fontWeight: 400,
                          fontSize: "20px",
                          lineHeight: "33.55px",
                          letterSpacing: "-0.25px",
                        }}
                      >
                        Student id: {student.student_id}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT BUTTON (FILLED) */}
                  <button
                    onClick={() => navigate(formatNav(`/dashboard/attendance/details/${student.student_id}?course_id=${courseId}&from_date=${fromDate}&to_date=${toDate}`))}
                    className="flex items-center justify-center gap-2 
             text-white 
             bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
             hover:from-[#514EF0] hover:to-[#9333EA]
             transition shadow-sm"
                    style={{
                      width: "234px",
                      height: "49px",
                      borderRadius: "13.49px",
                    }}
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* ================= PAGINATION ================= */}
            {filteredStudents.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
                <div className="text-[13px] font-medium text-[#6B7280]">
                  Showing {filteredStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) }).map((_, i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === Math.ceil(filteredStudents.length / itemsPerPage) ||
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
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredStudents.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage) || filteredStudents.length === 0}
                    className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
