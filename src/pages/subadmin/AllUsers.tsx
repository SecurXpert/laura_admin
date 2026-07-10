import { useEffect, useState } from "react";
import api from "@/api/axiosInstance"; import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
const AllUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      if (!token) {
        setError("Token missing. Please login again.");
        setLoading(false);
        return;
      }

      const res = await api.get(
        "/admin/users"
      );
      const apiData = res.data;
      let data = Array.isArray(apiData) ? apiData : (apiData?.users || apiData?.data || apiData?.items || []);
      
      // Reverse the data so newest users appear at the top
      data = [...data].reverse();
      setUsers(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Unauthorized: Admin access required");
      } else {
        console.error("Failed to load users from server.", err);
        setError("Failed to load users from server.");
      }
    } finally {
      setLoading(false);
    }
  };

  // SEARCH FILTER
  const filteredUsers = users.filter((user) => {
    const value = search.toLowerCase();
    const role = user.role?.toLowerCase() || "";

    // Determine display role to match the rendered UI
    let displayRole = role;
    if (role === "trainer" || role === "instructor") {
      displayRole = "instructor";
    }

    const normalizedRole = role.replace(/[\s_]/g, "");

    return (
      user.name.toLowerCase().includes(value) ||
      role.includes(value) ||
      displayRole.includes(value) ||
      normalizedRole.includes(value)
    );
  });

  // PAGINATION LOGIC
  const totalPages = Math.max(Math.ceil(filteredUsers.length / usersPerPage), 1);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = filteredUsers.slice(
    startIndex,
    startIndex + usersPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
            All Users
          </h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Manage and monitor your platform users
          </p>
        </div>

        {/* Responsive search input */}
        <div className="relative w-48 sm:w-72 max-w-[65%]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-gray-200 rounded-full bg-white shadow-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-[#5D3EFC] focus-visible:border-[#5D3EFC] focus-visible:ring-offset-0 placeholder:text-gray-400 transition-all"
            placeholder="Search Name or Role..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 py-6 w-full">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[24px]" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6 w-full">
          <p className="text-xs sm:text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="w-full">
          {/* RESPONSIVE SCROLLABLE TABLE WRAPPER */}
          <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-x-auto shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <Table className="w-full min-w-[620px] text-sm border-collapse">
                <TableHeader>
                  <TableRow className="border-t-2 border-b-2 border-gray-100" style={{ background: 'linear-gradient(90deg, #7B2FF7 0%, #752EF4 7.69%, #6F2EF1 15.38%, #692DEE 23.08%, #642CEB 30.77%, #5E2BE8 38.46%, #582AE5 46.15%, #5229E2 53.85%, #4C27E0 61.54%, #4626DD 69.23%, #3F25DA 76.92%, #3923D7 84.62%, #3221D4 92.31%, #2B1FD1 100%)' }}>
                    <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">Name</TableHead>
                    <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">Email</TableHead>
                    <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">Role</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y-2 divide-gray-100">
                  {currentUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors bg-white">
                      <TableCell className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium max-w-[160px] truncate">
                        {u.name}
                      </TableCell>

                      <TableCell className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium max-w-[180px] truncate">
                        {u.email}
                      </TableCell>

                      <TableCell className="px-6 py-5 align-middle whitespace-nowrap">
                        <span
                          className={`text-[16px] font-semibold px-[12px] py-[5px] rounded-full border-none shadow-none capitalize inline-flex items-center justify-center ${u.role?.toLowerCase() === "admin"
                              ? "bg-[#E0E7FF] text-[#4338CA]"
                              : u.role?.toLowerCase() === "trainer" || u.role?.toLowerCase() === "instructor"
                                ? "bg-[#E6F8ED] text-[#1E854A]"
                                : u.role?.toLowerCase() === "student"
                                  ? "bg-[#F1F5F9] text-[#64748B]"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {u.role?.toLowerCase() === "trainer" || u.role?.toLowerCase() === "instructor"
                            ? "Instructor"
                            : u.role
                              ? u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()
                              : ""}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {currentUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-400 text-xs sm:text-sm">
                        No users match your search criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* RESPONSIVE PAGINATION */}
          <div className="flex justify-center items-center gap-2 mt-6 w-full">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="inline-flex items-center justify-center gap-1 text-xs sm:text-sm h-8 px-3 rounded-lg border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Previous</span>
            </Button>

            <Button
              size="sm"
              className="bg-[#5D3EFC] hover:bg-[#5D3EFC] text-white text-xs sm:text-sm h-8 w-8 p-0 rounded-lg font-bold shadow-sm flex items-center justify-center cursor-default pointer-events-none"
            >
              {currentPage}
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="inline-flex items-center justify-center gap-1 text-xs sm:text-sm h-8 px-3 rounded-lg border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
