import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  KeyRound,
  Key,
  Save,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const Profile1 = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    about: '',
    password: '',
    currentPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://lauratek.in:8000/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);

        const savedPassword = data.password || localStorage.getItem('admin_password') || '';
        setFormData(prev => ({
          ...prev,
          firstName: data.name || '',
          lastName: '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          about: data.about || '',
          password: savedPassword,
          currentPassword: savedPassword
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to fetch profile data.",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchSessionHistory();
    }
  }, [activeTab]);

  const fetchSessionHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://lauratek.in:8000/subadmin/me/login-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Backend Session History Data:", data);
        
        let historyList = [];
        if (Array.isArray(data)) historyList = data;
        else if (data && Array.isArray(data.data)) historyList = data.data;
        else if (data && Array.isArray(data.history)) historyList = data.history;
        else if (data && Array.isArray(data.login_history)) historyList = data.login_history;
        
        setSessionHistory(historyList);
      }
    } catch (error) {
      console.error('Error fetching session history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'firstName' || name === 'lastName') {
      if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 40) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    if (name === 'phone') {
      if (/^[0-9]*$/.test(value) && value.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validations before saving
    if (!formData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full Name is required.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    const isPasswordChanged = formData.password && formData.password !== formData.currentPassword;
    if (isPasswordChanged && formData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const payload: any = {
        name: formData.firstName.trim(),
        email: formData.email,
        phone: formData.phone || "",
        address: formData.address || "",
        status: true,
        about_me: formData.about || ""
      };

      if (isPasswordChanged) {
        payload.password = formData.password;
      }

      const response = await fetch('https://lauratek.in:8000/admin/admin-profile-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();

        if (isPasswordChanged) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('admin_password');
          toast({
            title: "Success",
            description: "Password updated successfully. You have been signed out.",
            className: "bg-green-500 text-white border-none",
            duration: 2000
          });
          logout();
          navigate(window.location.pathname.startsWith('/subadmin') ? '/subadmin-login' : '/');
          return;
        }

        // If backend issues a new token on profile update, save it so we don't get 401'd and logged out
        if (result.access_token) {
          localStorage.setItem('access_token', result.access_token);
        } else if (result.token) {
          localStorage.setItem('access_token', result.token);
        }

        toast({
          title: "Success",
          description: result.message || "Profile updated successfully",
          className: "bg-green-500 text-white border-none",
          duration: 2000
        });

        setIsEditing(false);
        fetchProfile(); // Refresh the displayed data
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the profile.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Subadmin Profile</h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">Manage your account information and settings</p>
        </div>
      </div>

      {/* Top Profile Card */}
      <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-sm">
              <AvatarImage src={profileData?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-[#615FFF] to-[#AD46FF] text-white text-3xl font-bold uppercase">
                {(profileData?.name || `${formData.firstName} ${formData.lastName}`)
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-900">{profileData?.name || `${formData.firstName} ${formData.lastName}`}</h2>
                <Badge variant="secondary" className="bg-gradient-to-r from-[#615FFF] to-[#AD46FF] text-white border-none px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider">
                  {profileData?.role || 'SUBADMIN'}
                </Badge>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-sm">
                <Mail className="w-4 h-4" />
                <span>{profileData?.email || formData.email}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {activeTab === 'profile' && (
              isEditing ? (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    variant="outline"
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-[#6366f1] hover:bg-[#5558e6] text-white flex items-center gap-2 rounded-xl px-5 h-11"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#6366f1] hover:bg-[#5558e6] text-white flex items-center gap-2 rounded-xl px-5 h-11 shadow-sm shadow-indigo-100"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'profile'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
          <User className="w-4 h-4" />
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'history'
              ? 'bg-[#6366f1] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
        >
          <History className="w-4 h-4" />
          Session History
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'profile' ? (
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <User className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-lg text-slate-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2 md:col-span-1">
                <Label className="text-sm font-bold text-slate-700">Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={!isEditing
                      ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none h-11 text-slate-700 font-medium px-4 rounded-xl flex-1"
                      : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] h-11 text-slate-800 font-medium px-4 rounded-xl shadow-sm flex-1"}
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Email Address</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={!isEditing
                    ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none h-11 text-slate-700 font-medium px-4 rounded-xl w-full"
                    : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] h-11 text-slate-800 font-medium px-4 rounded-xl shadow-sm w-full"}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Phone Number</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={!isEditing
                    ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none h-11 text-slate-700 font-medium px-4 rounded-xl w-full"
                    : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] h-11 text-slate-800 font-medium px-4 rounded-xl shadow-sm w-full"}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-700">Address</Label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={!isEditing
                    ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none h-11 text-slate-700 font-medium px-4 rounded-xl w-full"
                    : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] h-11 text-slate-800 font-medium px-4 rounded-xl shadow-sm w-full"}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-bold text-slate-700">About</Label>
                <Textarea
                  name="about"
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  className={!isEditing
                    ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none min-h-[100px] text-slate-700 font-medium px-4 py-3 rounded-xl resize-none w-full"
                    : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] min-h-[100px] text-slate-800 font-medium px-4 py-3 rounded-xl resize-y shadow-sm w-full"}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                />
              </div>

              {/* Password section */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-bold text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                    className={!isEditing
                      ? "bg-[#f8f9fe] border-none pointer-events-none select-none cursor-default opacity-100 focus-visible:ring-0 focus:ring-0 focus:outline-none h-11 text-slate-700 font-medium px-4 w-full pr-12 rounded-xl"
                      : "bg-white border border-slate-200 focus-visible:ring-2 focus-visible:ring-[#6366f1] h-11 text-slate-800 font-medium px-4 w-full pr-12 rounded-xl shadow-sm"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-4">
              <History className="w-5 h-5 text-[#6366f1]" />
              <h3 className="font-bold text-lg text-slate-900">Session History</h3>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
              {loadingHistory ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#6366f1]" />
                </div>
              ) : sessionHistory.length > 0 ? (
                sessionHistory.map((session, index) => {
                  let rawOs = session.os || session.operating_system || session.device_os || session.platform || session.deviceType || "Windows";
                  let rawBrowser = session.browser || session.browser_name || session.browserName || "Chrome";
                  
                  // Extract 'family' from Python object string e.g. OperatingSystem(family='Windows', ...)
                  const extractFamily = (str: string) => {
                    if (typeof str !== 'string') return String(str);
                    const match = str.match(/family=['"]([^'"]+)['"]/);
                    return match ? match[1] : str;
                  };

                  const os = extractFamily(rawOs);
                  const browser = extractFamily(rawBrowser);

                  const ip = session.ip || session.ip_address || session.ipAddress || session.client_ip || "Unknown IP";
                  
                  let dateStr = session.date;
                  let timeStr = session.time;
                  
                  const timestamp = session.login_time || session.created_at || session.createdAt || session.timestamp;
                  if (timestamp) {
                    try {
                      const d = new Date(timestamp);
                      dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
                    } catch (e) {}
                  }

                  return (
                    <div key={session.id || index} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-[#6366f1] flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-[15px]">{os} • {browser}</h4>
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {ip}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="font-bold text-slate-800 text-[12px] bg-slate-100 px-3 py-1 rounded-full w-fit">
                          {dateStr || "Unknown Date"}
                        </div>
                        <div className="text-[12px] text-slate-500 mt-1 font-medium mr-1">
                          {timeStr || "Unknown Time"}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-slate-500">No session history found</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile1;
