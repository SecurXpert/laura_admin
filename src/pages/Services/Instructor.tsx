import { useEffect, useState } from "react";
import api from "../../lib/api";
import { toast } from "@/components/ui/use-toast";

import { Instructor } from "./InstructorComponents/types";
import InstructorHeader from "./InstructorComponents/InstructorHeader";
import InstructorCardList from "./InstructorComponents/InstructorCardList";
import InstructorPagination from "./InstructorComponents/InstructorPagination";
import InstructorDeleteModal from "./InstructorComponents/InstructorDeleteModal";

const InstructorPage = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [filtered, setFiltered] = useState<Instructor[]>([]);
  const [search, setSearch] = useState("");
  const [deleteInstructor, setDeleteInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  /* ================= ERROR HANDLER ================= */
  const mapApiError = (error: any) => {
    const status = error?.response?.status;
    switch (status) {
      case 400:
        return "Invalid request";
      case 404:
        return "Instructor not found";
      case 409:
        return "Instructor already exists";
      case 500:
        return "Server error";
      default:
        return error?.response?.data?.detail || "Something went wrong";
    }
  };

  /* ================= FETCH ================= */
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/instructors");
      setInstructors(res.data);
      setFiltered(res.data);
    } catch (error: any) {
      console.error("Failed to fetch live instructors.");
      toast({
        title: "Error",
        description: mapApiError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    setCurrentPage(1);
    const q = search.trim().toLowerCase();

    if (!q) {
      setFiltered(instructors);
      return;
    }

    setFiltered(
      instructors.filter(
        (inst) =>
          inst.name.toLowerCase().includes(q)
      )
    );
  }, [search, instructors]);

  /* ================= DELETE ================= */
  const confirmDelete = async () => {
    if (!deleteInstructor) return;

    try {
      await api.delete(`/admin/instructor/${deleteInstructor.id}`);

      setInstructors((prev) =>
        prev.filter((inst) => inst.id !== deleteInstructor.id)
      );
      setFiltered((prev) =>
        prev.filter((inst) => inst.id !== deleteInstructor.id)
      );

      toast({
        title: "Deleted",
        description: "Instructor deleted successfully",
        className: "bg-red-500 text-white",
        duration: 2000,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: mapApiError(error),
        variant: "destructive",
      });
    } finally {
      setDeleteInstructor(null);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      <InstructorHeader search={search} setSearch={setSearch} />

      <InstructorCardList
        loading={loading}
        instructors={filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
        onDelete={(inst) => setDeleteInstructor(inst)}
      />

      {(!loading && filtered.length > 0) && (
        <InstructorPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
        />
      )}

      <InstructorDeleteModal
        deleteInstructor={deleteInstructor}
        setDeleteInstructor={setDeleteInstructor}
        confirmDelete={confirmDelete}
      />
    </div>
  );
};

export default InstructorPage;