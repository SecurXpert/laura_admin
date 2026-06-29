import React from "react";

interface Props {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
  itemsPerPage: number;
}

export default function InstructorPagination({
  currentPage,
  setCurrentPage,
  totalItems,
  itemsPerPage,
}: Props) {
  if (totalItems === 0) return null;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
      <div className="text-[13px] font-medium text-[#6B7280]">
        Showing {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
        >
          Previous
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNumber = i + 1;
          if (
            pageNumber === 1 ||
            pageNumber === totalPages ||
            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNumber}
                onClick={() => setCurrentPage(pageNumber)}
                className={`w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold transition-all ${
                  currentPage === pageNumber
                    ? "bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent"
                    : "bg-white text-[#374151] border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {pageNumber}
              </button>
            );
          }

          if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
            return (
              <span key={pageNumber} className="text-gray-400 font-bold px-1">
                ...
              </span>
            );
          }

          return null;
        })}

        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalItems === 0}
          className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
        >
          Next
        </button>
      </div>
    </div>
  );
}
