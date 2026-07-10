import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseDetailsSectionProps {
  formData: any;
  errors: Record<string, string>;
  isEdit: boolean;
  categories: { id: number; name: string }[];
  displayInstructors: { id: number; name: string }[];
  resolvedInstructorName: string;
  onChange: (e: any) => void;
  onInstructorChange: (val: string) => void;
}

export const CourseDetailsSection: React.FC<CourseDetailsSectionProps> = ({
  formData,
  errors,
  isEdit,
  categories,
  displayInstructors,
  resolvedInstructorName,
  onChange,
  onInstructorChange,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
      <h2 className="text-xs sm:text-[15px] font-bold text-[#111827] mb-4 sm:mb-5 tracking-tight uppercase sm:normal-case">
        Course Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
        {/* CATEGORY SELECTOR */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Category <span className="text-red-500">*</span>
          </label>

          <Select
            name="category_id"
            value={formData.category_id || undefined}
            onValueChange={(val) =>
              onChange({ target: { name: "category_id", value: val } })
            }
            disabled={isEdit}
          >
            <SelectTrigger
              className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
                errors.category_id
                  ? "border-red-500 bg-red-50/30"
                  : "border-gray-200"
              } text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] ${
                isEdit
                  ? "bg-gray-100 cursor-not-allowed opacity-70"
                  : "bg-white"
              } transition-all shadow-sm truncate`}
            >
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_id && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.category_id}
            </span>
          )}
        </div>

        {/* LEVEL SELECTOR */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Level <span className="text-red-500">*</span>
          </label>

          <Select
            name="level"
            value={formData.level || undefined}
            onValueChange={(val) =>
              onChange({ target: { name: "level", value: val } })
            }
          >
            <SelectTrigger
              className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
                errors.level ? "border-red-500 bg-red-50/30" : "border-gray-200"
              } text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] bg-white transition-all shadow-sm truncate`}
            >
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.level}
            </span>
          )}
        </div>

        {/* LANGUAGE INPUT */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Language <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="language"
            value={formData.language}
            onChange={onChange}
            placeholder="Enter course language"
            className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
              errors.language
                ? "border-red-500 bg-red-50/30"
                : "border-gray-200"
            } outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] text-xs sm:text-sm transition-all shadow-sm`}
          />
          {errors.language && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.language}
            </span>
          )}
        </div>

        {/* SCHEDULE INPUT */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Start Date <span className="text-red-500">*</span>
          </label>

          <input
            type="date"
            name="schedule"
            value={formData.schedule}
            onChange={onChange}
            min={!isEdit ? new Date().toISOString().split("T")[0] : undefined}
            className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
              errors.schedule
                ? "border-red-500 bg-red-50/30"
                : "border-gray-200"
            } outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] text-xs sm:text-sm cursor-pointer transition-all shadow-sm`}
          />
          {errors.schedule && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.schedule}
            </span>
          )}
        </div>

        {/* DURATION INPUT */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Duration <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={onChange}
            placeholder="Enter course duration (days)"
            maxLength={8}
            className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
              errors.duration
                ? "border-red-500 bg-red-50/30"
                : "border-gray-200"
            } outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] text-xs sm:text-sm transition-all shadow-sm`}
          />
          {errors.duration && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.duration}
            </span>
          )}
        </div>

        {/* INSTRUCTOR SELECTOR / READ-ONLY DISPLAY */}
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Instructor <span className="text-red-500">*</span>
          </label>

          {isEdit ? (
            <div className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-200 bg-gray-100/80 flex items-center justify-between text-xs sm:text-sm text-gray-800 shadow-sm font-semibold select-none">
              <span className="truncate">
                {resolvedInstructorName || "Not Assigned"}
              </span>
            </div>
          ) : (
            <Select
              name="instructor_id"
              value={formData.instructor_id || undefined}
              onValueChange={onInstructorChange}
            >
              <SelectTrigger
                className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
                  errors.instructor_id
                    ? "border-red-500 bg-red-50/30"
                    : "border-gray-200"
                } text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] bg-white transition-all shadow-sm truncate`}
              >
                <SelectValue placeholder="Select Instructor" />
              </SelectTrigger>
              <SelectContent>
                {displayInstructors.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id.toString()}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {!isEdit && errors.instructor_id && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.instructor_id}
            </span>
          )}
        </div>

        {/* STATUS SELECTOR */}
        <div className="md:col-span-2 w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Status <span className="text-red-500">*</span>
          </label>

          <Select
            name="status"
            value={formData.status || undefined}
            onValueChange={(val) =>
              onChange({ target: { name: "status", value: val } })
            }
          >
            <SelectTrigger
              className={`w-full sm:w-1/2 h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${
                errors.status
                  ? "border-red-500 bg-red-50/30"
                  : "border-gray-200"
              } text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] bg-white transition-all shadow-sm truncate`}
            >
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">
              {errors.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
