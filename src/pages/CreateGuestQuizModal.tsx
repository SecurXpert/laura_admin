import React, { useState } from "react";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { FiClock, FiUser, FiFileText, FiSettings, FiLink, FiSave, FiArrowLeft } from "react-icons/fi";
import { GuestQuiz } from "./GuestQuizzes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [duration, setDuration] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<{id: number, title: string}[]>([]);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get('/admin/courses', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const data = res.data;
        let coursesArray = [];
        if (Array.isArray(data)) {
          coursesArray = data;
        } else if (data && Array.isArray(data.courses)) {
          coursesArray = data.courses;
        } else if (data && Array.isArray(data.data)) {
          coursesArray = data.data;
        }
        setCourses(coursesArray);
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

  const handleCourseIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-digits
    setCourseId(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      const res = await api.post(
        "/admin/guest-quiz/",
        {
          title,
          description,
          duration: duration.toString(),
          course_id: courseId,
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

      toast({
        title: "Created",
        description: "Quiz created successfully",
        className: "bg-green-600 text-white border-none",
        duration: 2000,
      });

      setTimeout(() => {
        onClose();
      }, 2000);
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
    <div className="w-full pb-8 relative">
      {/* HEADER */}
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB]/95 backdrop-blur-sm py-4 border-b border-slate-200 mb-6 -mt-4 px-2 rounded-b-lg">
        <button onClick={onClose} className="text-gray-500 text-sm flex items-center gap-2 mb-4 hover:text-gray-700">
          <FiArrowLeft /> Back to Guest Quizzes
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create Guest Quiz
            </h1>
            <p className="text-gray-500 text-md sm:text-sm mt-1">
              Set up a new quiz that can be shared publicly
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 shadow-sm transition-all"
            >
              <FiSave size={16} /> Submit Quiz
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
                <label className="text-sm font-medium text-gray-700">
                  Quiz Title <span className="text-red-500">*</span>
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
                <label className="text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Brief description of what this quiz covers..."
                  value={description}
                  maxLength={100}
                  onChange={(e) => setDescription(e.target.value)}
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
                    value={duration}
                    onChange={handleDurationChange}
                  />
                </div>
              </div>

              {/* COURSE ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Course ID <span className="text-red-500">*</span>
                </label>

                <div className="relative mt-1">
                  <FiUser className="absolute left-3 top-3 text-gray-400 text-lg pointer-events-none" />

                  <Select value={courseId || undefined} onValueChange={setCourseId}>
                    <SelectTrigger className="w-full border border-gray-200 bg-gray-50 pl-10 h-[46px] rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer shadow-none">
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

            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Passing Score</span>
              <span>--%</span>
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
