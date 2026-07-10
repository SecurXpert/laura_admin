import React, { useState } from "react";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

export const getUniqueCourses = (courses?: any[], fallbackCourse?: string): string[] => {
  const seen = new Set<string>();
  const uniqueCourses: string[] = [];

  const processCourse = (c: any) => {
    if (typeof c === 'string') {
      const trimmed = c.trim();
      if (trimmed) {
        const formatted = trimmed
          .split(/\s+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');

        const lower = formatted.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          uniqueCourses.push(formatted);
        }
      }
    }
  };

  if (courses && Array.isArray(courses)) {
    courses.forEach(processCourse);
  }

  if (uniqueCourses.length === 0 && fallbackCourse) {
    processCourse(fallbackCourse);
  }

  return uniqueCourses;
};

interface DashboardCoursesListProps {
  allCourses: string[];
}

const DashboardCoursesList: React.FC<DashboardCoursesListProps> = ({ allCourses }) => {
  const [expanded, setExpanded] = useState(false);

  if (allCourses.length === 0) return <span className="text-gray-400 text-xs italic">N/A</span>;

  const visibleCourses = expanded ? allCourses : allCourses.slice(0, 3);
  const extraCount = allCourses.length - 3;

  return (
    <>
      {visibleCourses.map((course, idx) => (
        <span
          key={idx}
          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 text-sm font-semibold whitespace-nowrap"
        >
          {course}
        </span>
      ))}
      {!expanded && extraCount > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-sm font-semibold whitespace-nowrap hover:bg-slate-100 transition-colors focus:outline-none"
        >
          +{extraCount} more
        </button>
      )}
      {expanded && extraCount > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-sm font-semibold whitespace-nowrap hover:bg-slate-100 transition-colors focus:outline-none"
        >
          Show less
        </button>
      )}
    </>
  );
};

export default DashboardCoursesList;

