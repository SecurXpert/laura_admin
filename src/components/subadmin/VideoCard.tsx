import { Button } from "@/components/ui/button";
import { Play, Download, Trash2, Pencil } from "lucide-react";

export interface VideoItem {
  id: number;
  title: string;
  category: string;
  thumbnailUrl: string;
  duration: string;
  size: string;
  uploadDate: string;
  videoUrl: string;
  trainerId?: string;
}

interface VideoCardProps {
  video: VideoItem;
  onDownload?: (video: VideoItem) => void;
  onEdit?: (video: VideoItem) => void;
  onDelete?: (video: VideoItem) => void;
}

const VideoCard = ({ video, onDownload, onEdit, onDelete }: VideoCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
      {/* Thumbnail Section */}
      <a 
        href={video.videoUrl !== "#" ? video.videoUrl : undefined} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative aspect-video bg-gray-900 group cursor-pointer block overflow-hidden"
      >
        <img
          src={video.thumbnailUrl || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80"}
          alt={video.title}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80";
          }}
        />
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-blue-600 ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Duration Pill */}
        {video.duration && video.duration !== "00:00" && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </a>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-[16px] line-clamp-1 mb-4">
          {video.title}
        </h3>

        {/* Metrics */}
        <div className="flex items-center bg-gray-50 rounded-xl p-3 mb-5 mt-auto border border-gray-100">
          <div className="flex flex-col flex-1">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Duration</span>
            <span className="text-sm font-semibold text-gray-800">{video.duration || "N/A"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-4">
          <Button
            onClick={() => onDownload && onDownload(video)}
            className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl h-10 text-[13px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit && onEdit(video)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-[13px]"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete && onDelete(video)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-10 text-[13px]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-gray-100 mt-auto">
          <p className="text-xs text-gray-400">
            Uploaded on {video.uploadDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
