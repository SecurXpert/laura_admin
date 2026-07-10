import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar as CalendarIcon, Video, Search, Calendar, ChevronDown, Copy, Trash2, Clock } from "lucide-react";
import ScheduleClassForm from "@/components/admin/ScheduleClassForm";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveClass {
  id: number;
  course_id: number;
  title: string;
  scheduled_at: string;
  duration: number;
  join_link: string;
  recorded_link: string;
}

export default function LiveClasses() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, statusFilter]);

  useEffect(() => {
    fetchCourses();
    fetchLiveClasses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/admin/courses");
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
      console.error("Failed to fetch courses", err);
    }
  };

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      let url = "/admin/schedule-live-class";
      if (dateFilter) {
        // Assume API accepts YYYY-MM-DD
        url += `?date=${dateFilter}`;
      }
      
      const res = await api.get(url);
      const data = res.data;
      
      let classArray = [];
      if (Array.isArray(data)) {
        classArray = data;
      } else if (data && Array.isArray(data.data)) {
        classArray = data.data;
      } else if (data && Array.isArray(data.items)) {
        classArray = data.items;
      }

      const sortedClasses = [...classArray].sort((a, b) => b.id - a.id);
      setClasses(sortedClasses);
      applyClientFilters(sortedClasses, searchTerm, statusFilter);
    } catch (err) {
      console.error("Failed to fetch live classes", err);
      toast.error("Failed to fetch live classes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this live class?")) return;
    try {
      await api.delete(`/admin/schedule-live-class/${id}`);
      toast.success("Live class deleted successfully", {
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none"
      });
      fetchLiveClasses();
    } catch (err) {
      console.error("Failed to delete live class", err);
      toast.error("Failed to delete live class", {
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none"
      });
    }
  };

  const handleCopyLink = (link: string) => {
    if (!link) {
      toast.error("No join link available", {
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none"
      });
      return;
    }
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard", {
      className: "!bg-emerald-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none"
    });
  };

  const applyClientFilters = (classList: LiveClass[], search: string, status: string) => {
    let result = [...classList];

    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }

    if (status !== "All Status") {
      const now = new Date();
      if (status === "Active") {
        result = result.filter(c => new Date(c.scheduled_at) > now); // Simplistic check
      } else if (status === "Completed") {
        result = result.filter(c => new Date(c.scheduled_at) <= now);
      }
    }

    setFilteredClasses(result);
  };

  useEffect(() => {
    applyClientFilters(classes, searchTerm, statusFilter);
  }, [searchTerm, statusFilter, classes]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  // Re-fetch when date filter changes
  useEffect(() => {
    fetchLiveClasses();
  }, [dateFilter]);

  const handleReset = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("All Status");
  };

  const getCourseDescription = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course?.description || "Join this live class to explore the curriculum, interact with instructors, and master new concepts through hands-on guidance.";
  };

  return (
    <div className="w-full space-y-6 pb-8">
      {/* Header Section - Hide completely when form is open */}
      {!isFormOpen && (
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 transition-all duration-300">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Live Classes Management
            </h1>
             <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
              Schedule and manage your All live sessions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          

            <Button
              onClick={() => setIsFormOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-sm text-[14px] font-medium h-11 px-6 rounded-full transition-colors"
            >
              <CalendarIcon className="w-[18px] h-[18px]" />
              Schedule Class
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-8 transition-all duration-300 ease-in-out">
        {isFormOpen ? (
          <ScheduleClassForm
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              fetchLiveClasses();
              setIsFormOpen(false);
            }}
          />
        ) : (
          <div className="space-y-6">
            
            {/* Filters Section */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100/50 flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3 pr-4 md:border-r border-gray-100 min-w-max">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1] text-white flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 leading-tight">Filters & Search</h3>
                  <p className="text-[13px] text-gray-500 font-medium">Refine your Course list</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap flex-1 gap-3 w-full">
                {/* Search */}
                <div className="relative w-full sm:max-w-[300px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search Courses by title..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-gray-100 rounded-[14px] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all placeholder:text-gray-400 text-gray-700 h-full"
                  />
                </div>

                {/* Date Picker */}
                <div className="relative w-full sm:w-auto min-w-[140px]">
                  <input 
                    type="date"
                    value={dateFilter}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-4 pr-10 py-2.5 bg-[#F8FAFC] border border-gray-100 rounded-[14px] text-[14px] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6] transition-all text-gray-700 h-full"
                  />
                </div>



                {/* Reset */}
                <button 
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F8FAFC] border border-gray-100 rounded-[14px] text-[14px] font-medium text-gray-600 hover:bg-gray-100 transition-colors h-full shrink-0"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>

            {/* Grid of Classes */}
            {loading && classes.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100/60 h-[300px] flex flex-col justify-between">
                    <div>
                      <Skeleton className="h-6 w-3/4 mb-6 rounded-lg" />
                      <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
                        <div>
                          <Skeleton className="h-3 w-20 mb-2 rounded" />
                          <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                        <div>
                          <Skeleton className="h-3 w-20 mb-2 rounded" />
                          <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                      </div>
                      <Skeleton className="h-3 w-full mb-2 rounded" />
                      <Skeleton className="h-3 w-4/5 rounded" />
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Skeleton className="h-11 flex-1 rounded-full" />
                      <Skeleton className="h-11 flex-1 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="p-6 rounded-[24px] border border-slate-100 shadow-sm mb-8 bg-white flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-[#F5F3FF] rounded-full flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-[#8B5CF6]" />
                </div>
                <h3 className="text-[18px] font-bold text-slate-800">No live classes scheduled</h3>
                <p className="text-slate-500 mt-2 max-w-md text-[15px]">
                  Click the "Schedule Class" button above to create a new live session for your students.
                </p>
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                  {filteredClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((cls) => {
                    let formattedDate = "Unknown Date";
                  let formattedTime = "Unknown Time";
                  try {
                    const d = new Date(cls.scheduled_at);
                    formattedDate = format(d, "MM/dd/yy");
                    formattedTime = format(d, "h.mma (O)").replace('GMT+5:30', 'IST'); // basic assumption or just standard format
                  } catch (e) {
                    // Ignore date parse errors
                  }

                  // Check if it's active
                  const isActive = new Date(cls.scheduled_at) > new Date();

                  return (
                    <div key={cls.id} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-gray-100/60 flex flex-col h-full relative group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
                      
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[19px] font-bold text-gray-900 leading-snug pr-4 break-words break-all">
                          {cls.title}
                        </h3>
                      </div>

                  



                      <div className="grid grid-cols-2 gap-y-5 gap-x-4 mb-6">
                        <div>
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-[12px] font-medium">schedule date</span>
                          </div>
                          <p className="text-[15px] font-bold text-gray-900">{formattedDate}</p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-[12px] font-medium">Time</span>
                          </div>
                          <p className="text-[15px] font-bold text-gray-900">{formattedTime}</p>
                        </div>

                        <div className="col-span-2">
                          <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span className="text-[12px] font-medium">Duration</span>
                          </div>
                          <p className="text-[15px] font-bold text-gray-900">{cls.duration} min</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-6 pt-2">
                        <button 
                          onClick={() => handleCopyLink(cls.join_link)}
                          className="flex items-center gap-1.5 text-[14px] text-gray-500 font-medium hover:text-gray-700 transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </button>
                        {cls.join_link && (
                          <a 
                            href={cls.join_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[14px] text-[#6366F1] font-bold hover:underline"
                          >
                            Join Link
                          </a>
                        )}
                      </div>

                      <div className="mt-auto">
                        <button 
                          onClick={() => handleDelete(cls.id)}
                          className="w-full bg-[#FF4D4F] hover:bg-[#FF7875] text-white py-3 rounded-[12px] flex items-center justify-center gap-2 text-[15px] font-semibold transition-colors"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredClasses.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
                  <div className="text-[13px] font-medium text-[#6B7280]">
                    Showing {filteredClasses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-{Math.min(currentPage * itemsPerPage, filteredClasses.length)} of {filteredClasses.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.ceil(filteredClasses.length / itemsPerPage) }).map((_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === Math.ceil(filteredClasses.length / itemsPerPage) ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold transition-all ${currentPage === pageNumber
                              ? "bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent"
                              : "bg-white text-[#374151] border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }

                      if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return <span key={pageNumber} className="text-gray-400 font-bold px-1">...</span>;
                      }

                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredClasses.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredClasses.length / itemsPerPage) || filteredClasses.length === 0}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
