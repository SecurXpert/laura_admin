import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from "react-icons/fi";

export type GuestCompilerQuestion = {
  question_id: number;
  title: string;
  question: string;
  description: string;
  sample_inputs: string;
  sample_outputs: string;
  test_cases: any[];
  suggestion: string[];
};

const GuestCompilerQuestions = () => {
  const [questions, setQuestions] = useState<GuestCompilerQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/guest/compiler-questions/get");
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      }
      const sortedData = [...data].sort((a: any, b: any) => b.question_id - a.question_id);
      setQuestions(sortedData);
    } catch (error) {
      console.error("Failed to fetch compiler questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (questionId: number) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await api.delete(`/guest/compiler-questions/delete?question_id=${questionId}`);
      setQuestions((prev) => prev.filter((q) => q.question_id !== questionId));
      toast({
        title: "Deleted",
        description: "Question deleted successfully",
        className: "bg-red-600 text-white border-none",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to delete question", error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(Math.ceil(filteredQuestions.length / pageSize), 1);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, questions.length]);

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      <>
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
              Guest Compiler Questions
            </h1>
            <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
              Manage programming challenges and test cases
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate("/guest-compiler-questions/add")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium shadow-md bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:opacity-95 transition"
            >
              <FiPlus className="text-base" />
              Add Question
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
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
                  <th className="p-4">Question</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Sample Input</th>
                  <th className="p-4">Sample Output</th>
                  <th className="p-4 text-center">Test Cases</th>
                  <th className="p-4 text-center">Suggestions</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">Loading compiler questions...</td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-500">No questions found</td>
                  </tr>
                ) : (
                  paginatedQuestions.map((q, index) => (
                    <tr key={q.question_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-slate-800 whitespace-nowrap">{q.title}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]" title={q.question}>{q.question}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]" title={q.description}>{q.description}</td>
                      <td className="p-4 text-slate-700 font-mono text-sm">{q.sample_inputs}</td>
                      <td className="p-4 text-slate-700 font-mono text-sm">{q.sample_outputs}</td>
                      <td className="p-4 text-center">
                        <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-bold text-xs">
                          {q.test_cases?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full font-bold text-xs">
                          {q.suggestion?.length || 0}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => navigate(`/guest-compiler-questions/view/${q.question_id}`)} className="text-indigo-500 hover:text-indigo-700 transition" title="View">
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/guest-compiler-questions/edit/${q.question_id}`)} className="text-orange-500 hover:text-orange-700 transition" title="Edit">
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(q.question_id)} className="text-red-500 hover:text-red-700 transition" title="Delete">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {!loading && filteredQuestions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="text-xs text-gray-500 font-medium">
                Showing {paginatedQuestions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, filteredQuestions.length)} of {filteredQuestions.length} matching questions
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-9 h-9 rounded-full text-sm font-semibold transition ${currentPage === pageNumber ? "bg-[#6366F1] text-white" : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    </div>
  );
};

export default GuestCompilerQuestions;
