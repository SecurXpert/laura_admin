import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState, useMemo } from "react";
import { FiPhone, FiMail, FiMapPin, FiSearch } from "react-icons/fi";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

/* ================= TYPES ================= */

interface Enrollment {
  id: number;
  name: string;
  email: string;
  mobile_number: string;
  qualification: string;
  interest: string;
  city: string;
  state: string;
  country: string;
  year_of_passedout: string;
  description: string;
  submitted_at: string;
}

/* ================= API ================= */

const fetchEnrollments = async (): Promise<Enrollment[]> => {
  const token = localStorage.getItem("access_token");

  const response = await api.get("/enrollments/admin_view/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

/* ================= COMPONENT ================= */

const EnrollmentAdminView = () => {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["admin-enrollments"],
    queryFn: fetchEnrollments,
  });

  /* ================= SEARCH + PAGINATION ================= */

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredData = useMemo(() => {
    const value = search.toLowerCase();

    return data.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const email = item.email?.toLowerCase() || "";
      const mobile = item.mobile_number || "";

      // LOCATION (combine city + state + country)
      const location = `${item.city || ""} ${item.state || ""} ${item.country || ""}`.toLowerCase();

      // COURSE (interest field)
      const course = item.interest?.toLowerCase() || "";

      return (
        name.includes(value) ||

        mobile.includes(search) ||
        location.includes(value) ||
        course.includes(value)
      );
    });
  }, [data, search]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ================= LOADING ================= */

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto pt-6">
        <div className="flex justify-between w-full">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[300px] rounded-full" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-[24px] mt-6" />
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-destructive">
        Failed to load enrollments
      </div>
    );
  }

  /* ================= UI ================= */

  const formatLocation = (city?: string, state?: string, country?: string) => {
    const parts = [];
    if (city?.trim()) parts.push(city.trim());
    if (state?.trim()) parts.push(state.trim());
    else if (country?.trim()) parts.push(country.trim());
    return parts.join(", ") || "-";
  };

  const totalItems = filteredData.length;
  const startRange = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRange = Math.min(page * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
      startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">

      {/* HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">
            Student Enrollments
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Lead + enrollment intelligence system
          </p>
        </div>

        <div className="relative w-full sm:w-[420px]">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            placeholder="Search students, courses, locations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-12 pr-4 rounded-full border border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#5E5ADB]/20 focus-visible:border-[#5E5ADB] text-base transition-all"
          />
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-x-auto shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        <div className="w-full overflow-x-auto">
          <Table className="w-full text-sm border-collapse min-w-[1000px]">

            {/* HEADER */}
            <TableHeader className="bg-[#F9FAFB80]">
              <TableRow className="border-t-2 border-b-2 border-gray-100 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Student
                </TableHead>
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Contact
                </TableHead>
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Qualification
                </TableHead>
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Preferred Course
                </TableHead>
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Submitted At
                </TableHead>
                <TableHead className="px-6 py-4 text-left align-middle text-[14px] font-bold text-[#6B7280] tracking-wider uppercase whitespace-nowrap">
                  Passed Out
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}
            <TableBody className="divide-y-2 divide-gray-100">
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-base sm:text-lg">
                    No enrollments found
                  </TableCell>
                </TableRow>
              )}

              {paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50/50 transition-colors bg-white"
                >
                  {/* STUDENT */}
                  <TableCell className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#1F2937] text-[16px] leading-snug whitespace-nowrap">
                        {item.name}
                      </span>
                      <span className="text-[16px] text-[#6B7280] font-medium mt-1">
                        LD-2024-{String(item.id).padStart(3, "0")}
                      </span>
                    </div>
                  </TableCell>

                  {/* CONTACT */}
                  <TableCell className="py-5 px-6">
                    <div className="flex flex-col gap-2 text-[#6B7280]">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-slate-400 w-[16px] h-[16px] shrink-0" />
                        <span className="text-[#6B7280] text-[16px] font-medium break-all">
                          {item.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-slate-400 w-[16px] h-[16px] shrink-0" />
                        <span className="text-[#6B7280] text-[16px] font-medium break-all">
                          {item.mobile_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-slate-400 w-[16px] h-[16px] shrink-0" />
                        <span className="text-[#6B7280] text-[16px] font-medium break-words">
                          {formatLocation(item.city, item.state, item.country)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* QUALIFICATION */}
                  <TableCell className="py-5 px-6 text-[#1F2937] text-[16px] font-semibold break-words max-w-[200px]">
                    {item.qualification || "-"}
                  </TableCell>

                  {/* PREFERRED COURSE */}
                  <TableCell className="py-5 px-6">
                    {item.interest ? (
                      <span className="inline-flex items-center px-[12px] py-[5px] bg-[#ede9fe] text-[#7c3aed] text-[16px] font-semibold rounded-full whitespace-nowrap">
                        {item.interest}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[16px]">—</span>
                    )}
                  </TableCell>

                  {/* SUBMITTED AT */}
                  <TableCell className="py-5 px-6 text-[#6B7280] font-medium text-[16px] whitespace-nowrap">
                    {item.submitted_at
                      ? format(new Date(item.submitted_at), "dd MMM yyyy, hh:mm a")
                      : "-"}
                  </TableCell>

                  {/* PASSED OUT */}
                  <TableCell className="py-5 px-6 text-[#6B7280] font-medium text-[16px] whitespace-nowrap">
                    {item.year_of_passedout || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION SECTION */}
        <div className="flex flex-wrap items-center justify-start gap-x-8 gap-y-4 px-6 py-5 border-t border-slate-100 bg-white">
          <p className="text-base sm:text-lg text-slate-500 font-medium whitespace-nowrap">
            Showing {startRange}-{endRange} of {totalItems}
          </p>

          <div className="flex items-center gap-2.5">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2.5 text-base sm:text-lg font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all duration-150"
            >
              Previous
            </button>

            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-semibold rounded-full transition-all duration-150 ${page === i
                    ? "bg-[#5E5ADB] text-white shadow-sm"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {i}
                </button>
              ))}
            </div>

            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-4 py-2.5 text-base sm:text-lg font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all duration-150"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnrollmentAdminView;