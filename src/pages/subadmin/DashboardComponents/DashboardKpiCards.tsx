import React from "react";
import { Users, BookOpen, HelpCircle } from "lucide-react";

interface DashboardKpiCardsProps {
  studentCount: number;
  courseCount: number;
  quizCount: number;
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  studentCount,
  courseCount,
  quizCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {[
        {
          icon: <Users className="text-blue-600" />,
          bg: "bg-blue-100",
          trend: "↑ +12.5%",
          trendStyle: "bg-[#e0f8eb] text-[#059669]",
          value: studentCount ? studentCount.toLocaleString() : "0",
          label: "Total Students",
          stroke: "#2563eb",
          gradient: "from-blue-50"
        },
        {
          icon: <BookOpen className="text-purple-600" />,
          bg: "bg-purple-100",
          trend: "↑ +8.2%",
          trendStyle: "bg-[#e0f8eb] text-[#059669]",
          value: courseCount ? courseCount.toLocaleString() : "0",
          label: "Total Courses",
          stroke: "#7c3aed",
          gradient: "from-purple-50"
        },
        {
          icon: <HelpCircle className="text-emerald-600" />,
          bg: "bg-emerald-100",
          trend: "↑ +3",
          trendStyle: "bg-[#e0f8eb] text-[#059669]",
          value: quizCount ? quizCount.toLocaleString() : "0",
          label: "Total quizzes",
          stroke: "#059669",
          gradient: "from-emerald-50"
        }
      ].map((card, i) => (
        <div key={i} className="bg-white rounded-3xl p-5 sm:p-6 border shadow-sm hover:shadow-md transition-shadow">
          {/* TOP */}
          <div className="flex justify-between items-center mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg}`}>
              {card.icon}
            </div>
          </div>

          {/* VALUE */}
          <h2 className="text-2xl sm:text-3xl font-bold">{card.value}</h2>
          <p className="text-gray-500 text-sm">{card.label}</p>

          {/* GRAPH */}
          <div className="mt-4 h-12 relative overflow-hidden">
            {/* Soft Glow Shadow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-12 rounded-b-3xl blur-xl opacity-60"
              style={{
                background: `linear-gradient(to top, ${card.stroke}20, transparent)`
              }}
            />

            {/* Extra smooth fade layer */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t ${card.gradient} to-transparent rounded-b-3xl`}
            />

            {/* Line Graph */}
            <svg viewBox="0 0 280 60" className="w-full h-full relative z-10">
              {/* AREA FILL (soft shadow like image) */}
              <path
                d="M0 45 
       Q40 35 70 40 
       T140 35 
       T210 28 
       T280 24 
       L280 60 
       L0 60 Z"
                fill={`${card.stroke}20`}
              />

              {/* WAVE LINE */}
              <path
                d="M0 45 
       Q40 35 70 40 
       T140 35 
       T210 28 
       T280 24"
                stroke={card.stroke}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardKpiCards;
