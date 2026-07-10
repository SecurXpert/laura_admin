import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const API_BASE_URL = "https://lauratek.in:8000";

interface GuestProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  educational_status: string;
  qualification: string;
  passedout_year: string;
  interest: string;
  state: string;
  city: string;
  created_at: string;
}

export default function RegisteredUsers() {
  const [users, setUsers] = useState<GuestProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<GuestProfile[]>(
        `${API_BASE_URL}/guest/admin/view-guest-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sorted = [...response.data].sort((a: any, b: any) => b.id - a.id);
      setUsers(sorted);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Failed to load registered users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Registered Users
            </h1>
             <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
              View and manage all guest user profiles
            </p>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
          />
        </div>
        {/* <button
          onClick={fetchUsers}
          className="w-full sm:w-auto px-5 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm text-gray-600 font-semibold hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button> */}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6">{renderSkeleton()}</div>
        ) : error ? (
          <div className="bg-red-50 border-b border-red-100 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium text-lg">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No users found.</p>
            <p className="text-sm">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-lg border-collapse whitespace-nowrap">
              <thead style={{ background: 'linear-gradient(180deg, #2563EB 0%, #3760EB 11.11%, #445CEB 22.22%, #4F58EC 33.33%, #5854EC 44.44%, #6050EC 55.56%, #684BEC 66.67%, #6F46ED 77.78%, #7640ED 88.89%, #7C3AED 100%)' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Location</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Education</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Interest</th>
                  <th className="px-6 py-4 text-left font-semibold text-white uppercase tracking-wider text-base">Joined At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4  font-semibold text-gray-900">
                      {user.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.email || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {[user.city, user.state, user.country].filter(Boolean).join(", ") || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-800">{user.qualification || "-"}</span>
                        <span className="text-base text-gray-600">Status: {user.educational_status || "-"} • Year: {user.passedout_year || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.interest ? (
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-base font-semibold rounded-full">
                          {user.interest}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(user.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 0 && !loading && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-start items-center gap-6 mt-6 pb-8">
          <div className="text-sm text-gray-500 font-medium">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)}-{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'bg-[#615FFF] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
