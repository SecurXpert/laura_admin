import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import CreateGuestQuizModal from "./CreateGuestQuizModal";
import AddGuestQuestionModal from "./AddGuestQuestionModal";
import BulkUploadGuestQuizModal from "./BulkUploadGuestQuizModal";
import ViewGuestQuizModal from "./ViewGuestQuizModal";

import { GuestQuizzesHeader } from "./GuestQuizzesComponents/GuestQuizzesHeader";
import { GuestQuizzesFilterBox } from "./GuestQuizzesComponents/GuestQuizzesFilterBox";
import { GuestQuizCard } from "./GuestQuizzesComponents/GuestQuizCard";
import { GuestQuizzesPagination } from "./GuestQuizzesComponents/GuestQuizzesPagination";

export type GuestQuiz = {
  id: number;
  title: string;
  description: string;
  created_at?: string;
  course_id?: number;
  timer?: number;
  no_of_questions?: number;
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

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [searchId, setSearchId] = useState("");

  const [questionsResult, setQuestionsResult] = useState<any[]>([]);
  const [viewingQuizId, setViewingQuizId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // ================= GET QUIZZES =================
  const fetchGuestQuizzes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/guest-quiz/guest/");

      if (Array.isArray(res.data)) {
        const sortedData = [...res.data].sort((a, b) => b.id - a.id);
        setQuizzes(sortedData);

        setSuccessMessage("Quiz created successfully");
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
      await api.delete(`/admin/guest-quiz/${quizId}`);
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
          const res = await api.get(`/admin/guest-quiz/quiz-view/${quiz.id}`);
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
      const quizCountRes = await api.get("/subadmin/quizzes/count");
      const quizListRes = await api.get("/guest/admin-view/quiz_listing");
      const analyticsRes = await api.get("/quiz/admin/results/analytics");

      const quizzesList = quizListRes.data || [];
      const analytics = analyticsRes.data || {};

      setDashboard({
        totalQuizzes: quizCountRes.data.total_quizzes || 0,
        activeQuizzes: quizzesList.length,
        totalAttempts: analytics.total_attempts || 0,
        avgCompletion: Math.round((analytics.average_score || 0) * 100),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    }
  };

  // ================= VIEW QUIZ QUESTIONS =================
  const handleViewQuiz = async (quizId: number) => {
    try {
      const res = await api.get(`/admin/guest-quiz/quiz-view/${quizId}`);
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
    const res = await api.get(`/admin/guest-quiz/quiz-view/${searchId}`);
    setQuestionsResult(res.data || []);
  };

  useEffect(() => {
    let filtered = quizzes;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (q) =>
          q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(q.course_id || "").includes(searchTerm)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        // Keeping all as active by default for now based on UI
      } else if (statusFilter === "inactive") {
        filtered = [];
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
    fetchDashboardData();
  }, []);

  const isAnyModalOpen =
    showModal || showQuestionModal || showBulkModal || viewingQuizId !== null;

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {!isAnyModalOpen ? (
        <>
          <GuestQuizzesHeader
            onBulkUpload={() => {
              setShowBulkModal(!showBulkModal);
              setShowModal(false);
              setShowQuestionModal(false);
            }}
            onAddQuestion={() => {
              setShowQuestionModal(!showQuestionModal);
              setShowModal(false);
              setShowBulkModal(false);
            }}
            onCreateQuiz={() => {
              setShowModal(!showModal);
              setShowQuestionModal(false);
              setShowBulkModal(false);
            }}
          />

          <GuestQuizzesFilterBox
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

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
                  {filteredQuizzes
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((quiz) => (
                      <GuestQuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onView={handleViewQuiz}
                        onDelete={handleDelete}
                      />
                    ))}
                </div>

                <GuestQuizzesPagination
                  currentPage={currentPage}
                  totalFiltered={filteredQuizzes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
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
