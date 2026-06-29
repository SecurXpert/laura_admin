import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Loader2,
  Plus,
  FileText,
  Settings,
  Clock,
  BookOpen,
  Link,
  HelpCircle,
  Pencil,
} from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { EditableQuestionCard } from './AdminQuizComponents/EditableQuestionCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lauratek.in:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  time?: number;
  timer?: number;
  created_at?: string;
  status?: string;
}

interface CreateQuizFormProps {
  editingQuiz: Quiz | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAdminQuizForm({ editingQuiz, onClose, onSuccess }: CreateQuizFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [time, setTime] = useState('');

  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [viewingQuestions, setViewingQuestions] = useState<any[]>([]);
  const [courses, setCourses] = useState<{id: number, title: string}[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch(`${BASE_URL}/admin/courses`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            Accept: 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          let coursesArray = [];
          if (Array.isArray(data)) {
            coursesArray = data;
          } else if (data && Array.isArray(data.courses)) {
            coursesArray = data.courses;
          } else if (data && Array.isArray(data.data)) {
            coursesArray = data.data;
          }
          setCourses(coursesArray);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const editingQuizId = editingQuiz?.id;

  const fetchQuestionsForEdit = async (qId: number) => {
    setQuestionsLoading(true);
    setViewingQuestions([]);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BASE_URL}/subadmin/quiz-view/${qId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setViewingQuestions(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (editingQuiz) {
      setTitle(editingQuiz.title);
      setDescription(editingQuiz.description);
      setCourseId(String(editingQuiz.course_id));
      setTime(String(editingQuiz.timer ?? editingQuiz.time ?? ''));
      fetchQuestionsForEdit(editingQuiz.id);
    } else {
      setTitle('');
      setDescription('');
      setCourseId('');
      setTime('');
      setViewingQuestions([]);
    }
  }, [editingQuiz]);

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !courseId) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setCreatingQuiz(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('course_id', courseId.trim());

      if (time) {
        formData.append('time', time);
        formData.append('timer', time);
      }

      let res;
      if (editingQuizId) {
        res = await fetch(`${BASE_URL}/subadmin/quizzes/${editingQuizId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: formData,
        });
      } else {
        res = await fetch(`${BASE_URL}/subadmin/quizzes`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData,
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || `Failed to ${editingQuizId ? 'update' : 'create'} quiz`);
      }

      toast({
        title: editingQuizId ? "Updated" : "Created",
        description: `Quiz ${editingQuizId ? 'updated' : 'created'} successfully!`,
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to ${editingQuizId ? 'update' : 'create'} quiz`,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setCreatingQuiz(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB]/95 backdrop-blur-sm py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 -mt-4 px-2 rounded-b-lg">
        <div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quiz Management
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            {editingQuizId ? 'Edit Quiz' : 'Create Quiz'}
          </h1>
          <p className="text-md text-gray-600 mt-1">
            {editingQuizId ? 'Update the details for this quiz' : 'Set up a new quiz'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="submit"
            form="create-quiz-form"
            disabled={creatingQuiz}
            className="flex items-center gap-2 bg-gradient-to-r from-[#3B5BDB] to-[#7B2FF7] hover:opacity-95 text-white px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-[0_10px_25px_rgba(123,47,247,0.35)] text-sm font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creatingQuiz ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{creatingQuiz ? (editingQuizId ? 'Updating...' : 'Creating...') : (editingQuizId ? 'Update Quiz' : 'Submit Quiz')}</span>
          </button>
        </div>
      </div>

      <form id="create-quiz-form" onSubmit={handleSaveQuiz} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Basic Information
                </h3>
                <p className="text-xs text-gray-500">
                  Quiz title and description
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                 
                </div>
                <input
                  maxLength={50}
                  className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                  placeholder="e.g., Frontend Developer Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  
                </div>
                <textarea
                  maxLength={150}
                  className="w-full border border-slate-200 bg-slate-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition min-h-[100px]"
                  placeholder="Brief description of what this quiz covers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Quiz Configuration
                </h3>
                <p className="text-xs text-gray-500">
                  Duration, scoring & attempts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full border border-slate-200 bg-slate-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                    placeholder="60"
                    value={time}
                    onChange={(e) => setTime(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course ID <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <Select value={courseId || undefined} onValueChange={setCourseId} disabled={!!editingQuizId}>
                    <SelectTrigger className={`w-full border border-slate-200 bg-slate-50 pl-10 h-[46px] rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition ${editingQuizId ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title || `Course ID: ${course.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border border-indigo-50/50 shadow-sm h-fit space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <Link className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-gray-800">Quiz Preview</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Status</span>
              <span className="text-green-600 font-semibold bg-green-50 px-2.5 py-0.5 rounded-md text-xs border border-green-200/50">active</span>
            </div>

            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Questions</span>
              <span className="font-semibold text-slate-800">{viewingQuestions.length}</span>
            </div>

            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100">
              <span className="text-slate-500">Duration</span>
              <span className="font-semibold text-slate-800">{time ? `${time} min` : "— min"}</span>
            </div>

           
          </div>

          <div className="text-xs text-gray-500 space-y-2 border-t border-slate-200/60 pt-4">
            <p className="font-medium text-slate-600">After creating the quiz, you can:</p>
            <p className="flex items-center gap-1.5">✔ Add questions from the question bank</p>
            <p className="flex items-center gap-1.5">✔ Generate a shareable link</p>
            <p className="flex items-center gap-1.5">✔ Track quiz attempts and results</p>
          </div>
        </div>
      </form>

      {editingQuizId && (
        <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Edit Questions & Options</h3>
              <p className="text-sm text-slate-500">Update specific questions and their choices for this quiz</p>
            </div>
          </div>

          {questionsLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
          ) : viewingQuestions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-slate-100">No questions found for this quiz.</div>
          ) : (
            <div className="space-y-6">
              {viewingQuestions.map((q, index) => (
                <EditableQuestionCard key={q.id} question={q} index={index + 1} onUpdate={() => fetchQuestionsForEdit(editingQuizId)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
