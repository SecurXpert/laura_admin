import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { FiFileText, FiSearch, FiCheckCircle, FiHelpCircle, FiList } from "react-icons/fi";

const API_BASE = "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

type GuestQuiz = {
  id: number;
  title: string;
  description: string;
};

type Question = {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

export default function GuestQuestions() {
  const [quizzes, setQuizzes] = useState<GuestQuiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all guest quizzes to populate selection
  const fetchQuizzes = async () => {
    try {
      setLoadingQuizzes(true);
      const res = await axios.get(`${API_BASE}/admin/guest-quiz/guest/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (Array.isArray(res.data)) {
        const reversed = [...res.data].reverse();
        setQuizzes(reversed);
        if (reversed.length > 0) {
          setSelectedQuizId(reversed[0].id.toString());
        }
      }
    } catch (err) {
      console.error("Failed to fetch guest quizzes:", err);
      toast({
        title: "Error",
        description: "Failed to fetch guest quizzes.",
        variant: "destructive",
      });
    } finally {
      setLoadingQuizzes(false);
    }
  };

  // Fetch questions for selected quiz
  const fetchQuestions = async (quizId: string) => {
    if (!quizId || quizId === "all") {
      setQuestions([]);
      return;
    }
    try {
      setLoadingQuestions(true);
      const res = await axios.get(`${API_BASE}/sub-admin/guest-quiz/quiz-view/${quizId}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      toast({
        title: "Error",
        description: "Failed to fetch quiz questions.",
        variant: "destructive",
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuizId !== "all" && selectedQuizId !== "") {
      fetchQuestions(selectedQuizId);
    }
  }, [selectedQuizId]);

  const filteredQuestions = questions.filter((q) =>
    q.question_text?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiHelpCircle className="text-indigo-600" />
            Guest Questions Bank
          </h1>
          <p className="text-sm text-gray-500">
            View and manage questions associated with guest quizzes
          </p>
        </div>
      </div>

      {/* QUIZ SELECTION & SEARCH FILTERS */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Guest Quiz
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            disabled={loadingQuizzes}
            className="w-full border border-gray-200 bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
          >
            {loadingQuizzes ? (
              <option>Loading quizzes...</option>
            ) : quizzes.length === 0 ? (
              <option value="">No quizzes available</option>
            ) : (
              quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id.toString()}>
                  {quiz.id} - {quiz.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex-1 relative">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Search Questions
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
            />
            <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 text-base" />
          </div>
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 text-white p-2 rounded-xl">
              <FiList size={18} />
            </div>
            <h2 className="font-bold text-gray-800">
              Questions Listing ({filteredQuestions.length})
            </h2>
          </div>
        </div>

        {loadingQuestions ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-sm">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FiFileText size={48} className="mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold text-gray-700">No Questions Found</h3>
            <p className="text-sm mt-1 max-w-xs mx-auto">
              {selectedQuizId === "all" || selectedQuizId === ""
                ? "Please select a guest quiz to display its questions."
                : "No questions found matching your search or this quiz is currently empty."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((question, idx) => (
              <div
                key={question.id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:border-indigo-100 hover:bg-indigo-50/10 transition space-y-4"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-lg">
                    Q{idx + 1}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-base leading-relaxed">
                    {question.question_text}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                  {["A", "B", "C", "D"].map((letter) => {
                    const optionKey = `option_${letter.toLowerCase()}` as keyof Question;
                    const optionText = question[optionKey] as string;
                    const isCorrect =
                      question.correct_option?.toLowerCase() === letter.toLowerCase();

                    if (!optionText) return null;

                    return (
                      <div
                        key={letter}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition ${isCorrect
                            ? "bg-green-50 border-green-200 text-green-950 font-medium"
                            : "bg-white border-gray-100 text-gray-700 hover:bg-gray-100/50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 flex items-center justify-center rounded-full font-bold text-xs ${isCorrect
                                ? "bg-green-500 text-white"
                                : "bg-gray-100 text-gray-500"
                              }`}
                          >
                            {letter}
                          </span>
                          <span className="text-sm">{optionText}</span>
                        </div>
                        {isCorrect && (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-100/50 px-2 py-0.5 rounded-full">
                            <FiCheckCircle size={12} />
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
