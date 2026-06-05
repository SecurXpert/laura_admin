import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  check_in_time: string;
  course_id: number;
  check_out_time: string;
  duration_hours: number;
}

const AttendanceDetails = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `https://lauratek.in:8000/attendance/admin/view-attendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `https://lauratek.in:8000/attendance/admin/delete/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Delete failed");
      await fetchAttendance();

      setToastMessage("Delete Successfully");
      setTimeout(() => setToastMessage(null), 3000);

    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete attendance");
    }
  };

  const studentAttendance = attendanceData.filter(
    (record) => record.student_id === Number(studentId)
  );

  const studentName = studentAttendance.length > 0 ? studentAttendance[0].student_name : "Student";

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 space-y-6 relative">

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
                      Attendance ID
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
                  {studentAttendance.map((record) => (
                    <TableRow
                      key={record.id}
                      className="bg-white hover:bg-gray-100 transition rounded-lg"
                    >
                      {/* DATE */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Calendar className="w-4 h-4 text-[#99A1AF]" />
                          {new Date(record.check_in_time).toLocaleDateString()}
                        </div>
                      </TableCell>

                      {/* CHECK-IN */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Clock className="w-4 h-4 text-green-600" />
                          {new Date(record.check_in_time).toLocaleTimeString()}
                        </div>
                      </TableCell>

                      {/* CHECK-OUT */}
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                          <Clock className="w-4 h-4 text-red-600" />
                          {new Date(record.check_out_time).toLocaleTimeString()}
                        </div>
                      </TableCell>

                      {/* DURATION */}
                      <TableCell>
                        <div className="flex flex-col gap-1 min-w-[120px]">
                          <span className="text-sm font-semibold text-gray-800">
                            {record.duration_hours}
                          </span>
                          <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (parseFloat(record.duration_hours.toString()) / 8) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-gray-700">
                        {record.id}
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
                            onClick={() => navigate(`/dashboard/attendance/edit/${record.id}`)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-lg"
                            onClick={() => handleDelete(record.id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDetails;
