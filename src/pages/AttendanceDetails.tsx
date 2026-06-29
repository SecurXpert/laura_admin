import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/services/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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

const AttendanceDetails = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("course_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const urlParams = new URLSearchParams();
      if (courseId) urlParams.append("course_id", courseId);
      if (fromDate) urlParams.append("from_date", fromDate);
      if (toDate) urlParams.append("to_date", toDate);

      const res = await fetch(
        `${API_BASE_URL}/attendance/admin/view-attendance?${urlParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      let records = Array.isArray(data) ? data : (data.data || data.items || []);
      records = [...records].sort((a: any, b: any) => {
        const idA = a.id || 0;
        const idB = b.id || 0;
        return idB - idA;
      });
      setAttendanceData(records);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [studentId, courseId, fromDate, toDate]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${API_BASE_URL}/attendance/admin/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");
      await fetchAttendance();

      toast({
        title: "Deleted",
        description: "Deleted successfully",
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

  const studentAttendance = attendanceData.filter(
    (record) => record.student_id === Number(studentId)
  );

  const paginatedAttendance = studentAttendance.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(studentAttendance.length / itemsPerPage);

  const studentName = studentAttendance.length > 0 ? studentAttendance[0].student_name : "Student";

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 space-y-6 relative">

      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/attendance")}
          className="rounded-full shadow-sm hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-[#1F2937]">
            Attendance Details
          </h1>
          <h3 className="text-sm text-gray-500">
            View full attendance history for {studentName}
          </h3>
        </div>
      </div>

      {loading ? (
        <div className="w-full space-y-4">
          <Skeleton className="h-10 w-1/3 rounded-xl mb-4" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      ) : (
        <Card className="rounded-2xl shadow-lg border bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Attendance Sheet - {studentName}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-xl overflow-hidden border bg-white overflow-x-auto">
              <Table>
                {/* HEADER */}
                <TableHeader>
                  <TableRow className="bg-[#F3F4F6]">
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Date
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Check In
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Check Out
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Duration
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Status
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Course Id
                    </TableHead>
                    <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                {/* BODY */}
                <TableBody className="bg-gray-50">
                  {studentAttendance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No attendance records found for this student.
                      </TableCell>
                    </TableRow>
                  )}
                  {paginatedAttendance.map((record, index) => (
                    <TableRow
                      key={record.id || index}
                      className="bg-white hover:bg-gray-100 transition rounded-lg"
                    >
                      {/* DATE */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-[#99A1AF]" />
                          {record.date ? new Date(record.date).toLocaleDateString() : "-"}
                        </div>
                      </TableCell>

                      {/* CHECK-IN */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Clock className="w-4 h-4 text-green-600" />
                          {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : "-"}
                        </div>
                      </TableCell>

                      {/* CHECK-OUT */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Clock className="w-4 h-4 text-red-600" />
                          {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : "-"}
                        </div>
                      </TableCell>

                      {/* DURATION */}
                      <TableCell>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-sm font-semibold text-gray-800">
                            {record.duration_hours || 0}
                          </span>
                          <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (parseFloat((record.duration_hours || 0).toString()) / 8) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* STATUS */}
                      <TableCell className="font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${record.status?.toLowerCase() === "present" ? "bg-green-100 text-green-700" :
                            record.status?.toLowerCase() === "absent" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                          }`}>
                          {record.status || "UNKNOWN"}
                        </span>
                      </TableCell>

                      <TableCell className="font-medium text-gray-700">
                        {record.course_id}
                      </TableCell>

                      {/* ACTIONS */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-lg"
                            onClick={() => navigate(`/dashboard/attendance/edit/${record.id || ""}`, { state: { record } })}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-lg"
                            onClick={() => handleDelete(record.id as number)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ================= PAGINATION ================= */}
            {studentAttendance.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between py-4 mt-4 border-t border-gray-100 gap-4 w-full">
                <div className="text-[13px] font-medium text-[#6B7280]">
                  Showing {studentAttendance.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, studentAttendance.length)} of {studentAttendance.length}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || studentAttendance.length === 0}
                    className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDetails;
