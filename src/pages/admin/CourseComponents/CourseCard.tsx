import React from "react";
import {
  Pencil,
  Trash2,
  Calendar,
  Users,
  BarChart,
  Globe,
  Clock,
  Layers,
} from "lucide-react";

interface CourseCardProps {
  course: any;
  instructorName: string;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course: c,
  instructorName,
  categoryName,
  onEdit,
  onDelete,
}) => {
  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const renderSchedule = (sched: string) => {
    if (!sched) return "Jan 25-Jun 25";
    if (sched.includes("-") && !sched.includes("T")) return sched;
    try {
      const d = new Date(sched);
      if (isNaN(d.getTime())) return sched;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return sched;
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all duration-200 min-w-0 w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-sm">
      {/* IMAGE COVER WITH FLOATING WHITE STATUS PILL MATCHING SCREENSHOT */}
      <div className="relative w-full h-40 bg-gray-100 flex-shrink-0">
        {c.image ? (
          <img
            src={c.image}
            alt={c.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg tracking-wider bg-gradient-to-br from-gray-50 to-gray-100">
            {getInitials(c.title)}
          </div>
        )}

        <span className="absolute top-3 right-3 px-3.5 py-1 text-xs font-bold capitalize rounded-full bg-white text-[#10B981] shadow-md tracking-wide">
          {c.status || "Active"}
        </span>
      </div>

      {/* CARD BODY CONFIGURATION */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 min-w-0 w-full">
        <div className="w-full min-w-0">
          <h2
            title={c.title}
            className="text-[16px] font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5rem] break-all"
          >
            {c.title}
          </h2>

          <p
            title={c.description}
            className="text-[14px] text-gray-500 mt-1 line-clamp-2 min-h-[2rem] break-all"
          >
            {c.description ||
              "Master modern React patterns with TypeScript and build scalable applications"}
          </p>
        </div>

        {/* 2-COLUMN LABELED ICON GRID PRECISELY REPLICATING SCREENSHOT */}
        <div
          className="grid grid-cols-2 gap-x-3 gap-y-4 mt-4 pt-4 w-full min-w-0"
          style={{ borderTop: "1.4px solid #F3F4F6" }}
        >
          {/* SCHEDULE */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Calendar className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Start date
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
              {renderSchedule(c.schedule)}
            </p>
          </div>

          {/* INSTRUCTOR NAME */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Users className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Instructor Name
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
              {instructorName}
            </p>
          </div>

          {/* LEVEL */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <BarChart className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Level
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words capitalize">
              {c.level || "Easy"}
            </p>
          </div>

          {/* LANGUAGE */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Globe className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Language
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
              {c.language || "selenium java"}
            </p>
          </div>

          {/* DURATION */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Clock className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Duration
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
              {typeof c.duration === "number"
                ? `${c.duration} days`
                : c.duration || "30 days"}
            </p>
          </div>

          {/* CATEGORY */}
          <div className="flex flex-col min-w-0 mt-0.5">
            <div className="flex items-center gap-1.5 text-gray-500 mb-0.5">
              <Layers className="w-4 h-4 flex-shrink-0 stroke-[1.75]" />
              <span className="text-[13px] sm:text-[14px] font-medium tracking-tight">
                Category
              </span>
            </div>
            <p className="text-[14px] sm:text-[15px] font-bold text-gray-900 break-words">
              {categoryName}
            </p>
          </div>
        </div>

        {/* BOTTOM BUTTON BAR PRECISELY MATCHING SCREENSHOT */}
        <div
          className="flex flex-wrap gap-2.5 sm:gap-3 mt-6 pt-4 w-full mt-auto"
          style={{ borderTop: "1.4px solid #F3F4F6" }}
        >
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#6366F1] hover:bg-[#5a5ce6] text-white rounded-xl py-2.5 text-xs font-bold shadow-sm transition-colors active:scale-[0.99]"
          >
            <Pencil className="w-3.5 h-3.5 stroke-[2]" />
            <span>Edit Course</span>
          </button>

          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FF4747] hover:bg-[#ff3333] text-white text-[13px] sm:text-sm font-medium transition-all shadow-sm active:scale-[0.98] min-w-[120px]"
          >
            <Trash2 className="w-4 h-4 stroke-2" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
