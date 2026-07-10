import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { FiClock, FiUser, FiFileText, FiSettings, FiLink, FiSave, FiArrowLeft, FiBook } from "react-icons/fi";
import { GuestQuiz } from "./GuestQuiz";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE = "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

interface CreateGuestQuizModalProps {
  onClose: () => void;
  onSuccess: (quizzes: GuestQuiz[]) => void;
}

const CreateGuestQuizModal: React.FC<CreateGuestQuizModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<string | number>("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const res = await fetch(`${API_BASE}/admin/courses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCourses(data);
          } else if (data && Array.isArray(data.courses)) {
            setCourses(data.courses);
          } else if (data && Array.isArray(data.data)) {
            setCourses(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (val.length <= 6) {
      setDuration(val);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 170) {
      setDescription(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !duration || !courseId) {
      toast({
        title: "Validation Error",
        description: "Please fill all mandatory fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/admin/guest-quiz/`,
        {
          title,
          description,
          duration: duration.toString(),
          course_id: courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dataArray = Array.isArray(res.data) ? res.data : [res.data];

      const updatedQuizzes = dataArray.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        course_id: q.course_id,
        timer: q.timer,
        no_of_questions: q.no_of_questions,
        created_at: q.created_at,
      }));

      onSuccess(updatedQuizzes);
      setTitle("");
      setDescription("");
      setDuration("");
      setCourseId("");
      onClose();

      toast({
        title: "Created",
        description: "Quiz created successfully",
        className: "bg-green-600 text-white font-semibold border-0 shadow-lg",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full pb-10 space-y-6">
      {/* HEADER */}
      <div className="sticky -top-4 sm:-top-6 md:-top-8 z-40 bg-[#F8FAFC] py-4 border-b border-gray-200/60 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 pt-4 sm:pt-6 md:pt-8 mb-6 flex flex-col gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#6366f1] font-medium transition-colors w-fit"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Guest Quizzes</span>
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Create Guest Quiz
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Set up a new quiz that can be shared publicly
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleSubmit}
              className="flex w-full sm:w-auto justify-center items-center gap-2 bg-gradient-to-r from-[#3B5BDB] to-[#7B2FF7] text-white px-6 py-2.5 rounded-full shadow-[0_4px_12px_rgba(123,47,247,0.3)] text-sm font-semibold hover:shadow-[0_6px_16px_rgba(123,47,247,0.4)] transition-all cursor-pointer"
            >
              <FiSave className="w-4 h-4" />
              <span>Submit Quiz</span>
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
                  Quiz title and description
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* TITLE */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between items-center w-full">
                  <span>Quiz Title <span className="text-red-500">*</span></span>

                </label>
                <input
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of what this quiz covers..."
                  value={description}
                  maxLength={170}
                  onChange={handleDescriptionChange}
                />
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
                  Quiz Configuration
                </h3>
                <p className="text-xs text-gray-500">
                  Duration, scoring & attempts
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* DURATION */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-1">
                  <FiClock className="absolute left-3 top-3 text-gray-400 text-lg" />

                  <input
                    type="text"
                    className="w-full border bg-gray-50 pl-10 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 60"
                    value={duration}
                    onChange={handleDurationChange}
                  />
                </div>
              </div>

              {/* COURSE ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course <span className="text-red-500">*</span>
                </label>

                <div className="mt-1">
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="w-full bg-gray-50 border p-3 h-[50px] rounded-lg cursor-pointer">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title} (ID: {course.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <FiLink className="text-base" />
            </div>
            <h3 className="font-semibold text-gray-800">Quiz Preview</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Status</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>

            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Questions</span>
              <span>0</span>
            </div>

            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Duration</span>
              <span>{duration || "--"} min</span>
            </div>


          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p>✔ Add questions from the question bank</p>
            <p>✔ Generate a shareable link</p>
            <p>✔ Track quiz attempts and results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGuestQuizModal;
