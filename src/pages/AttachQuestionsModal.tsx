import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { FiX, FiSave } from "react-icons/fi";
import { StudentExam } from "./StudentExams";

interface AttachQuestionsModalProps {
  exam: StudentExam;
  onClose: () => void;
  onSuccess: () => void;
}

const AttachQuestionsModal: React.FC<AttachQuestionsModalProps> = ({ exam, onClose, onSuccess }) => {
  const initQuestionsList = () => {
    const list: { uniqueId: string; question_bank_id: string; score: string }[] = [];
    let qObj = exam?.questions;
    if (typeof qObj === 'string') {
      try {
        qObj = JSON.parse(qObj);
      } catch (e) {
        qObj = {};
      }
    }
    
    if (qObj && typeof qObj === 'object') {
      Object.values(qObj).forEach((item: any) => {
        if (item && item.question_bank_id) {
          list.push({
            uniqueId: Math.random().toString(36).substring(7),
            question_bank_id: String(item.question_bank_id),
            score: String(item.score || 10)
          });
        }
      });
    }
    return list;
  };

  const [questionsList, setQuestionsList] = useState(initQuestionsList());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedQuestions: any = {};
      let qIndex = 1;
      questionsList.forEach((q) => {
        if (q.question_bank_id && q.score) {
          formattedQuestions[String(qIndex)] = {
            question_bank_id: Number(q.question_bank_id),
            score: Number(q.score)
          };
          qIndex++;
        }
      });

      const payload: any = {
        title: exam.title,
        description: exam.description,
        course_id: Number(exam.course_id),
        window_start: exam.window_start,
        window_end: exam.window_end,
        duration: Number(exam.duration),
        category: exam.category,
        is_active: exam.is_active ?? 1,
        questions: formattedQuestions
      };

      await api.put(`/exam/update?exam_id=${exam.id}`, payload);
      toast({
        title: "Attached",
        description: "Questions updated successfully",
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
      onSuccess();
    } catch (error: any) {
      console.error("Failed to attach questions", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail?.[0]?.msg || "Failed to attach questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Attach Questions</h2>
            <p className="text-xs text-gray-500 mt-1">Exam: {exam.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-medium text-gray-700">
              Exam Questions <span className="text-xs text-gray-500 font-normal">(Add by Question ID)</span>
            </label>
            <button
              type="button"
              onClick={() => setQuestionsList([...questionsList, { uniqueId: Math.random().toString(36).substring(7), question_bank_id: "", score: "10" }])}
              className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
            {questionsList.length === 0 ? (
              <p className="text-xs text-center text-gray-500 py-4">No questions attached yet. Click "+ Add Question" to start.</p>
            ) : (
              questionsList.map((q, idx) => (
                <div key={q.uniqueId} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-500 rounded-full text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Question ID</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 5"
                      className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      value={q.question_bank_id}
                      onChange={(e) => {
                        const newList = [...questionsList];
                        newList[idx].question_bank_id = e.target.value;
                        setQuestionsList(newList);
                      }}
                    />
                  </div>
                  <div className="w-24">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Score</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                      value={q.score}
                      onChange={(e) => {
                        const newList = [...questionsList];
                        newList[idx].score = e.target.value;
                        setQuestionsList(newList);
                      }}
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <button
                      type="button"
                      onClick={() => setQuestionsList(questionsList.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Remove Question"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : <><FiSave size={16} /> Save Questions</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachQuestionsModal;
