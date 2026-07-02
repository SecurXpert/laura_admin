import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FiMail } from "react-icons/fi";

export interface SubAdmin {
  id: number;
  name: string;
  email: string;
}

interface SubAdminsCardGridProps {
  listLoading: boolean;
  subAdminsSlice: SubAdmin[];
}

export const SubAdminsCardGrid: React.FC<SubAdminsCardGridProps> = ({
  listLoading,
  subAdminsSlice,
}) => {
  if (listLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4 w-full">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
      {subAdminsSlice.length === 0 ? (
        <p className="text-gray-400">No sub-admins found</p>
      ) : (
        subAdminsSlice.map((admin) => (
          <div
            key={admin.id}
            className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* TOP SECTION */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                {/* AVATAR */}
                <div className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] rounded-full text-white flex items-center justify-center font-bold text-[15px] sm:text-[16px] bg-[#8b5cf6] shadow-sm shrink-0">
                  {admin.name
                    ?.split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>

                {/* NAME + EMAIL */}
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-[16px] sm:text-[17px] font-bold text-[#1F2937] truncate">
                    {admin.name}
                  </p>

                  <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-gray-500 mt-1">
                    <FiMail className="text-gray-400 text-[12px] sm:text-sm shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM PILL */}
            <div className="mt-5 sm:mt-6">
              <div className="w-full py-2 sm:py-2.5 px-4 sm:px-5 text-[13px] sm:text-[14px] font-semibold text-white rounded-full bg-[#8b5cf6] shadow-sm text-left truncate">
                Subadmin Id : {admin.id}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
