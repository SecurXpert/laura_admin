import React from "react";
import { Upload } from "lucide-react";

interface CourseImageUploadProps {
  formData: {
    image: File | null;
  };
  handleFileChange: (e: any) => void;
  errors: Record<string, string>;
}

const CourseImageUpload: React.FC<CourseImageUploadProps> = ({
  formData,
  handleFileChange,
  errors,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm w-full">
      <h2 className="text-xs sm:text-[15px] font-bold text-[#111827] mb-4 sm:mb-5 tracking-tight uppercase sm:normal-case">
        Course Image <span className="text-red-500">*</span>
      </h2>

      <div className={`border-2 border-dashed rounded-2xl min-h-[180px] sm:h-[210px] flex flex-col items-center justify-center transition-all p-4 text-center w-full ${errors.image
        ? "border-red-500 bg-red-50/10 hover:border-red-500/80"
        : "border-gray-200 hover:border-[#5D3EFC]/50 bg-gray-50/30"
        }`}>
        <input
          type="file"
          name="image"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="image-upload"
        />

        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center w-full h-full select-none"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-50 border border-indigo-100/80 flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0 transition-transform hover:scale-105 shadow-sm">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-[#5D3EFC]" />
          </div>

          <p className="text-xs sm:text-sm text-gray-800 font-bold break-all px-2 line-clamp-2 w-full">
            {formData.image ? `Selected: ${formData.image.name}` : "Drag and drop or click to browse image"}
          </p>

          <p className="text-[11px] sm:text-xs text-gray-400 mt-1 sm:mt-1.5 font-medium">
            PNG, JPG or WEBP (max. 5MB)
          </p>
        </label>
      </div>
      {errors.image && (
        <span className="text-[11px] sm:text-xs text-red-500 mt-2 block font-medium">
          {errors.image}
        </span>
      )}
    </div>
  );
};

export default CourseImageUpload;
