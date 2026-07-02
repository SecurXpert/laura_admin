import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import AddAdminQuestionModal from "./AddAdminQuestionModal";
import BulkUploadAdminQuizModal from "./BulkUploadAdminQuizModal";
import CreateAdminQuizForm, { Quiz } from "./CreateAdminQuizForm";
import { QuizStats } from "./AdminQuizComponents/QuizStats";
import { QuizCard } from "./AdminQuizComponents/QuizCard";
import { ViewQuestions } from "./AdminQuizComponents/ViewQuestions";
import { AdminQuizHeader } from "./AdminQuizComponents/AdminQuizHeader";
import { AdminQuizFilters } from "./AdminQuizComponents/AdminQuizFilters";
import { AdminQuizPagination } from "./AdminQuizComponents/AdminQuizPagination";
import { AdminQuizDeleteDialog } from "./AdminQuizComponents/AdminQuizDeleteDialog";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

export default function AdminQuizzes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form visibility
  const [activeForm, setActiveForm] = useState<
    "none" | "quiz" | "add-question" | "bulk-upload" | "view-questions"
  >("none");

  // Viewing quiz questions states
  const [viewingQuiz, setViewingQuiz] = useState<Quiz | null>(null);
  const [viewingQuestions, setViewingQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Quiz form fields
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedQuiz, setSelectedQuiz] = useState("all");
  const [questionCounts, setQuestionCounts] = useState<{
    [key: number]: number;
  }>({});
  const [analytics, setAnalytics] = useState({
    total_attempts: 0,
    average_score: 0,
  });
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || quiz.status === statusFilter;

    const matchesDropdown =
      selectedQuiz === "all" || quiz.id.toString() === selectedQuiz;

    return matchesSearch && matchesStatus && matchesDropdown;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, selectedQuiz]);

  const fetchQuizzes = async () => {
    setLoading(true);
    const quizIdFromQuery = searchParams.get("quiz_id");
    let url = `${BASE_URL}/admin/quizzes`;

    if (quizIdFromQuery) {
      url += `?quiz_id=${quizIdFromQuery}`;
    }

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
            duration: 2000,
          });
          navigate("/login");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (quizIdFromQuery) {
        let singleQuiz: Quiz | null = null;
        if (Array.isArray(data)) {
          singleQuiz = data[0] ?? null;
        } else if (data && typeof data === "object" && "id" in data) {
          singleQuiz = data as Quiz;
        }
        setQuizzes(singleQuiz ? [singleQuiz] : []);
      } else {
        const sortedData = Array.isArray(data)
          ? [...data].sort((a, b) => b.id - a.id)
          : [];
        setQuizzes(sortedData);
      }
    } catch (err) {
      console.error("Fetch quizzes failed:", err);
      toast({
        title: "Error",
        description: "Could not load quizzes",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${BASE_URL}/quiz/admin/results/analytics`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics({
          total_attempts: data.total_attempts ?? 0,
          average_score: data.average_score ?? 0,
        });
      }
    } catch (err) {
      console.error("Fetch analytics failed:", err);
    }
  };

  const fetchQuizCount = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subadmin/quizzes/count`, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        let total = 0;
        if (typeof data === "number") {
          total = data;
        } else if (typeof data === "string") {
          total = Number(data);
        } else if (data && typeof data === "object") {
          total = data.total_quizzes ?? 0;
        }
        setTotalQuizzes(total);
      }
    } catch (err) {
      console.error("Fetch quiz count failed:", err);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    fetchAnalytics();
    fetchQuizCount();
  }, [searchParams]);

  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("access_token");
      const counts: any = {};

      await Promise.all(
        quizzes.map(async (quiz) => {
          try {
            const res = await fetch(
              `${BASE_URL}/subadmin/quiz-view/${quiz.id}`,
              {
                headers: {
                  Authorization: token ? `Bearer ${token}` : "",
                  Accept: "application/json",
                },
              }
            );

            if (res.ok) {
              const data = await res.json();
              counts[quiz.id] = data.length;
            } else {
              counts[quiz.id] = 0;
            }
          } catch {
            counts[quiz.id] = 0;
          }
        })
      );

      setQuestionCounts(counts);
    };

    if (quizzes.length > 0) {
      fetchCounts();
    }
  }, [quizzes]);

  const handleDeleteQuiz = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`${BASE_URL}/subadmin/quizzes/${deletingId}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("access_token");
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
            duration: 2000,
          });
          navigate("/login");
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.detail || errData.message || "Failed to delete quiz"
        );
      }

      toast({
        title: "Deleted",
        description: "Quiz deleted successfully",
        className: "bg-red-600 text-white border-none",
        duration: 2000,
      });
      setQuizzes((prev) => prev.filter((q) => q.id !== deletingId));
      setDeletingId(null);
      fetchQuizCount();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not delete quiz",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const toggleQuizForm = () => {
    setActiveForm(activeForm === "quiz" ? "none" : "quiz");
  };

  const handleViewQuizQuestions = async (quiz: Quiz) => {
    setViewingQuiz(quiz);
    setQuestionsLoading(true);
    setViewingQuestions([]);
    setActiveForm("view-questions");

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/subadmin/quiz-view/${quiz.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          Accept: "application/json",
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const questionsArr = Array.isArray(data) ? data : [];
      setViewingQuestions(questionsArr);
    } catch (err) {
      console.error("Fetch quiz questions failed:", err);
      toast({
        title: "Error",
        description: "Could not load quiz questions",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {activeForm === "none" && (
        <>
          <AdminQuizHeader
            onBulkUpload={() => setActiveForm("bulk-upload")}
            onAddQuestion={() => setActiveForm("add-question")}
            onCreateQuiz={toggleQuizForm}
          />

          <QuizStats totalQuizzes={totalQuizzes} analytics={analytics} />

          <AdminQuizFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedQuiz={selectedQuiz}
            onSelectQuiz={setSelectedQuiz}
            quizzes={quizzes}
            onReset={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCategoryFilter("all");
              setSelectedQuiz("all");
            }}
          />

          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">
              Your Quizzes
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-14 w-14 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No quizzes yet</h3>
              <p className="text-muted-foreground mt-2">
                Create a new quiz to get started
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    questionCount={questionCounts[quiz.id] ?? 0}
                    onView={handleViewQuizQuestions}
                    onEdit={(id) => {
                      setEditingQuizId(id);
                      setActiveForm("quiz");
                    }}
                    onDelete={setDeletingId}
                  />
                ))}
              </div>

              <AdminQuizPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </>
      )}

      {activeForm === "quiz" && (
        <CreateAdminQuizForm
          editingQuiz={quizzes.find((q) => q.id === editingQuizId) || null}
          onClose={() => {
            setActiveForm("none");
            setEditingQuizId(null);
          }}
          onSuccess={() => {
            setActiveForm("none");
            setEditingQuizId(null);
            fetchQuizzes();
            if (!editingQuizId) fetchQuizCount();
          }}
        />
      )}
      {activeForm === "view-questions" && (
        <ViewQuestions
          quiz={viewingQuiz}
          questions={viewingQuestions}
          loading={questionsLoading}
          onBack={() => setActiveForm("none")}
        />
      )}

      {activeForm === "add-question" && (
        <AddAdminQuestionModal
          quizzes={quizzes}
          onClose={() => setActiveForm("none")}
        />
      )}

      {activeForm === "bulk-upload" && (
        <BulkUploadAdminQuizModal
          quizzes={quizzes}
          onClose={() => setActiveForm("none")}
        />
      )}

      <AdminQuizDeleteDialog
        deletingId={deletingId}
        onClose={() => setDeletingId(null)}
        onConfirmDelete={handleDeleteQuiz}
      />
    </div>
  );
}
