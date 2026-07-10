import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import ScrollableDropdown from "@/components/ScrollableDropdown";
const API_BASE_URL = "https://lauratek.in:8000";

interface ScheduleClassFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ScheduleClassForm = ({ onClose, onSuccess }: ScheduleClassFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    scheduled_at: "",
    duration: "",
    join_link: "",
  });

  // Fetch courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE_URL}/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` }
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
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://lauratek.in:8000/admin/schedule-live-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: parseInt(formData.course_id),
          title: formData.title,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration: parseInt(formData.duration),
          join_link: formData.join_link,
          recorded_link: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule class");
      }

      toast({
        title: "Success",
        description: "Class scheduled successfully",
        className: "!bg-emerald-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none",
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule class. Please try again.",
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
            <h1 className="text-2xl font-bold text-gray-900">Schedule Live Class</h1>
            <p className="text-sm text-gray-500 mt-1">Create a new live session for your students</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="course_id" className="text-sm font-medium text-gray-700">Course <span className="text-red-500">*</span></Label>
            <ScrollableDropdown
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              options={courses.map(course => ({
                value: course.id.toString(),
                label: course.name || course.title || `Course ${course.id}`
              }))}
              placeholder="Select a course"
              buttonClassName="!h-11 !rounded-lg !border-gray-200"
              dropdownClassName="scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={50}
              placeholder="Enter Title"
              value={formData.title}
              onChange={handleChange}
              className="bg-white border-gray-200 h-11 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at" className="text-sm font-medium text-gray-700">Schedule Date & Time <span className="text-red-500">*</span></Label>
            <Input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              required
              min={new Date().toISOString().slice(0, 16)}
              value={formData.scheduled_at}
              onChange={handleChange}
              className="bg-white border-gray-200 h-11 focus-visible:ring-1 focus-visible:ring-[#6366F1] text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration <span className="text-red-500">*</span></Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              required
              min="1"
              step="1"
              onKeyDown={(e) => {
                if (e.key === "." || e.key === "e" || e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              placeholder="Enter duration in minutes"
              value={formData.duration}
              onChange={handleChange}
              className="bg-white border-gray-200 h-11 focus-visible:ring-1 focus-visible:ring-[#6366F1] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="join_link" className="text-sm font-medium text-gray-700">Join Link <span className="text-red-500">*</span></Label>
            <Input
              id="join_link"
              name="join_link"
              type="url"
              required
              placeholder="https://meet.google.com"
              value={formData.join_link}
              onChange={handleChange}
              className="bg-white border-gray-200 h-11 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 rounded-lg text-gray-700 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto h-11 px-8 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg font-medium transition-colors"
          >
            {loading ? "Scheduling..." : "Schedule Class"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleClassForm;
