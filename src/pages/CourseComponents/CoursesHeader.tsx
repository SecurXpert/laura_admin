import React from "react";
import { Button } from "@/components/ui/button";

interface CoursesHeaderProps {
  onAddCourse: () => void;
}

export const CoursesHeader: React.FC<CoursesHeaderProps> = ({ onAddCourse }) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
          Courses Management
        </h1>
        <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
          Manage and monitor your courses
        </p>
      </div>

      <Button
        onClick={onAddCourse}
        className="
          bg-[#3161EB] hover:bg-[#2954d6] text-white font-medium
          px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-xl
          shadow-sm transition-all active:scale-[0.99] whitespace-nowrap
        "
      >
        + Add Course
      </Button>
    </div>
  );
};
