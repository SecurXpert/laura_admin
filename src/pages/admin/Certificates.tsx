import React, { useState, useEffect } from "react";
import axios from "axios";
import { Award, Search, AlertCircle, RefreshCw, Download, Share2, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const API_BASE_URL = "https://lauratek.in:8000";

export default function Certificates() {
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState(true);

  const [certificates, setCertificates] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 6;

  const handleShare = async (certUrl: string, title: string) => {
    if (!certUrl) {
      toast.error("No certificate link available to share.");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${title}`,
          text: `Check out this certificate: ${title}`,
          url: certUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(certUrl);
        toast.success("Certificate link copied to clipboard!");
      } catch (err) {
        console.error("Error copying to clipboard:", err);
        toast.error("Failed to copy link.");
      }
    }
  };

  // Fetch courses for dropdown on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        setFetchingCourses(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else if (data && Array.isArray(data.data)) {
          setCourses(data.data);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error("Failed to fetch courses for dropdown", err);
        setCourses([]);
      } finally {
        setFetchingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch certificates when courseId changes, or when courses are loaded
  useEffect(() => {
    const fetchCertificates = async () => {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        return;
      }

      setLoading(true);
      setError(null);
      setCertificates(null);
      setCurrentPage(1);

      // If no specific course is selected (All Courses)
      if (!courseId) {
        if (courses.length === 0) {
          setCertificates([]);
          setLoading(false);
          return;
        }

        try {
          // Fetch certificates for ALL courses concurrently
          const promises = courses.map((c) =>
            axios.get(`${API_BASE_URL}/trainer/courses/${c.id}/certificates`, {
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => null) // Silently ignore if a specific course fails or has no certs
          );

          const results = await Promise.all(promises);
          let allCerts: any[] = [];

          results.forEach((res) => {
            if (res && res.data) {
              const certs = Array.isArray(res.data)
                ? res.data
                : Array.isArray(res.data.certificates)
                  ? res.data.certificates
                  : [];
              allCerts = [...allCerts, ...certs];
            }
          });

          const sortedAllCerts = [...allCerts].sort((a: any, b: any) => b.id - a.id);
          setCertificates(sortedAllCerts);
        } catch (err: any) {
          console.error("Failed to fetch all certificates", err);
          setError("Failed to load certificates for all courses");
        } finally {
          setLoading(false);
        }
        return;
      }

      // If a specific course IS selected
      try {
        const response = await axios.get(`${API_BASE_URL}/trainer/courses/${courseId}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sortedData = [...(response.data || [])].sort((a: any, b: any) => b.id - a.id);
        setCertificates(sortedData);
      } catch (err: any) {
        console.error(err);
        setError(
          err.response?.data?.detail ||
          err.message ||
          "Failed to load certificates"
        );
      } finally {
        setLoading(false);
      }
    };

    // Only attempt to fetch if we have loaded the courses list (or if they specifically picked a course)
    if (!fetchingCourses) {
      fetchCertificates();
    }
  }, [courseId, courses, fetchingCourses]);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-80 w-full rounded-2xl" />
      ))}
    </div>
  );

  const renderData = () => {
    if (!certificates) return null;

    // Extract the array whether it's wrapped or returned directly
    const certArray = Array.isArray(certificates) ? certificates : (Array.isArray(certificates.certificates) ? certificates.certificates : null);

    if (certArray) {
      if (certArray.length === 0) {
        return (
          <div className="p-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-200 mt-6">
            <Award className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium">No certificates found.</p>
          </div>
        );
      }

      const totalPages = Math.ceil(certArray.length / CARDS_PER_PAGE);
      const paginatedCerts = certArray.slice((currentPage - 1) * CARDS_PER_PAGE, currentPage * CARDS_PER_PAGE);

      return (
        <div className="mt-6 flex flex-col gap-6">
          {/* CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCerts.map((cert: any, i: number) => {
              const title = cert.course_name || cert.student_name || cert.title || cert.name || "Course Name";
              const certId = cert.certificate_no || cert.certificate_id || cert.id || `LTRK-2026-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

              const issuedAtRaw = cert.issued_at || cert.issued_on || cert.created_at || cert.issue_date || "May 13, 2026";
              const dateObj = new Date(issuedAtRaw);
              const issuedOn = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : issuedAtRaw;

              const status = cert.status || "Valid";
              const downloadUrl = cert.download_url;

              return (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow h-full">
                  {/* TOP SECTION */}
                  <div className="bg-gradient-to-r from-[#286ee6] to-[#9a38f5] pt-10 pb-8 px-4 flex flex-col items-center justify-center text-white text-center">
                    <div className="w-[54px] h-[54px] rounded-full border-[1.5px] border-white/40 flex items-center justify-center mb-5 bg-white/5 backdrop-blur-sm">
                      <Award className="w-6 h-6 text-white stroke-[1.5]" />
                    </div>
                    <p className="text-[10px] font-medium tracking-[0.1em] uppercase mb-2 opacity-90">
                      CERTIFICATE OF COMPLETION
                    </p>
                    <h3 className="text-[20px] font-bold tracking-wide capitalize line-clamp-2 px-4 leading-tight">
                      {title}
                    </h3>
                  </div>

                  {/* BOTTOM SECTION */}
                  <div className="p-6 flex flex-col gap-4 bg-white flex-1">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Certificate ID</span>
                      <span className="text-gray-800 font-bold">{certId}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Issued On</span>
                      <span className="text-gray-800 font-bold">{issuedOn}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400 font-medium">Status</span>
                      <span className="text-gray-800 font-bold capitalize">{status}</span>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3 mt-4 pt-1 items-center">
                      {downloadUrl ? (
                        <a href={downloadUrl} target="_blank" rel="noreferrer" className="flex-1 bg-gradient-to-r from-[#286ee6] to-[#9a38f5] text-white rounded-full py-3 text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                          <Download className="w-[18px] h-[18px]" />
                          Download
                        </a>
                      ) : (
                        <button className="flex-1 bg-gradient-to-r from-[#286ee6] to-[#9a38f5] text-white rounded-full py-3 text-[14px] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                          <Download className="w-[18px] h-[18px]" />
                          Download
                        </button>
                      )}
                      <button onClick={() => handleShare(downloadUrl, title)} className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors shrink-0 shadow-sm">
                        <Share2 className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-2 gap-4">
              <div className="text-[13px] font-medium text-[#6B7280]">
                Showing {((currentPage - 1) * CARDS_PER_PAGE) + 1}-
                {Math.min(currentPage * CARDS_PER_PAGE, certArray.length)} of {certArray.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Previous
                </button>

                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                  {currentPage}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm overflow-auto mt-6">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {typeof certificates === 'object' ? JSON.stringify(certificates, null, 2) : String(certificates)}
        </pre>
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Course Certificates
            </h1>
            <p className="text-md text-gray-500 mt-1">
              Fetch and manage certificates for specific courses
            </p>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={fetchingCourses}
            className="w-full h-[50px] pl-4 pr-10 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500/20 outline-none transition-all appearance-none text-gray-800 disabled:opacity-60"
          >
            <option value="">
              {fetchingCourses ? "Loading courses..." : "All Courses (Show All Certificates)"}
            </option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title || c.course_name} (ID: {c.id})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center flex flex-col items-center mt-6">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* CONTENT */}
      {loading ? renderSkeleton() : renderData()}
    </div>
  );
}
