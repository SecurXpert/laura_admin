import React from 'react';
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
      {/* Total Quizzes */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-gray-50/50 shadow-sm border">
        <BookOpen className="w-8 h-8 text-blue-500 mb-4" />
        <h2 className="text-3xl font-bold">{totalQuizzes}</h2>
        <p className="text-muted-foreground">Total Quizzes</p>
        
      </div>

      {/* Attempts */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-gray-50/50 shadow-sm border">
        <Users className="w-8 h-8 text-purple-500 mb-4" />
        <h2 className="text-3xl font-bold">{analytics.total_attempts}</h2>
        <p className="text-muted-foreground">Total Attempts</p>
       
      </div>

      {/* Avg Score */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-gray-50/50 shadow-sm border">
        <TrendingUp className="w-8 h-8 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold">
          {analytics.average_score > 1 ? Math.round(analytics.average_score) : Math.round(analytics.average_score * 100)}%
        </h2>
        <p className="text-muted-foreground">Avg Score</p>
       
      </div>

      {/* Active */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-gray-50/50 shadow-sm border">
        <Star className="w-8 h-8 text-orange-500 mb-4" />
        <h2 className="text-3xl font-bold">{totalQuizzes}</h2>
        <p className="text-muted-foreground">Active Quizzes</p>
       
      </div>
    </div>
  );
};
