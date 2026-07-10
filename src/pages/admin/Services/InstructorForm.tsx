import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { ArrowLeft, Upload, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

/* ================= TYPES ================= */
interface Instructor {
  id?: number;
  name: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  rating?: number;
}

/* ================= COMPONENT ================= */
const InstructorForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    rating: 0,
  });

  /* ================= ERROR HANDLER ================= */
  const mapApiError = (error: any) => {
    const status = error?.response?.status;
    switch (status) {
      case 400:
        return "Invalid request";
      case 404:
        return "Instructor not found";
      case 409:
        return "Email already exists";
      case 500:
        return "Server error";
      default:
        return error?.response?.data?.detail || "Something went wrong";
    }
  };

  /* ================= POPULATE FORM FROM STATE ================= */
  useEffect(() => {
    if (isEdit && location.state?.instructor) {
      const instructor = location.state.instructor;
      setFormData({
        name: instructor.name || "",
        email: "",
        password: "",
        bio: instructor.bio || "",
        rating: instructor.rating || 0,
      });
    }
  }, [isEdit, location.state]);

  /* ================= HANDLERS ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // Prevent starting space for name and email
    if ((name === "name" || name === "email") && value.startsWith(" ")) {
      return;
    }

    // Allow only letters + spaces for name
    if (name === "name") {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    /* NAME VALIDATION */
    if (!/^[A-Za-z][A-Za-z\s]{0,39}$/.test(formData.name)) {
      toast({
        title: "Validation Error",
        description:
          "Name must contain only letters, cannot start with space, max 40 characters",
        variant: "destructive",
      });
      return false;
    }

    if (!isEdit) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        return false;
      }

      const pwd = formData.password.trim();
      if (pwd.length < 8 || pwd.length > 30) {
        toast({
          title: "Validation Error",
          description: "Password must be between 8 and 30 characters.",
          variant: "destructive",
        });
        return false;
      }
      
      const hasCapital = /[A-Z]/.test(pwd);
      const hasInteger = /[0-9]/.test(pwd);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_+=\/\\\[\]~`]/.test(pwd);
      
      if (!hasCapital || !hasInteger || !hasSpecial) {
        toast({
          title: "Validation Error",
          description: "Password must contain at least one uppercase letter, one number, and one special character.",
          variant: "destructive",
        });
        return false;
      }
    }

    /* BIO VALIDATION */
    if (formData.bio.length > 200) {
      toast({
        title: "Validation Error",
        description: "Bio maximum 200 characters allowed",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);
      data.append("rating", String(formData.rating));

      if (!isEdit) {
        data.append("email", formData.email);
        data.append("password", formData.password);
      }

      if (selectedFile) {
        data.append("profile_picture", selectedFile);
      }

      if (isEdit && id) {
        await api.put(`/admin/instructors/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast({
          title: "Updated",
          description: "Instructor updated successfully",
          className: "bg-emerald-600 text-white",
          duration: 2000,
        });
      } else {
        await api.post("/admin/instructors", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast({
          title: "Created",
          description: "Instructor created successfully",
          className: "bg-emerald-600 text-white",
          duration: 2000,
        });
      }

      navigate("/dashboard/instructors");
    } catch (error: any) {
      toast({
        title: "Error",
        description: mapApiError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden box-border">
      {/* HEADER */}
      <div className="flex items-start gap-3 mb-6 sm:mb-8 w-full box-border">
        <button
          onClick={() => navigate("/dashboard/instructors")}
          className="mt-1.5 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-2xl font-bold text-[#111827] leading-tight break-words">
            {isEdit ? "Edit Instructor" : "Add New Instructor"}
          </h1>
          <p className="text-md text-[#6B7280] mt-1 break-words">
            {isEdit ? "Update instructor information details" : "Fill in the details to add a new instructor"}
          </p>
        </div>
      </div>

      {/* SINGLE FORM CARD CONTAINER */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 w-full box-border">
        <h2 className="text-base font-bold text-gray-900 mb-6">
          Instructor Information
        </h2>

        <div className="space-y-5 w-full box-border">
          {/* ID FIELD - ONLY IN EDIT MODE */}
          {isEdit && (
            <div className="w-full box-border min-w-0">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                ID
              </label>
              <input
                type="text"
                value={id || ""}
                disabled
                className="w-full h-11 px-4 border border-gray-300 rounded-xl bg-gray-100 text-gray-500 outline-none text-sm box-border"
              />
            </div>
          )}

          {/* FULL NAME FIELD */}
          <div className="w-full box-border min-w-0">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={40}
              placeholder="John Doe"
              className="w-full h-11 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-800 placeholder:text-gray-400 transition-all box-border"
            />
          </div>

          {/* EMAIL ADDRESS FIELD - ONLY IN CREATE MODE */}
          {!isEdit && (
            <div className="w-full box-border min-w-0">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                maxLength={40}
                placeholder="john.doe@example.com"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-800 placeholder:text-gray-400 transition-all box-border"
              />
            </div>
          )}

          {/* PASSWORD FIELD - ONLY IN CREATE MODE */}
          {!isEdit && (
            <div className="w-full box-border min-w-0">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  minLength={8}
                  maxLength={30}
                  className="w-full h-11 px-4 pr-10 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-800 placeholder:text-gray-400 transition-all box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* BIO FIELD */}
          <div className="w-full box-border min-w-0">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Bio <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={200}
              placeholder="Brief description about the instructor"
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-gray-800 placeholder:text-gray-400 resize-none transition-all box-border"
            />
          </div>

          {/* PROFILE PICTURE FIELD */}
          <div className="w-full box-border min-w-0">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Profile Picture <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>

            <div className="border-2 border-dashed border-gray-200 hover:border-purple-500/50 rounded-2xl min-h-[160px] h-auto flex flex-col items-center justify-center bg-[#fcfcfd] transition-all p-4 w-full box-border">
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    toast({
                      title: "File Too Large",
                      description: "Profile picture must be less than 5MB.",
                      variant: "destructive",
                    });
                    e.target.value = "";
                    setSelectedFile(null);
                    return;
                  }
                  setSelectedFile(file);
                }}
                className="hidden"
                id="profile-upload"
              />

              <label
                htmlFor="profile-upload"
                className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-center"
              >
                <div className="mb-2 transition-transform hover:scale-105">
                  <Upload className="w-6 h-6 text-gray-500 mx-auto" />
                </div>

                <p className="text-sm text-gray-700 font-medium break-all px-2 max-w-full">
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Click to upload or drag and drop"}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </label>
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] text-white font-medium text-sm shadow-sm transition-all mt-8 disabled:opacity-50 box-border"
          >
            {loading ? "Saving..." : isEdit ? "Update Instructor" : "Add Instructor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorForm;