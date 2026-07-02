import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Calendar, Clock, BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceFieldsProps {
  isEdit: boolean;
  id?: string;
  formData: any;
  students: any[];
  courses: any[];
  minDate: string;
  minCheckIn?: string;
  minCheckOut?: string;
  durationText: string;
  onChange: (e: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AttendanceFields: React.FC<AttendanceFieldsProps> = ({
  isEdit,
  id,
  formData,
  students,
  courses,
  minDate,
  minCheckIn,
  minCheckOut,
  durationText,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
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

              <div className="relative">
                <Select
                  name="student_id"
                  value={formData.student_id || undefined}
                  onValueChange={(val) =>
                    onChange({ target: { name: "student_id", value: val } })
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border border-gray-300 px-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-none">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} (ID: {student.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="relative">
              <Select
                name="course_id"
                value={formData.course_id || undefined}
                onValueChange={(val) =>
                  onChange({ target: { name: "course_id", value: val } })
                }
                disabled={isEdit}
              >
                <SelectTrigger
                  className={`h-11 w-full rounded-xl border border-gray-300 px-3 focus:ring-2 focus:ring-indigo-500 outline-none ${
                    isEdit ? "bg-gray-100 text-gray-500" : "bg-white"
                  } cursor-pointer shadow-none`}
                >
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title || `Course ID: ${course.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                min={minDate}
                value={formData.date || ""}
                onChange={onChange}
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
                min={minCheckIn}
                value={formData.check_in_time}
                onChange={onChange}
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
                min={minCheckOut}
                value={formData.check_out_time}
                onChange={onChange}
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
              <Select
                name="status"
                value={formData.status || undefined}
                onValueChange={(val) =>
                  onChange({ target: { name: "status", value: val } })
                }
              >
                <SelectTrigger className="h-11 w-full rounded-xl border border-gray-300 px-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-none">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
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
              value={durationText}
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
              onClick={onSubmit}
            >
              {isEdit ? "Update Attendance" : "Create Attendance"}
            </Button>

            <Button
              variant="outline"
              className="w-1/2 h-11 rounded-xl border border-gray-300 transition-all duration-300 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm hover:scale-[1.03] active:scale-[0.98]"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
