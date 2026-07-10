import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import ScrollableDropdown from "@/components/subadmin/ScrollableDropdown";
// removed invalid API_BASE_URL import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, AlertCircle, CheckCircle2, User, Calendar, Clock, BookOpen, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

const AttendanceForm = () => {
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const record = location.state?.record;
  const { id } = useParams();
  const isEdit = !!id;

  const getISTTodayDateString = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    return `${year}-${month}-${day}`;
  };

  const getISTCurrentDateTimeString = () => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(new Date());
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const year = parts.find(p => p.type === 'year')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const correctedHour = hour === '24' ? '00' : hour;
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
        const courseRes = await fetch(`${API_BASE_URL}/admin/courses`, { headers });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          let coursesArray = [];
          if (Array.isArray(courseData)) coursesArray = courseData;
          else if (courseData?.courses) coursesArray = courseData.courses;
          else if (courseData?.data) coursesArray = courseData.data;
          setCourses(coursesArray);
        }

        // Fetch Users (Students only)
        const userRes = await fetch(`${API_BASE_URL}/student/students/list`, { headers });
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

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Fetch attendance record if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const formatDateTimeLocal = (dateTimeString: string | null) => {
        if (!dateTimeString) return "";
        try {
          const date = new Date(dateTimeString);
          return date.toISOString().slice(0, 16);
        } catch (error) {
          return dateTimeString;
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

          let courseIdParam = searchParams.get("course_id");
          let fromDateParam = searchParams.get("from_date");
          let toDateParam = searchParams.get("to_date");

          if (!courseIdParam) courseIdParam = "1";
          if (!fromDateParam) fromDateParam = "2024-01-01";
          if (!toDateParam) toDateParam = "2030-12-31";

          const params = new URLSearchParams({
            course_id: courseIdParam,
            from_date: fromDateParam,
            to_date: toDateParam
          });

          const response = await fetch(`${API_BASE_URL}/attendance/admin/view-attendance?${params.toString()}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error("Failed to fetch attendance record");

          const result = await response.json();
          let attendanceList: any[] = [];
          if (Array.isArray(result)) attendanceList = result;
          else if (result && Array.isArray(result.data)) attendanceList = result.data;
          else if (result && Array.isArray(result.items)) attendanceList = result.items;

          const attendanceData = attendanceList.find((r: any) => r.id === Number(id));
          if (attendanceData) {
            populateForm(attendanceData);
          } else {
            console.log("No attendance data found for this ID in the fetched list");
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
        duration_hours
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? "update" : "create"} attendance record`);
      }

      toast({
        title: isEdit ? "Updated" : "Created",
        description: isEdit ? "Attendance updated successfully" : "Attendance created successfully",
        className: "bg-green-600 text-white",
        duration: 2000,
      });

      navigate(formatNav("/dashboard/attendance"));

    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} attendance:`, error);
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

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(formatNav("/dashboard/attendance"))}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Attendance" : "Add Attendance"}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Update attendance record"
                : "Create and configure a new attendance record"}
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* LEFT SIDE FORM */}
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">

              {/* Student ID */}
              {isEdit ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance ID
                  </label>

                  <input
                    type="text"
                    value={id || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-indigo-600" />

                    <label className="text-sm font-medium text-gray-700">
                      Student ID <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <ScrollableDropdown
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleChange}
                    options={students.map((student) => ({ value: student.id, label: `${student.name} (ID: ${student.id})` }))}
                    placeholder="Select Student"
                  />
                </div>
              )}

              {/* Course ID */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />

                  <label className="text-sm font-medium text-gray-700">
                    Course ID <span className="text-red-500">*</span>
                  </label>
                </div>

                <ScrollableDropdown
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  disabled={isEdit}
                  options={courses.map((course) => ({ value: course.id, label: course.title || `Course ID: ${course.id}` }))}
                  placeholder="Select Course"
                />
              </div>

              {/* Date */}
              {!isEdit && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />

                    <label className="text-sm font-medium text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <Input
                    type="date"
                    name="date"
                    min={getISTTodayDateString()}
                    value={formData.date || ""}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-300"
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Cannot select past dates
                  </p>
                </div>
              )}

              {/* Times */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Check-in */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-600" />

                    <label className="text-sm font-medium text-gray-700">
                      Check-in Time <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <Input
                    type="datetime-local"
                    name="check_in_time"
                    min={getISTCurrentDateTimeString()}
                    value={formData.check_in_time}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-300"
                  />
                </div>

                {/* Check-out */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-red-600" />

                    <label className="text-sm font-medium text-gray-700">
                      Check-out Time <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <Input
                    type="datetime-local"
                    name="check_out_time"
                    min={formData.check_in_time || getISTCurrentDateTimeString()}
                    value={formData.check_out_time}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-emerald-600" />
                  <label className="text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-300 px-3 pr-10 bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Duration */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />

                  <label className="text-sm font-medium text-gray-700">
                    Duration (Auto-calculated)
                  </label>
                </div>

                <Input
                  value={getDuration()}
                  readOnly
                  placeholder="Duration will be calculated automatically"
                  className="h-11 w-full rounded-xl bg-gray-100 border border-gray-300"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Based on check-in and check-out times
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between gap-4 pt-4 border-t">
                <Button
                  className="w-1/2 h-11 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {isEdit ? "Update Attendance" : "Create Attendance"}
                </Button>

                <Button
                  variant="outline"
                  className="w-1/2 h-11 rounded-xl border border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => navigate(formatNav("/dashboard/attendance"))}
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE DYNAMIC INFO */}
        <div className="flex flex-col space-y-6 h-full">
          {formData.student_id || formData.course_id || isEdit ? (
            <>
              {/* RECORD INFORMATION CARD */}
              <div className="bg-[#f8faff] rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    i
                  </div>
                  <h3 className="font-semibold text-blue-900">Record Summary</h3>
                </div>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span className="font-medium whitespace-nowrap mr-4">Student</span>
                    <span className="text-right truncate" title={students.find(s => s.id?.toString() === formData.student_id)?.name || formData.student_id}>
                      {students.find(s => s.id?.toString() === formData.student_id)?.name || formData.student_id || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span className="font-medium whitespace-nowrap mr-4">Course</span>
                    <span className="text-right truncate" title={courses.find(c => c.id?.toString() === formData.course_id)?.title || formData.course_id}>
                      {courses.find(c => c.id?.toString() === formData.course_id)?.title || formData.course_id || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span className="font-medium">Date</span>
                    <span>{formData.date || "-"}</span>
                  </div>
                  <div className="flex justify-between border-b border-blue-200 pb-2">
                    <span className="font-medium">Status</span>
                    <span className="capitalize">{formData.status || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Duration</span>
                    <span>{getDuration() || "-"}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 text-gray-500 text-center h-full flex flex-col items-center justify-center">
              <Info className="w-12 h-12 text-gray-300 mb-4" />
              <p>Select a student and course to see the attendance record summary.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AttendanceForm;
