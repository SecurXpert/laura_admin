


import { useEffect, useState } from "react";
import { FiBookOpen, FiSearch, FiUser, FiCalendar, FiFilter } from "react-icons/fi";
import { HiOutlineClock } from "react-icons/hi";
import { Skeleton } from "@/components/ui/skeleton";
import { BsCheckCircle } from "react-icons/bs";

type Quiz = {
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

/* ✅ NEW TYPES */
type QuizListing = {
  quiz_title: string;
  no_of_questions: number;
};

type QuizQuestion = {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  file_url: string | null;
};

const API_BASE = "https://lauratek.in:8000";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const lineData = [
  { v: 10 },
  { v: 25 },
  { v: 15 },
  { v: 35 },
  { v: 20 },
  { v: 40 }
];

const barData = [
  { v: 20 },
  { v: 40 },
  { v: 25 },
  { v: 45 },
  { v: 30 }
];





export default function Quizzes() {
  /* ================= EXISTING STATE ================= */
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /* ================= NEW STATE ================= */
  const [quizList, setQuizList] = useState<QuizListing[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [quizListError, setQuizListError] = useState<string | null>(null);

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
    ...new Set(quizzes.map((q) => q.course_id)),
  ];

  const uniqueInstructors = [
    ...new Set(quizzes.map((q) => q.instructor_name)),
  ];

  /* ================= APPLY FILTERS ================= */

  const applyFilters = () => {
    let filtered = [...quizzes];

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(lowerSearch) ||
          (quiz.description && quiz.description.toLowerCase().includes(lowerSearch)) ||
          quiz.instructor_name.toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(
        (quiz) => String(quiz.course_id) === selectedCourse
      );
    }

    if (selectedInstructor) {
      filtered = filtered.filter(
        (quiz) => quiz.instructor_name === selectedInstructor
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

  /* ================= INITIAL TABLE DATA ================= */

  useEffect(() => {
    setFilteredQuizzes(quizzes);
    setCurrentPage(1);
  }, [quizzes]);

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
          setCoursesList(data);
        }
      } catch (e) {
        console.error("Failed to fetch courses for mapping", e);
      }
    };
    fetchCourses();
  }, []);

  const getCourseName = (courseId: number) => {
    const course = coursesList.find(c => c.id === courseId);
    return course ? course.title : `Course ${courseId}`;
  };

  const [quizStatusCount, setQuizStatusCount] = useState<{
    total_quizzes: number;
    approved: number;
    pending: number;
  } | null>(null);
  const [quizStatusError, setQuizStatusError] = useState<string | null>(null);
  const [quizStatusLoading, setQuizStatusLoading] = useState(false);

  /* ================= NEW GET: QUIZ STATUS COUNT ================= */
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

  /* ================= EXISTING GET QUIZZES ================= */
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
      setQuizzes(data);


    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to load quizzes:", errorMsg);
      alert("Failed to load quizzes: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXISTING PUT ================= */
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
        `https://lauratek.in:8000/admin/quiz-status/${quizId}?approved=${approved}`,
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
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };
  /* ================= NEW GET: QUIZ LISTING ================= */
  const fetchQuizListing = async () => {
    const token = getToken();
    if (!token) {
      setQuizListError("No token found");
      console.error("No auth token");
      return;
    }

    try {
      setQuizListError(null);
      console.log("Fetching quiz listing from:", `${API_BASE}/admin/admin-view/quiz_listing_`);

      const res = await fetch(
        `${API_BASE}/admin/admin-view/quiz_listing_`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Quiz listing response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Quiz listing data received:", data);
      setQuizList(data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to load quiz listing:", errorMsg);
      setQuizListError(errorMsg);
    }
  };

  /* ================= NEW GET: QUIZ QUESTIONS ================= */
  const fetchQuizQuestions = async (quizTitle: string) => {
    const token = getToken();
    if (!token) {
      alert("No auth token found");
      return;
    }

    try {
      setQuestionLoading(true);
      setSelectedQuiz(quizTitle);

      const url = `${API_BASE}/admin/quiz-view/${quizTitle}`;
      console.log("Fetching questions from:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Questions response status:", res.status);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("Questions data received:", data);
      setQuestions(data);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to load questions:", errorMsg);
      alert("Failed to load questions: " + errorMsg);
    } finally {
      setQuestionLoading(false);
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

  const getSubmittedText = (quiz: Quiz) => {
    const minutes = ((quiz.id % 5) + 1) * 30;
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    console.log("Quizzes component mounted, initializing data fetch");
    fetchQuizzes();
    fetchQuizStatusCount();
  }, []);

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 sm:space-y-8">
      {/* ================= QUIZ CARDS ================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full box-border">

        {/* LEFT */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 truncate">
            Instructor Quizzes
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 break-words">
            Review, approve, and analyze quizzes created by instructors
          </p>
        </div>

        {/* RIGHT SEARCH */}
        <div className="mt-4 md:mt-0 relative w-full md:w-[350px]">
          <FiSearch className="absolute top-1/2 -translate-y-1/2 left-5 text-[#9CA3AF] text-[16px]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes, instructors, topics..."
            className="w-full h-[44px] pl-[42px] pr-4 rounded-[100px] border border-[#E5E7EB] bg-white text-[#4B5563] text-[14px] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all shadow-sm"
          />
        </div>
      </div>
      <div className="w-full box-border">
        {/* ================= RESPONSIVE STATS CARDS ================= */}

        <div className="w-full max-w-full overflow-hidden px-0 sm:px-1">
          <div
            className="
      grid
      grid-cols-1
      sm:grid-cols-2
      xl:grid-cols-3
      gap-4
      sm:gap-5
      lg:gap-6
      w-full
      items-stretch
    "
          >
            {/* ================= TOTAL QUIZZES ================= */}
            <div
              className="
        relative
        w-full
        min-w-0
        max-w-full
        bg-white
        rounded-3xl
        border border-gray-100/80
        shadow-[0_4px_24px_rgba(0,0,0,0.04)]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        transition-all
        duration-300
        overflow-hidden
        p-5
        sm:p-6
        min-h-[210px]
        flex
        flex-col
        justify-between
      "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3 w-full min-w-0">
                {/* LEFT */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight truncate">
                    Total Quizzes
                  </p>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                    {quizStatusLoading
                      ? "..."
                      : quizStatusCount?.total_quizzes ?? quizzes.length}
                  </h2>

                  <p className="text-[#10B981] text-xs font-semibold mt-1.5 truncate">
                    +12 this week
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(139,92,246,0.3)]">
                  <FiBookOpen className="text-white text-lg sm:text-xl" />
                </div>
              </div>

              {/* GRAPH WITH UNDERLYING SOFT GRADIENT FILL */}
              <div className="w-full h-[65px] sm:h-[72px] mt-4 overflow-hidden">
                <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25 L 160 50 L 0 50 Z"
                    fill="url(#purpleArea)"
                  />
                  <path
                    d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25"
                    fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* ================= PENDING APPROVALS ================= */}
            <div
              className="
        relative
        w-full
        min-w-0
        max-w-full
        bg-white
        rounded-3xl
        border border-gray-100/80
        shadow-[0_4px_24px_rgba(0,0,0,0.04)]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        transition-all
        duration-300
        overflow-hidden
        p-5
        sm:p-6
        min-h-[210px]
        flex
        flex-col
        justify-between
      "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3 w-full min-w-0">
                {/* LEFT */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight truncate">
                    Pending Approvals
                  </p>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                    {quizStatusLoading
                      ? "..."
                      : quizStatusCount?.pending ??
                      quizzes.filter((q) => q.approved === 0).length}
                  </h2>

                  <p className="text-gray-400 text-xs font-medium mt-1.5 truncate">
                    Requires action
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F97316] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(249,115,22,0.3)]">
                  <HiOutlineClock className="text-white text-xl sm:text-2xl" />
                </div>
              </div>

              {/* BAR GRAPH WITH SOLID ORANGE FILL */}
              <div className="w-full h-[70px] sm:h-[78px] flex items-end gap-[6px] mt-4 px-2">
                {[30, 20, 50, 15, 40, 20, 25].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-[4px] bg-[#F97316] transition-all duration-300"
                    style={{ height: `${(h / 50) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* ================= APPROVED TODAY ================= */}
            <div
              className="
        relative
        w-full
        min-w-0
        max-w-full
        bg-white
        rounded-3xl
        border border-gray-100/80
        shadow-[0_4px_24px_rgba(0,0,0,0.04)]
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
        hover:-translate-y-1
        transition-all
        duration-300
        overflow-hidden
        p-5
        sm:p-6
        min-h-[210px]
        flex
        flex-col
        justify-between
      "
            >
              {/* TOP */}
              <div className="flex items-start justify-between gap-3 w-full min-w-0">
                {/* LEFT */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-tight truncate">
                    Approved Today
                  </p>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl leading-none font-extrabold text-gray-900 mt-2 truncate">
                    {quizStatusLoading
                      ? "..."
                      : quizStatusCount?.approved ??
                      quizzes.filter((q) => q.approved === 1).length}
                  </h2>

                  <p className="text-[#10B981] text-xs font-semibold mt-1.5 truncate">
                    +3 from yesterday
                  </p>
                </div>

                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#10B981] flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(16,185,129,0.3)]">
                  <BsCheckCircle className="text-white text-lg sm:text-xl" />
                </div>
              </div>

              {/* GRAPH WITH PURE WAVE STROKE */}
              <div className="w-full h-[65px] sm:h-[72px] mt-4 overflow-hidden">
                <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
                  <path
                    d="M 0 35 C 7 35, 8 45, 15 45 C 25 45, 25 25, 35 25 C 45 25, 45 45, 55 45 C 67 45, 68 10, 80 10 C 92 10, 93 45, 105 45 C 115 45, 115 15, 125 15 C 135 15, 135 40, 145 40 C 152 40, 153 25, 160 25"
                    fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FILTER SECTION ================= */}

      <div className="w-full bg-white border border-[#ECECF2] rounded-[24px] p-4 sm:p-5 lg:p-6 mb-8 overflow-hidden box-border max-w-full">

        {/* FILTER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 w-full box-border">

          {/* COURSES */}
          <div className="relative w-full box-border">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-10 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
            >
              <option value="">All Courses</option>
              {uniqueCourses.map((course) => (
                <option key={course} value={course}>
                  Course {course}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>

          {/* INSTRUCTORS */}
          <div className="relative w-full box-border">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-10 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
            >
              <option value="">All Instructor</option>
              {uniqueInstructors.map((instructor) => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>

          {/* STATUS */}
          <div className="relative w-full box-border">
            <BsCheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-10 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
            </div>
          </div>

          {/* DATE */}
          <div className="relative w-full box-border">
            <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-[52px] w-full rounded-[16px] border border-[#E5E7EB] bg-gray-50 pl-11 pr-4 text-[15px] text-[#111827] outline-none focus:ring-2 focus:ring-[#8B5CF6] box-border appearance-none transition-all"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 w-full box-border">

            <button
              onClick={resetFilters}
              className="
          text-[#6B7280]
          text-[15px]
          font-medium
          hover:text-black
          transition
        "
            >
              Reset
            </button>

            <button
              onClick={applyFilters}
              className="
          h-[52px]
          px-6
          rounded-full
          bg-gradient-to-r
          from-[#7C3AED]
          to-[#A855F7]
          text-white
          text-[15px]
          font-semibold
          shadow-[0_8px_18px_rgba(124,58,237,0.25)]
          hover:scale-[1.02]
          transition-all
          whitespace-nowrap
        "
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>

      {quizStatusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Quiz status count failed to load: {quizStatusError}
        </div>
      )}

      {/* ================= EXISTING QUIZZES TABLE ================= */}
      <div className="w-full box-border max-w-full">
        <h1 className="text-2xl font-bold mb-6">Quizzes Approval</h1>

        {loading ? (
          <div className="space-y-4 mt-6 w-full">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-x-auto shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] pb-2 mb-10 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="min-w-[1000px] w-full border-collapse text-sm">
              <thead className="bg-[#F9FAFB80]">
                <tr className="border-t-2 border-b-2 border-gray-100">
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Quiz</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Instructor</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Course</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Questions</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Timer</th>

                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Created At</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Submitted</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Status</th>
                  <th className="px-6 py-4 text-left text-[14px] font-bold uppercase tracking-wider text-[#6B7280]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-gray-100">
                {filteredQuizzes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((quiz) => {
                  return (
                    <tr
                      key={quiz.id}
                      className="hover:bg-gray-50/50 transition-colors bg-white"
                    >
                      {/* QUIZ */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-bold text-[#1F2937] text-[16px] leading-tight max-w-[200px]">
                          {quiz.title}
                        </div>
                        <div className="text-[#6B7280] text-[16px] mt-1.5 max-w-[200px] truncate">
                          Topic: {quiz.description || "N/A"}
                        </div>
                      </td>

                      {/* INSTRUCTOR */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-semibold text-[#1F2937] text-[16px]">
                          {quiz.instructor_name}
                        </div>
                      </td>

                      {/* COURSE */}
                      <td className="px-6 py-5 align-top">
                        <div className="font-semibold text-[#1F2937] text-[16px]">
                          {getCourseName(quiz.course_id)}
                        </div>
                      </td>

                      {/* QUESTIONS */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col items-start">
                          <div className="font-bold text-[#1F2937] text-[16px] leading-none">
                            {quiz.no_of_questions}
                          </div>
                          <div className="font-bold text-[#1F2937] text-[16px] mt-1 leading-none">
                            Questions
                          </div>
                          <div className="w-12 h-1.5 flex rounded-full overflow-hidden mt-2.5">
                            <div className="bg-[#10B981] flex-1"></div>
                            <div className="bg-[#F59E0B] flex-1"></div>
                            <div className="bg-[#EF4444] flex-1"></div>
                          </div>
                        </div>
                      </td>

                      {/* TIMER */}
                      <td className="px-6 py-5 align-top">
                        <div className="inline-flex items-center justify-center px-[12px] py-[5px] rounded-full text-[16px] font-bold bg-[#EFF6FF] text-[#3B82F6] mt-0.5 whitespace-nowrap">
                          {quiz.timer} Min
                        </div>
                      </td>
                      {/* CREATED AT */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col items-start text-[#6B7280] text-[16px] font-medium whitespace-nowrap mt-1">
                          <span>{formatDate(quiz.created_at)}</span>
                          <span className="text-[#9CA3AF] text-[16px] mt-0.5">{formatTime(quiz.created_at)}</span>
                        </div>
                      </td>

                      {/* SUBMITTED */}
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col items-start text-[#6B7280] text-[16px] font-medium whitespace-nowrap mt-1">
                          <span>{formatDate(quiz.updated_at || quiz.created_at)}</span>
                          <span className="text-[#9CA3AF] text-[16px] mt-0.5">{formatTime(quiz.updated_at || quiz.created_at)}</span>
                        </div>
                      </td>




                      {/* STATUS */}
                      <td className="px-6 py-5 align-top">
                        <div className={`inline-flex items-center justify-center px-[12px] py-[5px] rounded-full text-[16px] font-bold mt-0.5
                          ${quiz.approved === 1 ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEF3C7] text-[#D97706]"}`}>
                          {quiz.approved === 1 ? "Approved" : "Pending"}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-5 align-top">
                        <div className="relative inline-block w-[110px]">
                          <select
                            value={quiz.approved === 1 ? "approved" : "pending"}
                            disabled={updatingId === quiz.id}
                            onChange={async (e) => {
                              const approvedValue = e.target.value === "approved";
                              await updateQuizStatus(quiz.id, approvedValue);
                            }}
                            className="appearance-none w-full px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] text-[16px] font-semibold outline-none cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all shadow-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#6B7280]">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ================= PAGINATION ================= */}
            <div className="flex flex-col sm:flex-row items-center justify-start px-6 py-5 bg-white border-t border-[#F3F4F6] rounded-b-[24px] gap-6">
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
          </div>
        )}
      </div>
    </div>
  );
}
