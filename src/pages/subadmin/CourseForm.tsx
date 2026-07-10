import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "@/API/axiosInstance";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CourseBasicInfo from "./CourseComponents/CourseBasicInfo";
import CourseDetailsSection from "./CourseComponents/CourseDetailsSection";
import CourseImageUpload from "./CourseComponents/CourseImageUpload";

/* ================= API ================= */
const COURSE_API = `/admin/courses`;
const CATEGORY_API = `/admin/categories`;
const INSTRUCTOR_API = `/admin/instructors`;

/* ================= TYPES ================= */
interface Category {
  id: any;
  name: string;
}

interface Instructor {
  id: any;
  name: string;
}

/* ================= COMPONENT ================= */
const CourseForm = () => {
  const navigate = useNavigate();
  const formatNav = (p: string) => window.location.pathname.startsWith('/subadmin') ? (p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`) : p;
  const location = useLocation();
  const { id } = useParams();

  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: "",
    language: "",
    category_id: "",
    status: "",
    image: null as File | null,
    schedule: "",
    instructor_id: "",
  });

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get(CATEGORY_API);
      const list = res.data?.data || res.data || [];
      const mapped = (Array.isArray(list) ? list : []).map((c: any) => ({
        id: String(c.id ?? c.category_id ?? ""),
        name: c.name ?? c.title ?? "",
      }));
      if (!mapped.some(c => String(c.id) === "101")) {
        mapped.push({ id: "101", name: "Web Development" });
      }
      setCategories(mapped);
    } catch (err) {
      console.error("Failed to fetch categories.", err);
      setCategories([{ id: "101", name: "Web Development" }]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await api.get(INSTRUCTOR_API);
      const list = res.data?.data || res.data || [];
      const mapped = (Array.isArray(list) ? list : []).map((inst: any) => ({
        id: String(inst.id ?? inst.instructor_id ?? inst.user_id ?? inst.sub_admin_id ?? ""),
        name: inst.name ?? inst.username ?? inst.full_name ?? inst.email ?? "",
      }));
      if (!mapped.some(i => String(i.id) === "1")) {
        mapped.push({ id: "1", name: "Arjun kumar" });
      }
      setInstructors(mapped);
    } catch (err) {
      console.error("Failed to fetch instructors.", err);
      setInstructors([{ id: "1", name: "Arjun kumar" }]);
    }
  };

  const fetchCourseById = async () => {
    try {
      let course: any = location.state?.course;
      if (!course) {
        try {
          const res = await api.get(`${COURSE_API}/${id}`);
          course = res.data?.data || res.data;
        } catch (e) {
          const listRes = await api.get(COURSE_API);
          const all = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.courses || listRes.data?.data || []);
          course = all.find((c: any) => String(c.id) === String(id));
        }
      }

      if (!course) return;

      let formattedSchedule = "";
      if (course.schedule) {
        const d = new Date(course.schedule);
        if (!isNaN(d.getTime())) {
          formattedSchedule = d.toISOString().slice(0, 10);
        }
      }

      const catId = course.category_id ?? course.category?.id ?? course.category?.category_id ?? "101";
      const instId = course.instructor_id ?? course.instructor?.id ?? course.instructor?.instructor_id ?? course.trainer_id ?? course.user_id ?? "1";

      setFormData({
        title: course.title || "",
        description: course.description || "",
        duration: course.duration ? String(course.duration) : "",
        level: course.level || "",
        language: course.language || "",
        category_id: String(catId),
        status: course.status || "active",
        instructor_id: String(instId),
        image: null,
        schedule: formattedSchedule,
      });
    } catch (err) {
      console.error("Failed to load course parameters", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setInitialLoading(true);
      await Promise.all([fetchCategories(), fetchInstructors()]);

      if (isEdit) {
        await fetchCourseById();
      }
      setInitialLoading(false);
    };

    initialize();
  }, [isEdit, id]);

  /* ================= HANDLERS ================= */
  const handleChange = (e: any) => {
    let { name, value } = e.target;

    if (name === "duration") {
      value = value.replace(/[^0-9]/g, "").slice(0, 8);
    } else if (name === "language") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    } else if (name === "title") {
      value = value.slice(0, 50);
    } else if (name === "description") {
      value = value.slice(0, 100);
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Image size must be less than 5MB" }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Selected file must be a valid image" }));
        return;
      }

      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Course Title is required";
    } else if (formData.title.length > 50) {
      newErrors.title = "Course Title cannot exceed 50 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 100) {
      newErrors.description = "Description cannot exceed 100 characters";
    }

    if (!formData.category_id) newErrors.category_id = "Category selection is required";
    if (!formData.level) newErrors.level = "Level selection is required";

    if (!formData.language.trim()) {
      newErrors.language = "Language is required";
    }

    if (!formData.schedule) {
      newErrors.schedule = "Schedule Date is required";
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (formData.schedule < today) {
        newErrors.schedule = "Past dates are not allowed";
      }
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.instructor_id) newErrors.instructor_id = "Instructor selection is required";
    if (!formData.status) newErrors.status = "Status selection is required";

    if (!isEdit && !formData.image) {
      newErrors.image = "Course image is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check the highlighted fields below and provide required details.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const payload = new FormData();

      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("duration", formData.duration);
      payload.append("level", formData.level);
      payload.append("language", formData.language);
      payload.append("category_id", formData.category_id);
      payload.append("schedule", formData.schedule);
      payload.append("instructor_id", formData.instructor_id);
      payload.append("status", formData.status);

      if (formData.image) {
        payload.append("image", formData.image);
      }

      if (isEdit) {
        await api.put(`${COURSE_API}/${id}`, payload);

        toast({
          title: "Updated",
          description: "Course updated successfully",
          className: "bg-emerald-600 text-white",
          duration: 2000,
        });
      } else {
        await api.post(COURSE_API, payload);

        toast({
          title: "Created",
          description: "Course created successfully",
          className: "bg-green-600 text-white",
          duration: 2000,
        });
      }

      navigate(formatNav("/dashboard/courses"));
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Failed to save course. Please verify your connection or payload.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[250px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
        <Skeleton className="h-[200px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-4 mb-2 sm:mb-4 w-full">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <button
            onClick={() => navigate(formatNav("/dashboard/courses"))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 sm:mt-1 hover:bg-gray-50 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#111827] leading-tight truncate">
              {isEdit ? `Edit Course (ID: ${id})` : "Add New Course"}
            </h1>

            <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5 sm:mt-1 break-words">
              {isEdit ? "Update and configure course details" : "Create and configure a new course record"}
            </p>
          </div>
        </div>
      </div>

      {/* BASIC INFORMATION SECTION */}
      <CourseBasicInfo
        formData={formData}
        handleChange={handleChange}
        errors={errors}
      />

      {/* COURSE DETAILS SECTION */}
      <CourseDetailsSection
        formData={formData}
        handleChange={handleChange}
        errors={errors}
        categories={categories}
        instructors={instructors}
        isEdit={isEdit}
      />

      {/* COURSE IMAGE UPLOAD SECTION */}
      <CourseImageUpload
        formData={formData}
        handleFileChange={handleFileChange}
        errors={errors}
      />

      {/* BOTTOM BUTTONS CONTAINER */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 w-full mt-2 sm:mt-3">
        <button
          onClick={() => navigate(formatNav("/dashboard/courses"))}
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 h-11 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs sm:text-sm font-semibold text-gray-700 transition-all shadow-sm active:scale-[0.99]"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full sm:w-auto px-6 sm:px-8 py-2.5 h-11 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-sm transition-opacity active:scale-[0.99]"
        >
          {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
        </button>
      </div>
    </div>
  );
};

export default CourseForm;
