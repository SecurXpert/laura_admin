import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { FaTrash } from "react-icons/fa";
import { FiClock, FiUser } from "react-icons/fi";
import { FiUpload, FiPlus } from "react-icons/fi";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { FiFileText, FiActivity, FiUsers, FiTrendingUp } from "react-icons/fi";
import { FiFilter } from "react-icons/fi";
import { FiSearch } from "react-icons/fi";
import { FiRefreshCw } from "react-icons/fi";
import { HiOutlineQuestionMarkCircle, HiOutlineChartBar, HiOutlineClock, HiOutlineCalendar } from "react-icons/hi";
import { Save, HelpCircle, BarChart3, Clock, Calendar, Eye, Trash2 } from "lucide-react";
import CreateGuestQuizModal from "./CreateGuestQuizModal";
import AddGuestQuestionModal from "./AddGuestQuestionModal";
import BulkUploadGuestQuizModal from "./BulkUploadGuestQuizModal";
import ViewGuestQuizModal from "./ViewGuestQuizModal";

const API_BASE = "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

export type GuestQuiz = {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  course_id?: number;
  timer?: number;
  no_of_questions?: number;
};

const GuestQuizCardItem: React.FC<{
  quiz: GuestQuiz;
  onView: (id: number) => void;
  onDelete: (id: number) => void;
}> = ({ quiz, onView, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const descText = quiz.description || "No description";
  const isLongText = descText.length > 60 || descText.split("\n").length > 2;

  return (
    <div
      className="relative overflow-hidden p-4 sm:p-6 rounded-[24px] border border-gray-100 shadow-sm bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between w-full min-w-0 h-full"
      style={{ borderTop: "1.35px solid #F3F4F6" }}
    >
      <div className="relative z-10 w-full min-w-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-5 w-full min-w-0">
          <div className="w-full min-w-0">
            <h3 className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight leading-tight capitalize break-words truncate w-full" title={quiz.title}>
              {quiz.title}
            </h3>
            <div className="mt-1.5">
              <div className={`text-xs sm:text-sm text-slate-500 leading-relaxed break-words whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-3" : ""}`}>
                {descText}
              </div>
              {isLongText && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 mt-1.5 focus:outline-none transition-colors cursor-pointer block"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 sm:gap-2.5 mb-5 w-full min-w-0">
          {/* Questions Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Questions</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {quiz.no_of_questions ?? 0}
            </span>
          </div>

          {/* Course Id Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Course Id</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {quiz.course_id ?? "—"}
            </span>
          </div>

          {/* Duration Box */}
          <div className="bg-slate-50/70 border border-slate-100/60 rounded-[16px] p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center min-w-0 flex-1">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mx-auto mb-1 shrink-0" />
            <span className="text-[10px] sm:text-[11px] md:text-xs text-slate-400 font-medium leading-tight block text-center">Duration</span>
            <span className="text-xs sm:text-sm md:text-base font-bold text-slate-800 mt-1 block text-center break-words">
              {quiz.timer !== undefined ? `${quiz.timer}m` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions & Footer */}
      <div className="w-full min-w-0 mt-auto">
        <div className="flex flex-wrap gap-1.5 sm:gap-2.5 w-full mb-4">
          <button
            className="flex-1 min-w-[70px] rounded-[12px] text-white font-semibold py-2 sm:py-2.5 h-10 sm:h-11 flex items-center justify-center gap-1.5 border-0 shadow-sm cursor-pointer transition-all duration-200 hover:opacity-95 text-[11px] sm:text-sm px-2 whitespace-nowrap"
            style={{ background: "linear-gradient(90deg, #2563EB 0%, #3161EB 7.14%, #3B5FEB 14.29%, #435CEB 21.43%, #4A5AEC 28.57%, #5157EC 35.71%, #5755EC 42.86%, #5C52EC 50%, #624FEC 57.14%, #664CEC 64.29%, #6B49EC 71.43%, #7045ED 78.57%, #7442ED 85.71%, #783EED 92.86%, #7C3AED 100%)" }}
            onClick={() => onView(quiz.id)}
          >
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>View</span>
          </button>

          <button
            className="flex-1 min-w-[70px] rounded-[12px] bg-[#ff4b4c] hover:bg-[#ef4444] text-white font-semibold py-2 sm:py-2.5 h-10 sm:h-11 flex items-center justify-center gap-1.5 border-0 shadow-sm cursor-pointer transition-all duration-200 text-[11px] sm:text-sm px-2 whitespace-nowrap"
            onClick={() => onDelete(quiz.id)}
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Delete</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-3 border-t border-slate-50">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            Updated {quiz.created_at
              ? new Date(quiz.created_at).toLocaleDateString('en-GB')
              : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

const GuestQuiz = () => {
  const [quizzes, setQuizzes] = useState<GuestQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [questionCounts, setQuestionCounts] = useState<{ [key: number]: number }>({});
  const [selectedQuiz, setSelectedQuiz] = useState("all");



  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredQuizzes, setFilteredQuizzes] = useState<GuestQuiz[]>([]);

  // PAGINATION
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
      const res = await axios.get(
        `${API_BASE}/admin/guest-quiz/guest/`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (Array.isArray(res.data)) {
        setQuizzes([...res.data].reverse());
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
      await axios.delete(
        `${API_BASE}/sub-admin/guest-quiz/${quizId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      toast({
        title: "Deleted",
        description: "Guest Quiz deleted successfully",
        className: "bg-red-600 text-white font-semibold border-0 shadow-lg",
        duration: 3000,
      });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete quiz.",
        variant: "destructive",
      });
    }
  };

  const fetchQuestionCounts = async () => {
    const counts: { [key: number]: number } = {};
    await Promise.all(
      quizzes.map(async (quiz) => {
        try {
          const res = await axios.get(
            `${API_BASE}/sub-admin/guest-quiz/quiz-view/${quiz.id}`,
            {
              headers: {
                Authorization: `Bearer ${getToken()}`,
              },
            }
          );
          counts[quiz.id] = res.data?.length || 0;
        } catch {
          counts[quiz.id] = 0;
        }
      })
    );
    setQuestionCounts(counts);
  };



  // ================= VIEW QUIZ QUESTIONS =================
  const handleViewQuiz = async (quizId: number) => {
    try {
      const res = await axios.get(
        `${API_BASE}/sub-admin/guest-quiz/quiz-view/${quizId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
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
    try {
      const res = await axios.get(
        `${API_BASE}/sub-admin/guest-quiz/quiz-view/${searchId}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );
      setQuestionsResult(res.data || []);
    } catch (err) {
      console.error("Search error:", err);
    }
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
    // 🎯 Selected Quiz Filter
    if (selectedQuiz !== "all") {
      filtered = filtered.filter(
        (q) => q.id === Number(selectedQuiz)
      );
    }
    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedQuiz, quizzes]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedQuiz("all");
  };
  useEffect(() => {
    fetchGuestQuizzes();
  }, []);
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAnyModalOpen = showModal || showQuestionModal || showBulkModal || viewingQuizId !== null;

  return (
    <div className="w-full space-y-6">
      {!isAnyModalOpen ? (
        <>
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            {/* LEFT SIDE */}
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Guest Quizzes</h1>
              <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
                Manage public quizzes accessible without login
              </p>
            </div>
            {/* RIGHT SIDE BUTTONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              {/* BULK UPLOAD */}
              <button
                onClick={() => {
                  setShowBulkModal(!showBulkModal);
                  setShowModal(false);
                  setShowQuestionModal(false);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition h-10"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition h-10"
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
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium shadow-md
               bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-95 transition h-10"
              >
                <FiPlus className="text-base" />
                Create Quiz
              </button>
            </div>
          </div>



          {/* FILTERS */}
          <div className="bg-white p-5 rounded-xl shadow border mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white p-3 rounded-xl">
                <FiFilter size={18} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">
                  Filters & Search
                </h2>
                <p className="text-sm text-gray-500">
                  Find and filter guest quizzes
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search quizzes by name, course id..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border bg-gray-50 p-2.5 pl-10 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-10"
                />
                <FiSearch className="absolute left-3 top-3.5 text-gray-400 text-base" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <select
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                  className="w-full sm:w-48 border bg-gray-50 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-10"
                >
                  <option value="all">All Quizzes</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm h-10 shrink-0"
                >
                  <FiRefreshCw className="text-base" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Guest Quizzes Cards Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">Guest Quiz List</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-slate-500 font-medium animate-pulse">Loading guest quizzes...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full min-w-0">
                {paginatedQuizzes.map((quiz) => (
                  <GuestQuizCardItem
                    key={quiz.id}
                    quiz={quiz}
                    onView={handleViewQuiz}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {totalPages > 0 && (
                <div className="flex justify-center items-center gap-2 mt-8 mb-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition ${currentPage === i + 1
                            ? "bg-[#4F46E5] text-white border-[#4F46E5]"
                            : "bg-white border text-gray-600 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-lg border bg-white text-gray-600 disabled:opacity-50 disabled:pointer-events-none hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
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

export default GuestQuiz;