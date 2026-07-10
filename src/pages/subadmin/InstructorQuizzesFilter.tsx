import React from "react";
import { FiBookOpen, FiUser, FiCalendar } from "react-icons/fi";
import { BsCheckCircle } from "react-icons/bs";
import ScrollableDropdown from "@/components/subadmin/ScrollableDropdown";

interface InstructorQuizzesFilterProps {
  selectedCourse: string;
  setSelectedCourse: (val: string) => void;
  selectedInstructor: string;
  setSelectedInstructor: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  uniqueCourses: number[];
  uniqueInstructors: string[];
  applyFilters: () => void;
  resetFilters: () => void;
  getCourseName: (id: number) => string;
}

const InstructorQuizzesFilter: React.FC<InstructorQuizzesFilterProps> = ({
  selectedCourse,
  setSelectedCourse,
  selectedInstructor,
  setSelectedInstructor,
  selectedStatus,
  setSelectedStatus,
  selectedDate,
  setSelectedDate,
  uniqueCourses,
  uniqueInstructors,
  applyFilters,
  resetFilters,
  getCourseName,
}) => {
  return (
    <div className="w-full bg-white border border-[#ECECF2] rounded-[24px] p-4 sm:p-5 lg:p-6 mb-8 overflow-visible box-border max-w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full box-border">

        {/* COURSES */}
        <div className="relative w-full box-border">
          <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          <ScrollableDropdown
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            options={[
              { value: "", label: "All Courses" },
              ...uniqueCourses.map((course) => ({ value: String(course), label: getCourseName(course) }))
            ]}
            placeholder="All Courses"
            buttonClassName="!h-[52px] !rounded-[16px] !border-[#E5E7EB] !bg-gray-50 !pl-11 text-[15px]"
          />
        </div>

        {/* INSTRUCTORS */}
        <div className="relative w-full box-border">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          <ScrollableDropdown
            value={selectedInstructor}
            onChange={(e) => setSelectedInstructor(e.target.value)}
            options={[
              { value: "", label: "All Instructors" },
              ...uniqueInstructors.map((instructor) => ({ value: instructor, label: instructor }))
            ]}
            placeholder="All Instructors"
            buttonClassName="!h-[52px] !rounded-[16px] !border-[#E5E7EB] !bg-gray-50 !pl-11 text-[15px]"
          />
        </div>

        {/* STATUS */}
        <div className="relative w-full box-border">
          <BsCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
          <ScrollableDropdown
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: "", label: "All Status" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending" }
            ]}
            placeholder="All Status"
            buttonClassName="!h-[52px] !rounded-[16px] !border-[#E5E7EB] !bg-gray-50 !pl-11 text-[15px]"
          />
        </div>

        {/* DATE */}
        <div className="relative w-full box-border">
          <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => {
              const today = new Date().toISOString().split("T")[0];
              const val = e.target.value > today ? today : e.target.value;
              setSelectedDate(val);
            }}
            className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-4 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 w-full box-border">
          <button
            onClick={resetFilters}
            className="text-[#6B7280] text-[15px] font-medium hover:text-black transition"
          >
            Reset
          </button>
          <button
            onClick={applyFilters}
            className="h-[52px] px-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[15px] font-semibold shadow-[0_8px_18px_rgba(124,58,237,0.25)] hover:scale-[1.02] transition-all whitespace-nowrap"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorQuizzesFilter;
