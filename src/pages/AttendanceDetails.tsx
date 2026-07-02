import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/services/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

import { AttendanceDetailsHeader } from "./AttendanceComponents/AttendanceDetailsHeader";
import { AttendanceDetailsTable } from "./AttendanceComponents/AttendanceDetailsTable";
import { AttendanceDetailsPagination } from "./AttendanceComponents/AttendanceDetailsPagination";

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
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
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
      let records = Array.isArray(data)
        ? data
        : data.data || data.items || [];
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

  const studentName =
    studentAttendance.length > 0 ? studentAttendance[0].student_name : "Student";

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12 space-y-6 relative">
      <AttendanceDetailsHeader
        studentName={studentName}
        onBack={() => navigate("/dashboard/attendance")}
      />

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
            <AttendanceDetailsTable
              paginatedAttendance={paginatedAttendance}
              studentAttendanceCount={studentAttendance.length}
              onEdit={(record) =>
                navigate(`/dashboard/attendance/edit/${record.id || ""}`, {
                  state: { record },
                })
              }
              onDelete={handleDelete}
            />

            <AttendanceDetailsPagination
              currentPage={currentPage}
              totalFiltered={studentAttendance.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDetails;
