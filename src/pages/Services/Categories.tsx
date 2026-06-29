import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { Search, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

/* ================= TYPES ================= */
interface Category {
  id: number;
  name: string;
  description?: string;
}

/* ================= COMPONENT ================= */
const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

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

  /* ================= GET METHOD ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/categories");

      const normalized: Category[] = res.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
      })).sort((a: Category, b: Category) => b.id - a.id);

      setCategories(normalized);
      setFiltered(normalized);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load categories from server",
        variant: "destructive",
      });
      setCategories([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const q = search.trim().toLowerCase();

    if (!q) {
      setFiltered(categories);
      return;
    }

    setFiltered(
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q)
      )
    );
    setCurrentPage(1);
  }, [search, categories]);

  /* ================= PAGINATION LOGIC ================= */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const displayedCategories = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteCategory) return;

    try {
      await api.delete(`/admin/categories/${deleteCategory.id}`);

      setCategories((prev) =>
        prev.filter((c) => c.id !== deleteCategory.id)
      );
      setFiltered((prev) =>
        prev.filter((c) => c.id !== deleteCategory.id)
      );

      toast({
        title: "Deleted",
        description: "Category deleted successfully",
        className: "bg-[#FEE2E2] border-[#EF4444]/30 text-[#991B1B] font-semibold",
        duration: 2000,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: mapApiError(error),
        variant: "destructive",
      });
    } finally {
      setDeleteCategory(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 sm:mb-8 w-full">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate">
            Categories
          </h1>
           <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Organize and manage course categories
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Category by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#9F54FC] focus:border-[#9F54FC] placeholder:text-gray-400 transition-all shadow-sm"
            />
          </div>

          {/* Add Category Button */}
          <button
            onClick={() => navigate("add")}
            className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2 rounded-full bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 text-white text-[13px] sm:text-sm font-medium shadow-sm transition-all whitespace-nowrap flex-shrink-0"
          >
            <span className="text-sm sm:text-base font-medium leading-none">+</span>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">

        {(!loading && filtered.length === 0) && (
          <div className="col-span-full text-center py-12 text-gray-400 text-xs sm:text-sm">
            No categories match your search criteria
          </div>
        )}

        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[240px] w-full rounded-2xl" />
          ))
        ) : (
          displayedCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border hover:shadow-md transition flex flex-col justify-between min-h-[220px] sm:min-h-[240px] h-full w-full min-w-0 relative overflow-hidden"
          >
            {/* Decorative right-side glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#2B7FFF] to-[#AD46FF] opacity-10 blur-[54px] rounded-full pointer-events-none z-0"></div>

            {/* Top Content Layout */}
            <div className="w-full min-w-0 flex-1 relative z-10">
              {/* Title with flexible multiline layout adaptation */}
              <h2
                title={cat.name}
                className="text-xl sm:text-2xl font-bold text-[#111827] line-clamp-2 min-h-[2.5rem] break-all leading-tight"
              >
                {cat.name}
              </h2>



              <hr className="mt-4 border-gray-100 w-full" />

              {/* Description preview text */}
              <h3 className="font-bold text-[#111827] text-sm sm:text-[15px] mt-4">
                Description
              </h3>
              <p
                title={cat.description}
                className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-3 break-all mt-1.5"
              >
                {cat.description || "No description available"}
              </p>
            </div>

            <hr className="my-4 border-gray-100 w-full" />

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full mt-auto">
              {/* Edit Action Button */}
              <Button
                size="sm"
                onClick={() => navigate(`edit/${cat.id}`, { state: { category: cat } })}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#7B51FC] hover:bg-[#6A40EB] text-white rounded-full py-2.5 text-[12px] sm:text-[14px] px-2 sm:px-4 font-semibold transition-all duration-200 shadow-sm h-10 border-none"
              >
                <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] flex-shrink-0" />
                <span>Edit Category</span>
              </Button>

              {/* Delete Action Button */}
              <Button
                size="sm"
                onClick={() => setDeleteCategory(cat)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#FF4C4C] hover:bg-[#E63946] text-white rounded-full py-2.5 text-[12px] sm:text-[14px] px-2 sm:px-4 font-semibold transition-all duration-200 shadow-sm h-10 border-none"
              >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2] flex-shrink-0" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        )))}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 0 && !loading && (
        <div className="flex flex-col sm:flex-row justify-start items-center gap-6 mt-8 pt-6 border-t border-gray-100">
          <div className="text-sm text-gray-500 font-medium">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}-{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      isActive 
                        ? 'bg-[#615FFF] text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full px-4 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* DELETE DIALOG OVERLAY */}
      <Dialog
        open={!!deleteCategory}
        onOpenChange={() => setDeleteCategory(null)}
      >
        <DialogContent className="w-[92vw] max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Delete Category</DialogTitle>
          </DialogHeader>

          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Are you sure you want to permanently delete{" "}
            <b className="text-gray-900 font-semibold">{deleteCategory?.name}</b>?
          </p>

          <div className="flex justify-end gap-2.5 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteCategory(null)}
              className="text-xs sm:text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="text-xs sm:text-sm rounded-lg"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
