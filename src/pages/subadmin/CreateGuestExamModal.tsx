import React, { useState, useEffect } from "react";
import api from "@/api/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import { FiClock, FiUser, FiFileText, FiSettings, FiLink, FiSave, FiArrowLeft, FiChevronDown, FiCalendar, FiTag, FiList, FiPlus, FiTrash2 } from "react-icons/fi";
import { GuestExam } from "./GuestExams";
import GuestCompilerQuestion from "./GuestCompilerQuestion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateGuestExamModalProps {
  onClose: () => void;
  onSuccess: () => void;
  examToEdit?: GuestExam | null;
}

const CreateGuestExamModal: React.FC<CreateGuestExamModalProps> = ({
  onClose,
  onSuccess,
  examToEdit,
}) => {
  const [title, setTitle] = useState(examToEdit ? examToEdit.title : "");
  const [description, setDescription] = useState(examToEdit ? examToEdit.description : "");
  const [duration, setDuration] = useState(examToEdit ? examToEdit.duration.toString() : "");
  const [courseId, setCourseId] = useState(examToEdit ? examToEdit.course_id.toString() : "");
  const [category, setCategory] = useState(examToEdit ? examToEdit.category : "");

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
  const initialQuestions = examToEdit?.questions && typeof examToEdit.questions === 'object'
    ? Object.entries(examToEdit.questions).map(([_, q]: [string, any]) => ({
      question_bank_id: q.question_bank_id?.toString() || "",
      score: q.score?.toString() || ""
    }))
    : [{ question_bank_id: "", score: "" }];
  const [questions, setQuestions] = useState<{ question_bank_id: string, score: string }[]>(initialQuestions);

  const [loading, setLoading] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);

  const [courses, setCourses] = useState<{ id: number, title: string }[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [compilerQuestions, setCompilerQuestions] = useState<{ question_id: number, title: string }[]>([]);

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

        // Fetch compiler questions
        const questionsRes = await api.get('/guest/compiler-questions/get', { headers });
        let qData = [];
        if (Array.isArray(questionsRes.data)) {
          qData = questionsRes.data;
        } else if (questionsRes.data?.data && Array.isArray(questionsRes.data.data)) {
          qData = questionsRes.data.data;
        }
        setCompilerQuestions(qData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length <= 6) {
      setDuration(val);
    }
  };

  const handleAddQuestion = () => setQuestions([...questions, { question_bank_id: "", score: "" }]);
  const handleRemoveQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));
  const handleQuestionChange = (index: number, field: "question_bank_id" | "score", value: string) => {
    const updated = [...questions];
    updated[index][field] = value.replace(/\D/g, ""); // Only numbers
    setQuestions(updated);
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

    // Prepare questions payload
    const questionsPayload: any = {};
    let hasValidQuestion = false;
    questions.forEach((q, index) => {
      if (q.question_bank_id && q.score) {
        questionsPayload[(index + 1).toString()] = {
          question_bank_id: Number(q.question_bank_id),
          score: Number(q.score)
        };
        hasValidQuestion = true;
      }
    });

    if (!hasValidQuestion) {
      toast({
        title: "Validation Error",
        description: "Please add at least one valid question with an ID and score",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // API expects ISO string. Format: "2026-06-20T08:29:37.525Z"
      const startIso = new Date(windowStart).toISOString();
      const endIso = new Date(windowEnd).toISOString();

      const payload: any = {
        title,
        description,
        course_id: Number(courseId),
        window_start: startIso,
        window_end: endIso,
        duration: Number(duration),
        category,
        questions: questionsPayload
      };

      if (examToEdit) {
        payload.is_active = examToEdit.is_active ?? 1;
        await api.put(`/guest/exam/update?exam_id=${examToEdit.id}`, payload);
        toast({
          title: "Updated",
          description: "Guest exam updated successfully",
          className: "bg-green-600 text-white border-none",
          duration: 2000,
        });
      } else {
        await api.post("/guest/exam/creation", payload);
        toast({
          title: "Created",
          description: "Guest exam created successfully",
          className: "bg-green-600 text-white border-none",
          duration: 2000,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error(`Failed to ${examToEdit ? "update" : "create"} guest exam:`, error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail?.[0]?.msg || `Failed to ${examToEdit ? "update" : "create"} guest exam. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full pb-8">
      {/* HEADER */}
      <div className="sticky -top-4 sm:-top-6 md:-top-8 z-40 bg-[#F8FAFC] py-4 border-b border-gray-200/60 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 pt-4 sm:pt-6 md:pt-8 mb-6">
        <button onClick={onClose} className="text-gray-500 text-sm flex items-center gap-2 mb-4 hover:text-gray-700">
          <FiArrowLeft /> Back to Guest Exams
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {examToEdit ? "Edit Guest Exam" : "Create Guest Exam"}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {examToEdit ? "Modify examination session details" : "Set up a new examination session"}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-stretch sm:justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
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
                  <span className={`text-[11px] font-medium ${title.length === 50 ? 'text-red-500' : 'text-gray-400'}`}>

                  </span>
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
                  <span className={`text-[11px] font-medium ${description.length === 200 ? 'text-red-500' : 'text-gray-400'}`}>

                  </span>
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
                  <FiTag className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none z-10" />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full h-11 border bg-gray-50 pl-10 pr-3 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={6} avoidCollisions={false} className="rounded-[12px] max-h-[300px]">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name} className="py-2.5 cursor-pointer">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <FiUser className="absolute left-3 top-3.5 text-gray-400 text-lg pointer-events-none z-10" />
                  <Select value={courseId} onValueChange={setCourseId} disabled={!!examToEdit}>
                    <SelectTrigger className={`w-full h-11 border bg-gray-50 pl-10 pr-3 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm ${examToEdit ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={6} avoidCollisions={false} className="rounded-[12px] max-h-[300px]">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)} className="py-2.5 cursor-pointer">
                          {course.title || `Course ID: ${course.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={windowStart}
                    min={new Date().toISOString().slice(0, 16)}
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
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={windowEnd}
                    min={windowStart || new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setWindowEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* QUESTIONS CONFIG */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowCreateQuestionModal(true)}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 text-indigo-600 text-sm font-semibold hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-lg"
                >
                  Create New Question
                </button>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full sm:w-auto flex justify-center items-center gap-2 text-white text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 transition-colors px-4 py-2 rounded-lg shadow-sm"
                >
                  <FiPlus /> Add Questions
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4 border border-dashed rounded-xl">No questions added yet.</p>
              )}
              {questions.map((q, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <div className="flex-[2] w-full min-w-0">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Question</label>
                    <div className="relative">
                      <Select value={String(q.question_bank_id || "")} onValueChange={(val) => handleQuestionChange(index, 'question_bank_id', val)}>
                        <SelectTrigger className="w-full h-11 border bg-white px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm truncate">
                          <SelectValue placeholder="Select a question" />
                        </SelectTrigger>
                        <SelectContent side="bottom" sideOffset={6} avoidCollisions={false} className="rounded-[12px] max-h-[300px] w-[var(--radix-select-trigger-width)]">
                          {compilerQuestions.map((cq) => (
                            <SelectItem key={cq.question_id} value={String(cq.question_id)} className="py-2.5 cursor-pointer">
                              {cq.title ? `${cq.title} (ID: ${cq.question_id})` : `Question ID: ${cq.question_id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex-1 w-full sm:w-auto min-w-0">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Score</label>
                    <input
                      type="text"
                      className="w-full border bg-white p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      placeholder="e.g. 10"
                      value={q.score}
                      onChange={(e) => handleQuestionChange(index, 'score', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 bg-white sm:bg-transparent border border-gray-200 sm:border-transparent mt-1 sm:mt-0"
                    title="Remove Question"
                  >
                    <span className="sm:hidden text-xs font-semibold">Remove Question</span>
                    <FiTrash2 className="text-lg" />
                  </button>
                </div>
              ))}
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

      {/* Create Question Modal */}
      {showCreateQuestionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-gray-50 w-full max-w-7xl rounded-2xl shadow-xl overflow-hidden max-h-[95vh] overflow-y-auto relative">
            <GuestCompilerQuestion
              isModal={true}
              onSuccess={() => {
                setShowCreateQuestionModal(false);
                // Refresh questions list
                const token = localStorage.getItem('access_token');
                const headers = { Authorization: token ? `Bearer ${token}` : '' };
                api.get('/guest/compiler-questions/get', { headers }).then(res => {
                  let qData = [];
                  if (Array.isArray(res.data)) qData = res.data;
                  else if (res.data?.data && Array.isArray(res.data.data)) qData = res.data.data;
                  setCompilerQuestions(qData);
                }).catch(err => console.error(err));
              }}
              onCancel={() => setShowCreateQuestionModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateGuestExamModal;
