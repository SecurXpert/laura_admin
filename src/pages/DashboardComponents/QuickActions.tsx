import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import { FiUsers, FiBookOpen } from "react-icons/fi";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 sm:mt-10 w-full">
      <div className="bg-[#FFFFFFCC] backdrop-blur-lg border border-[#EEF0F3] rounded-[20px] shadow-sm p-4 sm:p-6 w-full">
        <h2 className="text-lg sm:text-xl md:text-[24px] font-semibold text-[#111827] mb-4 sm:mb-5">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
          {/* Action 1 */}
          <div
            onClick={() => navigate("/dashboard/students")}
            className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#A855F7] to-[#EC4899] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
          >
            <FiUsers className="text-white text-lg sm:text-xl mb-1" />
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
              Add Student
            </span>
          </div>

          {/* Action 2 */}
          <div
            onClick={() => navigate("/dashboard/courses")}
            className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
          >
            <FiBookOpen className="text-white text-lg sm:text-xl mb-1" />
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
              Create Course
            </span>
          </div>

          {/* Action 3 */}
          <div
            onClick={() => navigate("/dashboard/instructors")}
            className="h-[80px] sm:h-[90px] rounded-xl sm:rounded-[18px] bg-gradient-to-r from-[#10B981] to-[#14B8A6] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 hover:opacity-95 active:scale-[0.99] shadow-sm select-none p-2 text-center"
          >
            <FaGraduationCap className="text-white text-lg sm:text-xl mb-1" />
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
              Add Instructor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
