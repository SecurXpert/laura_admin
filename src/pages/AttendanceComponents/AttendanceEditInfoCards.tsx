import React from "react";
import { Info, AlertCircle, CheckCircle2 } from "lucide-react";

interface AttendanceEditInfoCardsProps {
  formData: any;
  students: any[];
  courses: any[];
  formatIST: (timeStr: string) => string;
}

export const AttendanceEditInfoCards: React.FC<AttendanceEditInfoCardsProps> = ({
  formData,
  students,
  courses,
  formatIST,
}) => {
  return (
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
            <span className="text-xs text-gray-500 font-medium">
              Last Updated:
            </span>
            <span className="text-xs font-bold text-gray-900">
              {formData.date ? `${formData.date} ` : ""}
              {formatIST(formData.check_in_time)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Updated By:
            </span>
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
            <span className="block text-[11px] text-gray-400 font-medium mb-1">
              Student
            </span>
            <span className="text-xs font-bold text-gray-900">
              {formData.student_id
                ? students.find(
                    (s) =>
                      (s.id || s.student_id || s.user_id)?.toString() ===
                      formData.student_id.toString()
                  )?.name || `Student ID: ${formData.student_id}`
                : "Not entered"}
            </span>
          </div>

          {/* Course */}
          <div className="bg-[#f9fafb] p-3 rounded-xl">
            <span className="block text-[11px] text-gray-400 font-medium mb-1">
              Course
            </span>
            <span className="text-xs font-bold text-gray-900">
              {formData.course_id
                ? courses.find(
                    (c) => c.id?.toString() === formData.course_id.toString()
                  )?.title || `Course ID: ${formData.course_id}`
                : "Not selected"}
            </span>
          </div>

          {/* Check-in / Check-out Side-by-Side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f9fafb] p-3 rounded-xl">
              <span className="block text-[11px] text-gray-400 font-medium mb-1">
                Check-in
              </span>
              <span className="text-xs font-bold text-gray-900">
                {formData.check_in_time
                  ? formatIST(formData.check_in_time)
                  : "--:--"}
              </span>
            </div>

            <div className="bg-[#f9fafb] p-3 rounded-xl">
              <span className="block text-[11px] text-gray-400 font-medium mb-1">
                Check-out
              </span>
              <span className="text-xs font-bold text-gray-900">
                {formData.check_out_time
                  ? formatIST(formData.check_out_time)
                  : "--:--"}
              </span>
            </div>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f9fafb] p-3 rounded-xl">
              <span className="block text-[11px] text-gray-400 font-medium mb-1">
                Date
              </span>
              <span className="text-xs font-bold text-gray-900">
                {formData.date
                  ? new Date(formData.date).toLocaleDateString("en-IN")
                  : "Not entered"}
              </span>
            </div>

            <div className="bg-[#f9fafb] p-3 rounded-xl">
              <span className="block text-[11px] text-gray-400 font-medium mb-1">
                Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                {formData.status || "Present"}
              </span>
            </div>
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
              <span className="text-xs text-gray-600">
                All fields are required
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">
                Date cannot be in the future
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">
                Check-out must be after check-in
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-gray-600">
                Changes are auto-saved
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
