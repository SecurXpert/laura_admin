import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiClock } from "react-icons/fi";
import CreateGuestExamModal from "./CreateGuestExamModal";

export type GuestExam = {
  id: number;
  title: string;
  description: string;
  course_id: number;
  category: string;
  duration: number;
  window_start: string;
  window_end: string;
  is_active: number;
  questions: any;
};

const GuestExams = () => {
  const [exams, setExams] = useState<GuestExam[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [examToEdit, setExamToEdit] = useState<GuestExam | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/guest/exam/get");
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      const sortedData = [...data].sort((a: any, b: any) => b.id - a.id);
      setExams(sortedData);
    } catch (error) {
      console.error("Failed to fetch guest exams", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.courses) {
        data = res.data.courses;
      } else if (res.data?.data) {
        data = res.data.data;
      }
      setCourses(data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const handleDelete = async (examId: number) => {
    if (!window.confirm("Are you sure you want to delete this guest exam?")) return;

    try {
      await api.delete(`/guest/exam/delete?exam_id=${examId}`);
      setExams((prev) => prev.filter((e) => e.id !== examId));
      toast({
        title: "Deleted",
        description: "Exam deleted successfully",
        className: "bg-red-600 text-white border-none",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to delete exam", error);
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.id?.toString().includes(searchTerm)
  );

  const totalPages = Math.max(Math.ceil(filteredExams.length / pageSize), 1);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, exams.length]);

  const isAnyModalOpen = showCreateModal || examToEdit !== null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', '');
    } catch (e) {
      return dateString;
    }
  };

  const getQuestionCount = (questionsObj: any) => {
    if (!questionsObj) return 0;
    return Object.keys(questionsObj).length;
  };

  const getCourseName = (id: number) => {
    if (!id) return "--";
    const course = courses.find((c: any) => c.id === id);
    return course ? (course.title || course.name) : `Course ${id}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {!isAnyModalOpen ? (
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
                Guest Exams
              </h1>
              <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
                Manage and configure guest examination sessions
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => {
                  setExamToEdit(null);
                  setShowCreateModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-md bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-95 transition"
              >
                <FiPlus className="text-base" />
                Create Guest Exam
              </button>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title .."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
            <div className="overflow-x-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="p-4 pl-6">Title</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Course Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Window Start</th>
                    <th className="p-4">Window End</th>
                   
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 pr-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">Loading exams...</td>
                    </tr>
                  ) : filteredExams.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">No exams found</td>
                    </tr>
                  ) : (
                    paginatedExams.map((exam, index) => {
                      const isActive = exam.is_active === 1;

                      return (
                        <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 pl-6 font-bold text-gray-600">{exam.title}</td>
                          <td className="p-4 text-gray-500 truncate max-w-[200px]" title={exam.description}>{exam.description}</td>
                          <td className="p-4 text-gray-700 font-medium">{getCourseName(exam.course_id)}</td>
                          <td className="p-4">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                              {exam.category}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600 flex items-center gap-1.5 mt-1"><FiClock className="text-gray-400" /> {exam.duration} min</td>
                          <td className="p-4 text-gray-600 text-[13px]">{formatDate(exam.window_start)}</td>
                          <td className="p-4 text-gray-600 text-[13px]">{formatDate(exam.window_end)}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-4 pr-6">
                            <div className="flex items-center justify-center gap-3">
                              <button onClick={() => navigate(`/guest-exams/view/${exam.id}`)} className="text-indigo-500 hover:text-indigo-700 transition" title="View"><FiEye className="w-4 h-4" /></button>
                              <button onClick={() => setExamToEdit(exam)} className="text-orange-500 hover:text-orange-700 transition" title="Edit"><FiEdit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(exam.id)} className="text-red-500 hover:text-red-700 transition" title="Delete"><FiTrash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
                <span className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-semibold text-gray-700">{Math.min(currentPage * pageSize, filteredExams.length)}</span> of{" "}
                  <span className="font-semibold text-gray-700">{filteredExams.length}</span> entries
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition shadow-2xs"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition shadow-2xs ${
                        currentPage === i + 1
                          ? "bg-[#615fff] text-white"
                          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition shadow-2xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* CREATE / EDIT MODAL */}
      {isAnyModalOpen && (
        <CreateGuestExamModal
          examToEdit={examToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setExamToEdit(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setExamToEdit(null);
            fetchExams();
          }}
        />
      )}
    </div>
  );
};

export default GuestExams;
