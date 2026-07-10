import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { API_BASE_URL } from "@/services/api/api";
import { toast } from "@/components/ui/use-toast";

import { AttendanceFormHeader } from "./AttendanceComponents/AttendanceFormHeader";
import { AttendanceFields } from "./AttendanceComponents/AttendanceFields";
import { AttendanceEditInfoCards } from "./AttendanceComponents/AttendanceEditInfoCards";
import { AttendanceAddInfoCards } from "./AttendanceComponents/AttendanceAddInfoCards";

interface AttendanceRecord {
  id: number;
  student_id: number;
  student_name: string;
  check_in_time: string;
  check_out_time: string;
  date: string;
  course_id: number;
  duration_hours: number;
}

const AttendanceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const record = location.state?.record;
  const { id } = useParams();
  const isEdit = !!id;

  const getISTTodayDateString = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.formatToParts(new Date());
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    return `${year}-${month}-${day}`;
  };

  const getISTCurrentDateTimeString = () => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const year = parts.find((p) => p.type === "year")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    const minute = parts.find((p) => p.type === "minute")?.value;
    const correctedHour = hour === "24" ? "00" : hour;
    return `${year}-${month}-${day}T${correctedHour}:${minute}`;
  };

  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Courses
        const courseRes = await fetch(`${API_BASE_URL}/admin/courses`, {
          headers,
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          let coursesArray = [];
          if (Array.isArray(courseData)) coursesArray = courseData;
          else if (courseData?.courses) coursesArray = courseData.courses;
          else if (courseData?.data) coursesArray = courseData.data;
          setCourses(coursesArray);
        }

        // Fetch Users (Students)
        const userRes = await fetch(`${API_BASE_URL}/admin/users`, { headers });
        if (userRes.ok) {
          const userData = await userRes.json();
          let usersArray = [];
          if (Array.isArray(userData)) usersArray = userData;
          else if (userData?.users) usersArray = userData.users;
          else if (userData?.data) usersArray = userData.data;
          setStudents(usersArray);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchDropdownData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    check_in_time: "",
    check_out_time: "",
    date: "",
    course_id: "",
    status: "present",
  });

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );

  // Fetch attendance record if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const formatDateTimeLocal = (dateTimeString: string | null) => {
        if (!dateTimeString) return "";
        try {
          const cleanStr = dateTimeString.replace(" ", "T");
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(cleanStr)) {
            return cleanStr.slice(0, 16);
          }
          const date = new Date(dateTimeString);
          if (isNaN(date.getTime())) return dateTimeString;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
          return dateTimeString || "";
        }
      };

      const populateForm = (attendanceData: any) => {
        const updatedFormData = {
          student_id: attendanceData.student_id?.toString() || "",
          check_in_time: formatDateTimeLocal(attendanceData.check_in_time),
          check_out_time: formatDateTimeLocal(attendanceData.check_out_time),
          date: attendanceData.date || "",
          course_id: attendanceData.course_id?.toString() || "",
          status: attendanceData.status || "present",
        };
        setFormData(updatedFormData);
        setSelectedRecord(attendanceData);
      };

      // Best path: Data was passed directly from AttendanceDetails
      if (record) {
        populateForm(record);
        return;
      }

      // Fallback path: Need to fetch from backend (e.g. user refreshed the page)
      const fetchAttendanceRecord = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) throw new Error("No authentication token found");

          const courseIdParam = searchParams.get("course_id");
          const fromDateParam = searchParams.get("from_date");
          const toDateParam = searchParams.get("to_date");

          const params = new URLSearchParams();
          if (courseIdParam) params.append("course_id", courseIdParam);
          if (fromDateParam) params.append("from_date", fromDateParam);
          if (toDateParam) params.append("to_date", toDateParam);

          const url = params.toString()
            ? `${API_BASE_URL}/attendance/admin/view-attendance?${params.toString()}`
            : `${API_BASE_URL}/attendance/admin/view-attendance`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok)
            throw new Error("Failed to fetch attendance record");

          const result = await response.json();
          let attendanceList: any[] = [];
          if (Array.isArray(result)) attendanceList = result;
          else if (result && Array.isArray(result.data))
            attendanceList = result.data;
          else if (result && Array.isArray(result.items))
            attendanceList = result.items;

          const attendanceData = attendanceList.find(
            (r: any) => r.id === Number(id)
          );
          if (attendanceData) {
            populateForm(attendanceData);
          } else {
            console.log(
              "No attendance data found for this ID in the fetched list"
            );
            toast({
              title: "Record Not Found",
              description: "Could not locate this attendance record.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching attendance record:", error);
        }
      };

      fetchAttendanceRecord();
    }
  }, [isEdit, id, record, searchParams]);

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    // Only allow numbers for student_id and course_id, max 20 digits
    if (name === "student_id" || name === "course_id") {
      value = value.replace(/[^0-9]/g, "").slice(0, 20);
    }

    setFormData({ ...formData, [name]: value });
  };

  const getDuration = () => {
    if (!formData.check_in_time || !formData.check_out_time) return "";

    const start = new Date(formData.check_in_time);
    const end = new Date(formData.check_out_time);

    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return "";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m`;
  };

  const formatIST = (timeStr: string) => {
    if (!timeStr) return "Not set";
    try {
      return new Date(timeStr)
        .toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .toUpperCase();
    } catch (e) {
      return "Invalid Date";
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/attendance/admin/view-attendance`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance records");
      }

      const result = await response.json();
      console.log("Fetched attendance records:", result);
      return result;
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (formData.check_in_time && formData.check_out_time) {
      const checkInDate = new Date(formData.check_in_time);
      const checkOutDate = new Date(formData.check_out_time);
      if (checkOutDate <= checkInDate) {
        toast({
          title: "Invalid Duration",
          description: "Check-out time must be after check-in time.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = id
        ? `${API_BASE_URL}/attendance/admin/edit/${id}`
        : `${API_BASE_URL}/attendance/admin/add`;

      const method = isEdit ? "PUT" : "POST";

      let duration_hours = 0;
      if (formData.check_in_time && formData.check_out_time) {
        const start = new Date(formData.check_in_time);
        const end = new Date(formData.check_out_time);
        const diffMs = end.getTime() - start.getTime();
        if (diffMs > 0) {
          duration_hours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
        }
      }

      const payload = {
        ...formData,
        duration_hours,
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEdit ? "update" : "create"} attendance record`
        );
      }

      const result = await response.json();
      console.log(`${isEdit ? "Updated" : "Created"} attendance:`, result);

      toast({
        title: isEdit ? "Updated" : "Created",
        description: isEdit
          ? "Attendance updated successfully"
          : "Attendance created successfully",
        className: "bg-green-600 text-white",
        duration: 2000,
      });

      navigate("/dashboard/attendance");
    } catch (error) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} attendance:`,
        error
      );
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} attendance`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <AttendanceFormHeader
        isEdit={isEdit}
        onBack={() => navigate("/dashboard/attendance")}
      />

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <AttendanceFields
          isEdit={isEdit}
          id={id}
          formData={formData}
          students={students}
          courses={courses}
          minDate={getISTTodayDateString()}
          minCheckIn={isEdit ? undefined : getISTCurrentDateTimeString()}
          minCheckOut={
            isEdit
              ? undefined
              : formData.check_in_time || getISTCurrentDateTimeString()
          }
          durationText={getDuration()}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/dashboard/attendance")}
        />

        {/* RIGHT SIDE DYNAMIC INFO */}
        <div className="flex flex-col justify-between space-y-6 h-full">
          {isEdit ? (
            <AttendanceEditInfoCards
              formData={formData}
              students={students}
              courses={courses}
              formatIST={formatIST}
            />
          ) : (
            <AttendanceAddInfoCards
              formData={formData}
              formatIST={formatIST}
              durationText={getDuration()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
