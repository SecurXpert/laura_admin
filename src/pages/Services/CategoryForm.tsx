import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

/* ================= TYPES ================= */
interface Category {
  id: number;
  name: string;
  description?: string;
}

/* ================= COMPONENT ================= */
const CategoryForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  /* ================= ERROR HANDLER ================= */
  const mapApiError = (error: any) => {
    const status = error?.response?.status;
    switch (status) {
      case 400:
        return "Invalid request";
      case 404:
        return "Category not found";
      case 409:
        return "Category already exists";
      case 500:
        return "Server error";
      default:
        return error?.response?.data?.detail || "Something went wrong";
    }
  };

  /* ================= POPULATE FORM FROM STATE ================= */
  useEffect(() => {
    if (isEdit && location.state?.category) {
      const category = location.state.category;
      setFormData({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [isEdit, location.state]);

  /* ================= HANDLERS ================= */

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    // Prevent starting space for name
    if (name === "name" && value.startsWith(" ")) {
      return;
    }

    // Allow letters, spaces, and special characters for name
    if (name === "name") {
      const sanitized = value.replace(/[^A-Za-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, "");
      setFormData({
        ...formData,
        [name]: sanitized,
      });
    } else {
      // Prevent starting space for description
      if (value.startsWith(" ")) {
        return;
      }

      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  /* ================= VALIDATION ================= */

  const validateForm = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and Description are required",
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

      if (isEdit && id) {
        await api.put(`/admin/categories/${id}`, {
          name: formData.name,
          description: formData.description,
        });

        toast({
          title: "Success",
          description: "Category updated successfully",
          className: "bg-[#E6F8ED] border-[#1E854A]/30 text-[#1E854A] font-semibold",
          duration: 2000,
        });
      } else {
        await api.post("/admin/categories", {
          name: formData.name,
          description: formData.description,
        });

        toast({
          title: "Success",
          description: "Category created successfully",
          className: "bg-[#E6F8ED] border-[#1E854A]/30 text-[#1E854A] font-semibold",
          duration: 2000,
        });
      }

      navigate("/dashboard/categories");
    } catch (error: any) {
      toast({
        title: "Error",
        description: mapApiError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden pb-12 space-y-6">

      {/* HEADER - OUTSIDE THE CARD */}
      <div className="flex items-center gap-3 w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/categories")}
          className="h-8 w-8 text-gray-500 hover:text-gray-900 rounded-full transition-colors flex-shrink-0"
          title="Back to Categories"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          {isEdit ? "Edit Category" : "Add Category"}
        </h1>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8 w-full">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">

          {isEdit && (
            <div className="w-full">
              <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
                Category ID
              </Label>
              <Input
                value={id || ""}
                disabled
                className="bg-gray-100 cursor-not-allowed text-xs sm:text-sm border-gray-200 shadow-sm"
              />
            </div>
          )}

          {/* Dynamically adjust column occupancy based on form mode context */}
          <div className={isEdit ? "w-full" : "md:col-span-2 w-full"}>
            <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              name="name"
              value={formData.name}
              maxLength={50}
              onChange={handleChange}
              placeholder="Enter category name"
              className="text-xs sm:text-sm border-gray-200 focus-visible:ring-[#5D3EFC] shadow-sm transition-all"
            />
          </div>

          <div className="md:col-span-2 w-full mt-1">
            <Label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              maxLength={170}
              onChange={handleChange}
              placeholder="Enter category description"
              className="min-h-[120px] text-xs sm:text-sm border-gray-200 focus-visible:ring-[#5D3EFC] shadow-sm transition-all resize-y"
            />
          </div>

        </div>

        {/* Responsive action panel: stacked full width on phones, right-aligned side-by-side on desktop */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-8 pt-5 border-t border-gray-50 w-full">

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/categories")}
            className="w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-2.5 h-auto rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-[#3161EB] hover:bg-[#3161EB]/90 text-white text-xs sm:text-sm py-2 sm:py-2.5 h-auto rounded-xl shadow-sm transition-opacity"
          >
            {isEdit ? "Update Category" : "Create Category"}
          </Button>

        </div>

      </div>

    </div>
  );
};

export default CategoryForm;
