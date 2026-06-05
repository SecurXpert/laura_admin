import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle2 } from "lucide-react";
import { Pencil, Trash2, Search } from "lucide-react";
import { Eye } from "lucide-react";

import { User, Calendar, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";


interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  check_in_time: string;
  course_id: number;
  check_out_time: string;
  duration_hours: number;
}

const Attendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<{ student_id: number; student_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (location.state?.flashToast) {
      setSuccessToast(location.state.flashToast);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  }, [location]);

  // ================= FETCH =================
  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance/admin/view-attendance");

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
      );

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  //  SEARCH FILTER
  const filteredStudents = students.filter((student) =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toString().includes(searchTerm)
  );

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await api.delete(`/attendance/admin/delete/${id}`);

      await fetchAttendance();

      setToastMessage("Delete Successfully");
      setTimeout(() => setToastMessage(null), 3000);

    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete attendance");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 relative">

      {/* LARGE TOAST MESSAGE */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-[9999] transition-all duration-300">
          <div className="bg-red-500 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 text-lg font-bold tracking-wide border-2 border-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}

      {/* LARGE GREEN SUCCESS TOAST (FROM FORMS) */}
      {successToast && (
        <div className="fixed bottom-10 right-10 z-[9999] transition-all duration-300">
          <div className="bg-green-500 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 text-lg font-bold tracking-wide border-2 border-green-600">
            <CheckCircle2 className="w-7 h-7 text-white" />
            {successToast}
          </div>
        </div>
      )}

      <div className="space-y-6">

        {/* RESPONSIVE HEADER CONTAINER */}
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          {/* LEFT TITLE */}
          <div>
            <h1 className="text-2xl font-semibold text-[#1F2937]">
              Student Attendance
            </h1>
            <h3 className="text-sm text-gray-500">Track and manage student attendance records efficiently</h3>
          </div>

          {/* RIGHT SIDE (BUTTON) */}
          <div className="flex items-center gap-3">
            {/* Add Button */}
            <button
              onClick={() => navigate("/dashboard/attendance/add")}
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

        {/* SEARCH BAR CONTAINER */}
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3">
          <div className="relative w-full">
            {/* Search Icon */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              placeholder="Search by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 
                   rounded-full focus:ring-2 focus:ring-blue-200 
                   focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[90px] w-full rounded-xl" />
            ))}
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
                          fontSize: "30px",
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
                    onClick={() => navigate(`/dashboard/attendance/details/${student.student_id}`)}
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