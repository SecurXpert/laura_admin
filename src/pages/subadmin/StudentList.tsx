import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  UserCheck,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  RefreshCw,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import StudentTable, { Student } from './StudentTable';

interface NewStudent {
  name: string;
  email: string;
  password: string;
  role: string;
}

const StudentList = () => {
  const navigate = useNavigate();
  const formatNav = (p: string) =>
    window.location.pathname.startsWith('/subadmin')
      ? p.startsWith('/')
        ? `/subadmin${p}`
        : `/subadmin/${p}`
      : p;

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentCount, setStudentCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [courseFilter, setCourseFilter] = useState('All Courses');

  const [currentPage, setCurrentPage] = useState(1);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const TOKEN_STORAGE_KEY = 'access_token';
  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

  const API_BASE = 'https://lauratek.in:8000';

  const axiosConfig = () => ({
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
      const res = await axios.get<Student[]>(`${API_BASE}/student/students/list`, axiosConfig());
      const reversedData = [...(res.data || [])].reverse();
      setStudents(reversedData);
    } catch (err: any) {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/student/students/count`, axiosConfig());
      setStudentCount(res.data?.total_students || 0);
    } catch (err) {
      console.error('Failed to load student count', err);
    }
  };

  const handleCreateStudent = async () => {
    try {
      await axios.post(`${API_BASE}/admin/student`, newStudent, axiosConfig());

      toast({
        title: 'Created',
        description: 'Student created successfully',
        className: 'bg-emerald-600 text-white',
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
        title: 'Failed',
        description: err.response?.data?.message || 'Failed to create student',
        className: 'bg-red-600 text-white',
        duration: 2000,
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete student #${id}?`)) return;

    try {
      await axios.delete(`${API_BASE}/admin/student/${id}`, axiosConfig());
      toast({
        title: 'Deleted',
        description: 'Student deleted successfully',
        className: 'bg-red-600 text-white',
        duration: 2000,
      });
      fetchStudents();
    } catch (err: any) {
      toast({
        title: 'Failed',
        description: err.response?.data?.message || 'Failed to delete student',
        className: 'bg-red-600 text-white',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentCount();
  }, []);

  const activeStudentCount = students.filter((s) => s.mfa_enabled).length || 0;

  const allUniqueCourses = useMemo(() => {
    const courses = new Set<string>();
    students.forEach((s) => {
      if (s.courses && Array.isArray(s.courses)) {
        s.courses.forEach((c) => courses.add(c));
      }
    });
    return ['All Courses', ...Array.from(courses)];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        !searchTerm ||
        (s.name || s.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'Active') matchStatus = s.mfa_enabled === true;
      if (statusFilter === 'Inactive') matchStatus = s.mfa_enabled === false;

      let matchCourse = true;
      if (courseFilter !== 'All Courses') {
        matchCourse = s.courses?.includes(courseFilter) || false;
      }

      return matchSearch && matchStatus && matchCourse;
    });
  }, [students, searchTerm, statusFilter, courseFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredStudents]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="p-10 text-center">Loading students...</div>;

  if (error) {
    return (
      <div className="p-10 text-center text-red-600">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchStudents} className="mt-3 bg-gray-600 text-white px-4 py-2 rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative w-full max-w-full overflow-hidden pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* LEFT SIDE */}
        <div className="flex items-start gap-3">
          <div>
            <h2 className="text-3xl font-bold text-[#1F2937]">Student Records</h2>
            <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
              View and manage student profile and performance
            </p>
          </div>
        </div>

        {/* RIGHT BUTTON */}
        <button
          onClick={() => navigate(formatNav('/dashboard/students/add'))}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:from-[#514EF0] hover:to-[#9333EA] transition-all duration-200"
        >
          <Users className="w-[18px] h-[18px]" />
          Add Student
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-gradient-to-tr from-white to-[#EEF2FF]/40 rounded-3xl p-6 shadow-sm border-2 border-slate-100 hover:border-slate-200 transition-colors duration-300 flex flex-col relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF2FF] flex items-center justify-center">
            <Users className="w-6 h-6 text-[#3B82F6] stroke-[2]" />
          </div>
          <div className="mt-5">
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              {studentCount.toLocaleString()}
            </h3>
            <p className="text-[15px] font-medium text-slate-500 mt-1">Total Students</p>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-4 h-4 text-[#3B82F6] stroke-[2.5]" />
          </div>
        </div>

        <div className="bg-gradient-to-tr from-white to-[#ECFDF5]/40 rounded-3xl p-6 shadow-sm border-2 border-slate-100 hover:border-slate-200 transition-colors duration-300 flex flex-col relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-[#10B981] stroke-[2]" />
          </div>
          <div className="mt-5">
            <h3 className="text-[32px] font-bold text-slate-900 leading-none">
              {activeStudentCount.toLocaleString()}
            </h3>
            <p className="text-[15px] font-medium text-slate-500 mt-1">Active Students</p>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Filters & Search UI */}
      <div className="bg-white rounded-[24px] p-5 mb-8 flex flex-col gap-5 shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 pl-1">
          <div className="w-[48px] h-[48px] rounded-[14px] bg-[#5B4AE0] text-white flex items-center justify-center shadow-sm">
            <Filter className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-[600] text-slate-800 text-[15px] leading-tight mb-0.5">
              Filters & Search
            </h3>
            <p className="text-[12px] text-[#94A3B8] font-medium">Find & filter student</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] stroke-[2]" />
            <input
              type="text"
              placeholder="Search quizzes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 placeholder-[#94A3B8] font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-3 md:gap-4">
            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors cursor-pointer appearance-none pr-10"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B4AE0] transition-colors cursor-pointer appearance-none pr-10"
              >
                {allUniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none" />
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All Status');
                setCourseFilter('All Courses');
              }}
              className="px-5 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[14px] text-[#64748B] font-medium hover:bg-[#F1F5F9] flex items-center justify-center gap-2 transition-colors shrink-0"
            >
              <RefreshCw className="w-[16px] h-[16px] text-[#94A3B8] stroke-[2]" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">Personal information</h2>
            <p className="text-sm text-gray-500 mt-1">Basic student details</p>
          </div>

          <div className="grid grid-cols-2 gap-5 mt-6">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  placeholder="Enter your name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              onClick={handleCreateStudent}
              className="px-6 py-2.5 rounded-lg text-white shadow-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:from-[#514EF0] hover:to-[#9333EA] transition"
            >
              Create Student
            </button>
          </div>
        </div>
      )}

      {/* Student Table & Pagination & Assigned Courses Popup */}
      <StudentTable
        students={currentStudents}
        totalFilteredCount={filteredStudents.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDelete={handleDelete}
        formatNav={formatNav}
      />
    </div>
  );
};

export default StudentList;
