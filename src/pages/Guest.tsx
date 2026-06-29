import React, { useState } from "react";
import { CalendarCheck, Trophy, Target } from "lucide-react";

import GuestDashboardAttendance from "./GuestTabs/GuestDashboardAttendance";
import GuestDashboardResults from "./GuestTabs/GuestDashboardResults";
import GuestDashboardQuizzes from "./GuestTabs/GuestDashboardQuizzes";

export default function GuestDashboard() {
  const [activeTab, setActiveTab] = useState<"attendance" | "results" | "quizzes">("attendance");

  return (
    <div className="w-full space-y-6 pb-8">
      {/* 🔹 Tabs Section */}
      <div className="w-full mb-6">
        <div className="px-4 md:px-6 pt-4 border-b border-gray-200">
          <div className="flex items-center gap-8 text-sm">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`relative flex items-center gap-2 pb-3 ${
                activeTab === "attendance" ? "text-[#7c3aed] font-medium" : "text-gray-600"
              }`}
            >
              <CalendarCheck className="h-4 w-4" />
              Attendance
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`relative flex items-center gap-2 pb-3 ${
                activeTab === "results" ? "text-[#7c3aed] font-medium" : "text-gray-600"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Results
            </button>

            <button
              onClick={() => setActiveTab("quizzes")}
              className={`relative flex items-center gap-2 pb-3 ${
                activeTab === "quizzes" ? "text-[#7c3aed] font-medium" : "text-gray-600"
              }`}
            >
              <Target className="h-4 w-4" />
              Quiz Listing
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 CONTENT SECTION */}
      <div className="w-full">
        {activeTab === "attendance" && <GuestDashboardAttendance />}
        {activeTab === "results" && <GuestDashboardResults />}
        {activeTab === "quizzes" && <GuestDashboardQuizzes />}
      </div>
    </div>
  );
}
