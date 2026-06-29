import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Zap, Trophy, Award, Calendar, ArrowLeft } from "lucide-react";

interface StudentStreak {
  student_id: number;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  last_attendance_date: string;
}

const ViewStreak = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student; 
  
  const [streak, setStreak] = useState<StudentStreak | null>(null);
  const [loading, setLoading] = useState(true);

  const TOKEN_STORAGE_KEY = 'access_token';
  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
  const axiosConfig = () => ({
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await api.get<StudentStreak[]>("/student-streaks/admin/all", axiosConfig());
        const myStreak = res.data?.find(s => s.student_id === Number(id));
        setStreak(myStreak || null);
      } catch (err) {
        console.error("Failed to load streak:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, [id]);

  const renderStatusBadge = (status: boolean | string | null | undefined) => {
    const isEnabled = !!status;
    if (isEnabled) {
      return (
        <span className="inline-block px-[12px] py-[4px] bg-[#E6F8ED] text-[#1E854A] text-[13px] font-semibold rounded-full whitespace-nowrap">
          Enabled
        </span>
      );
    }
    return (
      <span className="inline-block px-[12px] py-[4px] bg-[#F1F5F9] text-[#64748B] text-[13px] font-semibold rounded-full whitespace-nowrap">
        Disabled
      </span>
    );
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 p-6">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative w-full max-w-full overflow-hidden pb-4">
      
      {/* Header Section mimicking Student.tsx */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8"
                title="Back to Students"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
                Student Profile & Performance
              </h2>
            </div>
            <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium ml-11">
              Viewing detailed information and performance streaks
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] w-full p-6 sm:p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100">

        {/* Profile Info */}
        {student ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-8 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-16 sm:h-16 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl sm:text-2xl font-bold shadow-lg">
              {(student.name || student.first_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="w-full overflow-hidden">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {student.name || (student.first_name ? `${student.first_name} ${student.last_name || ''}`.trim() : 'Unknown')}
              </h4>
              <p className="text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-2 mt-1 w-full">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="truncate">{student.email}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <h4 className="text-xl font-bold text-gray-900 break-all">Student ID: {id}</h4>
          </div>
        )}

        {/* Streaks & Points Grid */}
        <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Performance Data</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-orange-50 p-4 sm:p-5 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center w-full">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.current_streak || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-orange-600 mt-1">Current Streak</span>
          </div>
          
          <div className="bg-blue-50 p-4 sm:p-5 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center w-full">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.longest_streak || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-blue-600 mt-1">Longest Streak</span>
          </div>
          
          <div className="bg-purple-50 p-4 sm:p-5 rounded-2xl border border-purple-100 flex flex-col items-center justify-center text-center w-full">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mb-2 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              {streak?.total_points || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-purple-600 mt-1">Total Points</span>
          </div>
          
          <div className="bg-emerald-50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center w-full overflow-hidden">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 mb-2 shrink-0" />
            <span className="text-sm sm:text-lg font-bold text-gray-900 truncate w-full px-1">
              {streak?.last_attendance_date 
                ? new Date(streak.last_attendance_date).toLocaleDateString()
                : '-'}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-600 mt-1">Last Attendance</span>
          </div>
        </div>

        {/* Other Details */}
        {student && (
          <>
            <h4 className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Additional Details</h4>
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 text-xs sm:text-sm w-full">
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Phone Number</span>
                <span className="font-semibold text-gray-900 truncate block">{student.phone || 'Not provided'}</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Gender</span>
                <span className="font-semibold text-gray-900 truncate block">{student.gender || 'Not provided'}</span>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">MFA Status</span>
                <div className="mt-1">{renderStatusBadge(student.mfa_enabled)}</div>
              </div>
              <div className="overflow-hidden">
                <span className="block text-gray-500 font-medium mb-1">Enrolled Courses</span>
                <span className="font-semibold text-gray-900 truncate block">{student.courses?.length || 0} courses</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewStreak;
