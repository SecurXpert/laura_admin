import React from "react";

interface AttendanceAddInfoCardsProps {
  formData: any;
  formatIST: (timeStr: string) => string;
  durationText: string;
}

export const AttendanceAddInfoCards: React.FC<AttendanceAddInfoCardsProps> = ({
  formData,
  formatIST,
  durationText,
}) => {
  return (
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
                {formData.date
                  ? new Date(formData.date).toLocaleDateString()
                  : "Not selected"}
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
                {durationText || "Calculating..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
