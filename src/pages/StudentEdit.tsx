import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "@/lib/api";
import { User, Mail, Lock, Phone, Settings, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

interface Student {
  id: number;
  email: string;
  name?: string;
  phone?: string | null;
  status?: boolean;
  address?: string | null;
  about_me?: string | null;
}

const StudentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'basic'>('security');

  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: true,
    address: '',
    about_me: '',
    profile_picture: null as File | null,
    resume: null as File | null,
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
        toast({ title: "Error", description: "No authentication token found.", variant: "destructive" });
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
            password: student.password || student.plain_password || student.plainPassword || student.password_plain || (student.name ? `${student.name.split(' ')[0].toLowerCase()}@123` : 'student@123'),
            status: student.status !== undefined ? student.status : true,
            address: student.address || '',
            about_me: student.about_me || '',
            profile_picture: null,
            resume: null,
          });
        } else {
          toast({ title: "Error", description: "Student not found.", variant: "destructive" });
          navigate('/dashboard/students');
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load student details.", variant: "destructive" });
        navigate('/dashboard/students');
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'name') {
      processedValue = value.replace(/[^A-Za-z\s]/g, "").slice(0, 40);
    } else if (name === 'phone') {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (name === 'password') {
      processedValue = value.slice(0, 30);
    }

    if (name === 'status') {
      setStudentData((prev) => ({ ...prev, status: value === 'true' }));
    } else {
      setStudentData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setStudentData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSecuritySubmit = async () => {
    if (!studentData.name.trim() || !studentData.email.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields (Name and Email).", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      toast({ title: "Validation Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (studentData.phone && studentData.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Phone number must be exactly 10 digits.", variant: "destructive" });
      return;
    }

    if (studentData.password && (studentData.password.length < 8 || studentData.password.length > 30)) {
      toast({ title: "Validation Error", description: "Password must be between 8 and 30 characters long.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        name: studentData.name,
        email: studentData.email,
        phone: studentData.phone,
        status: studentData.status
      };
      const simulatedPassword = studentData.name ? `${studentData.name.split(' ')[0].toLowerCase()}@123` : 'student@123';
      if (studentData.password && studentData.password !== simulatedPassword) {
        payload.password = studentData.password;
      }

      await api.put(`/admin/student/${id}`, payload, axiosConfig());

      toast({
        title: "Updated",
        description: "Security & Account information updated successfully",
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update security information";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicSubmit = async () => {
    if (!studentData.name.trim() || !studentData.email.trim()) {
      toast({ title: "Validation Error", description: "Please fill in all required fields (Name and Email).", variant: "destructive" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentData.email)) {
      toast({ title: "Validation Error", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (studentData.phone && studentData.phone.length !== 10) {
      toast({ title: "Validation Error", description: "Phone number must be exactly 10 digits.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", studentData.name);
      formData.append("email", studentData.email);
      if (studentData.phone) formData.append("phone", studentData.phone);
      if (studentData.address) formData.append("address", studentData.address);
      if (studentData.about_me) formData.append("about_me", studentData.about_me);
      if (studentData.profile_picture) formData.append("profile_picture", studentData.profile_picture);
      if (studentData.resume) formData.append("resume", studentData.resume);

      await api.put(`/admin/update/student/${id}`, formData, {
        headers: {
          ...axiosConfig().headers,
          'Content-Type': 'multipart/form-data',
        }
      });

      toast({
        title: "Updated",
        description: "Basic information updated successfully",
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update basic information";
      toast({ title: "Error", description: msg, variant: "destructive" });
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
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12">
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

      {/* TABS SELECTION */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'security'
              ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Security & Account
        </button>
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
            activeTab === 'basic'
              ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
              : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Basic Information
        </button>
      </div>

      {/* MAIN FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 mt-2">
        {/* SECTION TITLE ROW */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {activeTab === 'security' ? 'Security & Account Information' : 'Basic Information & Files'}
            </h2>
            <p className="text-xs text-gray-500">
              {activeTab === 'security' ? 'Update name, login credentials and status' : 'Update profile details, address and files'}
            </p>
          </div>
        </div>

        {/* SUBTLE SEPARATOR */}
        <div className="border-b border-gray-100 my-6" />

        {/* INPUT FIELDS GRID - SHARED FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          {/* TAB SPECIFIC FIELDS */}
          {activeTab === 'security' && (
            <>
              {/* PASSWORD */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={studentData.password}
                    onChange={handleChange}
                    minLength={8}
                    maxLength={30}
                    placeholder="Enter password"
                    className="w-full h-11 pl-10 pr-10 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
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
            </>
          )}

          {activeTab === 'basic' && (
            <>
              {/* ADDRESS */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={studentData.address || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Enter full address"
                  className="w-full p-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all resize-y"
                />
              </div>

              {/* ABOUT ME */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  About Me
                </label>
                <textarea
                  name="about_me"
                  value={studentData.about_me || ''}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about the student..."
                  className="w-full p-4 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 outline-none text-gray-800 placeholder:text-gray-400 transition-all resize-y"
                />
              </div>

              {/* PROFILE PICTURE */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full h-11 px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all"
                />
              </div>

              {/* RESUME */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Resume (PDF/DOC)
                </label>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full h-11 px-3 py-2 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* BOTTOM ACTION BUTTONS ROW */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
          <button
            onClick={activeTab === 'security' ? handleSecuritySubmit : handleBasicSubmit}
            disabled={loading}
            className="h-11 px-8 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : (activeTab === 'security' ? "Update Security Info" : "Update Basic Info")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEdit;
