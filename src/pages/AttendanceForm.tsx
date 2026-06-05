import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Info, AlertCircle, CheckCircle2, User, Calendar, Clock, BookOpen } from "lucide-react";

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

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    check_in_time: "",
    check_out_time: "",
    date: "",
    course_id: "",
  });

  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  // Fetch attendance record if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const fetchAttendanceRecord = async () => {
        try {
          const token = localStorage.getItem("access_token");
          if (!token) {
            throw new Error("No authentication token found");
          }

          // Try the same endpoint as the list view but with ID parameter
          const response = await fetch(`https://lauratek.in:8000/attendance/admin/view-attendance?id=${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error("Failed to fetch attendance record");
          }

          const result = await response.json();
          console.log("Full API response:", result);
          console.log("Response structure:", JSON.stringify(result, null, 2));

          // Handle different response structures - try multiple approaches
          let attendanceList: any[] = [];
          if (Array.isArray(result)) {
            attendanceList = result;
          } else if (result && Array.isArray(result.data)) {
            attendanceList = result.data;
          } else if (result && Array.isArray(result.attendance)) {
            attendanceList = result.attendance;
          }

          let attendanceData = null;
          if (attendanceList.length > 0) {
            attendanceData = attendanceList.find((r: any) => r.id === Number(id)) || attendanceList[0];
          } else if (result && typeof result === 'object' && result.student_id) {
            attendanceData = result;
          }

          console.log("Final attendance data to populate:", attendanceData);
          console.log("Student ID:", attendanceData?.student_id);
          console.log("Course ID:", attendanceData?.course_id);
          console.log("Check-in time:", attendanceData?.check_in_time);
          console.log("Check-out time:", attendanceData?.check_out_time);
          console.log("Date:", attendanceData?.date);

          // Format datetime-local values properly
          const formatDateTimeLocal = (dateTimeString: string) => {
            if (!dateTimeString) return "";
            try {
              const date = new Date(dateTimeString);
              // Format as YYYY-MM-DDTHH:MM for datetime-local input
              return date.toISOString().slice(0, 16);
            } catch (error) {
              console.error("Error formatting datetime:", error);
              return dateTimeString;
            }
          };

          // Direct form update - bypass any potential issues
          if (attendanceData) {
            const updatedFormData = {
              student_id: attendanceData.student_id?.toString() || "",
              check_in_time: formatDateTimeLocal(attendanceData.check_in_time),
              check_out_time: formatDateTimeLocal(attendanceData.check_out_time),
              date: attendanceData.date || "",
              course_id: attendanceData.course_id?.toString() || "",
            };
            console.log("Setting form data:", updatedFormData);
            setFormData(updatedFormData);

            // Additional debugging: check if form actually updated
            setTimeout(() => {
              console.log("Form data after update:", formData);
            }, 200);
          } else {
            console.log("No attendance data found to populate form");
          }

        } catch (error) {
          console.error("Error fetching attendance record:", error);
        }
      };

      fetchAttendanceRecord();
    }
  }, [isEdit, id]);

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
      return new Date(timeStr).toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).toUpperCase();
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

      const response = await fetch(`https://lauratek.in:8000/attendance/admin/view-attendance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

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
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = id
        ? `https://lauratek.in:8000/attendance/admin/edit/${id}`
        : `https://lauratek.in:8000/attendance/admin/add`;

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEdit ? "update" : "create"} attendance record`);
      }

      const result = await response.json();
      console.log(`${isEdit ? "Updated" : "Created"} attendance:`, result);

      navigate("/dashboard/attendance", { 
        state: { flashToast: isEdit ? "Update attendance successfully" : "Create attendance successfully" } 
      });

    } catch (error) {
      console.error(`Error ${isEdit ? "updating" : "creating"} attendance:`, error);
      // You might want to show an error message to the user here
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
            onClick={() => navigate("/dashboard/attendance")}
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
                      Student ID *
                    </label>
                  </div>

                  <Input
                    name="student_id"
                    placeholder="Enter student ID"
                    value={formData.student_id}
                    onChange={handleChange}
                    className="h-11 w-full rounded-xl border border-gray-300"
                  />
                </div>
              )}

              {/* Course ID */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />

                  <label className="text-sm font-medium text-gray-700">
                    Course ID *
                  </label>
                </div>

                <Input
                  name="course_id"
                  placeholder="Enter course ID"
                  value={isEdit ? formData.course_id : formData.course_id}
                  onChange={handleChange}
                  disabled={isEdit}
                  className={`h-11 w-full rounded-xl border border-gray-300 ${isEdit ? "bg-gray-100 text-gray-500" : ""}`}
                />
              </div>

              {/* Date */}
              {!isEdit && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />

                    <label className="text-sm font-medium text-gray-700">
                      Date *
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
                      Check-in Time *
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
                      Check-out Time *
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
                >
                  {isEdit ? "Update Attendance" : "Create Attendance"}
                </Button>

                <Button
                  variant="outline"
                  className="w-1/2 h-11 rounded-xl border border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm hover:scale-[1.03] active:scale-[0.98]"
                  onClick={() => navigate("/dashboard/attendance")}
                >
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT SIDE DYNAMIC INFO */}
        <div className="flex flex-col justify-between space-y-6 h-full">
          {isEdit ? (
            <>
              {/* RECORD INFORMATION CARD */}
              <div className="bg-[#f8faff] rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Info className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <h3 className="text-[16px] font-bold text-gray-900">
                    Record Information
                  </h3>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Last Updated:</span>
                    <span className="text-xs font-bold text-gray-900">
                      {formData.date ? `${formData.date} ` : ""}{formatIST(formData.check_in_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Updated By:</span>
                    <span className="text-xs font-bold text-gray-900">Admin User</span>
                  </div>
                </div>

                <div className="border-t border-blue-100 pt-3">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Changes will be tracked and timestamped for audit purposes.
                  </p>
                </div>
              </div>

              {/* PREVIOUS VALUES CARD */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-[16px] font-bold text-gray-900 mb-4">
                  Previous Values
                </h3>

                <div className="space-y-3">
                  {/* Student */}
                  <div className="bg-[#f9fafb] p-3 rounded-xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">Student</span>
                    <span className="text-xs font-bold text-gray-900">
                      Student ID: {formData.student_id || "Not entered"}
                    </span>
                  </div>

                  {/* Check-in / Check-out Side-by-Side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f9fafb] p-3 rounded-xl">
                      <span className="block text-[11px] text-gray-400 font-medium mb-1">Check-in</span>
                      <span className="text-xs font-bold text-gray-900">
                        {formData.check_in_time ? formatIST(formData.check_in_time) : "--:--"}
                      </span>
                    </div>

                    <div className="bg-[#f9fafb] p-3 rounded-xl">
                      <span className="block text-[11px] text-gray-400 font-medium mb-1">Check-out</span>
                      <span className="text-xs font-bold text-gray-900">
                        {formData.check_out_time ? formatIST(formData.check_out_time) : "--:--"}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-[#f9fafb] p-3 rounded-xl">
                    <span className="block text-[11px] text-gray-400 font-medium mb-1">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Present
                    </span>
                  </div>
                </div>
              </div>

              {/* VALIDATION RULES CARD */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="text-[16px] font-bold text-gray-900">
                      Validation Rules
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600">All fields are required</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600">Date cannot be in the future</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600">Check-out must be after check-in</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600">Changes are auto-saved</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* QUICK TIPS */}
              <div className="bg-white rounded-[22px] shadow-[0_8px_30px_rgba(99,102,241,0.08)] border border-[#f3f4f6] p-6">
                {/* Heading */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-5 h-5 rounded-full border border-indigo-500 flex items-center justify-center">
                    <span className="text-[11px] text-indigo-600 font-bold">i</span>
                  </div>

                  <h3 className="text-[15px] font-semibold text-[#111827]">
                    Quick Tips
                  </h3>
                </div>

                {/* Tips */}
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Select the student from the dropdown
                      <br />
                      to view their details
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Date cannot be in the future
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Duration is calculated automatically from
                      <br />
                      times
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Status is auto-detected but can be
                      <br />
                      changed manually
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Check-out time must be after check-in time
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-indigo-500 mt-[7px] flex-shrink-0"></div>
                    <p className="text-[14px] leading-[22px] text-[#4b5563]">
                      Attendance records are saved automatically
                      <br />
                      when all required fields are filled
                    </p>
                  </div>
                </div>
              </div>

              {/* CURRENT ATTENDANCE INFO */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5">
                    <span className="text-indigo-600">📊</span>
                    Current Attendance
                  </h3>

                  <div className="space-y-4">
                    {/* Student ID Display */}
                    <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-700">Student ID</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formData.student_id || "Not entered"}
                      </span>
                    </div>

                    {/* Date Display */}
                    <div className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-700">Date</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {formData.date ? new Date(formData.date).toLocaleDateString() : "Not selected"}
                      </span>
                    </div>

                    {/* Check-in Display */}
                    <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-700">Check-in</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatIST(formData.check_in_time)}
                      </span>
                    </div>

                    {/* Check-out Display */}
                    <div className="flex items-center justify-between bg-red-50 px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-700">Check-out</span>
                      <span className="text-sm font-semibold text-red-600">
                        {formatIST(formData.check_out_time)}
                      </span>
                    </div>

                    {/* Duration Display */}
                    <div className="flex items-center justify-between bg-purple-50 px-4 py-3 rounded-xl">
                      <span className="text-sm text-gray-700">Duration</span>
                      <span className="text-sm font-semibold text-purple-600">
                        {getDuration() || "Calculating..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
