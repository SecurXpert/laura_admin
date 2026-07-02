import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Instructor } from "./types";

interface Props {
  loading: boolean;
  instructors: Instructor[];
  onDelete: (inst: Instructor) => void;
}

export default function InstructorCardList({ loading, instructors, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
      {(!loading && instructors.length === 0) && (
        <div className="col-span-full text-center py-12 text-gray-400 text-xs sm:text-sm font-medium w-full">
          No instructors found matching your criteria
        </div>
      )}

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="min-h-[200px] sm:min-h-[210px] w-full rounded-[18px]" />
        ))
      ) : (
        instructors.map((inst) => (
          <div
            key={inst.id}
            className="bg-[#FFFFFFCC] rounded-[18px] p-4 sm:p-6 border border-[#ECECEC] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between min-h-[200px] sm:min-h-[210px] min-w-0 w-full"
          >
            {/* TOP SECTION */}
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 w-full min-w-0">
              {/* AVATAR */}
              <div className="relative flex-shrink-0 self-start">
                {inst.profile_picture ? (
                  <img
                    src={inst.profile_picture}
                    alt={inst.name}
                    className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-full object-cover shadow-md border-[2px] sm:border-[3px] border-white"
                  />
                ) : (
                  <div className="w-[48px] h-[48px] sm:w-[58px] sm:h-[58px] rounded-full bg-gradient-to-br from-[#6A5BFF] to-[#8F4DFF] flex items-center justify-center text-white font-semibold text-xl sm:text-2xl leading-none uppercase shadow-md border-[2px] sm:border-[3px] border-white">
                    {inst.name
                      ?.split(" ")
                      ?.slice(0, 2)
                      ?.map((n) => n[0])
                      ?.join("")
                      ?.toUpperCase()}
                  </div>
                )}
                {/* ONLINE DOT */}
                <div className="absolute bottom-[2px] right-[2px] w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full bg-[#00D26A] border-2 border-white" />
              </div>

              {/* CONTENT */}
              <div className="flex-1 min-w-0 w-full">
                {/* NAME + RATING */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2
                    title={inst.name}
                    className="text-[20px] sm:text-[22px] font-[700] text-[#1F2937] leading-tight break-words"
                  >
                    {inst.name}
                  </h2>
                 
                </div>

                {/* EMAIL */}
                {inst.email && (
                  <div className="text-[13px] sm:text-[14px] font-medium text-[#6366F1] mt-0.5 break-all">
                    {inst.email}
                  </div>
                )}

                {/* FULL BIO WITHOUT TRUNCATION */}
                <div
                  className="mt-2.5 sm:mt-3 text-[15px] sm:text-[16px] text-[#4B5563] leading-relaxed break-words whitespace-pre-wrap"
                >
                  {inst.bio || "No bio available"}
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS PRESERVING ORIGINAL FONT AND HEIGHT TARGETS */}
            <div className="flex gap-3 sm:gap-4 mt-5 pt-4 border-t border-[#F0F0F0] w-full mt-auto">
              {/* EDIT BUTTON */}
              <Button
                onClick={() =>
                  navigate(`edit/${inst.id}`, {
                    state: { instructor: inst },
                  })
                }
                className="flex-1 h-[38px] sm:h-[42px] rounded-[10px] bg-gradient-to-r from-[#3D63FB] to-[#884CFF] text-white font-medium text-[14px] flex items-center justify-center gap-1.5 sm:gap-2 hover:opacity-95 shadow-none"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Edit</span>
              </Button>

              {/* DELETE BUTTON */}
              <Button
                onClick={() => onDelete(inst)}
                className="flex-1 h-[38px] sm:h-[42px] rounded-[10px] bg-[#FE3F46] hover:bg-[#e0353c] text-white font-medium text-[14px] flex items-center justify-center gap-1.5 sm:gap-2 shadow-none"
              >
                <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
