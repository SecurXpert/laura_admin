import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type AssignedStudent = {
  course_id: number;
  course_name: string;
  student_id: number;
  student_name: string;
};

const AssignCourseToStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assigned, setAssigned] = useState<AssignedStudent[]>([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("access_token");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (location.state?.flashToast) {
      setSuccessToast(location.state.flashToast);
      window.history.replaceState({}, document.title);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  }, [location]);

  useEffect(() => {
    const fetchAssignedStudents = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/assigned-courses-students`);
        setAssigned(res.data || []);
      } catch {
        toast.error("Failed to fetch assigned students");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedStudents();
  }, [token]);

  const filteredData = assigned.filter((item) => {
    const value = search.toLowerCase();
    return (
      item.course_name.toLowerCase().includes(value) ||
      item.student_name.toLowerCase().includes(value) ||
      String(item.student_id).includes(value) ||
      String(item.course_id).includes(value)
    );
  });

  // Group the filtered data by student to show multiple course pills per row
  const groupedStudents = Object.values(
    filteredData.reduce((acc, curr) => {
      if (!acc[curr.student_id]) {
        acc[curr.student_id] = {
          student_id: curr.student_id,
          student_name: curr.student_name,
          courses: [],
        };
      }
      if (!acc[curr.student_id].courses.find((c: any) => c.id === curr.course_id)) {
        acc[curr.student_id].courses.push({
          id: curr.course_id,
          name: curr.course_name,
        });
      }
      return acc;
    }, {} as Record<number, { student_id: number; student_name: string; courses: { id: number; name: string }[] }>)
  ).sort((a: any, b: any) => b.student_id - a.student_id);

  return (
    <div className="space-y-6 relative">

      {/* LARGE GREEN SUCCESS TOAST */}
      {successToast && (
        <div className="fixed bottom-10 right-10 z-[9999] transition-all duration-300">
          <div className="bg-green-500 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 text-lg font-bold tracking-wide border-2 border-green-600">
            <CheckCircle2 className="w-7 h-7 text-white" />
            {successToast}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
            Assign Course Student
          </h2>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Learning allocation system with personalized recommendations
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => navigate("/dashboard/assign-course-student/add")}
            className="text-white rounded-xl px-4 py-2 bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:from-[#514EF0] hover:to-[#9333EA] transition shadow-sm"
          >
            Assign Course to Student
          </Button>
        </div>
      </div>

      {/* STUDENT RECORDS TABLE */}
      <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10">
        {/* HEADER + SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 pb-4">
          <h2 className="text-[22px] font-bold text-[#1F2937]">
            Student records
          </h2>

          {/* SEARCH */}
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student by name,course,id."
              className="w-full h-11 rounded-full border border-gray-200 pl-11 pr-4 text-[13px] text-gray-700 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[800px]">
            {/* HEADER */}
            <thead className="bg-[#F9FAFB80]">
              <tr className="border-t-2 border-b-2 border-gray-100">
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#6B7280] tracking-wider uppercase w-[30%]">STUDENT</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#6B7280] tracking-wider uppercase w-[40%]">COURSES</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#6B7280] tracking-wider uppercase w-[15%]">COURSE ID</th>
                <th className="px-6 py-4 text-left text-[14px] font-bold text-[#6B7280] tracking-wider uppercase w-[15%]">STUDENT ID</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y-2 divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-6 py-5"><Skeleton className="h-10 w-48 rounded-full" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-8 w-32 rounded-full" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-5"><Skeleton className="h-6 w-16" /></td>
                  </tr>
                ))
              ) : (
                <>
                  {groupedStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors bg-white">
                      {/* STUDENT NAME */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {/* Avatar */}
                          <div className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-[#8b5cf6] text-white flex-shrink-0 font-medium text-[14px] shadow-sm">
                            {item.student_name
                              ?.split(" ")
                              .map((word) => word[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          {/* Name */}
                          <span className="text-[#1F2937] text-[18px] font-bold whitespace-nowrap">
                            {item.student_name}
                          </span>
                        </div>
                      </td>

                      {/* COURSES */}
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {item.courses.map((course, cIdx) => (
                            <span
                              key={cIdx}
                              className="inline-flex items-center px-[12px] py-[5px] rounded-full bg-[#ede9fe] text-[#7c3aed] text-[16px] font-semibold"
                            >
                              {course.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* COURSE ID */}
                      <td className="px-6 py-5 text-[#6B7280] font-medium text-[16px]">
                        {item.courses.map((c) => c.id).join(", ")}
                      </td>

                      {/* STUDENT ID */}
                      <td className="px-6 py-5 text-[#6B7280] font-medium text-[16px]">
                        {item.student_id}
                      </td>
                    </tr>
                  ))}

                  {groupedStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                        No assignments found
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {(!loading && groupedStudents.length > 0) && (
          <div className="flex flex-col sm:flex-row items-center justify-start px-6 py-5 border-t border-gray-100 gap-6 w-full bg-white">
            <div className="text-[13px] font-medium text-[#6B7280]">
              Showing {groupedStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, groupedStudents.length)} of {groupedStudents.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Previous
              </button>

              {Array.from({ length: Math.ceil(groupedStudents.length / itemsPerPage) }).map((_, i) => {
                const pageNumber = i + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === Math.ceil(groupedStudents.length / itemsPerPage) ||
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
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(groupedStudents.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(groupedStudents.length / itemsPerPage) || groupedStudents.length === 0}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCourseToStudent;
