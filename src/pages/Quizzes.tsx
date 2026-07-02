import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from "@/services/api/api";
import { QuizzesHeader } from "./QuizzesComponents/QuizzesHeader";
import { QuizzesStatsGrid } from "./QuizzesComponents/QuizzesStatsGrid";
import { QuizzesFilterSection } from "./QuizzesComponents/QuizzesFilterSection";
import { QuizzesTable, Quiz } from "./QuizzesComponents/QuizzesTable";
import { QuizzesPagination } from "./QuizzesComponents/QuizzesPagination";
import { QuizzesStatusModal } from "./QuizzesComponents/QuizzesStatusModal";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMessage, setStatusModalMessage] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [coursesList, setCoursesList] = useState<any[]>([]);

  const [quizStatusCount, setQuizStatusCount] = useState<{
    total_quizzes: number;
    approved: number;
    pending: number;
  } | null>(null);
  const [quizStatusError, setQuizStatusError] = useState<string | null>(null);
  const [quizStatusLoading, setQuizStatusLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCoursesList(
            Array.isArray(data)
              ? data
              : Array.isArray(data?.courses)
              ? data.courses
              : Array.isArray(data?.data)
              ? data.data
              : []
          );
        }
      } catch (e) {
        console.error("Failed to fetch courses for mapping", e);
      }
    };
    fetchCourses();
  }, []);

  const getCourseName = (courseId: number) => {
    const course = coursesList.find((c) => c.id === courseId);
    return course ? course.title || course.name : `Course ${courseId}`;
  };

  const uniqueCourses = [...new Set(quizzes.map((q) => q.course_id))];
  const uniqueInstructors = [
    ...new Set(
      quizzes.map((q) =>
        q.instructor_name ? String(q.instructor_name).trim() : ""
      )
    ),
  ].filter(Boolean);

  useEffect(() => {
    let filtered = [...quizzes];

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(lowerSearch) ||
          (quiz.description &&
            quiz.description.toLowerCase().includes(lowerSearch)) ||
          (quiz.instructor_name &&
            String(quiz.instructor_name)
              .trim()
              .toLowerCase()
              .includes(lowerSearch)) ||
          getCourseName(quiz.course_id).toLowerCase().includes(lowerSearch)
      );
    }

    if (selectedCourse)
      filtered = filtered.filter(
        (quiz) => String(quiz.course_id) === selectedCourse
      );
    if (selectedInstructor)
      filtered = filtered.filter(
        (quiz) =>
          quiz.instructor_name &&
          String(quiz.instructor_name).trim() === selectedInstructor
      );
    if (selectedStatus)
      filtered = filtered.filter((quiz) =>
        selectedStatus === "approved"
          ? quiz.approved === 1
          : quiz.approved === 0
      );
    if (selectedDate)
      filtered = filtered.filter((quiz) => {
        const d = new Date(quiz.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}` === selectedDate;
      });

    setFilteredQuizzes(filtered);
    setCurrentPage(1);
  }, [
    search,
    selectedCourse,
    selectedInstructor,
    selectedStatus,
    selectedDate,
    quizzes,
    coursesList,
  ]);

  const fetchQuizStatusCount = async () => {
    const token = getToken();
    if (!token) return setQuizStatusError("No auth token found");
    try {
      setQuizStatusLoading(true);
      setQuizStatusError(null);
      const res = await fetch(`${API_BASE}/admin/quiz-status-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setQuizStatusCount({
        total_quizzes: Number(data.total_quizzes) || 0,
        approved: Number(data.approved) || 0,
        pending: Number(data.pending) || 0,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setQuizStatusError(errorMsg);
    } finally {
      setQuizStatusLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    const token = getToken();
    if (!token) return alert("Auth token missing");
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Quiz[] = await res.json();
      setQuizzes([...data].sort((a, b) => b.id - a.id));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      alert("Failed to load quizzes: " + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateQuizStatus = async (quizId: number, approved: boolean) => {
    const token = getToken();
    if (!token) return alert("Auth token missing");
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
      if (!response.ok) throw new Error("Status update failed");

      const oldQuiz = quizzes.find((q) => q.id === quizId);
      const wasApproved = oldQuiz?.approved === 1;

      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === quizId ? { ...quiz, approved: approved ? 1 : 0 } : quiz
        )
      );

      if (oldQuiz && wasApproved !== approved) {
        setQuizStatusCount((prev) =>
          prev
            ? {
                ...prev,
                approved: approved ? prev.approved + 1 : prev.approved - 1,
                pending: approved ? prev.pending - 1 : prev.pending + 1,
              }
            : prev
        );
      }
      setStatusModalMessage(
        `Quiz status successfully updated to ${
          approved ? "Approved" : "Pending"
        }.`
      );
      setStatusModalOpen(true);
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    fetchQuizzes();
    fetchQuizStatusCount();
  }, []);

  const quizzesSlice = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border space-y-6 sm:space-y-8">
      <QuizzesHeader search={search} onSearchChange={setSearch} />

      <QuizzesStatsGrid
        quizStatusLoading={quizStatusLoading}
        totalQuizzesCount={quizStatusCount?.total_quizzes ?? quizzes.length}
        pendingCount={
          quizStatusCount?.pending ??
          quizzes.filter((q) => q.approved === 0).length
        }
        approvedCount={
          quizStatusCount?.approved ??
          quizzes.filter((q) => q.approved === 1).length
        }
      />

      <QuizzesFilterSection
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
        uniqueCourses={uniqueCourses as number[]}
        getCourseName={getCourseName}
        selectedInstructor={selectedInstructor}
        onInstructorChange={setSelectedInstructor}
        uniqueInstructors={uniqueInstructors}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onReset={() => {
          setSelectedCourse("");
          setSelectedInstructor("");
          setSelectedStatus("");
          setSelectedDate("");
          setSearch("");
        }}
        onApply={() => {}}
      />

      {quizStatusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Quiz status count failed to load: {quizStatusError}
        </div>
      )}

      <QuizzesTable
        loading={loading}
        quizzesSlice={quizzesSlice}
        getCourseName={getCourseName}
        formatDate={formatDate}
        formatTime={formatTime}
        updatingId={updatingId}
        onUpdateStatus={updateQuizStatus}
        paginationComponent={
          <QuizzesPagination
            currentPage={currentPage}
            totalFiltered={filteredQuizzes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        }
      />

      <QuizzesStatusModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        message={statusModalMessage}
      />
    </div>
  );
}
