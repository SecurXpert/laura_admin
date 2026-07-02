import React from "react";
import {
  Users,
  BookOpen,
  GraduationCap as LucideGraduationCap,
  TrendingUp,
} from "lucide-react";
import { DashboardSummary } from "./types";

const LineGraph: React.FC = () => (
  <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
    <svg
      viewBox="0 0 160 50"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="
            M0 22
            C15 30, 30 34, 45 18
            C60 2, 75 8, 90 30
            C105 50, 120 6, 135 10
            C145 14, 152 28, 160 24
            L160 50
            L0 50
            Z
          "
        fill="url(#purpleArea)"
      />

      <path
        d="
            M0 22
            C15 30, 30 34, 45 18
            C60 2, 75 8, 90 30
            C105 50, 120 6, 135 10
            C145 14, 152 28, 160 24
          "
        fill="none"
        stroke="#5B5CF0"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const BlueLineGraph: React.FC = () => (
  <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
    <svg
      viewBox="0 0 160 50"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="blueArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="
            M0 24
            C18 30, 35 34, 52 18
            C65 6, 78 8, 92 28
            C108 48, 122 6, 138 10
            C148 14, 154 24, 160 20
            L160 50
            L0 50
            Z
          "
        fill="url(#blueArea)"
      />

      <path
        d="
            M0 24
            C18 30, 35 34, 52 18
            C65 6, 78 8, 92 28
            C108 48, 122 6, 138 10
            C148 14, 154 24, 160 20
          "
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const GreenLineGraph: React.FC = () => (
  <div className="h-[48px] sm:h-[56px] mt-2 sm:mt-3 overflow-hidden w-full">
    <svg
      viewBox="0 0 160 50"
      preserveAspectRatio="none"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="greenArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="
            M0 12
            C18 34, 36 40, 52 10
            C66 -4, 82 18, 95 32
            C108 46, 124 8, 138 12
            C148 16, 154 24, 160 20
            L160 50
            L0 50
            Z
          "
        fill="url(#greenArea)"
      />

      <path
        d="
            M0 12
            C18 34, 36 40, 52 10
            C66 -4, 82 18, 95 32
            C108 46, 124 8, 138 12
            C148 16, 154 24, 160 20
          "
        fill="none"
        stroke="#10B981"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  </div>
);

const BarGraph: React.FC = () => (
  <div className="h-[48px] sm:h-[56px] flex items-end gap-[3px] mt-2 sm:mt-3 w-full px-0.5">
    {[42, 26, 52, 22, 44, 24, 34].map((h, i) => (
      <div
        key={i}
        className="flex-1 rounded-t-[6px] bg-[#A855F7] transition-all duration-300 hover:bg-[#B14CFA]"
        style={{ height: `${(h / 52) * 100}%` }}
      />
    ))}
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  additionalInfo?: string;
  GraphComponent?: React.FC;
}> = ({ title, value, icon, additionalInfo, GraphComponent }) => (
  <div
    className="
        bg-white
        rounded-[24px]
        p-5
        shadow-[0_8px_30px_rgba(0,0,0,0.03)]
        border border-[#ECEEF2]/60
        min-h-[160px] sm:min-h-[175px]
        flex
        flex-col
        justify-between
        transition-all
        duration-300
        hover:translate-y-[-2px]
        w-full
        min-w-0
      "
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-[13px] text-[#6B7280] font-medium truncate">
          {title}
        </p>

        <h2 className="text-3xl sm:text-[36px] font-bold text-[#111827] mt-1 tracking-tight truncate">
          {value}
        </h2>

        {additionalInfo && (
          <p className="text-xs sm:text-[13px] text-[#10B981] font-medium mt-1 truncate">
            {additionalInfo}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">{icon}</div>
    </div>

    {GraphComponent && <GraphComponent />}
  </div>
);

interface StatCardsGridProps {
  summary: DashboardSummary | null;
}

const StatCardsGrid: React.FC<StatCardsGridProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
      <StatCard
        title="Total Students"
        value={summary?.students ?? 0}
        // additionalInfo="+12% this month"
        icon={
          <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-[0_8px_20px_rgba(168,85,247,0.3)]">
            <Users className="w-5 h-5 text-white" />
          </div>
        }
        GraphComponent={LineGraph}
      />

      <StatCard
        title="Active Courses"
        value={summary?.courses ?? 0}
        // additionalInfo="+8 new courses"
        icon={
          <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center shadow-[0_8px_20px_rgba(236,72,153,0.3)]">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
        }
        GraphComponent={BarGraph}
      />

      <StatCard
        title="Instructors"
        value={summary?.instructors ?? 0}
        // additionalInfo="Active now"
        icon={
          <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.3)]">
            <LucideGraduationCap className="w-5 h-5 text-white" />
          </div>
        }
        GraphComponent={BlueLineGraph}
      />

      <StatCard
        title="Total Quizzes"
        value={summary?.quizzes ?? 0}
        // additionalInfo="↑ 5% increase"
        icon={
          <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
        }
        GraphComponent={GreenLineGraph}
      />
    </div>
  );
};

export default StatCardsGrid;
