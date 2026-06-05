import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "@/lib/api";import { FiSearch, FiMoreVertical, FiEye, FiEdit2, FiTrash2, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, UserPlus, User, Mail, Lock, Users, UserCheck, TrendingUp, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Student {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  rollNumber?: string;
  course_id?: number | null;
  is_admin: boolean;
  mfa_enabled: boolean;
  mfa_verified_at?: string | null;
  mfa_failed_attempts?: number;
  mfa_locked_until?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  about_me?: string | null;
  expertise?: string | null;
  profile_picture?: string | null;
  linked_picture?: string | null;
  linkedin?: string | null;
  resume_url?: string | null;
  resume_uri?: string | null;
  profile_image?: string | null;
  [key: string]: any;
}

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [selectedStudentCourses, setSelectedStudentCourses] = useState<{ studentName: string; courses: string[] } | null>(null);

  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    activeStudents: 0,
    avgPerformance: 0,
    totalExamsTaken: 0,
  });

  const TOKEN_STORAGE_KEY = 'access_token';
  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);  const axiosConfig = () => ({
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  const fetchStudents = async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Student[]>("/student/students/list", axiosConfig());
      setStudents(res.data || []);
    } catch (err: any) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const countRes = await api.get("/student/students/count", { headers });
      const analyticsRes = await api.get("/quiz/admin/results/analytics/students", { headers });

      // Handle the count response whether it's a direct number or an object
      const totalStudentsCount = typeof countRes.data === 'number'
        ? countRes.data
        : (countRes.data?.count ?? countRes.data?.total_students ?? countRes.data ?? 0);

      const analytics = analyticsRes.data || {};
      const overall = analytics.overall || {};

      setDashboard(prev => ({
        ...prev,
        totalStudents: totalStudentsCount,
        avgPerformance: overall.average_score || 0,
        totalExamsTaken: overall.total_attempts || 0,
      }));
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  const handleCreateStudent = async () => {
    try {
      await api.post("/admin/student", newStudent, axiosConfig());

      toast({
        title: "Created",
        description: "Student created successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });

      setNewStudent({
        name: '',
        email: '',
        password: '',
        role: 'student',
      });

      setCreateModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Failed to create student",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete student #${id}?`)) return;

    try {
      await api.delete(`/admin/student/${id}`, axiosConfig());
      toast({
        title: "Deleted",
        description: "Student deleted successfully",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      fetchStudents();
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Failed to delete student",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
    }
  };

  // Edit helper has been moved to a separate page component

  useEffect(() => {
    fetchStudents();
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      const active = students.filter(s => s.mfa_enabled).length;
      setDashboard(prev => ({ ...prev, activeStudents: active }));
    }
  }, [students]);

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

  const renderVerifiedAt = (verifiedAt: string | null | undefined) => {
    if (!verifiedAt) return <span className="text-gray-400 font-medium">—</span>;
    try {
      const date = new Date(verifiedAt);
      if (!isNaN(date.getTime())) {
        const pad = (num: number) => String(num).padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return <span className="text-[#1E854A] font-semibold text-[13px] whitespace-nowrap">{formatted}</span>;
      }
    } catch (e) {
      // ignore
    }
    return <span className="text-[#1E854A] font-semibold text-[13px] whitespace-nowrap">{verifiedAt}</span>;
  };

  const renderLockedUntil = (lockedUntil: string | null | undefined) => {
    if (!lockedUntil) return <span className="text-gray-400 font-medium">—</span>;
    try {
      const date = new Date(lockedUntil);
      if (!isNaN(date.getTime())) {
        const pad = (num: number) => String(num).padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return <span className="text-[#EF4444] font-semibold text-[13px] whitespace-nowrap">{formatted}</span>;
      }
    } catch (e) {
      // ignore
    }
    return <span className="text-[#EF4444] font-semibold text-[13px] whitespace-nowrap">{lockedUntil}</span>;
  };

  if (loading) return (
    <div className="w-full space-y-4 p-6">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchStudents} className="mt-3 bg-gray-600 text-white px-4 py-2 rounded">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative w-full max-w-full overflow-hidden pb-4">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        {/* LEFT SIDE */}
        <div className="flex items-start gap-3">

          {/* ICON */}

          {/* TEXT */}
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Student Records
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage student profile and performance
            </p>
          </div>

        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => navigate('/dashboard/students/add')}
          className="
    flex items-center gap-2
    text-white
    px-5 py-2.5
    rounded-full
    text-sm font-medium
    shadow-sm
    bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
    hover:from-[#514EF0] hover:to-[#9333EA]
    transition-all duration-200
  "
        >
          <span className="text-lg">+</span>
          Create Student
        </button>

      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Total Students */}
        <div className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 opacity-40 blur-2xl rounded-full"></div>
          <div className="mb-4 relative z-10">
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl w-fit">
              <Users size={24} />
            </div>
          </div>
          <p className="text-[32px] font-bold text-gray-900 relative z-10 leading-tight">
            {dashboard.totalStudents}
          </p>
          <p className="text-gray-500 text-[15px] font-medium mt-1 relative z-10">
            Total Students
          </p>
          <p className="text-sm font-medium text-blue-600 mt-3 relative z-10 flex items-center gap-1">
            <TrendingUp size={16} /> +12.5% from last month
          </p>
        </div>

        {/* Active Students */}
        <div className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200 opacity-40 blur-2xl rounded-full"></div>
          <div className="mb-4 relative z-10">
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl w-fit">
              <UserCheck size={24} />
            </div>
          </div>
          <p className="text-[32px] font-bold text-gray-900 relative z-10 leading-tight">
            {dashboard.activeStudents}
          </p>
          <p className="text-gray-500 text-[15px] font-medium mt-1 relative z-10">
            Active Students
          </p>
          <p className="text-sm font-medium text-emerald-600 mt-3 relative z-10 flex items-center gap-1">
            <TrendingUp size={16} /> +75.7% of total
          </p>
        </div>
      </div>      {createModalOpen && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 w-full">

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">
              Personal information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Basic student details
            </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-2 gap-5 mt-6">

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="Enter your name"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newStudent.email}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, email: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={newStudent.password}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, password: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateStudent}
              className="px-6 py-2.5 rounded-lg text-white shadow-sm 
             bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
             hover:from-[#514EF0] hover:to-[#9333EA]
             transition"
            >
              Create Student
            </button>
          </div>
        </div>
      )}
      {students.length === 0 ? (
        <p className="text-center text-gray-500">No students found.</p>
      ) : (
        <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-x-auto shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-sm border-collapse min-w-[1000px]">

            {/* Header */}
            <thead style={{ background: 'linear-gradient(90deg, #7B2FF7 0%, #752EF4 7.69%, #6F2EF1 15.38%, #692DEE 23.08%, #642CEB 30.77%, #5E2BE8 38.46%, #582AE5 46.15%, #5229E2 53.85%, #4C27E0 61.54%, #4626DD 69.23%, #3F25DA 76.92%, #3923D7 84.62%, #3221D4 92.31%, #2B1FD1 100%)' }}>
              <tr className="border-t-2 border-b-2 border-gray-100">
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">NAME</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">EMAIL</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">PHONE</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">DOB</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">GENDER</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">COURSES</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">MFA</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">MFA VERIFIED</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">FAILED ATTEMPTS</th>
                <th className="px-6 py-4 text-left align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">LOCKED UNTIL</th>
                <th className="px-6 py-4 text-center align-middle text-[11px] font-bold text-white tracking-wider uppercase whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100">
              {students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((s) => (
                <tr key={s.id} className="hover:bg-gray-100 transition-colors even:bg-[#FAFAFA] odd:bg-white">

                  <td className="px-6 py-4 text-left align-middle text-[15px] text-[#1F2937] font-bold whitespace-nowrap">
                    {s.name || (s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : '-')}
                  </td>
                  <td className="px-6 py-4 text-left align-middle text-[15px] text-[#1F2937] font-medium">{s.email || '-'}</td>
                  <td className="px-6 py-4 text-left align-middle text-[15px] text-[#6B7280] font-medium whitespace-nowrap">{s.phone || '-'}</td>
                  <td className="px-6 py-4 text-left align-middle text-[15px] text-[#6B7280] font-medium whitespace-nowrap">{s.dob || '-'}</td>
                  <td className="px-6 py-4 text-left align-middle text-[15px] text-[#6B7280] font-medium">{s.gender || '-'}</td>

                  {/* Courses array */}
                  <td className="px-6 py-4 text-left align-middle">
                    {s.courses && s.courses.length > 0 ? (
                      <div className="flex flex-col gap-1.5 justify-start items-start whitespace-nowrap py-1">
                        {s.courses.slice(0, 2).map((course: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-[10px] py-[3px] bg-[#ede9fe] text-[#7c3aed] text-[13px] font-semibold rounded-full">
                            {course}
                          </span>
                        ))}
                        {s.courses.length > 2 && (
                          <button
                            onClick={() => setSelectedStudentCourses({
                              studentName: s.name || s.email,
                              courses: s.courses
                            })}
                            className="text-[13px] text-[#5D3EFC] hover:underline font-bold mt-0.5"
                          >
                            + {s.courses.length - 2} more
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[15px]">—</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-left align-middle">
                    {renderStatusBadge(s.mfa_enabled)}
                  </td>

                  <td className="px-6 py-4 text-left align-middle">
                    {renderVerifiedAt(s.mfa_verified_at)}
                  </td>

                  <td className="px-6 py-4 text-left align-middle text-[15px] font-semibold text-[#1F2937]">
                    {s.mfa_failed_attempts ?? 0}
                  </td>

                  <td className="px-6 py-4 text-left align-middle text-[15px]">
                    {renderLockedUntil(s.mfa_locked_until)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-center align-middle">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => navigate(`/dashboard/students/edit/${s.id}`)}
                        className="flex items-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

          {/* ================= PAGINATION ================= */}
          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-start px-6 py-5 border-t border-gray-100 gap-6 w-full bg-white mt-4">
              <div className="text-[13px] font-medium text-[#6B7280]">
                Showing {students.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, students.length)} of {students.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Previous
                </button>

                {Array.from({ length: Math.ceil(students.length / itemsPerPage) }).map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(students.length / itemsPerPage) ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold transition-all ${currentPage === pageNumber
                          ? "bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent"
                          : "bg-white text-[#374151] border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                    return <span key={pageNumber} className="text-gray-400 font-bold px-1">...</span>;
                  }

                  return null;
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(Math.ceil(students.length / itemsPerPage), p + 1))}
                  disabled={currentPage === Math.ceil(students.length / itemsPerPage) || students.length === 0}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Edit modal replaced by dedicated edit route page */}

      {/* Popup modal for showing all assigned courses */}
      {selectedStudentCourses && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Assigned Courses
            </h3>
            <p className="text-sm text-gray-500 mb-3 font-medium">
              Student: <span className="text-gray-800 font-semibold">{selectedStudentCourses.studentName}</span>
            </p>
            <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto py-2">
              {selectedStudentCourses.courses.map((course, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3.5 py-1.5 bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold rounded-full"
                >
                  {course}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudentCourses(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentList;