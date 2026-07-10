import React from "react";

interface CourseBasicInfoProps {
  formData: {
    title: string;
    description: string;
  };
  handleChange: (e: any) => void;
  errors: Record<string, string>;
}

const CourseBasicInfo: React.FC<CourseBasicInfoProps> = ({
  formData,
  handleChange,
  errors,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
      <h2 className="text-xs sm:text-[15px] font-bold text-[#111827] mb-4 sm:mb-5 tracking-tight uppercase sm:normal-case">
        Basic Information
      </h2>

      <div className="space-y-4 sm:space-y-5 w-full">
        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Course Title <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter course title"
            maxLength={50}
            className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border ${errors.title ? "border-red-500 bg-red-50/30" : "border-gray-200"
              } outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] text-xs sm:text-sm transition-all shadow-sm`}
          />
          {errors.title && <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">{errors.title}</span>}
        </div>

        <div className="w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
            Description <span className="text-red-500">*</span>
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter course description"
            rows={4}
            maxLength={170}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border ${errors.description ? "border-red-500 bg-red-50/30" : "border-gray-200"
              } outline-none focus:ring-2 focus:ring-[#5D3EFC]/20 focus:border-[#5D3EFC] text-xs sm:text-sm transition-all shadow-sm resize-y`}
          />
          {errors.description && (
            <span className="text-[11px] sm:text-xs text-red-500 mt-1 block font-medium">{errors.description}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBasicInfo;
