import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";

type TestCase = {
  testcase: number;
  input: string;
  output: string;
};

const ViewGuestCompilerQuestion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;

  const [questionData, setQuestionData] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        const [questionRes, coursesRes] = await Promise.all([
          api.get(`/guest/compiler-questions/get?question_id=${id}`),
          api.get('/admin/courses', { headers })
        ]);

        let data = null;
        if (Array.isArray(questionRes.data) && questionRes.data.length > 0) {
          data = questionRes.data[0];
        } else if (questionRes.data?.data && Array.isArray(questionRes.data.data) && questionRes.data.data.length > 0) {
          data = questionRes.data.data[0];
        } else if (!Array.isArray(questionRes.data) && questionRes.data?.question_id) {
          data = questionRes.data;
        }

        let coursesData: any[] = [];
        if (Array.isArray(coursesRes.data)) {
          coursesData = coursesRes.data;
        } else if (coursesRes.data?.courses && Array.isArray(coursesRes.data.courses)) {
          coursesData = coursesRes.data.courses;
        } else if (coursesRes.data?.data && Array.isArray(coursesRes.data.data)) {
          coursesData = coursesRes.data.data;
        }
        setCourses(coursesData);

        if (data) {
          setQuestionData(data);
        } else {
          navigate(formatNav("/dashboard/guest-compiler-questions"));
        }
      } catch (error) {
        console.error("Failed to fetch compiler question details", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchQuestionDetails();
    }
  }, [id, navigate]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading question details...</div>;
  }

  if (!questionData) {
    return <div className="p-8 text-center text-gray-500">Question not found.</div>;
  }

  const testCases: TestCase[] = questionData.test_cases || [];
  const suggestions: string[] = questionData.suggestion || [];
  const courseName = courses.find((c) => c.id === questionData.course_id)?.title || courses.find((c) => c.id === questionData.course_id)?.name || courses.find((c) => c.id === questionData.course_id)?.course_name;

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1a1744] tracking-tight">
            View Compiler Question
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-medium">
            Question details — read only
          </p>
        </div>
        <button
          onClick={() => navigate(formatNav("/dashboard/guest-compiler-questions"))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          Back to List
        </button>
      </div>

      <div className="space-y-6">
        {/* BASIC INFORMATION */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Question Information</h3>
          </div>
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Question ID</p>
              <span className="inline-flex font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-md text-[13px]">
                CQ{questionData.question_id?.toString().padStart(3, '0')}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Course</p>
              <p className="text-[14px] text-gray-700 font-semibold">
                {questionData.course_id ? `C${String(questionData.course_id).padStart(3, '0')}` : "--"}
                {courseName ? ` — ${courseName}` : ""}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Title</p>
              <p className="text-[15px] font-bold text-gray-900">{questionData.title || "--"}</p>
            </div>
            
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Question</p>
              <p className="text-[14px] text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{questionData.question || "--"}</p>
            </div>
            
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description</p>
              <p className="text-[14px] text-gray-700 leading-relaxed">{questionData.description || "--"}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sample Inputs</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 font-mono text-[13px] break-all">
                  {questionData.sample_inputs || "--"}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sample Outputs</p>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-gray-700 font-mono text-[13px] break-all">
                  {questionData.sample_outputs || "--"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEST CASES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Test Cases</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">{testCases.length} test cases</p>
          </div>
          <div className="p-6">
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4 w-16">Test Case</th>
                    <th className="p-4 w-1/2">Input</th>
                    <th className="p-4 w-1/2">Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {testCases.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-sm text-gray-500">
                        No test cases added.
                      </td>
                    </tr>
                  ) : (
                    testCases.map((tc, index) => (
                      <tr key={index} className="bg-white">
                        <td className="p-4 text-sm font-medium text-gray-500">{tc.testcase || index + 1}</td>
                        <td className="p-4">
                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-indigo-600 font-bold font-mono text-[12px] break-all">
                            {tc.input}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-indigo-600 font-bold font-mono text-[12px] break-all">
                            {tc.output}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="text-[15px] font-bold text-gray-900">Suggestions</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">{suggestions.length} hints</p>
          </div>
          <div className="p-6">
            {suggestions.length === 0 ? (
              <p className="text-sm text-gray-500 px-2">No suggestions added.</p>
            ) : (
              <div className="space-y-3">
                {suggestions.map((sug, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 p-3 rounded-lg text-[13px] text-gray-700">
                      {sug}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGuestCompilerQuestion;
