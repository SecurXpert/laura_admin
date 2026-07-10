import React from "react";
import { BookOpen, UserPlus } from "lucide-react";

interface CourseStatsProps {
  totalCourses: number;
  activeCourses: number;
  studentCount: number;
}

const CourseStats: React.FC<CourseStatsProps> = ({
  totalCourses,
  activeCourses,
  studentCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 w-full">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total Courses</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
          {totalCourses}
        </h2>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Active Courses</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
          {activeCourses}
        </h2>
      </div>

      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0 w-full sm:col-span-2 lg:col-span-1">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#5A5CE6] to-[#7A5CF0] text-white mb-3 sm:mb-4 shadow-sm">
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">Total Students</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 truncate">
          {studentCount}
        </h2>
      </div>
    </div>
  );
};

export default CourseStats;
