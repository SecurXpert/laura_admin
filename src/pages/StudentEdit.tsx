import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "@/lib/api";import { User, Mail, Lock, Phone, Settings, ArrowLeft, X, Save, Camera, Loader2, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface Student {
  id: number;
  email: string;
  name?: string;
  phone?: string | null;
  status?: boolean;
}

const StudentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: true,
  });

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
    const fetchStudent = async () => {
      const token = getToken();
      if (!token) {
        alert('No authentication token found.');
        navigate('/dashboard/students');
        return;
      }

      try {
        setFetching(true);
        const res = await api.get<Student[]>("/student/students/list", axiosConfig());
        const student = res.data?.find((s) => s.id === Number(id));
        if (student) {
          setStudentData({
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            password: '', // blank by default
            status: student.status !== undefined ? student.status : true,
          });
        } else {
          alert('Student not found.');
          navigate('/dashboard/students');
        }
      } catch (err) {
        alert('Failed to load student details.');
        navigate('/dashboard/students');
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'status') {
      setStudentData((prev) => ({ ...prev, status: value === 'true' }));
    } else {
      setStudentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!studentData.name.trim() || !studentData.email.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (studentData.password && studentData.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    try {
      setLoading(true);
      const payload: any = { ...studentData };
      if (!payload.password) {
        delete payload.password;
      }

      await api.put(`/admin/student/${id}`, payload, axiosConfig());
      alert("Student updated successfully");
      navigate('/dashboard/students');
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update student";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
        <Skeleton className="h-10 w-1/4 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* TOP NAVIGATION LINK */}
      <button
        onClick={() => navigate('/dashboard/students')}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        {/* ICON BLOCK */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white shadow-md flex-shrink-0">
          <User className="w-8 h-8" />
        </div>

        {/* TITLES */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Student #{id}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Update student details in the system
          </p>
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mt-6">
        {/* SECTION TITLE ROW */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Personal Information & Settings
            </h2>
            <p className="text-xs text-gray-500">
              Basic student details and status
            </p>
          </div>
        </div>

        {/* SUBTLE SEPARATOR */}
        <div className="border-b border-gray-100 my-6" />

        {/* INPUT FIELDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={studentData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* EMAIL ADDRESS */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={studentData.email}
                onChange={handleChange}
                placeholder="student@email.com"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                name="phone"
                value={studentData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="password"
                name="password"
                value={studentData.password}
                onChange={handleChange}
                minLength={8}
                placeholder="Leave blank to keep unchanged"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={String(studentData.status)}
              onChange={handleChange}
              className="w-full h-11 px-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 transition-all cursor-pointer"
            >
              <option value="true">Active (Enabled)</option>
              <option value="false">Inactive (Disabled)</option>
            </select>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS ROW */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-50">
          {/* <button
            onClick={() => navigate('/dashboard/students')}
            disabled={loading}
            className="h-10 px-5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 border border-gray-200/50"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button> */}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {/* <Save className="w-3.5 h-3.5" /> */}
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEdit;
