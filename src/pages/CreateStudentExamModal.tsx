import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { FiClock, FiUser, FiFileText, FiSettings, FiLink, FiSave, FiArrowLeft, FiChevronDown, FiCalendar, FiTag, FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import { StudentExam } from "./StudentExams";
import StudentCompilerQuestion from "./StudentCompilerQuestion";

interface CreateStudentExamModalProps {
  onClose: () => void;
  onSuccess: () => void;
  examToEdit?: StudentExam | null;
}

const CreateStudentExamModal: React.FC<CreateStudentExamModalProps> = ({
  onClose,
  onSuccess,
  examToEdit,
}) => {
  const [title, setTitle] = useState(examToEdit ? examToEdit.title : "");
  const [description, setDescription] = useState(examToEdit ? examToEdit.description : "");
  const [duration, setDuration] = useState(examToEdit ? examToEdit.duration.toString() : "");
  const [courseId, setCourseId] = useState(examToEdit ? examToEdit.course_id.toString() : "");
  const [category, setCategory] = useState(examToEdit ? examToEdit.category : "");

  const [availableQuestions, setAvailableQuestions] = useState<{ question_id: number, title: string }[]>([]);
  const [examQuestions, setExamQuestions] = useState<{ question_id: string; score: string; tempId: number }[]>(() => {
    if (examToEdit && examToEdit.questions) {
      let qObj = examToEdit.questions;
      if (typeof qObj === 'string') {
        try { qObj = JSON.parse(qObj); } catch (e) { qObj = {}; }
      }
      if (qObj && typeof qObj === 'object') {
        const list: { question_id: string; score: string; tempId: number }[] = [];
        Object.entries(qObj).forEach(([key, val]: [string, any], idx) => {
          if (val && typeof val === 'object' && val.question_bank_id !== undefined) {
            list.push({
              question_id: String(val.question_bank_id),
              score: String(val.score ?? 10),
              tempId: Date.now() + idx
            });
          } else if (val && typeof val === 'object' && val.score !== undefined) {
            list.push({
              question_id: String(key),
              score: String(val.score),
              tempId: Date.now() + idx
            });
          } else {
            list.push({
              question_id: String(key),
              score: String(val),
              tempId: Date.now() + idx
            });
          }
        });
        return list;
      }
    }
    return [];
  });
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // Format dates for datetime-local input (YYYY-MM-DDThh:mm)
  const formatForInput = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const [windowStart, setWindowStart] = useState(examToEdit ? formatForInput(examToEdit.window_start) : "");
  const [windowEnd, setWindowEnd] = useState(examToEdit ? formatForInput(examToEdit.window_end) : "");
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<{ id: number, title: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: token ? `Bearer ${token}` : '' };

        // Fetch courses
        const coursesRes = await api.get('/admin/courses', { headers });
        const coursesData = coursesRes.data;
        let coursesArray = [];
        if (Array.isArray(coursesData)) {
          coursesArray = coursesData;
        } else if (coursesData && Array.isArray(coursesData.courses)) {
          coursesArray = coursesData.courses;
        } else if (coursesData && Array.isArray(coursesData.data)) {
          coursesArray = coursesData.data;
        }
        setCourses(coursesArray);

        // Fetch categories
        const catRes = await api.get('/admin/categories', { headers });
        if (Array.isArray(catRes.data)) {
          setCategories(catRes.data);
        }

        // Fetch questions
        const questionsRes = await api.get('/compiler-questions/get', { headers });
        let qData = [];
        if (Array.isArray(questionsRes.data)) {
          qData = questionsRes.data;
        } else if (questionsRes.data?.data && Array.isArray(questionsRes.data.data)) {
          qData = questionsRes.data.data;
        }
        setAvailableQuestions(qData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const fetchSingleQuestion = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: token ? `Bearer ${token}` : '' };
      const qRes = await api.get(`/compiler-questions/get?question_id=${id}`, { headers });
      let qData = null;
      if (Array.isArray(qRes.data) && qRes.data.length > 0) {
        qData = qRes.data[0];
      } else if (qRes.data?.data && Array.isArray(qRes.data.data) && qRes.data.data.length > 0) {
        qData = qRes.data.data[0];
      } else if (qRes.data?.question_id) {
        qData = qRes.data;
      }
      if (qData) {
        setAvailableQuestions(prev => {
          if (!prev.find(q => String(q.question_id) === String(qData.question_id))) {
            return [qData, ...prev];
          }
          return prev;
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (examQuestions.length > 0 && availableQuestions.length > 0) {
      examQuestions.forEach(eq => {
        if (eq.question_id && !availableQuestions.some(q => String(q.question_id) === String(eq.question_id))) {
          const numId = Number(eq.question_id);
          if (!isNaN(numId) && numId > 0) {
            fetchSingleQuestion(numId);
          }
        }
      });
    }
  }, [examQuestions, availableQuestions]);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length <= 6) {
      setDuration(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !courseId || !windowStart || !windowEnd || !duration || !category) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // API expects ISO string. Format: "2026-06-20T08:29:37.525Z"
      const startIso = new Date(windowStart).toISOString();
      const endIso = new Date(windowEnd).toISOString();

      const questionsObj: any = {};
      let qIndex = 1;
      examQuestions.forEach(q => {
        if (q.question_id) {
          const sVal = q.score ? Number(q.score) : 10;
          questionsObj[String(qIndex)] = {
            question_bank_id: Number(q.question_id),
            score: isNaN(sVal) || sVal <= 0 ? 10 : sVal
          };
          qIndex++;
        }
      });

      const payload: any = {
        title,
        description,
        course_id: Number(courseId),
        window_start: startIso,
        window_end: endIso,
        duration: Number(duration),
        category,
        questions: questionsObj
      };

      if (examToEdit) {
        payload.is_active = examToEdit.is_active ?? 1;
        await api.put(`/exam/update?exam_id=${examToEdit.id}`, payload);
        toast({
          title: "Updated",
          description: "Student exam updated successfully",
          className: "bg-green-600 text-white border-none",
          duration: 2000,
        });
      } else {
        await api.post("/exam/creation", payload);
        toast({
          title: "Created",
          description: "Student exam created successfully",
          className: "bg-green-600 text-white border-none",
          duration: 2000,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error(`Failed to ${examToEdit ? "update" : "create"} student exam:`, error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail?.[0]?.msg || `Failed to ${examToEdit ? "update" : "create"} student exam. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="w-full pb-8 relative">
      {/* HEADER */}
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB] pt-4 pb-4 border-b border-slate-200 mb-6 -mt-3 sm:-mt-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <button onClick={onClose} className="text-gray-500 text-sm flex items-center gap-2 mb-4 hover:text-gray-700">
          <FiArrowLeft /> Back to Student Exams
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {examToEdit ? "Edit Student Exam" : "Create Student Exam"}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {examToEdit ? "Modify examination session details" : "Set up a new examination session"}
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (examToEdit ? "Saving..." : "Creating...") : <><FiSave size={16} /> {examToEdit ? "Save Changes" : "Submit Exam"}</>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                <FiFileText className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Basic Information
                </h3>
                <p className="text-xs text-gray-500">
                  Exam title and description
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* TITLE */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between items-center w-full">
                  <span>Exam Title <span className="text-red-500">*</span></span>

                </label>
                <input
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Frontend Developer Assessment"
                  value={title}
                  maxLength={50}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between items-center w-full">
                  <span>Description <span className="text-red-500">*</span></span>

                </label>
                <textarea
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Brief description of what this exam covers..."
                  value={description}
                  rows={3}
                  maxLength={200}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <FiTag className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                  <select
                    className={`w-full border bg-gray-50 pl-10 pr-10 p-3 rounded-lg outline-none appearance-none text-sm ${!!examToEdit ? "cursor-not-allowed text-gray-500 bg-gray-100" : "focus:ring-2 focus:ring-indigo-500 cursor-pointer"}`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={!!examToEdit}
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-4 text-gray-400 text-lg pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* CONFIG */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                <FiSettings className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Exam Configuration
                </h3>
                <p className="text-xs text-gray-500">
                  Duration, course link & scheduling
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COURSE ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course ID <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <FiUser className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                  <select
                    className={`w-full border bg-gray-50 pl-10 pr-10 p-3 rounded-lg outline-none appearance-none text-sm ${!!examToEdit ? "cursor-not-allowed text-gray-500 bg-gray-100" : "focus:ring-2 focus:ring-indigo-500 cursor-pointer"}`}
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    disabled={!!examToEdit}
                  >
                    <option value="" disabled>Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title || `Course ID: ${course.id}`}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-4 text-gray-400 text-lg pointer-events-none" />
                </div>
              </div>

              {/* DURATION */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <FiClock className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                  <input
                    type="text"
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="60"
                    value={duration}
                    onChange={handleDurationChange}
                  />
                </div>
              </div>

              {/* WINDOW START */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Window Start <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                  <input
                    type="datetime-local"
                    min={minDateTime}
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={windowStart}
                    onChange={(e) => setWindowStart(e.target.value)}
                  />
                </div>
              </div>

              {/* WINDOW END */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Window End <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <FiCalendar className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none" />
                  <input
                    type="datetime-local"
                    min={minDateTime}
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={windowEnd}
                    onChange={(e) => setWindowEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* EXAM QUESTIONS */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                  <FiList className="text-lg" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Exam Questions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Add questions from the question bank
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(true)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  Create New Question
                </button>
                <button
                  type="button"
                  onClick={() => setExamQuestions([...examQuestions, { question_id: "", score: "10", tempId: Date.now() }])}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
                >
                  <FiPlus /> Add questions
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {examQuestions.length > 0 && (
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  <div className="col-span-12 sm:col-span-8">Question</div>
                  <div className="col-span-9 sm:col-span-3">Score</div>
                  <div className="col-span-3 sm:col-span-1"></div>
                </div>
              )}
              {examQuestions.map((eq, idx) => (
                <div key={eq.tempId} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-3 sm:p-0 sm:bg-transparent rounded-lg">
                  <div className="col-span-12 sm:col-span-8 relative">
                    <select
                      className="w-full border bg-white sm:bg-gray-50 p-3 rounded-lg outline-none appearance-none text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      value={eq.question_id}
                      onChange={(e) => {
                        const newEq = [...examQuestions];
                        newEq[idx].question_id = e.target.value;
                        setExamQuestions(newEq);
                      }}
                    >
                      <option value="" disabled>Select a question</option>
                      {availableQuestions.map(q => (
                        <option key={q.question_id} value={String(q.question_id)}>{q.title}</option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-4 text-gray-400 text-lg pointer-events-none" />
                  </div>
                  <div className="col-span-9 sm:col-span-3">
                    <input
                      type="number"
                      className="w-full border bg-white sm:bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="e.g. 10"
                      value={eq.score}
                      onChange={(e) => {
                        const newEq = [...examQuestions];
                        newEq[idx].score = e.target.value;
                        setExamQuestions(newEq);
                      }}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-1 flex justify-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setExamQuestions(examQuestions.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      title="Remove Row"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
              {examQuestions.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                  No questions added yet. Click "Add Row" to start.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <FiLink className="text-base" />
            </div>
            <h3 className="font-semibold text-gray-800">Exam Preview</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Status</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>

            <div className="flex justify-between bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-800 truncate max-w-[120px]">{category || "--"}</span>
            </div>

            <div className="flex justify-between bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-800">{duration || "--"} min</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p className="font-medium text-slate-600 mb-2">Next steps:</p>
            <p className="flex items-center gap-1.5">✔ Save the exam configuration</p>
            <p className="flex items-center gap-1.5">✔ Add questions via Question Bank</p>
            <p className="flex items-center gap-1.5">✔ Share the exam link with students</p>
          </div>
        </div>
      </div>

      {showAddQuestionModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden backdrop-blur-sm">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="p-2 sm:p-6">
              <StudentCompilerQuestion
                isModal={true}
                onCancel={() => setShowAddQuestionModal(false)}
                onSuccess={(newId) => {
                  setShowAddQuestionModal(false);
                  if (newId) {
                    fetchSingleQuestion(newId);
                    setExamQuestions(prev => [...prev, { question_id: String(newId), score: "10", tempId: Date.now() }]);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStudentExamModal;
