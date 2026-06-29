import React from "react";
import { BookOpen, Users, TrendingUp, Star } from "lucide-react";

interface QuizStatsProps {
  totalQuizzes: number;
  analytics: {
    total_attempts: number;
    average_score: number;
  };
}

export const QuizStats: React.FC<QuizStatsProps> = ({ totalQuizzes, analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      
      {/* Card 1: Total Quizzes */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between min-h-[180px]">
        {/* Soft blue gradient top-right */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-400/20 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="bg-blue-50 w-12 h-12 flex items-center justify-center rounded-2xl relative z-10 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="text-[32px] leading-tight font-bold text-[#0F172A]">{totalQuizzes}</h3>
          <p className="text-[13px] text-slate-500 font-medium mb-3">Total Quizzes</p>
         
        </div>
      </div>

      {/* Card 2: Total Attempts */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between min-h-[180px]">
        {/* Soft purple gradient top-right */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-400/20 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="bg-purple-50 w-12 h-12 flex items-center justify-center rounded-2xl relative z-10 mb-4">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="text-[32px] leading-tight font-bold text-[#0F172A]">
            {analytics.total_attempts.toLocaleString()}
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mb-3">Total Attempts</p>
          
         
        </div>
      </div>

      {/* Card 3: Avg Score */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between min-h-[180px]">
        {/* Soft green gradient top-right */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="bg-emerald-50 w-12 h-12 flex items-center justify-center rounded-2xl relative z-10 mb-4">
          <TrendingUp className="w-6 h-6 text-emerald-500" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="text-[32px] leading-tight font-bold text-[#0F172A]">
            {Math.round(analytics.average_score * 100)}%
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mb-3">Avg Score</p>
          
          
        </div>
      </div>

      {/* Card 4: Active Quizzes */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-full flex flex-col justify-between min-h-[180px]">
        {/* Soft orange gradient top-right */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-300/20 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="bg-orange-50 w-12 h-12 flex items-center justify-center rounded-2xl relative z-10 mb-4">
          <Star className="w-6 h-6 text-orange-500" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="text-[32px] leading-tight font-bold text-[#0F172A]">{totalQuizzes}</h3>
          <p className="text-[13px] text-slate-500 font-medium mb-3">Active Quizzes</p>
          
          
        </div>
      </div>

    </div>
  );
};
