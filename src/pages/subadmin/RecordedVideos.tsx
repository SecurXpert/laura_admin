import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, ChevronDown, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import UploadVideoForm from "@/components/subadmin/UploadVideoForm";
import VideoCard, { VideoItem } from "@/components/subadmin/VideoCard";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://lauratek.in:8000";

export default function RecordedVideos() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, courseFilter]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch Courses for Dropdown
      try {
        const coursesRes = await fetch(`${API_BASE_URL}/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          let coursesArray = [];
          if (Array.isArray(coursesData)) {
            coursesArray = coursesData;
          } else if (coursesData && Array.isArray(coursesData.courses)) {
            coursesArray = coursesData.courses;
          } else if (coursesData && Array.isArray(coursesData.data)) {
            coursesArray = coursesData.data;
          }
          setCourses(coursesArray);
        }
      } catch (err) {
        console.warn("Failed to fetch courses for filter", err);
      }

      // Fetch All Videos
      // We pass no filters so we get all videos for client-side filtering
      const params = new URLSearchParams();
      params.append("skip", "0");
      params.append("limit", "1000");

      const url = `${API_BASE_URL}/admin/recorded-videos?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recorded videos");
      }

      const data = await response.json();
      console.log("Fetched recorded videos:", data);
      
      let videoArray = [];
      if (Array.isArray(data)) {
        videoArray = data;
      } else if (data && Array.isArray(data.data)) {
        videoArray = data.data;
      } else if (data && Array.isArray(data.items)) {
        videoArray = data.items;
      } else if (data && Array.isArray(data.videos)) {
        videoArray = data.videos;
      } else if (data && Array.isArray(data.recorded_videos)) {
        videoArray = data.recorded_videos;
      } else {
        console.warn("Unexpected API response format:", data);
      }

      const sortedArray = [...videoArray].sort((a: any, b: any) => {
        const idA = a.id || a.video_id || 0;
        const idB = b.id || b.video_id || 0;
        return idB - idA;
      });

      const mappedVideos: VideoItem[] = sortedArray.map((item: any) => {
        let durationStr = "00:00";
        if (item.duration_seconds) {
          const m = Math.floor(item.duration_seconds / 60);
          const s = Math.floor(item.duration_seconds % 60);
          durationStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        
        return {
          id: item.id || item.video_id,
          title: item.title || "Untitled Video",
          category: `Course ${item.course_id}`,
          courseId: item.course_id?.toString() || "",
          thumbnailUrl: item.thumbnail_url || item.thumbnail || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
          duration: durationStr,
          uploadDate: item.recorded_date ? item.recorded_date.split("T")[0] : "Unknown",
          videoUrl: item.video_url || item.video_file || "#",
          trainerId: item.trainer_id || "",
        };
      });

      setVideos(mappedVideos);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recorded videos.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Client-Side Filtering logic
  const filteredVideos = videos.filter((video) => {
    // Search query match (title)
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Course match
    if (courseFilter !== "all" && (video as any).courseId !== courseFilter) {
      return false;
    }
    // Date match (exact string match for now, assuming uploadDate is YYYY-MM-DD)
    if (dateFilter && video.uploadDate !== dateFilter) {
      return false;
    }
    return true;
  });

  const handleDownload = (video: VideoItem) => {
    if (video.videoUrl && video.videoUrl !== "#") {
      window.open(video.videoUrl, "_blank");
    } else {
      toast({
        title: "Download unavailable",
        description: "No valid video URL found for download.",
      });
    }
  };

  const handleEdit = (video: VideoItem) => {
    setEditingVideo(video);
    setIsFormOpen(true);
  };

  const handleDelete = async (video: VideoItem) => {
    if (!window.confirm("Are you sure you want to delete this recorded video?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/recorded-video/${video.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      setVideos(videos.filter(v => v.id !== video.id));
      toast({
        title: "Success",
        description: "Video deleted successfully.",
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none",
      });
    } catch (err) {
      console.error("Failed to delete video", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete video. Please try again.",
        className: "!bg-red-600 !text-white !font-medium !p-4 !rounded-[16px] !shadow-lg !border-none",
      });
    }
  };

  return (
    <div className="w-full max-w-full box-border space-y-6 sm:space-y-8">
      {/* Header Section */}
      {!isFormOpen && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full box-border gap-4 mb-6 transition-all duration-300">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
              Recorded Videos
            </h1>
            <p className="text-md sm:text-md text-[#4B5563] mt-1 font-medium">
              Manage your course video library
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            
            <Button
              onClick={() => {
                setEditingVideo(null);
                setIsFormOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm text-[14px] font-medium h-10 px-4 rounded-xl transition-colors"
            >
              <Plus className="w-[18px] h-[18px]" />
              Upload Video
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mt-8 transition-all duration-300 ease-in-out">
        {isFormOpen ? (
          <UploadVideoForm
            editVideoId={editingVideo?.id}
            initialData={editingVideo}
            onClose={() => {
              setIsFormOpen(false);
              setEditingVideo(null);
            }}
            onSuccess={() => {
              fetchInitialData();
              setIsFormOpen(false);
              setEditingVideo(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#F8FAFC] border-gray-200 h-11 rounded-lg text-[14px] focus-visible:ring-1 focus-visible:ring-[#6366F1]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-[180px]">
                  <Input
                    type="date"
                    value={dateFilter}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-[#F8FAFC] border-gray-200 h-11 rounded-lg text-[14px] text-gray-600 focus-visible:ring-1 focus-visible:ring-[#6366F1] w-full"
                  />
                </div>
                <div className="relative w-full sm:w-[180px]">
                  <select 
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full h-11 pl-3 pr-10 bg-[#F8FAFC] border border-gray-200 rounded-lg text-[14px] text-gray-700 outline-none focus:ring-1 focus:ring-[#6366F1] appearance-none cursor-pointer"
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id.toString()}>
                        {course.name || course.title || `Course ${course.id}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Video Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {filteredVideos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((video) => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      onDownload={handleDownload}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-start py-5 mt-4 border-t border-gray-100 gap-6 w-full">
                  <div className="text-[13px] font-medium text-[#6B7280]">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVideos.length)} of {filteredVideos.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.ceil(filteredVideos.length / itemsPerPage) }).map((_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === Math.ceil(filteredVideos.length / itemsPerPage) ||
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
                      onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredVideos.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredVideos.length / itemsPerPage)}
                      className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-slate-200 shadow-sm bg-white flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-[#EEF2FF] rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-[#6366F1]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">No videos found</h3>
                <p className="text-slate-500 mt-2 max-w-md">
                  {videos.length === 0 
                    ? "Your video library is empty. Click the 'Upload Video' button above to add one."
                    : "We couldn't find any videos matching your search criteria. Try adjusting your filters."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
