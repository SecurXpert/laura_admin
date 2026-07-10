import React, { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FiCalendar } from "react-icons/fi";
import { FiChevronDown } from "react-icons/fi";
import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
export default function ReviewsCardUI() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [open, setOpen] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const selectRef = useRef(null);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  // ✅ Fetch Courses
  useEffect(() => {
    if (!token) return;

    api
      .get("/admin/assigned-courses-instructor")
      .then((res) => {
        const mapped = (res.data || []).map((item: any) => ({
          id: item.course_id ?? item.id,
          name: item.course_name ?? item.name ?? "Unnamed",
        }));
        setCourses(mapped);

        if (mapped.length > 0) {
          fetchAllReviews(mapped);
        }
      })
      .catch((err) => console.error("Failed to fetch courses", err));
  }, [token]);

  const fetchAllReviews = async (courseList: any[]) => {
    setLoading(true);
    try {
      const allReviews = await Promise.all(
        courseList.map(c => api.get(`/reviews/by-course?course_id=${c.id}`).then(res => res.data || []).catch(() => []))
      );
      setReviews(allReviews.flat());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (value: number | "") => {
    setSelectedCourse(value);
    setOpen(false);

    // AUTO LOAD REVIEWS
    if (!value) {
      fetchAllReviews(courses);
      return;
    }

    setLoading(true);

    api
      .get(`/reviews/by-course?course_id=${value}`)
      .then((res) => {
        setReviews(res.data || []);
        setCurrentPage(1);
      })
      .catch((err) => console.error("Failed to fetch reviews", err))
      .finally(() => {
        setLoading(false);
      });
  };

  // ✅ DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      await api.delete(
        `/reviews/admin/delete-review/${id}`
      );

      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  // ✅ START EDIT
  const startEdit = (row: any) => {
    setEditingId(row.id);
    setEditText(row.review_text);
  };

  // ✅ SAVE EDIT
  const handleSave = async (row: any) => {
    try {
      await api.put(
        `/reviews/admin/edit-review/${row.id}`,
        {
          course_id: row.course_id,
          student_id: row.student_id,
          review_text: editText,
        }
      );

      setReviews((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, review_text: editText } : r
        )
      );

      setEditingId(null);
      setEditText("");
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* HEADER */}
      <div
        className="bg-white mb-6 w-full"
        style={{
          borderTop: "1.29px solid #E5E7EB",
          borderRadius: "20.68px",
          boxShadow:
            "0px 1.29px 2.59px -1.29px #0000001A, 0px 1.29px 3.88px 0px #0000001A",
        }}
      >
        <div className="p-4 sm:p-6 md:p-8">

          {/* TITLE */}
          <h2 className="ttext-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">
            Performance Review
          </h2>

          <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
            Evaluate student performance and provide feedback
          </p>

          {/* FORM */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mt-6">

            {/* LEFT SIDE */}
            <div className="flex flex-col w-full">
              <label className="mb-2 text-sm sm:text-base md:text-[18px] font-medium text-gray-900">
                Select Course
              </label>

              <div className="relative w-full max-w-[673px]">

                {/* Selected */}
                <div
                  onClick={() => setOpen(!open)}
                  className="min-h-[50px] sm:h-[56px] md:h-[63px] flex items-center justify-between px-4 rounded-[18px] border bg-gray-50 cursor-pointer"
                >
                  <span className="text-gray-800 text-sm sm:text-base truncate">
                    {courses.find(c => c.id === selectedCourse)?.name || "All Courses"}
                  </span>
                  <FiChevronDown className="text-gray-500 flex-shrink-0" />
                </div>

                {/* Dropdown */}
                {open && (
                  <div className="absolute top-full left-0 w-full bg-white border rounded-xl mt-2 shadow-lg z-50 max-h-60 overflow-y-auto">

                    <div
                      onClick={() => handleSelectCourse("")}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      All Courses
                    </div>

                    {courses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCourse(c.id)}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      {/* CARDS */}

      <h3 className="font-semibold mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <span className="text-base sm:text-lg">
          Selected Course {selectedCourse || "-"}
        </span>

        <span className="text-gray-400 text-sm sm:text-md">
          ({reviews.length} total reviews)
        </span>
      </h3>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 w-full">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[20px]" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p>No data</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {reviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row) => (
              <div
                key={row.id}
                className="bg-white rounded-[20px] p-4 sm:p-5 shadow-sm hover:shadow-md transition w-full overflow-hidden relative"
                style={{ border: '0.96px solid #F3F4F6' }}
              >
                {/* TOP-RIGHT GRADIENT BLOB */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#2B7FFF] to-[#AD46FF] opacity-10  blur-[54px] rounded-full pointer-events-none z-0"></div>

                {/* HEADER */}
                <div className="flex justify-between items-start mb-3 gap-3 relative z-10">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">
                      Student Name/ Id
                    </p>

                    <p className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                      {row.student_name || "Ramesh"} (STU ID: {row.student_id})
                    </p>
                  </div>

                  <span className="bg-[#E6F8ED] text-[#1E854A] px-3 py-1 text-xs sm:text-sm font-semibold rounded-full border border-green-200 whitespace-nowrap">
                    Id: {row.id}
                  </span>
                </div>

                {/* DATE */}
                <p className="text-xs sm:text-sm text-gray-400 mb-4 flex items-center gap-2 flex-wrap">
                  <FiCalendar size={16} />
                  Created AT {row.created_at || "—"}
                </p>

                {/* DETAILS BOX */}
                <div
                  className="rounded-xl p-3 sm:p-4 mb-4"
                  style={{
                    borderTop: "1.36px solid #F3F4F6",
                    borderBottom: "1.36px solid #F3F4F6",
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-gray-500 text-sm">Course ID</p>
                      <p className="font-semibold text-base sm:text-lg break-words">
                        {row.course_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm">
                        Instructor ID
                      </p>
                      <p className="font-semibold text-base sm:text-lg break-words">
                        {row.instructor_id}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">
                      Instructor Name
                    </p>
                    <p className="font-semibold text-base sm:text-lg break-words">
                      {row.instructor_name || "Rama"}
                    </p>
                  </div>
                </div>

                {/* REVIEW BOX */}
                <div
                  className="rounded-xl p-3 sm:p-4 mb-4 backdrop-blur-lg shadow-sm"
                  style={{
                    border: '0.96px solid rgba(243, 244, 246, 1)',
                    background: 'rgba(258, 259, 260, 1)'
                  }}
                >
                  <p className="text-gray-800 text-sm mb-2">
                    Review
                  </p>

                  {editingId === row.id ? (
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border p-2 w-full rounded-lg focus:outline-none text-sm"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-[#2B7FFF1A] text-[#2B7FFF] px-3 py-1 rounded-lg break-words max-w-full">
                        {row.review_text}
                      </span>
                    </div>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  {editingId === row.id ? (
                    <>
                      <button
                        onClick={() => handleSave(row)}
                        className="w-full sm:flex-1 bg-green-600 text-white py-2 rounded-lg"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="w-full sm:flex-1 bg-gray-400 text-white py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(row)}
                        className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <FiEdit size={16} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(row.id)}
                        className="w-full sm:flex-1 bg-red-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {!loading && reviews.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 px-2 gap-4">
              <div className="text-[13px] font-medium text-[#6B7280]">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, reviews.length)} of {reviews.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Previous
                </button>

                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                  {currentPage}
                </div>

                <button
                  disabled={currentPage === Math.ceil(reviews.length / itemsPerPage) || Math.ceil(reviews.length / itemsPerPage) === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reviews.length / itemsPerPage)))}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  )
}
