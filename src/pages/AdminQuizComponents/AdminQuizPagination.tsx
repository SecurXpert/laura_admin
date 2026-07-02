import React from "react";

interface AdminQuizPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AdminQuizPagination: React.FC<AdminQuizPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 0) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-50 transition text-sm font-medium"
      >
        Previous
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition ${
              currentPage === i + 1
                ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-50 transition text-sm font-medium"
      >
        Next
      </button>
    </div>
  );
};
