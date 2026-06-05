import { useEffect, useState } from "react";

import api from "@/lib/api"; import { toast } from "@/components/ui/use-toast";

import { FaTrash } from "react-icons/fa";

import { FiClock, FiUser } from "react-icons/fi";

import { FiUpload, FiPlus } from "react-icons/fi";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { FiFileText, FiActivity, FiUsers, FiTrendingUp } from "react-icons/fi";
import { FiFilter } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";
import { HiOutlineQuestionMarkCircle, HiOutlineChartBar, HiOutlineClock, HiOutlineCalendar } from "react-icons/hi";
import { Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CreateGuestQuizModal from "./CreateGuestQuizModal";
import AddGuestQuestionModal from "./AddGuestQuestionModal";
import BulkUploadGuestQuizModal from "./BulkUploadGuestQuizModal";
import ViewGuestQuizModal from "./ViewGuestQuizModal";
export type GuestQuiz = {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  course_id?: number;
  timer?: number;
  no_of_questions?: number;   // ✅ ADD THIS
};

const GuestQuizzes = () => {

  const [quizzes, setQuizzes] = useState<GuestQuiz[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [questionCounts, setQuestionCounts] = useState<{ [key: number]: number }>({});
  const [selectedQuiz, setSelectedQuiz] = useState("all");

  const [dashboard, setDashboard] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalAttempts: 0,
    avgCompletion: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredQuizzes, setFilteredQuizzes] = useState<GuestQuiz[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ADD QUESTION

  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // BULK CSV

  const [showBulkModal, setShowBulkModal] = useState(false);

  // SEARCH

  const [searchId, setSearchId] = useState("");

  const [questionsResult, setQuestionsResult] = useState<any[]>([]);
  const [viewingQuizId, setViewingQuizId] = useState<number | null>(null);

  const [successMessage, setSuccessMessage] = useState("");

  // ================= GET QUIZZES =================
  const fetchGuestQuizzes = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "/admin/guest-quiz/guest/"
      );

      if (Array.isArray(res.data)) {
        setQuizzes(res.data);

        // SUCCESS MESSAGE
        setSuccessMessage("Quiz created successfully");

        // AUTO REMOVE MESSAGE
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }

    } catch {
      setError("Failed to fetch guest quizzes");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE QUIZ =================
  const handleDelete = async (quizId: number) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await api.delete(
        `/admin/guest-quiz/${quizId}`
      );

      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));

      toast({
        title: "Deleted",
        description: "Quiz deleted successfully",
        className: "bg-red-600 text-white border-none",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const fetchQuestionCounts = async () => {

    const counts: { [key: number]: number } = {};

    await Promise.all(

      quizzes.map(async (quiz) => {

        try {

          const res = await api.get(

            `/admin/guest-quiz/quiz-view/${quiz.id}`

          );

          counts[quiz.id] = res.data?.length || 0;

        } catch {

          counts[quiz.id] = 0;

        }

      })

    );

    setQuestionCounts(counts);

  };
  const fetchDashboardData = async () => {
    try {
      // ✅ TOTAL QUIZZES
      const quizCountRes = await api.get(
        "/subadmin/quizzes/count"
      );

      // ✅ QUIZ LIST (for active count)
      const quizListRes = await api.get(
        "/guest/admin-view/quiz_listing"
      );

      // ✅ ANALYTICS (MAIN API YOU SHARED)
      const analyticsRes = await api.get(
        "/quiz/admin/results/analytics"
      );

      const quizzes = quizListRes.data || [];
      const analytics = analyticsRes.data || {};

      setDashboard({
        totalQuizzes: quizCountRes.data.total_quizzes || 0,

        // if backend gives status → adjust here
        activeQuizzes: quizzes.length,

        totalAttempts: analytics.total_attempts || 0,

        // convert 0.46 → 46%
        avgCompletion: Math.round((analytics.average_score || 0) * 100),
      });

    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };
  // ================= VIEW QUIZ QUESTIONS =================

  const handleViewQuiz = async (quizId: number) => {

    try {

      const res = await api.get(

        `/admin/guest-quiz/quiz-view/${quizId}`

      );

      setQuestionsResult(res.data || []);

      setViewingQuizId(quizId);

    } catch (error) {

      console.error("Error fetching quiz questions:", error);

      setQuestionsResult([]);

    }

  };

  // ================= BACK TO QUIZ LIST =================

  const handleBackToQuizzes = () => {

    setViewingQuizId(null);

    setQuestionsResult([]);

  };

  // ================= SEARCH =================

  const handleSearch = async () => {

    if (!searchId) return;

    const res = await api.get(

      `/admin/guest-quiz/quiz-view/${searchId}`

    );

    setQuestionsResult(res.data || []);

  };
  useEffect(() => {
    let filtered = quizzes;

    // 🔍 Search
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((q) =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(q.course_id || "").includes(searchTerm)
      );
    }

    // 🎯 Status Filter
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        // Keeping all as active by default for now based on UI
      } else if (statusFilter === "inactive") {
        filtered = []; // None are inactive right now
      }
    }

    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, quizzes]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  useEffect(() => {
    fetchGuestQuizzes();
    fetchDashboardData(); // ✅ IMPORTANT
  }, []);

  const isAnyModalOpen = showModal || showQuestionModal || showBulkModal || viewingQuizId !== null;

  return (

    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      {!isAnyModalOpen ? (
        <>
          {/* HEADER */}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

            {/* LEFT SIDE */}

            <div>

              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">

                Guest Quizzes

              </h1>

              <p className="text-xs sm:text-sm text-gray-500">

                Manage public quizzes accessible without login

              </p>

            </div>

            {/* RIGHT SIDE BUTTONS */}

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-start md:justify-end">

              {/* BULK UPLOAD */}

              <button

                onClick={() => {

                  setShowBulkModal(!showBulkModal);

                  setShowModal(false);

                  setShowQuestionModal(false);

                }}

                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"

              >

                <FiUpload className="text-base" />

                Bulk Upload

              </button>

              {/* ADD QUESTION */}

              <button

                onClick={() => {

                  setShowQuestionModal(!showQuestionModal);

                  setShowModal(false);

                  setShowBulkModal(false);

                }}

                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition"

              >

                <FiPlus className="text-base" />

                Add Question

              </button>

              {/* CREATE QUIZ */}

              <button

                onClick={() => {

                  setShowModal(!showModal);

                  setShowQuestionModal(false);

                  setShowBulkModal(false);

                }}

                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-md

               bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-95 transition"

              >

                <FiPlus className="text-base" />

                Create Quiz

              </button>

            </div>

          </div>

          <div className="bg-white p-5 rounded-xl shadow border mb-6">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-4">

              {/* ICON */}
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white p-3 rounded-xl">
                <FiFilter size={18} />
              </div>

              {/* TEXT */}
              <div>
                <h2 className="font-semibold text-gray-800">
                  Filters & Search
                </h2>
                <p className="text-sm text-gray-500">
                  Find and filter guest quizzes
                </p>
              </div>

            </div>

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4">

              {/* SEARCH INPUT */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search quizzes by name,id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border bg-gray-50 p-3 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* ICON */}
                <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-lg" />
              </div>

              {/* STATUS DROPDOWN */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border bg-gray-50 px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* RESET BUTTON */}
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-600"
              >
                <FiRefreshCw className="text-base" />
                Reset
              </button>

            </div>
          </div>

          {/* QUIZ TABLE / GRID */}
          <div className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition"
                    >
                      {/* HEADER */}
                      <div className="flex justify-between items-start mb-4">
                        {/* LEFT SIDE */}
                        <div className="flex-1 pr-2">
                          <h2 className="font-bold text-gray-900 text-lg leading-6 break-words">
                            {quiz.title}
                          </h2>
                          <p className="text-base text-gray-500 mt-1 leading-6 break-words max-h-[72px] overflow-hidden">
                            {quiz.description || "No description"}
                          </p>
                        </div>

                        {/* RIGHT SIDE */}
                        <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full whitespace-nowrap">
                          Active
                        </span>
                      </div>

                      {/* STATS */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                        {/* Questions */}
                        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
                          <HiOutlineQuestionMarkCircle className="text-indigo-500 text-2xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                          <p className="text-gray-500 text-xs sm:text-sm font-medium">Questions</p>
                          <p className="font-bold text-gray-900 text-base sm:text-xl">{quiz.no_of_questions ?? 0}</p>
                        </div>

                        {/* Course Id */}
                        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
                          <HiOutlineChartBar className="text-purple-500 text-2xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                          <p className="text-gray-500 text-xs sm:text-sm font-medium">Course Id</p>
                          <p className="font-bold text-gray-900 text-base sm:text-xl">{quiz.course_id}</p>
                        </div>

                        {/* Duration */}
                        <div className="bg-gray-50 rounded-xl p-2 sm:p-4 text-center shadow-sm">
                          <HiOutlineClock className="text-orange-500 text-2xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                          <p className="text-gray-500 text-xs sm:text-sm font-medium">Duration</p>
                          <p className="font-bold text-gray-900 text-base sm:text-xl">{quiz.timer}m</p>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewQuiz(quiz.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white py-2.5 rounded-lg text-base font-medium"
                        >
                          <FiEye className="text-lg" />
                          View
                        </button>

                        <button
                          onClick={() => handleDelete(quiz.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-base font-medium"
                        >
                          <FiTrash2 className="text-lg" />
                          Delete
                        </button>
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                        <HiOutlineCalendar className="text-gray-400 text-sm" />
                        <span>
                          Updated {quiz.created_at
                            ? new Date(quiz.created_at).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ================= PAGINATION ================= */}
                {filteredQuizzes.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
                    <div className="text-[13px] font-medium text-[#6B7280]">
                      Showing {filteredQuizzes.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredQuizzes.length)} of {filteredQuizzes.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                      >
                        Previous
                      </button>

                      {Array.from({ length: Math.ceil(filteredQuizzes.length / itemsPerPage) }).map((_, i) => {
                        const pageNumber = i + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === Math.ceil(filteredQuizzes.length / itemsPerPage) ||
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
                        onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredQuizzes.length / itemsPerPage), p + 1))}
                        disabled={currentPage === Math.ceil(filteredQuizzes.length / itemsPerPage) || filteredQuizzes.length === 0}
                        className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {showModal && (
            <CreateGuestQuizModal
              onClose={() => setShowModal(false)}
              onSuccess={() => {
                setShowModal(false);
                fetchGuestQuizzes();
              }}
            />
          )}

          {showQuestionModal && (
            <AddGuestQuestionModal
              quizzes={quizzes}
              onClose={() => {
                setShowQuestionModal(false);
                fetchGuestQuizzes();
              }}
            />
          )}

          {showBulkModal && (
            <BulkUploadGuestQuizModal
              quizzes={quizzes}
              onClose={() => {
                setShowBulkModal(false);
                fetchGuestQuizzes();
              }}
            />
          )}

          {viewingQuizId !== null && (
            <ViewGuestQuizModal
              quiz={quizzes.find((q) => q.id === viewingQuizId)}
              quizId={viewingQuizId}
              questions={questionsResult}
              onClose={handleBackToQuizzes}
            />
          )}
        </>
      )}

    </div>

  );

};

export default GuestQuizzes;
