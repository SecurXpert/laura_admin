import React, { useState } from "react";
import { Loader2, Save, X, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";

interface EditableQuestionCardProps {
  question: any;
  index: number;
  onUpdate: () => void;
}

export const EditableQuestionCard: React.FC<EditableQuestionCardProps> = ({ question, index, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [questionText, setQuestionText] = useState(question.question_text);
  const [optionA, setOptionA] = useState(question.option_a);
  const [optionB, setOptionB] = useState(question.option_b);
  const [optionC, setOptionC] = useState(question.option_c);
  const [optionD, setOptionD] = useState(question.option_d);
  const [correctOption, setCorrectOption] = useState(question.correct_option);

  const handleSaveOption = async (optionKey: string, newValue: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      const formData = new FormData();
      formData.append("option_value", newValue);

      const res = await fetch(`${API_BASE}/subadmin/questions/${question.id}/options/${optionKey}`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error("Failed to save option");
      toast.success(`Option ${optionKey.toUpperCase()} saved successfully`, {
        className: "!bg-green-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } catch (err) {
      toast.error(`Failed to save Option ${optionKey.toUpperCase()}`, {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionKey: string) => {
    if (!window.confirm(`Are you sure you want to delete Option ${optionKey.toUpperCase()}?`)) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/subadmin/questions/${question.id}/options/${optionKey}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete option");
      
      if (optionKey === 'a') setOptionA('');
      if (optionKey === 'b') setOptionB('');
      if (optionKey === 'c') setOptionC('');
      if (optionKey === 'd') setOptionD('');

      toast.success(`Option ${optionKey.toUpperCase()} deleted successfully`, {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } catch (err) {
      toast.error(`Failed to delete Option ${optionKey.toUpperCase()}`, {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("question_text", questionText);
      formData.append("option_a", optionA);
      formData.append("option_b", optionB);
      formData.append("option_c", optionC);
      formData.append("option_d", optionD);
      formData.append("correct_option", correctOption);
      formData.append("quiz_id", String(question.quiz_id));

      const res = await fetch(`${API_BASE}/subadmin/questions/${question.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update question");

      // Based on Swagger requirements, update options via PATCH if necessary, but
      // since backend processes formData from PUT, we'll iterate options explicitly for safety
      const optionKeys = ['a', 'b', 'c', 'd'];
      for (const key of optionKeys) {
        const newVal = { 'a': optionA, 'b': optionB, 'c': optionC, 'd': optionD }[key];
        const originalVal = question[`option_${key}`];
        if (originalVal !== newVal && newVal) {
          const patchFormData = new FormData();
          patchFormData.append("option_value", newVal);
          await fetch(`${API_BASE}/subadmin/questions/${question.id}/options/${key}`, {
            method: "PATCH",
            headers: { 
              Authorization: `Bearer ${token}`
            },
            body: patchFormData
          }).catch(console.error);
        }
      }

      toast.success("Question updated successfully", {
        className: "!bg-green-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question", {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/subadmin/questions/${question.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (!res.ok) throw new Error("Failed to delete question");

      toast.success("Question deleted successfully", {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question", {
        className: "!bg-red-500 !text-white !p-5 !text-[16px] !rounded-xl !font-medium !border-none !min-w-[380px] !shadow-2xl"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-white rounded-2xl p-5 border shadow-sm relative group">
        <div className="absolute top-4 right-4 flex gap-2 transition">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition"
            title="Edit Question"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition"
            title="Delete Question"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
        <h3 className="font-semibold text-lg text-gray-900 mb-4 pr-20">
          <span className="text-indigo-500 mr-2">Q{index}.</span>
          {question.question_text}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border ${question.correct_option === 'a' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="font-semibold mr-2">A.</span> {question.option_a}
          </div>
          <div className={`p-3 rounded-xl border ${question.correct_option === 'b' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="font-semibold mr-2">B.</span> {question.option_b}
          </div>
          <div className={`p-3 rounded-xl border ${question.correct_option === 'c' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="font-semibold mr-2">C.</span> {question.option_c}
          </div>
          <div className={`p-3 rounded-xl border ${question.correct_option === 'd' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <span className="font-semibold mr-2">D.</span> {question.option_d}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 shadow-sm space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700">Question {index}</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          className="mt-1 bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'a', label: 'Option A', val: optionA, setter: setOptionA },
          { key: 'b', label: 'Option B', val: optionB, setter: setOptionB },
          { key: 'c', label: 'Option C', val: optionC, setter: setOptionC },
          { key: 'd', label: 'Option D', val: optionD, setter: setOptionD },
        ].map(opt => (
          <div key={opt.key} className="relative group/opt">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">{opt.label}</label>
              <div className="flex gap-1 transition-opacity">
                <button 
                  onClick={() => handleSaveOption(opt.key, opt.val)}
                  disabled={loading}
                  title={`Save ${opt.label} only`}
                  className="p-1 text-green-600 hover:bg-green-100 rounded-md transition"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteOption(opt.key)}
                  disabled={loading}
                  title={`Delete ${opt.label}`}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-md transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <Input value={opt.val} onChange={(e) => opt.setter(e.target.value)} className="bg-white border-indigo-100 focus-visible:ring-indigo-500" />
          </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Correct Option (a, b, c, or d)</label>
        <Input
          value={correctOption}
          onChange={(e) => setCorrectOption(e.target.value.toLowerCase())}
          className="mt-1 bg-white max-w-xs"
        />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
          <X className="w-4 h-4 mr-2" /> Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
};
