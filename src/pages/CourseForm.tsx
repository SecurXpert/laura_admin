import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import { CourseFormHeader } from "./CourseComponents/CourseFormHeader";
import { CourseBasicInfo } from "./CourseComponents/CourseBasicInfo";
import { CourseDetailsSection } from "./CourseComponents/CourseDetailsSection";
import { CourseImageUpload } from "./CourseComponents/CourseImageUpload";
import { CourseFormActions } from "./CourseComponents/CourseFormActions";

/* ================= API ================= */
const COURSE_API = `/admin/courses`;
const CATEGORY_API = `/admin/categories`;
const INSTRUCTOR_API = `/admin/instructors`;

/* ================= TYPES ================= */
interface Category {
  id: number;
  name: string;
}

interface Instructor {
  id: number;
  name: string;
}

/* ================= COMPONENT ================= */
const CourseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const locationState = (location.state || {}) as any;

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
    instructor_name: "",
  });

  /* ================= FETCH ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get(CATEGORY_API);

      setCategories(
        res.data.map((c: any) => ({
          id: c.id ?? c.category_id,
          name: c.name ?? c.title,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch categories. Setting fallback selections.");
      setCategories([
        { id: 101, name: "Web Development" },
        { id: 102, name: "Data Science & AI" },
        { id: 103, name: "DevOps Architecture" },
        { id: 104, name: "UI/UX Design Systems" },
      ]);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await api.get(INSTRUCTOR_API);

      let data = res.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.instructors && Array.isArray(data.instructors)) {
          data = data.instructors;
        }
      }

      if (Array.isArray(data)) {
        const normalizedInstructors = data.map((i: any) => ({
          id: i.id ?? i.instructor_id ?? i.trainer_id,
          name: i.name ?? i.title ?? i.email,
        }));
        setInstructors(normalizedInstructors);
      } else {
        setInstructors([]);
      }
    } catch (err) {
      console.error(
        "Failed to fetch instructors. Setting fallback selections."
      );
      setInstructors([
        { id: 1, name: "Arjun kumar" },
        { id: 2, name: "Dr. Sarah Jenkins" },
        { id: 3, name: "Michael Chang" },
      ]);
    }
  };

  const fetchCourseById = async () => {
    try {
      const res = await api.get(`${COURSE_API}/${id}`);

      const course = res.data;
      let formattedSchedule = "";

      if (course.schedule) {
        const d = new Date(course.schedule);
        if (!isNaN(d.getTime())) {
          formattedSchedule = d.toISOString().slice(0, 10);
        }
      }

      let instId = (
        course.instructor_id ||
        course.instructorId ||
        course.instructor?.id ||
        course.trainer_id ||
        locationState.instructorId ||
        ""
      )?.toString();
      const instName =
        course.instructor_name ||
        course.instructorName ||
        course.instructor?.name ||
        locationState.instructorName ||
        "";
      if (!instId && instName) {
        instId = "999999";
      }

      setFormData({
        title: course.title || "",
        description: course.description || "",
        duration: course.duration ? String(course.duration) : "",
        level: course.level || "",
        language: course.language || "",
        category_id: (
          course.category_id ||
          course.categoryId ||
          ""
        )?.toString(),
        status: course.status || "active",
        instructor_id: instId,
        instructor_name: instName,
        image: null,
        schedule: formattedSchedule,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to load course parameters",
        variant: "destructive",
      });
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
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Selected file must be a valid image",
        }));
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

    if (!formData.category_id)
      newErrors.category_id = "Category selection is required";
    if (!formData.level) newErrors.level = "Level selection is required";

    if (!formData.language.trim()) {
      newErrors.language = "Language is required";
    }

    if (!formData.schedule) {
      newErrors.schedule = "Schedule Date is required";
    } else if (!isEdit) {
      const today = new Date().toISOString().split("T")[0];
      if (formData.schedule < today) {
        newErrors.schedule = "Past dates are not allowed";
      }
    }

    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    }

    if (!formData.instructor_id)
      newErrors.instructor_id = "Instructor selection is required";
    if (!formData.status) newErrors.status = "Status selection is required";

    if (!isEdit && !formData.image) {
      newErrors.image = "Course image is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast({
        title: "Validation Error",
        description:
          "Please check the highlighted fields below and provide required details.",
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

      navigate("/dashboard/courses");
    } catch (error) {
      toast({
        title: "Submission Error",
        description:
          "Failed to save course. Please verify your connection or payload.",
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

  const currentInstId = formData.instructor_id?.toString();
  const resolvedInstructorName =
    formData.instructor_name ||
    instructors.find((i) => i.id.toString() === currentInstId)?.name ||
    (currentInstId === "1"
      ? "Arjun kumar"
      : currentInstId
      ? `Instructor #${currentInstId}`
      : "");
  const displayInstructors = [...instructors];
  if (
    currentInstId &&
    !displayInstructors.some((inst) => inst.id.toString() === currentInstId)
  ) {
    displayInstructors.push({
      id: Number(currentInstId) || 999999,
      name: resolvedInstructorName || `Instructor #${currentInstId}`,
    });
  } else if (!currentInstId && resolvedInstructorName) {
    displayInstructors.push({
      id: 999999,
      name: resolvedInstructorName,
    });
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <CourseFormHeader
        isEdit={isEdit}
        id={id}
        onBack={() => navigate("/dashboard/courses")}
      />

      <CourseBasicInfo
        title={formData.title}
        description={formData.description}
        errors={errors}
        onChange={handleChange}
      />

      <CourseDetailsSection
        formData={formData}
        errors={errors}
        isEdit={isEdit}
        categories={categories}
        displayInstructors={displayInstructors}
        resolvedInstructorName={resolvedInstructorName}
        onChange={handleChange}
        onInstructorChange={(val) => {
          const selectedInst = displayInstructors.find(
            (i) => i.id.toString() === val
          );
          handleChange({ target: { name: "instructor_id", value: val } });
          setFormData((prev) => ({
            ...prev,
            instructor_id: val,
            instructor_name: selectedInst
              ? selectedInst.name
              : prev.instructor_name,
          }));
        }}
      />

      <CourseImageUpload
        image={formData.image}
        error={errors.image}
        onFileChange={handleFileChange}
      />

      <CourseFormActions
        loading={loading}
        isEdit={isEdit}
        onCancel={() => navigate("/dashboard/courses")}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CourseForm;