import React from "react";

interface SubAdminsPaginationProps {
  currentPage: number;
  totalFiltered: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const SubAdminsPagination: React.FC<SubAdminsPaginationProps> = ({
  currentPage,
  totalFiltered,
  itemsPerPage,
  onPageChange,
}) => {
  if (totalFiltered === 0) return null;

  const totalPages = Math.ceil(totalFiltered / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between py-5 mt-4 border-t border-gray-100 gap-6 w-full">
      <div className="text-[13px] font-medium text-[#6B7280]">
        Showing {(currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, totalFiltered)} of {totalFiltered}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
        >
          Previous
        </button>

        <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
          {currentPage}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
        >
          Next
        </button>
      </div>
    </div>
  );
};
