import React, { useState, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { FiMail } from "react-icons/fi";
import { FiLock } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";

interface SubAdminPayload {
  name: string;
  email: string;
  password: string;
}

interface CreateResponse {
  message?: string;
}const TOKEN_KEY = "access_token";

const CreateSubAdmin: React.FC = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<SubAdminPayload>({
    name: "",
    email: "",
    password: "",
  });

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    let { name, value } = e.target;

    if (name === "name") {
      value = value.replace(/[^A-Za-z\s]/g, "").slice(0, 40);
    } else if (name === "password") {
      value = value.slice(0, 8);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password.length < 8) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 8 characters long",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "No access token found",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<CreateResponse>(
        "/admin/create-subadmin",
        formData
      );

      toast({
        title: "Created",
        description: response.data.message || "Sub-admin created successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });

      navigate("/dashboard/sub-admins");

    } catch (err) {
      const axiosErr = err as AxiosError<{
        message?: string;
      }>;

      toast({
        title: "Failed",
        description: axiosErr.response?.data?.message || "Failed to create sub-admin",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FB] p-3 sm:p-5 lg:p-6">

      <div
        className="
          w-full
          bg-white
          rounded-[24px]
          border border-[#ECECF2]
          shadow-sm
          p-4
          sm:p-6
          lg:p-8
        "
      >

        {/* TOP */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/sub-admins")}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-gray-50 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <h1
            className="
              text-[24px]
              sm:text-[28px]
              font-semibold
              text-[#111827]
            "
          >
            Create New Sub-Admin
          </h1>
        </div>

        {/* SECTION TITLE */}
        <div className="flex items-center gap-2 mb-5">

          <div className="w-2 h-2 rounded-full bg-[#615FFF]" />

          <p className="text-[15px] font-semibold text-[#111827]">
            Basic Information
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <div className="mb-5">

            <label className="block text-sm text-[#374151] mb-2 font-medium">
              Full Name
            </label>

            <div className="relative">

              <FiUser
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  text-[17px]
                "
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={40}
                placeholder="John Doe"
                className="
                  w-full
                  h-[52px]
                  rounded-[16px]
                  border border-[#E5E7EB]
                  bg-[#FCFCFD]
                  pl-12
                  pr-4
                  text-[15px]
                  outline-none
                  focus:ring-2
                  focus:ring-[#8B5CF6]
                  focus:border-[#8B5CF6]
                "
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="mb-5">

            <label className="block text-sm text-[#374151] mb-2 font-medium">
              Email Address
            </label>

            <div className="relative">

              <FiMail
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  text-[17px]
                "
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john.doe@admin.com"
                className="
                  w-full
                  h-[52px]
                  rounded-[16px]
                  border border-[#E5E7EB]
                  bg-[#FCFCFD]
                  pl-12
                  pr-4
                  text-[15px]
                  outline-none
                  focus:ring-2
                  focus:ring-[#8B5CF6]
                  focus:border-[#8B5CF6]
                "
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-8">

            <label className="block text-sm text-[#374151] mb-2 font-medium">
              Password
            </label>

            <div className="relative">

              <FiLock
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  text-[17px]
                "
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                maxLength={8}
                placeholder="Enter strong password"
                className="
                  w-full
                  h-[52px]
                  rounded-[16px]
                  border border-[#E5E7EB]
                  bg-[#FCFCFD]
                  pl-12
                  pr-4
                  text-[15px]
                  outline-none
                  focus:ring-2
                  focus:ring-[#8B5CF6]
                  focus:border-[#8B5CF6]
                "
              />
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-[#ECECF2] pt-6">

            <div className="flex items-center justify-end gap-3 flex-wrap">

              {/* CANCEL */}
              {/* <button
                type="button"
                onClick={() => navigate("/dashboard/sub-admins")}
                className="
                  h-[46px]
                  px-6
                  rounded-[14px]
                  border border-[#D1D5DB]
                  text-[#4B5563]
                  text-sm
                  font-medium
                  hover:bg-gray-50
                  transition
                "
              >
                Cancel
              </button> */}

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="
                  h-[46px]
                  px-7
                  rounded-[14px]
                  text-white
                  text-sm
                  font-medium
                  bg-gradient-to-r
                  from-[#615FFF]
                  to-[#A855F7]
                  shadow-[0_10px_25px_rgba(97,95,255,0.25)]
                  hover:scale-[1.02]
                  transition-all
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Creating..."
                  : "Create Sub-Admin"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateSubAdmin;