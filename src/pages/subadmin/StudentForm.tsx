import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, User, Mail, Lock, ArrowLeft, X, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";

const StudentForm = () => {
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newStudent, setNewStudent] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^A-Za-z\s]/g, "").slice(0, 40);
    } else if (name === "password") {
      value = value.trim();
    }

    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      return;
    }

    const pw = newStudent.password;

    if (pw !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        className: "bg-red-600 text-white",
        duration: 3000,
      });
      return;
    }

    if (!pw || pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.",
        className: "bg-red-600 text-white",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/admin/student`, newStudent, axiosConfig());

      toast({
        title: "Created",
        description: "Student created successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });

      navigate(formatNav('/dashboard/students'));
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.response?.data?.message || "Failed to create student",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* TOP NAVIGATION LINK */}
      <button
        onClick={() => navigate(formatNav('/dashboard/students'))}
        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* HEADER SECTION */}
      <div className="flex items-center gap-4">
        {/* ICON BLOCK */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white shadow-md flex-shrink-0">
          <UserPlus className="w-8 h-8" />
        </div>

        {/* TITLES */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Add New Student
          </h1>
          <p className="text-md sm:text-md text-gray-500 mt-1">
            Enter student details to add them to the system
          </p>
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mt-6">
        {/* SECTION TITLE ROW */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500">
              Basic student details
            </p>
          </div>
        </div>

        {/* SUBTLE SEPARATOR */}
        <div className="border-b border-gray-100 my-6" />

        {/* INPUT FIELDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={newStudent.name}
                onChange={handleChange}
                maxLength={40}
                placeholder="Enter full name"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* EMAIL ADDRESS */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={newStudent.email}
                onChange={handleChange}
                placeholder="student@email.com"
                className="w-full h-11 pl-10 pr-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={newStudent.password}
                onChange={handleChange}
                minLength={8}
                placeholder="********"
                className="w-full h-11 pl-10 pr-12 bg-[#f8fafc] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value.trim())}
                minLength={8}
                placeholder="********"
                className="w-full h-11 pl-10 pr-12 bg-[#f8fafc] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS ROW */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-50">
          {/* <button
            onClick={() => navigate(formatNav('/dashboard/students'))}
            disabled={loading}
            className="h-10 px-5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 border border-gray-200/50"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button> */}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-md font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {/* <Save className="w-3.5 h-3.5" /> */}
            {loading ? "Saving..." : "create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
