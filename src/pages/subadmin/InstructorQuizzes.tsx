import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";
import InstructorQuizzesStats from "./InstructorQuizzesStats";
import InstructorQuizzesFilter from "./InstructorQuizzesFilter";
import InstructorQuizzesTable from "./InstructorQuizzesTable";

export type Quiz = {
  id: number;
  title: string;
  description: string;
  course_id: number;
  approved: number;
  model_type: string | null;
  no_of_questions: number;
  instructor_name: string;
  timer: number;
  created_at: string;
  updated_at: string;
};

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

export default function InstructorQuizzes() {
  /* ================= EXISTING STATE ================= */
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [popupMsg, setPopupMsg] = useState<{ title: string; text: string; success: boolean } | null>(null);

  /* ================= FILTER STATES ================= */
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ================= UNIQUE DROPDOWN VALUES ================= */
  const uniqueCourses = [
    ...new Set(quizzes.map((q) => q.course_id).filter((id) => id !== null && id !== undefined)),
  ];

  const uniqueInstructors = [
    ...new Set(quizzes.map((q) => q.instructor_name ? String(q.instructor_name).trim() : "")),
  ].filter(Boolean);

  /* ================= APPLY FILTERS ================= */
  const applyFilters = () => {
    let filtered = [...quizzes];

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          (quiz.title && quiz.title.toLowerCase().includes(lowerSearch)) ||
          (quiz.description && quiz.description.toLowerCase().includes(lowerSearch)) ||
          (quiz.instructor_name && String(quiz.instructor_name).trim().toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(
        (quiz) => String(quiz.course_id) === selectedCourse
      );
    }

    if (selectedInstructor) {
      filtered = filtered.filter(
        (quiz) => quiz.instructor_name && String(quiz.instructor_name).trim() === selectedInstructor
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((quiz) =>
        selectedStatus === "approved"
          ? quiz.approved === 1
          : quiz.approved === 0
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (quiz) => {
          if (!quiz.created_at) return false;
          const quizDate = new Date(quiz.created_at);
          const year = quizDate.getFullYear();
          const month = String(quizDate.getMonth() + 1).padStart(2, '0');
          const day = String(quizDate.getDate()).padStart(2, '0');
          const localDateStr = `${year}-${month}-${day}`;
          return localDateStr === selectedDate;
        }
      );
    }

    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  };

  /* ================= RESET FILTERS ================= */
  const resetFilters = () => {
    setSelectedCourse("");
    setSelectedInstructor("");
    setSelectedStatus("");
    setSelectedDate("");
    setSearch("");
    setFilteredQuizzes(quizzes);
    setCurrentPage(1);
  };

  /* ================= AUTO FILTER ON CHANGE ================= */
  useEffect(() => {
    applyFilters();
  }, [search, selectedCourse, selectedInstructor, selectedStatus, selectedDate, quizzes]);

  const [coursesList, setCoursesList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCoursesList(data);
          } else if (data && Array.isArray(data.courses)) {
            setCoursesList(data.courses);
          } else if (data && Array.isArray(data.data)) {
            setCoursesList(data.data);
          } else {
            setCoursesList([]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch courses for mapping", e);
        setCoursesList([]);
      }
    };
    fetchCourses();
  }, []);

  const getCourseName = (courseId: number) => {
    const course = coursesList.find(c => Number(c.id) === Number(courseId));
    return course ? course.title : `Course ${courseId}`;
  };

  const [quizStatusCount, setQuizStatusCount] = useState<{
    total_quizzes: number;
    approved: number;
    pending: number;
  } | null>(null);
  const [quizStatusError, setQuizStatusError] = useState<string | null>(null);
  const [quizStatusLoading, setQuizStatusLoading] = useState(false);

  /* ================= GET: QUIZ STATUS COUNT ================= */
  const fetchQuizStatusCount = async () => {
    const token = getToken();
    if (!token) {
      setQuizStatusError("No auth token found");
      return;
    }

    try {
      setQuizStatusLoading(true);
      setQuizStatusError(null);

      const res = await fetch(`${API_BASE}/admin/quiz-status-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setQuizStatusCount({
        total_quizzes: Number(data.total_quizzes) || 0,
        approved: Number(data.approved) || 0,
        pending: Number(data.pending) || 0,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to load quiz status count:", errorMsg);
      setQuizStatusError(errorMsg);
    } finally {
      setQuizStatusLoading(false);
    }
  };

  /* ================= GET QUIZZES ================= */
  const fetchQuizzes = async () => {
    const token = getToken();
    if (!token) return alert("Auth token missing");

    try {
      setLoading(true);
      console.log("Fetching quizzes from:", `${API_BASE}/admin/quizzes`);

      const res = await fetch(`${API_BASE}/admin/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Quizzes response status:", res.status);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Quiz[] = await res.json();
      console.log("Quizzes data received:", data);
      
      const sortedData = [...data].sort((a, b) => b.id - a.id);
      setQuizzes(sortedData);

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to load quizzes:", errorMsg);
      alert("Failed to load quizzes: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PUT ================= */
  const updateQuizStatus = async (
    quizId: number,
    approved: boolean
  ) => {
    const token = getToken();

    if (!token) {
      alert("Auth token missing");
      return;
    }

    try {
      setUpdatingId(quizId);

      const response = await fetch(
        `${API_BASE}/admin/quiz-status/${quizId}?approved=${approved}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Status update failed");
      }

      const oldQuiz = quizzes.find(q => q.id === quizId);
      const wasApproved = oldQuiz?.approved === 1;

      // update ui instantly
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId
            ? {
              ...quiz,
              approved: approved ? 1 : 0,
            }
            : quiz
        )
      );

      // update stats cards instantly
      if (oldQuiz && wasApproved !== approved) {
        setQuizStatusCount((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            approved: approved ? prev.approved + 1 : prev.approved - 1,
            pending: approved ? prev.pending - 1 : prev.pending + 1,
          };
        });
      }
      setPopupMsg({
        title: "Status Updated",
        text: `Quiz status successfully updated to ${approved ? "Approved" : "Pending"}.`,
        success: true
      });
    } catch (error) {
      console.error(error);
      setPopupMsg({
        title: "Update Failed",
        text: "Failed to update quiz status. Please try again.",
        success: false
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    console.log("InstructorQuizzes component mounted, initializing data fetch");
    fetchQuizzes();
    fetchQuizStatusCount();
  }, []);

  return (
    <div className="w-full max-w-full box-border space-y-6 sm:space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full box-border">
        {/* LEFT */}
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
            Instructor Quizzes
          </h1>
          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Review, approve, and analyze quizzes created by instructors
          </p>
        </div>

        {/* RIGHT SEARCH */}
        {/* <div className="mt-4 md:mt-0 relative w-full md:w-[350px]">
          <FiSearch className="absolute top-1/2 -translate-y-1/2 left-5 text-[#9CA3AF] text-[16px]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes, instructors, topics..."
            className="w-full h-[44px] pl-[42px] pr-4 rounded-[100px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[14px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all shadow-sm"
          />
        </div> */}
      </div>

      <div className="w-full box-border">
        <InstructorQuizzesStats 
          quizStatusLoading={quizStatusLoading}
          quizStatusCount={quizStatusCount}
          quizzes={quizzes}
        />
      </div>

      <InstructorQuizzesFilter
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedInstructor={selectedInstructor}
        setSelectedInstructor={setSelectedInstructor}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        uniqueCourses={uniqueCourses}
        uniqueInstructors={uniqueInstructors}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        getCourseName={getCourseName}
      />

      {quizStatusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Quiz status count failed to load: {quizStatusError}
        </div>
      )}

      <InstructorQuizzesTable 
        loading={loading}
        filteredQuizzes={filteredQuizzes}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        getCourseName={getCourseName}
        updatingId={updatingId}
        updateQuizStatus={updateQuizStatus}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      {/* Center Popup Message Modal */}
      {popupMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-2xl border border-gray-100 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 text-3xl font-bold ${popupMsg.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {popupMsg.success ? '✓' : '✕'}
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-2">{popupMsg.title}</h3>
            <p className="text-[15px] text-[#6B7280] mb-6 leading-relaxed">{popupMsg.text}</p>
            <button
              onClick={() => setPopupMsg(null)}
              className="w-full h-[48px] bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-semibold text-[15px] rounded-full shadow-md hover:opacity-95 transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
