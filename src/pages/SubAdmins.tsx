import React, { useState, useEffect, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FiSearch, FiMail, FiUser } from "react-icons/fi";

/* ================= TYPES ================= */

interface SubAdmin {
  id: number;
  name: string;
  email: string;
}

interface SubAdminPayload {
  name: string;
  email: string;
  password: string;
}

interface CreateResponse {
  message?: string;
}

/* ================= CONFIG ================= */
const TOKEN_KEY = "access_token";

/* ================= COMPONENT ================= */

const SubAdmins: React.FC = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem(TOKEN_KEY);

  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const [formData, setFormData] = useState<SubAdminPayload>({
    name: "",
    email: "",
    password: "",
  });

  /* ================= HELPERS ================= */

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setError(null);
    setSuccessMessage(null);
  };

  /* ================= FETCH LIST ================= */

  const fetchSubAdmins = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setListLoading(true);
    setListError(null);

    try {
      const response = await api.get<SubAdmin[]>(
        "/admin/list-of-sbuadmins"
      );

      const sortedData = [...response.data].sort((a, b) => b.id - a.id);
      setSubAdmins(sortedData);
    } catch (err) {
      console.error("Fetch sub-admins failed:", err);
      setListError("Failed to load sub-admins");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  /* ================= FORM ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("No access token found. Please login again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<CreateResponse>(
        "/admin/create-subadmin",
        formData
      );

      setSuccessMessage(
        response.data.message || "Sub-admin created successfully"
      );

      resetForm();
      setShowForm(false);
      fetchSubAdmins();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; detail?: any }>;
      let msg = "Failed to create sub-admin";

      if (axiosErr.response) {
        const status = axiosErr.response.status;
        const data = axiosErr.response.data;

        if (status === 401 || status === 403) {
          msg = "Session expired or unauthorized. Login as super-admin.";
        } else if (status === 409) {
          msg = data?.message || "Email already exists";
        } else if (status === 400) {
          msg = data?.detail?.[0]?.msg || data?.message || "Invalid input";
        } else if (status >= 500) {
          msg = "Server error. Contact backend team.";
        }
      } else {
        msg = "Backend server not reachable";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  const filteredSubAdmins = subAdmins.filter(
    (admin) =>
      (admin.name && admin.name.toLowerCase().includes(search.toLowerCase())) ||
      (admin.id && admin.id.toString().includes(search))
  );

  return (
    <div className="space-y-6 relative">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">

        {/* LEFT SIDE (TITLE + SUBTITLE) */}
        <div className="flex flex-col">

          <h2
            className="
   text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight
  "
            
          >
            Sub-Admin Management
          </h2>

          <p
            className="
   text-md sm:text-md text-[#4B5563] mt-1 font-medium
  "
            
          >
            Role based access control system with comprehensive permissions
          </p>

        </div>

        {/* RIGHT SIDE (SEARCH + BUTTON) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* SEARCH */}
          <div className="relative w-full sm:w-64">

            {/* ICON */}
            <FiSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]"
            />

            {/* INPUT */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by subadmin name & id"
              className="
      w-full
      h-[42px]
      pl-11 pr-4
      rounded-full
      border border-gray-200
      bg-white
      text-sm
      text-gray-700
      outline-none
      focus:ring-2 focus:ring-[#615FFF]
      focus:border-[#615FFF]
      transition
    "
            />

          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => navigate("/dashboard/create-sub-admin")}
            className="
    text-white
    px-4
    h-10
    rounded-full
    text-sm
    font-medium
    whitespace-nowrap
    bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
    hover:from-[#514EF0] hover:to-[#9333EA]
    transition shadow-sm
  "
          >
            + Add New Sub-Admin
          </button>

        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 w-full">

          {/* TITLE */}
          <h3 className="text-lg font-semibold text-[#101828] mb-5">
            Create New Sub-Admin
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
            <div className="space-y-1">
              <label className="text-sm text-[#4A5565] font-medium">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="
            w-full
            h-11
            px-4
            rounded-xl
            border border-gray-200
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#615FFF]
            focus:border-[#615FFF]
          "
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="text-sm text-[#4A5565] font-medium">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="
            w-full
            h-11
            px-4
            rounded-xl
            border border-gray-200
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#615FFF]
            focus:border-[#615FFF]
          "
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label className="text-sm text-[#4A5565] font-medium">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Enter password"
                className="
            w-full
            h-11
            px-4
            rounded-xl
            border border-gray-200
            text-sm
            outline-none
            focus:ring-2 focus:ring-[#615FFF]
            focus:border-[#615FFF]
          "
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="
            px-5
            h-10
            rounded-xl
            border border-gray-200
            text-sm
            text-gray-600
            hover:bg-gray-50
          "
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
    px-5
    h-10
    rounded-xl
    text-white
    text-sm
    font-medium
    bg-gradient-to-r from-[#615FFF] to-[#AD46FF]
    hover:from-[#514EF0] hover:to-[#9333EA]
    transition shadow-sm
    disabled:opacity-60 disabled:cursor-not-allowed
  "
              >
                {loading ? "Creating..." : "Create Sub-Admin"}
              </button>

            </div>

            {/* MESSAGES */}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}

          </form>
        </div>
      )}

      {/* ERROR */}
      {listError && (
        <div className="text-red-600 mb-4">{listError}</div>
      )}

      {listLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4 w-full">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[20px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">

          {filteredSubAdmins.length === 0 ? (
            <p className="text-gray-400">No sub-admins found</p>
          ) : (
            filteredSubAdmins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((admin) => (
              <div
                key={admin.id}
                className="
    bg-white
    border border-gray-100
    rounded-[24px]
    p-6
    shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]
    hover:shadow-md
    transition-all
    flex flex-col justify-between
  "
              >

                {/* TOP SECTION */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* AVATAR */}
                    <div
                      className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] rounded-full 
                   text-white flex items-center justify-center 
                   font-bold text-[15px] sm:text-[16px]
                   bg-[#8b5cf6] shadow-sm shrink-0"
                    >
                      {admin.name
                        ?.split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>

                    {/* NAME + EMAIL */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-[16px] sm:text-[17px] font-bold text-[#1F2937] truncate">
                        {admin.name}
                      </p>

                      <div className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-gray-500 mt-1">
                        <FiMail className="text-gray-400 text-[12px] sm:text-sm shrink-0" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE BADGE */}
                 
                </div>

                {/* BOTTOM PILL */}
                <div className="mt-5 sm:mt-6">
                  <div
                    className="
        w-full
        py-2 sm:py-2.5
        px-4 sm:px-5
        text-[13px] sm:text-[14px] font-semibold
        text-white
        rounded-full
        bg-[#8b5cf6]
        shadow-sm
        text-left
        truncate
      "
                  >
                    Subadmin Id : {admin.id}
                  </div>
                </div>

              </div>
            ))
          )}

        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {filteredSubAdmins.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
          <div className="text-[13px] font-medium text-[#6B7280]">
            Showing {filteredSubAdmins.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredSubAdmins.length)} of {filteredSubAdmins.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
            >
              Previous
            </button>

            {Array.from({ length: Math.ceil(filteredSubAdmins.length / itemsPerPage) }).map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === Math.ceil(filteredSubAdmins.length / itemsPerPage) ||
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
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredSubAdmins.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredSubAdmins.length / itemsPerPage) || filteredSubAdmins.length === 0}
              className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

/* ================= STYLES ================= */
const tableStyle = {
  width: "100%",
  marginTop: "1.5rem",
  borderCollapse: "separate" as const,
  borderSpacing: 0,
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid #e5e7eb",
};
const addBtn = {
  background: "#0504AA",
  color: "#fff",
  padding: "0.6rem 1.4rem",
  borderRadius: "8px",
  border: "none",
  fontWeight: 500,
  cursor: "pointer",
};
const formContainer = {
  width: "100%",
  marginTop: "20px",
  padding: "24px",
  background: "#ffffff",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const formTitle = {
  marginBottom: "20px",
  fontSize: "20px",
  fontWeight: "600",
};

const field = {
  marginBottom: "16px",
};

const label = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 500,
};

const buttonGroup = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "10px",
};

const cancelBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "#f1f5f9",
  cursor: "pointer",
};

const createBtn = {
  padding: "10px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#0504AA",
  color: "#fff",
  fontWeight: 500,
  cursor: "pointer",
};

const tableHeader = {
  background: "linear-gradient(90deg,#7616AC 0%,#1907AD 100%)",
  color: "#fff",
  borderRadius: "14px",
};

const tableBody = {
  background: "#ffffff",
};

const th = {
  padding: "1rem",
  textAlign: "left" as const,
};

const td = {
  padding: "1rem",
  borderBottom: "1px solid #e5e7eb",
};

const errorBox = {
  background: "#fee2e2",
  color: "#dc2626",
  padding: "1rem",
  marginTop: "1rem",
  borderRadius: "8px",
};

const input = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1.2rem",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  background: "#f1f5f9",
};

const submitBtn = {
  width: "100%",
  padding: "0.9rem",
  background: "#2563eb",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: 600,
};

export default SubAdmins;