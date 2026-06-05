import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Shield, Edit, Save, X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";interface AdminProfile {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
          password: ""
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
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

      await api.put(
        "/admin/admin-profile-update",
        {
          name: editedProfile.name,
          email: editedProfile.email,
          phone: editedProfile.phone || "",
          password: editedProfile.password || "",
          about: editedProfile.about || "",
          address: editedProfile.address || "",
          status: true,
        }
      );

      if (editedProfile.password) {
        localStorage.removeItem("access_token");
        toast({
          title: "Password Updated",
          description: "Your password has been changed. Logging you out...",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      const savedProfile = {
        ...editedProfile,
        password: "" // Clear password field after successful save
      };

      setProfile(savedProfile);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated on the server.",
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
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              {/* <Save className="w-4 h-4" /> */}
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
              {/* <X className="w-4 h-4" /> */}
              Cancel
            </Button>
          </div>
        )}
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
                  <h2 className="text-2xl sm:text-[28px] font-bold text-[#1E293B] tracking-tight">
                    {currentProfile.name || "Admin"}
                  </h2>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-[#64748B] text-sm font-medium mt-1">
                    <Mail className="w-[15px] h-[15px] text-[#94A3B8]" />
                    <span className="truncate">{currentProfile.email || "No Email"}</span>
                  </div>
                </div>
              </div>

              {/* Right side: Pill Badge */}
              <div className="flex-shrink-0">
                <div className="px-6 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#A855F7] text-white text-xs sm:text-sm font-bold tracking-wider rounded-xl shadow-[0_8px_20px_rgba(99,102,241,0.35)] flex items-center justify-center uppercase select-none">
                  ADMIN
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card - Stacked below */}
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
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={currentProfile.password || ""}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    minLength={8}
                    maxLength={8}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;