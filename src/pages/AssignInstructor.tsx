import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

type Course = {
  id: number;
  title: string;
};

type Instructor = {
  id: number;
  name: string;
};

const AssignInstructor = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  const fetchCourses = async () => {
    try {
      const res = await fetch(`https://lauratek.in:8000/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setCourses(await res.json());
    } catch {
      toast.error("Failed to fetch courses");
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch(`https://lauratek.in:8000/admin/instructors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setInstructors(await res.json());
    } catch {
      toast.error("Failed to fetch instructors");
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  const handleAssign = async () => {
    if (!courseId || !instructorId) {
      toast({
        title: "Error",
        description: "Please select both course and instructor",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://lauratek.in:8000/admin/assign-instructor`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: Number(courseId),
          instructor_id: Number(instructorId),
        }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Assigned",
        description: "Instructor assigned successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });

      navigate("/dashboard/assign-course");
    } catch {
      toast({
        title: "Failed",
        description: "Assignment failed",
        className: "bg-red-600 text-white",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER WITH BACK ARROW */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/assign-course")}
          className="rounded-full shadow-sm hover:bg-gray-100 h-10 w-10 border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1F2937]">
            Assign Instructor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Use this dedicated page to assign instructors to courses.
          </p>
        </div>
      </div>

      {/* NEW ASSIGNMENT CARD */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <h3 className="text-[19px] font-bold text-gray-900 mb-8">New Assignment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COURSE SELECT */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Select Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger className="h-12 rounded-[16px] border-gray-200 focus:ring-2 focus:ring-[#8b5cf6] text-[#1F2937] font-medium bg-white shadow-sm">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent className="rounded-[12px]">
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.id} — {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* INSTRUCTOR SELECT */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#4B5563]">Select Instructor</Label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger className="h-12 rounded-[16px] border-gray-200 focus:ring-2 focus:ring-[#8b5cf6] text-[#1F2937] font-medium bg-white shadow-sm">
                <SelectValue placeholder="All Instructor" />
              </SelectTrigger>
              <SelectContent className="rounded-[12px]">
                {instructors.map((inst) => (
                  <SelectItem key={inst.id} value={String(inst.id)}>
                    {inst.id} — {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-4 mt-10">
          <Button
            onClick={handleAssign}
            disabled={loading}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full px-8 h-11 text-[15px] font-medium shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
          >
            {loading ? "Assigning..." : "Submit"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/assign-course")}
            className="rounded-full px-8 h-11 text-[15px] font-medium border-gray-300 text-gray-700 hover:bg-gray-50 transition-all hover:scale-[1.02]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignInstructor;
