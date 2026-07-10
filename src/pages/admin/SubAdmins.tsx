import React, { useState, useEffect, FormEvent } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

import { SubAdminsHeader } from "./SubAdminsComponents/SubAdminsHeader";
import { SubAdminsForm } from "./SubAdminsComponents/SubAdminsForm";
import {
  SubAdminsCardGrid,
  SubAdmin,
} from "./SubAdminsComponents/SubAdminsCardGrid";
import { SubAdminsPagination } from "./SubAdminsComponents/SubAdminsPagination";

interface SubAdminPayload {
  name: string;
  email: string;
  password: string;
}

interface CreateResponse {
  message?: string;
}

const TOKEN_KEY = "access_token";

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

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setError(null);
    setSuccessMessage(null);
  };

  const fetchSubAdmins = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setListLoading(true);
    setListError(null);

    try {
      const response = await api.get<SubAdmin[]>("/admin/list-of-sbuadmins");
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

  const filteredSubAdmins = subAdmins.filter(
    (admin) =>
      (admin.name &&
        admin.name.toLowerCase().includes(search.toLowerCase())) ||
      (admin.id && admin.id.toString().includes(search))
  );

  const subAdminsSlice = filteredSubAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 relative">
      <SubAdminsHeader
        search={search}
        onSearchChange={setSearch}
        onAddNew={() => navigate("/dashboard/create-sub-admin")}
      />

      {showForm && (
        <SubAdminsForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            resetForm();
          }}
          loading={loading}
          error={error}
          successMessage={successMessage}
        />
      )}

      {listError && <div className="text-red-600 mb-4">{listError}</div>}

      <SubAdminsCardGrid
        listLoading={listLoading}
        subAdminsSlice={subAdminsSlice}
      />

      <SubAdminsPagination
        currentPage={currentPage}
        totalFiltered={filteredSubAdmins.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SubAdmins;