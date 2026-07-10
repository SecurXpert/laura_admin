import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import { FiX, FiPlus, FiSearch } from "react-icons/fi";

type TestCase = {
  testcase: number;
  input: string;
  output: string;
};

interface CompilerQuestionProps {
  isModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CompilerQuestion: React.FC<CompilerQuestionProps> = ({ isModal, onSuccess, onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const isEditMode = !isModal && Boolean(id);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [sampleInputs, setSampleInputs] = useState("");
  const [sampleOutputs, setSampleOutputs] = useState("");
  
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchQuestionDetails = async () => {
        try {
          // Fetch existing question to edit
          const res = await api.get(`/compiler-questions/get?question_id=${id}`);
          let data = null;
          if (Array.isArray(res.data) && res.data.length > 0) {
            data = res.data[0];
          } else if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
            data = res.data.data[0];
          } else if (!Array.isArray(res.data) && res.data?.question_id) {
            data = res.data;
          }

          if (data) {
            setTitle(data.title || "");
            setQuestion(data.question || "");
            setDescription(data.description || "");
            setSampleInputs(data.sample_inputs || "");
            setSampleOutputs(data.sample_outputs || "");
            setTestCases(data.test_cases || []);
            setSuggestions(data.suggestion || []);
          } else {
            toast({ title: "Error", description: "Question not found", variant: "destructive" });
            navigate(formatNav("/dashboard/compiler-questions"));
          }
        } catch (error) {
          console.error("Failed to fetch compiler question details", error);
          toast({ title: "Error", description: "Failed to load question details", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      };
      fetchQuestionDetails();
    }
  }, [id, navigate, isEditMode]);

  const handleAddTestCase = () => {
    setTestCases([...testCases, { testcase: testCases.length + 1, input: "", output: "" }]);
  };

  const handleRemoveTestCase = (indexToRemove: number) => {
    const updated = testCases.filter((_, idx) => idx !== indexToRemove).map((tc, idx) => ({
      ...tc,
      testcase: idx + 1
    }));
    setTestCases(updated);
  };

  const handleTestCaseChange = (index: number, field: "input" | "output", value: string) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  const handleAddSuggestion = () => {
    setSuggestions([...suggestions, ""]);
  };

  const handleRemoveSuggestion = (indexToRemove: number) => {
    setSuggestions(suggestions.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSuggestionChange = (index: number, value: string) => {
    const updated = [...suggestions];
    updated[index] = value;
    setSuggestions(updated);
  };

  const handleSubmit = async () => {
    if (!title || !question || !sampleInputs || !sampleOutputs) {
      toast({
        title: "Validation Error",
        description: "Title, question, sample inputs and sample outputs are required.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        question,
        description,
        sample_inputs: sampleInputs,
        sample_outputs: sampleOutputs,
        test_cases: testCases,
        suggestion: suggestions.filter(s => s.trim() !== "")
      };

      if (isEditMode) {
        await api.put(`/compiler-questions/update?question_id=${id}`, payload);
        toast({
          title: "Updated",
          description: "Compiler question updated successfully",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        await api.post("/compiler-questions/add", payload);
        toast({
          title: "Created",
          description: "Compiler question created successfully",
          className: "bg-green-600 text-white border-none",
        });
      }
      if (isModal && onSuccess) {
        onSuccess();
      } else {
        navigate(formatNav("/dashboard/compiler-questions"));
      }
    } catch (error: any) {
      console.error("Failed to save compiler question", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail?.[0]?.msg || "Failed to save question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1a1744] tracking-tight">
            {isEditMode ? "Edit Compiler Question" : "Add Compiler Question"}
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-medium">
            {isEditMode ? `Editing: ${title}` : "Create a new compiler challenge"}
          </p>
        </div>
        <button
          onClick={() => isModal && onCancel ? onCancel() : navigate(formatNav("/dashboard/compiler-questions"))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          {isModal ? "Cancel" : "Back to List"}
        </button>
      </div>

      <div className="space-y-6">
        {/* BASIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Basic Information</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Core problem statement and metadata</p>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
               
              </div>
              <input
                maxLength={50}
                className="w-full border border-gray-200 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                placeholder="Enter question title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Question</label>
               
              </div>
              <textarea
                maxLength={70}
                className="w-full border border-gray-200 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all min-h-[100px]"
                placeholder="Describe the problem statement in full..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                
              </div>
              <textarea
                maxLength={200}
                className="w-full border border-gray-200 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all min-h-[80px]"
                placeholder="Additional constraints or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sample Inputs</label>
                
                </div>
                <input
                  maxLength={50}
                  className="w-full border border-gray-200 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono transition-all"
                  placeholder="e.g. [1, 2, 3]"
                  value={sampleInputs}
                  onChange={(e) => setSampleInputs(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Sample Outputs</label>
                  
                </div>
                <input
                  maxLength={50}
                  className="w-full border border-gray-200 bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono transition-all"
                  placeholder="e.g. 6"
                  value={sampleOutputs}
                  onChange={(e) => setSampleOutputs(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* TEST CASES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Test Cases</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Define input/output pairs for automated evaluation</p>
          </div>
          <div className="p-6">
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-16">No.</th>
                    <th className="p-4 w-1/2">Input</th>
                    <th className="p-4 w-1/2">Output</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {testCases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <FiSearch className="text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">No results found</p>
                      </td>
                    </tr>
                  ) : (
                    testCases.map((tc, index) => (
                      <tr key={index} className="bg-white">
                        <td className="p-4 text-sm font-medium text-gray-400">{tc.testcase}</td>
                        <td className="p-4 relative group">
                          <input
                            maxLength={50}
                            className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono pr-12"
                            value={tc.input}
                            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-sans">{tc.input.length}/50</span>
                        </td>
                        <td className="p-4 relative group">
                          <input
                            maxLength={50}
                            className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-mono pr-12"
                            value={tc.output}
                            onChange={(e) => handleTestCaseChange(index, "output", e.target.value)}
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 font-sans">{tc.output.length}/50</span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleRemoveTestCase(index)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                            <FiX />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleAddTestCase}
              className="flex items-center gap-2 text-indigo-600 text-[13px] font-bold hover:text-indigo-700 transition-colors px-2"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                <FiPlus className="w-3.5 h-3.5" />
              </div>
              Add Test Case
            </button>
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Suggestions</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Hints to guide students toward the solution</p>
          </div>
          <div className="p-6">
            {suggestions.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4 px-2">No suggestions added yet.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {suggestions.map((sug, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="relative flex-1">
                      <input
                        maxLength={100}
                        className="w-full border border-gray-200 bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm pr-14"
                        value={sug}
                        onChange={(e) => handleSuggestionChange(index, e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-300">{sug.length}/100</span>
                    </div>
                    <button onClick={() => handleRemoveSuggestion(index)} className="text-gray-400 hover:text-red-500 transition-colors p-2 shrink-0">
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleAddSuggestion}
              className="flex items-center gap-2 text-indigo-600 text-[13px] font-bold hover:text-indigo-700 transition-colors px-2"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center">
                <FiPlus className="w-3.5 h-3.5" />
              </div>
              Add Suggestion
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-[#6366F1] hover:bg-[#5a5ce6] text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEditMode ? "Update Question" : "Save Question"}
          </button>
          <button
            onClick={() => isModal && onCancel ? onCancel() : navigate(formatNav("/dashboard/compiler-questions"))}
            className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompilerQuestion;
