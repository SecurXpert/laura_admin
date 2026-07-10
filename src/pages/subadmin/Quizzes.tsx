import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  RefreshCw,
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  Filter,
  Loader2,
  Eye,
  Trash2,
  Clock,
  BarChart3,
  HelpCircle,
  Calendar,
  FileQuestion,
  ArrowLeft,
  FileText,
  Settings,
  Link,
  CheckCircle2,
  Search,
  Pencil
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from "@/components/ui/use-toast";
import AddQuestionModal from "./AddQuestionModal";
import BulkUploadQuestionModal from "./BulkUploadQuestionModal";
import CreateQuizForm, { Quiz } from "./CreateQuizForm";
import { QuizStats } from "./QuizComponents/QuizStats";
import { QuizCard } from "./QuizComponents/QuizCard";
import { ViewQuestions } from "./QuizComponents/ViewQuestions";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';



export default function Quizzes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form visibility
  const [activeForm, setActiveForm] = useState<'none' | 'quiz' | 'add-question' | 'bulk-upload' | 'view-questions'>('none');

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
  const [questionCounts, setQuestionCounts] = useState<{ [key: number]: number }>({});
  const [analytics, setAnalytics] = useState({ total_attempts: 0, average_score: 0 });
  const [totalQuizzes, setTotalQuizzes] = useState(0);




  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
    };
  };
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase());

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
    const quizIdFromQuery = searchParams.get('quiz_id');
    let url = `${BASE_URL}/admin/quizzes`;

    if (quizIdFromQuery) {
      url += `?quiz_id=${quizIdFromQuery}`;
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      if (quizIdFromQuery) {
        let singleQuiz: Quiz | null = null;
        if (Array.isArray(data)) {
          singleQuiz = data[0] ?? null;
        } else if (data && typeof data === 'object' && 'id' in data) {
          singleQuiz = data as Quiz;
        }
        setQuizzes(singleQuiz ? [singleQuiz] : []);
      } else {
        setQuizzes(Array.isArray(data) ? [...data].reverse() : []);
      }
    } catch (err) {
      console.error('Fetch quizzes failed:', err);
      toast({
        title: "Error",
        description: "Could not load quizzes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${BASE_URL}/quiz/admin/results/analytics`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
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
      console.error('Fetch analytics failed:', err);
    }
  };

  const fetchQuizCount = async () => {
    try {
      const res = await fetch(`${BASE_URL}/subadmin/quizzes/count`, {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
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
      console.error('Fetch quiz count failed:', err);
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
              counts[quiz.id] = data.length; // ✅ count questions
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
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          navigate('/login');
          return;
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || 'Failed to delete quiz');
      }

      toast({
        title: "Deleted",
        description: "Quiz deleted successfully",
        className: "bg-red-500 text-white",
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
      });
    }
  };



  const toggleQuizForm = () => {
    setActiveForm(activeForm === 'quiz' ? 'none' : 'quiz');
  };

  const handleViewQuizQuestions = async (quiz: Quiz) => {
    setViewingQuiz(quiz);
    setQuestionsLoading(true);
    setViewingQuestions([]);
    setActiveForm('view-questions');

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/subadmin/quiz-view/${quiz.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const questionsArr = Array.isArray(data) ? data : [];
      setViewingQuestions(questionsArr);
    } catch (err) {
      console.error('Fetch quiz questions failed:', err);
      toast({
        title: "Error",
        description: "Could not load quiz questions",
        variant: "destructive",
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

  const showTable = activeForm === 'none';

  return (
    <div className={`w-full ${activeForm === 'none' ? 'max-w-6xl mx-auto space-y-6' : ''}`}>
      {activeForm === 'none' && (
        <>
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Quiz Management</h1>
              <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
                Create and manage all your quizzes
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                onClick={() => setActiveForm('bulk-upload')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Bulk Upload CSV
              </Button>

              <Button
                variant="outline"
                onClick={() => setActiveForm('add-question')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </Button>

              <Button
                onClick={toggleQuizForm}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md animate-in fade-in duration-200 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Quiz
              </Button>
            </div>
          </div>

          {/* STATS CARDS */}
          <QuizStats totalQuizzes={totalQuizzes} analytics={analytics} />

          {/* FILTER SECTION */}
          <div className="p-6 rounded-2xl border shadow-sm mb-8 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Filters & Search</h3>
                <p className="text-sm text-muted-foreground">
                  Refine your quiz list
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow w-full sm:w-auto">
                <Input
                  placeholder="Search quizzes by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <select
                  className="w-full sm:w-48 border rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 h-10"
                  value={selectedQuiz}
                  onChange={(e) => setSelectedQuiz(e.target.value)}
                >
                  <option value="all">All Quizzes</option>

                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 shrink-0"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setSelectedQuiz("all");
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* FOOTER BAR */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            </p>
          </div>

          {/* Quizzes Cards Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-slate-800">Your Quizzes</h2>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedQuizzes.map((quiz) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    questionCount={questionCounts[quiz.id] ?? 0}
                    onView={handleViewQuizQuestions}
                    onEdit={(id) => {
                      setEditingQuizId(id);
                      setActiveForm('quiz');
                    }}
                    onDelete={setDeletingId}
                  />
                ))}
              </div>

              {filteredQuizzes.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 mb-4 px-2 gap-4">
                  <div className="text-[13px] font-medium text-[#6B7280]">
                    Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredQuizzes.length)} of {filteredQuizzes.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Previous
                    </button>

                    <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                      {currentPage}
                    </div>

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeForm === 'quiz' && (
        <CreateQuizForm
          editingQuiz={quizzes.find(q => q.id === editingQuizId) || null}
          onClose={() => {
            setActiveForm('none');
            setEditingQuizId(null);
          }}
          onSuccess={() => {
            setActiveForm('none');
            setEditingQuizId(null);
            fetchQuizzes();
            if (!editingQuizId) fetchQuizCount();
          }}
        />
      )}
      {activeForm === 'view-questions' && (
        <ViewQuestions
          quiz={viewingQuiz}
          questions={viewingQuestions}
          loading={questionsLoading}
          onBack={() => setActiveForm('none')}
        />
      )}

      {activeForm === 'add-question' && (
        <AddQuestionModal quizzes={quizzes} onClose={() => setActiveForm('none')} />
      )}

      {activeForm === 'bulk-upload' && (
        <BulkUploadQuestionModal quizzes={quizzes} onClose={() => setActiveForm('none')} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All questions belonging to this quiz will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuiz}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
