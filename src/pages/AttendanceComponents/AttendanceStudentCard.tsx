import React from "react";
import { Eye } from "lucide-react";

interface AttendanceStudentCardProps {
  student: { student_id: number; student_name: string };
  onViewDetails: () => void;
}

export const AttendanceStudentCard: React.FC<AttendanceStudentCardProps> = ({
  student,
  onViewDetails,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-md transition bg-white gap-4">
      {/* LEFT */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Avatar with dynamic color */}
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center 
           text-white font-semibold flex-shrink-0
           bg-gradient-to-r from-[#615FFF] to-[#AD46FF]"
        >
          {student.student_name?.charAt(0)?.toUpperCase()}
        </div>

        {/* Name + ID */}
        <div>
          <p
            className="font-bold text-[#101828]"
            style={{
              fontFamily: "Inter",
              fontSize: "25px",
              lineHeight: "45.3px",
              letterSpacing: "-0.74px",
            }}
          >
            {student.student_name}
          </p>
          <p
            className="text-gray-500"
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "33.55px",
              letterSpacing: "-0.25px",
            }}
          >
            Student id: {student.student_id}
          </p>
        </div>
      </div>

      {/* RIGHT BUTTON (FILLED) */}
      <button
        onClick={onViewDetails}
        className="flex items-center justify-center gap-2 
           text-white 
           bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
           hover:from-[#514EF0] hover:to-[#9333EA]
           transition shadow-sm"
        style={{
          width: "234px",
          height: "49px",
          borderRadius: "13.49px",
        }}
      >
        <Eye className="w-5 h-5" />
        View Details
      </button>
    </div>
  );
};
