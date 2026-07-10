import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CourseCard, { CourseItem } from "./CourseCard";

interface CourseGridProps {
  loading: boolean;
  filteredCourses: CourseItem[];
  currentPage: number;
  itemsPerPage: number;
  getCategoryName: (id: number) => string;
  getInstructorName: (id: number) => string;
  renderSchedule: (sched: string) => string;
  onDelete: (c: CourseItem) => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({
  loading,
  filteredCourses,
  currentPage,
  itemsPerPage,
  getCategoryName,
  getInstructorName,
  renderSchedule,
  onDelete,
}) => {
  return (
    <div className="w-full">
      {(!loading && filteredCourses.length === 0) && (
        <div className="text-center py-12 text-gray-400 text-xs sm:text-sm font-medium w-full">
          No courses found matching your filter criteria
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[380px] w-full rounded-2xl" />
          ))
        ) : (
          filteredCourses
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                getCategoryName={getCategoryName}
                getInstructorName={getInstructorName}
                renderSchedule={renderSchedule}
                onDelete={onDelete}
              />
            ))
        )}
      </div>
    </div>
  );
};

export default CourseGrid;
