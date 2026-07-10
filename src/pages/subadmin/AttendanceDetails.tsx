import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// removed invalid API_BASE_URL import
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

const AttendanceDetails = () => {
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("course_id");
  const fromDate = searchParams.get("from_date");
  const toDate = searchParams.get("to_date");

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      const urlParams = new URLSearchParams();
      if (courseId) urlParams.append("course_id", courseId);
      if (fromDate) urlParams.append("from_date", fromDate);
      if (toDate) urlParams.append("to_date", toDate);

      // Fallbacks if missing to prevent 422
      if (!courseId) urlParams.append("course_id", "1");
      if (!fromDate) urlParams.append("from_date", "2024-01-01");
      if (!toDate) urlParams.append("to_date", "2030-12-31");

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

  const studentName = studentAttendance.length > 0 ? studentAttendance[0].student_name : "Student";

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 space-y-6 relative">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(formatNav("/dashboard/attendance"))}
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
                  {studentAttendance.map((record, index) => (
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
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const params = new URLSearchParams();
                              if (courseId) params.append("course_id", courseId);
                              if (fromDate) params.append("from_date", fromDate);
                              if (toDate) params.append("to_date", toDate);
                              navigate(formatNav(`/dashboard/attendance/edit/${record.id}?${params.toString()}`));
                            }}
                            className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-semibold text-sm mr-2"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 font-semibold text-sm"
                            onClick={() => handleDelete(record.id as number)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDetails;
