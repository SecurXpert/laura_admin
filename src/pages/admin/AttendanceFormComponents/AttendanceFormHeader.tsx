import React from "react";
import { ArrowLeft } from "lucide-react";

interface AttendanceFormHeaderProps {
  isEdit: boolean;
  onBack: () => void;
}

export const AttendanceFormHeader: React.FC<AttendanceFormHeaderProps> = ({
  isEdit,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
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
  );
};
