import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, UploadCloud, ArrowLeft, ChevronDown } from "lucide-react";
import { API_BASE_URL } from "@/services/api/api";

interface UploadVideoFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  editVideoId?: number;
  initialData?: any;
}

const UploadVideoForm = ({ onClose, onSuccess, editVideoId, initialData }: UploadVideoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: (initialData?.courseId || initialData?.course_id || "")?.toString(),
    title: initialData?.title || "",
    trainer_id: (initialData?.trainerId || initialData?.trainer_id || initialData?.instructor_id || "")?.toString(),
    recorded_date: initialData?.uploadDate || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Courses
        const coursesRes = await fetch(`${API_BASE_URL}/admin/courses`, { headers });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          let coursesArray = [];
          if (Array.isArray(coursesData)) {
            coursesArray = coursesData;
          } else if (coursesData && Array.isArray(coursesData.courses)) {
            coursesArray = coursesData.courses;
          } else if (coursesData && Array.isArray(coursesData.data)) {
            coursesArray = coursesData.data;
          }
          setCourses(coursesArray);
        }

        // Fetch Instructors
        const instRes = await fetch(`${API_BASE_URL}/admin/instructors`, { headers });
        if (instRes.ok) {
          const instData = await instRes.json();
          setInstructors(instData || []);
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };

    fetchDropdownData();
  }, []);

  // Automatically select instructor when course is loaded or changed
  useEffect(() => {
    if (formData.course_id && courses.length > 0) {
      const selectedCourse = courses.find(c => c.id?.toString() === formData.course_id || c.course_id?.toString() === formData.course_id);
      const matchedInstructorId = selectedCourse?.instructor_id || selectedCourse?.instructorId || selectedCourse?.trainer_id || selectedCourse?.instructor?.id || "";
      if (matchedInstructorId && formData.trainer_id !== matchedInstructorId.toString()) {
        setFormData(prev => ({ ...prev, trainer_id: matchedInstructorId.toString() }));
      }
    }
  }, [formData.course_id, courses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "course_id") {
      const selectedCourse = courses.find(c => c.id?.toString() === value || c.course_id?.toString() === value);
      const matchedInstructorId = selectedCourse?.instructor_id || selectedCourse?.instructorId || selectedCourse?.trainer_id || selectedCourse?.instructor?.id || "";
      setFormData((prev) => ({ 
        ...prev, 
        course_id: value,
        ...(matchedInstructorId && { trainer_id: matchedInstructorId.toString() })
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please select a video file only.",
        });
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please drop a video file only.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !editVideoId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a file to upload",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      submitData.append("course_id", formData.course_id);
      submitData.append("title", formData.title);
      submitData.append("trainer_id", formData.trainer_id);
      submitData.append("recorded_date", formData.recorded_date);
      if (file) {
        submitData.append("video_file", file);
      }

      const url = editVideoId
        ? `${API_BASE_URL}/admin/recorded-video/${editVideoId}`
        : `${API_BASE_URL}/admin/upload-recorded-video`;

      const method = editVideoId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, browser will automatically set it with the correct boundary for multipart/form-data
        },
        body: submitData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      toast({
        title: "Success",
        description: editVideoId ? "Video updated successfully" : "Video uploaded successfully",
        className: "!bg-emerald-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: editVideoId ? "Failed to update video. Please try again." : "Failed to upload video. Please try again.",
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              {editVideoId ? "Edit Video" : "Add Video"}
            </h1>
            <p className="text-slate-500 text-[15px] mt-1">
              {editVideoId ? "Update details for this recorded video" : "Upload a new video to your course library"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="course_id" className="text-sm font-medium text-gray-700">Course <span className="text-red-500">*</span></Label>
            <div className="relative">
              <select
                id="course_id"
                name="course_id"
                required
                value={formData.course_id}
                onChange={handleChange}
                disabled={!!editVideoId}
                className={`w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-700 outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none ${!!editVideoId ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white cursor-pointer"}`}
              >
                <option value="" disabled>Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.title || c.name || `Course ${c.id}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter Title"
              value={formData.title}
              onChange={handleChange}
              maxLength={40}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trainer_id" className="text-sm font-medium text-gray-700">Instructor <span className="text-red-500">*</span></Label>
            <div className="relative">
              <select
                id="trainer_id"
                name="trainer_id"
                required
                value={formData.trainer_id}
                onChange={handleChange}
                disabled={!!editVideoId}
                className={`w-full pl-3 pr-10 py-2.5 border border-gray-200 rounded-lg text-[14px] text-gray-700 outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none ${!!editVideoId ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-white cursor-pointer"}`}
              >
                <option value="" disabled>Select Instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id.toString()}>
                    {i.name || i.email || `Instructor ${i.id}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recorded_date" className="text-sm font-medium text-gray-700">Recorded Date <span className="text-red-500">*</span></Label>
            <Input
              id="recorded_date"
              name="recorded_date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.recorded_date}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1] text-gray-600"
            />
          </div>
        </div>

        <div
          className="mt-6 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#6366F1] transition-colors cursor-pointer bg-white"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="video/*"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <UploadCloud className="h-10 w-10 text-gray-400" />
            <div className="text-sm font-medium text-gray-700">
              Drag and drop or click to upload
            </div>
            <div className="text-xs text-gray-400">
              {file 
                ? file.name 
                : editVideoId 
                  ? "Existing video kept. Upload a new one to replace." 
                  : "Video files only (e.g. MP4, WebM)"}
            </div>
          </div>
        </div>

        <div className="pt-4 pb-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-6 rounded-lg font-medium text-[16px] transition-colors"
          >
            {loading ? (editVideoId ? "Updating..." : "Uploading...") : (editVideoId ? "Update" : "Submit")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideoForm;
