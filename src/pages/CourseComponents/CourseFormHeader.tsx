import React from "react";
import { ArrowLeft } from "lucide-react";

interface CourseFormHeaderProps {
  isEdit: boolean;
  id?: string;
  onBack: () => void;
}

export const CourseFormHeader: React.FC<CourseFormHeaderProps> = ({
  isEdit,
  id,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-2 sm:mb-4 w-full">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 sm:mt-1 hover:bg-gray-50 transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] leading-tight truncate">
            {isEdit ? `Edit Course #${id}` : "Add New Course"}
          </h1>

          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5 sm:mt-1 break-words">
            {isEdit
              ? `Update and configure course details for ID: ${id}`
              : "Create and configure a new course record"}
          </p>
        </div>
      </div>
    </div>
  );
};
