import React, { useEffect, useState } from "react";
import api from "@/lib/api"; import { toast } from "sonner";
import {
  Star,
  MessageSquare,
  Search,
  ShieldAlert
} from "lucide-react";
import { FiStar, FiMessageSquare, FiChevronDown, FiThumbsUp, FiChevronRight } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";

/* ================= API ================= */
const REVIEWS_API = "/admin/trainer-reviews";

interface Review {
  id: number;
  course_id: number;
  trainer_id: number;
  student_id: number;
  rating: number;
  sentiment: string;
  comment: string;
  visible_admin_only: boolean;
  created_at: string;
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [instructorFilter, setInstructorFilter] = useState("");
  const [starFilter, setStarFilter] = useState("");

  // Backend static datasets for mapping IDs to names
  const [students, setStudents] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const normalizeSentiment = (s: string) => {
    if (!s) return "";
    const lower = s.toLowerCase();
    if (lower.startsWith("pos")) return "Positive";
    if (lower.startsWith("neu")) return "Neutral";
    if (lower.startsWith("neg")) return "Negative";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getStudentName = (id: number) => {
    const found = students.find((s) => s.id === id);
    return found ? found.name || `${found.first_name || ""} ${found.last_name || ""}`.trim() || `Student #${id}` : `Student #${id}`;
  };

  const getCourseTitle = (id: number) => {
    const found = coursesList.find((c) => c.id === id);
    return found ? found.title || `Course #${id}` : `Course #${id}`;
  };

  const getInstructorName = (id: number) => {
    const found = instructors.find((i) => i.id === id);
    return found ? found.name || `Trainer #${id}` : `Trainer #${id}`;
  };

  const fetchStaticData = async () => {
    try {
      const res = await api.get("/student/students/list");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }

    try {
      const res = await api.get("/admin/courses");
      setCoursesList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }

    try {
      const res = await api.get("/admin/instructors");
      setInstructors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch instructors", err);
    }
  };

  /* ================= GET REVIEWS ================= */
  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await api.get(REVIEWS_API);

      console.log("API Response:", response.data);

      const itemsList = response.data.items || [];

      setReviews(itemsList);
      setFilteredReviews(itemsList);

      const computedTotal = response.data.total !== undefined ? response.data.total : itemsList.length;
      setTotal(computedTotal);

      let computedAvg = 0;
      if (response.data.avg_rating !== undefined) {
        computedAvg = response.data.avg_rating;
      } else if (itemsList.length > 0) {
        const sum = itemsList.reduce((acc: number, r: Review) => acc + r.rating, 0);
        computedAvg = sum / itemsList.length;
      }
      setAvgRating(computedAvg);

    } catch (error: any) {
      console.error("fetchReviews error:", error);
      toast.error("Failed to fetch trainer reviews");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD ON PAGE OPEN ================= */
  useEffect(() => {
    fetchReviews();
    fetchStaticData();
  }, []);

  const getAvatarColor = (id: number) => {
    const colors = [
      "bg-indigo-600",
      "bg-violet-600",
      "bg-purple-600",
      "bg-blue-600",
      "bg-fuchsia-600"
    ];
    return colors[id % colors.length];
  };

  /* ================= DYNAMIC SENTIMENT RESOLUTION ================= */
  const getSentiment = (rating: number) => {
    const rounded = Math.round(rating);
    if (rounded >= 4) return "Positive";
    if (rounded === 3) return "Neutral";
    return "Negative";
  };

  /* ================= DYNAMIC DISTRIBUTION RESOLUTION ================= */
  const getDistribution = () => {
    const counts = [0, 0, 0, 0, 0]; // 1*, 2*, 3*, 4*, 5*
    reviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (rating >= 1 && rating <= 5) {
        counts[rating - 1]++;
      }
    });
    return counts;
  };

  const counts = getDistribution();
  const totalCountForDistribution = reviews.length;

  const getReviewsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return reviews.filter(r => new Date(r.created_at) >= oneWeekAgo).length;
  };
  const reviewsThisWeek = getReviewsThisWeek();

  const getReviewsLast7Days = () => {
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    reviews.forEach(r => {
      const date = new Date(r.created_at);
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        dayCounts[6 - diffDays]++;
      }
    });
    return dayCounts;
  };
  const last7DaysCounts = getReviewsLast7Days();
  const maxDayCount = Math.max(...last7DaysCounts, 1);

  /* ================= APPLY / RESET FILTERS ================= */
  const handleApplyFilters = () => {
    let result = [...reviews];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(r => {
        const studentName = getStudentName(r.student_id).toLowerCase();
        const courseTitle = getCourseTitle(r.course_id).toLowerCase();
        const instructorName = getInstructorName(r.trainer_id).toLowerCase();
        const comment = r.comment.toLowerCase();
        const studentIdStr = `student id: ${r.student_id}`;
        const courseIdStr = `course id: ${r.course_id}`;
        const trainerIdStr = `trainer id: ${r.trainer_id}`;
        return (
          studentIdStr.includes(q) ||
          courseIdStr.includes(q) ||
          trainerIdStr.includes(q) ||
          comment.includes(q) ||
          String(r.student_id).includes(q) ||
          String(r.course_id).includes(q) ||
          String(r.trainer_id).includes(q) ||
          studentName.includes(q) ||
          courseTitle.includes(q) ||
          instructorName.includes(q)
        );
      });
    }

    if (courseFilter) {
      result = result.filter(r => String(r.course_id) === courseFilter);
    }

    if (instructorFilter) {
      result = result.filter(r => String(r.trainer_id) === instructorFilter);
    }

    if (starFilter) {
      result = result.filter(r => String(Math.round(r.rating)) === starFilter);
    }

    setFilteredReviews(result);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCourseFilter("");
    setInstructorFilter("");
    setStarFilter("");
    setFilteredReviews(reviews);
    setCurrentPage(1);
  };

  // Get unique options from reviews for filters
  const uniqueCourseIds = Array.from(new Set(reviews.map(r => r.course_id)));
  const uniqueTrainerIds = Array.from(new Set(reviews.map(r => r.trainer_id)));

  // Pagination bounds
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  return (
    <div className="w-full space-y-6 pb-8">

      {/* HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Student Reviews</h1>
        <p className="text-gray-500 text-sm mt-1">Review analytics dashboard with sentiment analysis</p>
      </div>

      {/* TOP SUMMARY STATS GRID - 2 CARDS IN A 4-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">

        {/* Card 1: Avg Rating */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[160px] border border-gray-100/50">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[13px] font-medium text-gray-500">Avg Rating</span>
              <h2 className="text-[28px] font-bold text-gray-900 leading-tight mt-1">{avgRating.toFixed(1)}</h2>
              <span className="text-[12px] font-medium text-[#10B981] mt-1 block">Out of 5.0</span>
            </div>
            <div className="w-12 h-12 rounded-[20px] bg-[#FF8A00] shadow-[0_4px_10px_rgba(255,138,0,0.3)] flex items-center justify-center text-white">
              <FiStar className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          {/* Wave SVG */}
          <svg className="w-full h-12 mt-3" viewBox="0 0 300 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient-wave-orange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FF8A00" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0,45 C50,42 75,52 120,48 C160,44 180,32 220,38 C260,44 280,35 300,32 L300,60 L0,60 Z"
              fill="url(#gradient-wave-orange)"
            />
            <path
              d="M0,45 C50,42 75,52 120,48 C160,44 180,32 220,38 C260,44 280,35 300,32"
              fill="none"
              stroke="#FF8A00"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[160px] border border-gray-100/50">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[13px] font-medium text-gray-500">Total Reviews</span>
              <h2 className="text-[28px] font-bold text-gray-900 leading-tight mt-1">{total}</h2>
              <span className="text-[12px] font-medium text-[#10B981] mt-1 block">+{reviewsThisWeek} this week</span>
            </div>
            <div className="w-12 h-12 rounded-[20px] bg-[#8B5CF6] shadow-[0_4px_10px_rgba(139,92,246,0.3)] flex items-center justify-center text-white">
              <FiMessageSquare className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
          {/* Bar Chart - Static aesthetic heights matching the image */}
          <div className="flex items-end justify-between gap-1.5 h-12 mt-3">
            {[100, 85, 90, 60, 75, 65, 55].map((heightPct, index) => (
              <div
                key={index}
                className="w-full bg-[#6366F1] rounded-t-[4px] transition-all duration-300"
                style={{ height: `${heightPct}%` }}
              />
            ))}
          </div>
        </div>

      </div>

      {/* RATING DISTRIBUTION CARD - FULL WIDTH */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-[22px] font-bold text-gray-900">Rating Distribution</h3>
        </div>

        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = counts[stars - 1];
            const pct = totalCountForDistribution > 0 ? Math.round((count / totalCountForDistribution) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-4">
                <span className="text-[13px] font-medium text-gray-700 w-6">{stars}★</span>
                <div className="flex-1 h-5 bg-[#E5E7EB] rounded-full relative overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[#FF8A00] flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  >
                    {pct > 5 && (
                      <span className="text-white text-[11px] font-medium">{count}</span>
                    )}
                  </div>
                </div>
                <span className="text-[13px] text-gray-700 font-medium w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTERS CONTAINER */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

          {/* Search bar */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-[18px] h-[18px]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search Reviews"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-[#F1F5F9] rounded-[16px] text-[13px] font-medium focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] bg-[#F8FAFC] transition-all placeholder:text-[#94A3B8] text-gray-700"
            />
          </div>

          {/* Filter selectors */}
          <div className="flex flex-wrap items-center gap-4">

            {/* Courses selector */}
            <div className="relative min-w-[160px]">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full appearance-none border border-[#F1F5F9] rounded-[16px] pl-4 pr-10 py-3 text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] bg-[#F8FAFC] cursor-pointer"
              >
                <option value="">All Courses</option>
                {uniqueCourseIds.map(id => (
                  <option key={id} value={String(id)}>{getCourseTitle(id)}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none w-4 h-4" />
            </div>

            {/* Instructor selector */}
            <div className="relative min-w-[160px]">
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="w-full appearance-none border border-[#F1F5F9] rounded-[16px] pl-4 pr-10 py-3 text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] bg-[#F8FAFC] cursor-pointer"
              >
                <option value="">All Instructor</option>
                {uniqueTrainerIds.map(id => (
                  <option key={id} value={String(id)}>{getInstructorName(id)}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none w-4 h-4" />
            </div>

            {/* Stars selector */}
            <div className="relative min-w-[140px]">
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                className="w-full appearance-none border border-[#F1F5F9] rounded-[16px] pl-4 pr-10 py-3 text-[13px] font-semibold text-gray-700 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] bg-[#F8FAFC] cursor-pointer"
              >
                <option value="">All Stars</option>
                {[5, 4, 3, 2, 1].map(stars => (
                  <option key={stars} value={String(stars)}>{stars} Stars</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none w-4 h-4" />
            </div>

          </div>
        </div>

        {/* Buttons right aligned */}
        <div className="flex items-center justify-end gap-5">
          <button
            onClick={handleResetFilters}
            className="text-[14px] font-medium text-[#64748B] hover:text-gray-900 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="bg-[#9055FD] hover:bg-[#7D40EC] text-white text-[14px] font-medium px-8 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* REVIEWS TABLE CARD */}
      <div className="bg-white border border-gray-100 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left bg-[#F9FAFB80]">
                <th className="py-4 pl-6 pr-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Student</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Course</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Instructor</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Rating</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Comment</th>
                <th className="py-4 px-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Sentiment</th>
                <th className="py-4 pl-4 pr-6 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-55">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="p-4">
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </td>
                  </tr>
                ))
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-455 font-semibold text-sm">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                currentItems.map((review) => {
                  const sentiment = normalizeSentiment(review.sentiment) || getSentiment(review.rating);
                  const avatarColor = getAvatarColor(review.student_id);

                  return (
                    <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">

                      {/* Student Column */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-[34px] h-[34px] rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-[13px] font-semibold shadow-sm`}>
                            {getStudentName(review.student_id).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ST'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 text-[14px] block truncate">
                              {getStudentName(review.student_id)}
                            </span>
                            {review.visible_admin_only && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100 mt-0.5">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                <span>Admin Only</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Course Column */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900 text-[14px] block">
                          {getCourseTitle(review.course_id)}
                        </span>
                      </td>

                      {/* Instructor Column */}
                      <td className="py-4 px-4">
                        <span className="text-gray-500 font-medium text-[14px] block">
                          {getInstructorName(review.trainer_id)}
                        </span>
                      </td>

                      {/* Rating Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FiStar
                              key={star}
                              className={`w-4 h-4 ${star <= Math.round(review.rating)
                                ? "text-[#FF8A00] fill-[#FF8A00]"
                                : "text-[#E2E8F0] fill-[#E2E8F0]"
                                }`}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Comment Column */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <p className="text-gray-600 text-[13px] line-clamp-2" title={review.comment}>
                          {review.comment || "—"}
                        </p>
                      </td>

                      {/* Sentiment Column */}
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[13px] font-medium inline-block
                          ${sentiment === "Positive"
                            ? "bg-[#D1FAE5] text-[#059669]"
                            : sentiment === "Neutral"
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : "bg-[#FEE2E2] text-[#DC2626]"
                          }`}
                        >
                          {sentiment}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="py-4 pl-4 pr-6 text-gray-500 text-[14px]">
                        {new Date(review.created_at).toLocaleDateString('en-GB')}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredReviews.length > 0 && (
          <div className="flex items-center justify-between px-6 py-5 border-t border-gray-100">
            <span className="text-[14px] text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredReviews.length)} of {filteredReviews.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="border border-gray-200 rounded-full px-5 py-2 text-[14px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "w-9 h-9 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[14px] font-medium transition-all shadow-sm"
                      : "w-9 h-9 rounded-full border border-gray-200 text-gray-700 flex items-center justify-center text-[14px] font-medium hover:bg-gray-50 transition-all"
                  }
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="border border-gray-200 rounded-full px-5 py-2 text-[14px] font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Reviews;