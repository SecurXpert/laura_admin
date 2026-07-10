import React from "react";

interface CourseFormActionsProps {
  loading: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const CourseFormActions: React.FC<CourseFormActionsProps> = ({
  loading,
  isEdit,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full mt-2 sm:mt-3">
      <button
        onClick={onCancel}
        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.99]"
      >
        Cancel
      </button>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full sm:w-auto px-6 sm:px-8 py-2.5 h-11 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-opacity active:scale-[0.99]"
      >
        {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
      </button>
    </div>
  );
};
