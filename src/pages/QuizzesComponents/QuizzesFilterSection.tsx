import React from "react";
import { FiBookOpen, FiUser, FiCalendar } from "react-icons/fi";
import { BsCheckCircle } from "react-icons/bs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizzesFilterSectionProps {
  selectedCourse: string;
  onCourseChange: (val: string) => void;
  uniqueCourses: number[];
  getCourseName: (id: number) => string;
  selectedInstructor: string;
  onInstructorChange: (val: string) => void;
  uniqueInstructors: string[];
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedDate: string;
  onDateChange: (val: string) => void;
  onReset: () => void;
  onApply: () => void;
}

export const QuizzesFilterSection: React.FC<QuizzesFilterSectionProps> = ({
  selectedCourse,
  onCourseChange,
  uniqueCourses,
  getCourseName,
  selectedInstructor,
  onInstructorChange,
  uniqueInstructors,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
  onReset,
  onApply,
}) => {
  return (
    <div className="w-full bg-white border border-[#ECECF2] rounded-[24px] p-4 sm:p-5 lg:p-6 mb-8 overflow-hidden box-border max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full box-border">
        {/* COURSES */}
        <div className="relative w-full box-border">
          <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <Select
            value={selectedCourse || "all"}
            onValueChange={(val) => onCourseChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border transition-all shadow-none">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course} value={String(course)}>
                  {getCourseName(course as number)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* INSTRUCTORS */}
        <div className="relative w-full box-border">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <Select
            value={selectedInstructor || "all"}
            onValueChange={(val) =>
              onInstructorChange(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border transition-all shadow-none">
              <SelectValue placeholder="All Instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instructor</SelectItem>
              {uniqueInstructors.map((instructor) => (
                <SelectItem key={instructor} value={instructor}>
                  {instructor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* STATUS */}
        <div className="relative w-full box-border">
          <BsCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
          <Select
            value={selectedStatus || "all"}
            onValueChange={(val) => onStatusChange(val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border transition-all shadow-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DATE */}
        <div className="relative w-full box-border">
          <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-4 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 w-full box-border">
          <button
            onClick={onReset}
            className="text-[#6B7280] text-[15px] font-medium hover:text-black transition"
          >
            Reset
          </button>

          <button
            onClick={onApply}
            className="h-[52px] px-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[15px] font-semibold shadow-[0_8px_18px_rgba(124,58,237,0.25)] hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};
