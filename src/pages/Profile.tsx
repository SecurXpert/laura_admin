import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Shield, Edit, Save, X, Calendar, Eye, EyeOff, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api"; interface AdminProfile {
  id: number;
  name: string;
  email: string;
  about: string;
  address: string;
  phone: string;
  password?: string;
}

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [profile, setProfile] = useState<AdminProfile>({
    id: 1,
    name: "",
    email: "",
    about: "",
    address: "",
    phone: "",
    password: ""
  });

  const [editedProfile, setEditedProfile] = useState<AdminProfile>(profile);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/admin/profile");

        const data = response.data;
        const fetchedProfile: AdminProfile = {
          id: data.id || 1,
          name: data.name || "",
          email: data.email || "",
          about: data.about || "",
          address: data.address || "",
          phone: data.phone || "",
          password: localStorage.getItem("admin_password") || ""
        };

        setProfile(fetchedProfile);
        setEditedProfile(fetchedProfile);
      } catch (err: any) {
        console.error("Profile fetch failed:", err);
        let msg = "Failed to load profile data.";
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            msg = "Session expired or unauthorized. Please log in again.";
          } else if (err.response.data?.message) {
            msg = err.response.data.message;
          }
        }
        setError(msg);
        toast({
          title: "Error Loading Profile",
          description: msg,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const fetchLoginHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await api.get("/admin/me/login-history");
      if (Array.isArray(response.data)) {
        setLoginHistory(response.data);
      } else {
        setLoginHistory(response.data ? [response.data] : []);
      }
    } catch (err: any) {
      console.error("Failed to fetch login history:", err);
      toast({
        title: "Error",
        description: "Failed to load session history.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' && loginHistory.length === 0) {
      fetchLoginHistory();
    }
  }, [activeTab]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile });
  };

  const handleSave = async () => {
    if (!editedProfile.name || editedProfile.name.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    if (editedProfile.password && editedProfile.password.length !== 8) {
      toast({
        title: "Validation Error",
        description: "Password must be exactly 8 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!editedProfile.phone || editedProfile.phone.length !== 10) {
      toast({
        title: "Validation Error",
        description: "Phone number is required and must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found. Please log in.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Saving Changes...",
        description: "Updating your profile on the server.",
      });

      const isPasswordChanged = editedProfile.password && editedProfile.password !== profile.password;

      const payload: any = {
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone || "",
        about: editedProfile.about || "",
        address: editedProfile.address || "",
        status: true,
      };

      if (isPasswordChanged) {
        payload.password = editedProfile.password;
      }

      await api.put(
        "/admin/admin-profile-update",
        payload
      );

      if (isPasswordChanged) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("admin_password");
        toast({
          title: "Logout successfully",
          description: "Your password has been changed. Logging you out...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      const savedProfile = {
        ...editedProfile
      };

      setProfile(savedProfile);
      setIsEditing(false);

      toast({
        title: "Update successfully",
        description: "Your profile information has been successfully updated on the server.",
        className: "bg-green-500 text-white border-none",
      });
    } catch (err: any) {
      console.error("Profile update failed:", err);
      let msg = "Failed to update profile data.";
      if (err.response && err.response.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail.map((d: any) => `${d.loc.slice(1).join(".")}: ${d.msg}`).join(", ");
        }
      }
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    let processedValue = value;
    if (field === 'name') {
      processedValue = value.replace(/[^A-Za-z\s]/g, "").slice(0, 40);
    } else if (field === 'phone') {
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    } else if (field === 'password') {
      processedValue = value.slice(0, 8);
    }

    setEditedProfile(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const currentProfile = isEditing ? editedProfile : profile;

  if (loading) {
    return (
      <div className="space-y-6 w-full max-w-7xl mx-auto pt-4">
        <Skeleton className="h-10 w-[250px] mb-2" />
        <Skeleton className="h-[120px] w-full rounded-[24px]" />
        <Skeleton className="h-[400px] w-full rounded-[24px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
           <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
             Manage your account information and settings
           </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Overview Horizontal Card matching user mockup */}
        <Card className="w-full rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
              {/* Left side: Avatar + User info */}
              <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto text-center sm:text-left">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#A855F7] flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-[0_4px_14px_rgba(124,58,237,0.15)] flex-shrink-0">
                  {currentProfile.name ? currentProfile.name.split(' ').map(n => n[0]).join('') : "A"}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <h2 className="text-2xl sm:text-[28px] font-bold text-[#1E293B] tracking-tight">
                      {currentProfile.name || "Admin"}
                    </h2>
                    <span className="px-2.5 py-1 bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-[11px] font-bold tracking-wider rounded-md shadow-sm uppercase select-none">
                      Admin
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[#64748B] text-sm font-medium mt-1">
                    <Mail className="w-[15px] h-[15px] text-[#94A3B8]" />
                    <span className="truncate">{currentProfile.email || "No Email"}</span>
                  </div>
                </div>
              </div>

              {/* Right side: Actions */}
              <div className="flex-shrink-0">
                {activeTab === 'profile' && (
                  !isEditing ? (
                    <Button onClick={handleEdit} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-6 sm:py-2.5 rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.35)] font-bold tracking-wide">
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleSave} className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-6 sm:py-2.5 rounded-xl shadow-[0_8px_20px_rgba(16,185,129,0.35)] font-bold tracking-wide">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2 px-6 py-6 sm:py-2.5 rounded-xl border-gray-300 font-bold tracking-wide">
                        Cancel
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 w-full max-w-md mx-auto sm:mx-0">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'profile' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <User className="w-4 h-4" /> Profile Information
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-[#6366F1] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <History className="w-4 h-4" /> Session History
          </button>
        </div>

        {activeTab === 'profile' ? (
        <Card className="w-full rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <User className="w-5 h-5 text-gray-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={currentProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    maxLength={40}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.name || "N/A"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={currentProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.email || "N/A"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={currentProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    minLength={10}
                    maxLength={10}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.phone || "N/A"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Input
                    id="address"
                    value={currentProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.address || "N/A"}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="about">About</Label>
                {isEditing ? (
                  <Input
                    id="about"
                    value={currentProfile.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.about || "N/A"}</p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentProfile.password || ""}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      minLength={8}
                      maxLength={8}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        ) : (
          <Card className="w-full rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#ECEEF2]/60 bg-white">
            <CardHeader className="border-b border-gray-100 pb-6 mb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <History className="w-5 h-5 text-[#6366F1]" />
                Session History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                 <div className="space-y-4">
                   <Skeleton className="h-20 w-full rounded-2xl" />
                   <Skeleton className="h-20 w-full rounded-2xl" />
                   <Skeleton className="h-20 w-full rounded-2xl" />
                 </div>
              ) : loginHistory.length === 0 ? (
                 <div className="text-center py-12 flex flex-col items-center">
                   <Shield className="w-12 h-12 text-gray-200 mb-3" />
                   <h3 className="text-lg font-semibold text-gray-700">No session history found</h3>
                   <p className="text-gray-500 mt-1">There are no recent logins recorded for this account.</p>
                 </div>
              ) : (
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                   {loginHistory.map((item, index) => {
                     // Helper to extract family='...' from python-like repr strings
                     const extractFamily = (str: string) => {
                       if (!str) return "Unknown";
                       const match = str.match(/family='([^']+)'/);
                       return match ? match[1] : str;
                     };

                     const browserName = extractFamily(item.browser);
                     const osName = extractFamily(item.os);
                     const loginDate = new Date(item.login_time);
                     
                     // Try to guess icon based on OS
                     const isWindows = osName.toLowerCase().includes('windows');
                     const isMac = osName.toLowerCase().includes('mac');
                     const isLinux = osName.toLowerCase().includes('linux');
                     const isMobile = osName.toLowerCase().includes('android') || osName.toLowerCase().includes('ios');

                     return (
                       <div key={index} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl bg-white hover:bg-gray-50 transition-colors shadow-sm">
                         <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center flex-shrink-0">
                             {isMobile ? <Phone className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-900 text-base">{osName} • {browserName}</h4>
                             <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 font-medium">
                               <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5"/> {item.ip || "Unknown IP"}</span>
                               {item.location && <span className="flex items-center gap-1">• {item.location}</span>}
                             </div>
                           </div>
                         </div>
                         <div className="text-right flex flex-col items-end">
                           <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                             {loginDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                           </span>
                           <span className="text-xs text-gray-500 font-medium mt-1">
                             {loginDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                           </span>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;