import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { FiSearch } from "react-icons/fi";
import api from "@/lib/api";

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isCollapsed, onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileName, setProfileName] = useState(" ");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/profile");
        if (res.data?.name) {
          setProfileName(res.data.name);
        }
      } catch (err) {
        console.error("Failed to fetch profile in header:", err);
      }
    };
    fetchProfile();
  }, []);

  const goToProfile = () => {
    navigate("/dashboard/profile");
  };

  const initials = profileName
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AU";

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-[#F8F9FB]/95 backdrop-blur-md border-b border-[#ECEEF2]/40 transition-all duration-300",
        isCollapsed ? "left-0 md:left-[96px]" : "left-0 md:left-[288px]"
      )}
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left side: Menu toggle + Search Bar exactly matching screenshot */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Menu icon button for mobile sidebar toggling */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 text-gray-600 flex-shrink-0 md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </Button>

          {/* Premium Search Bar matching user screenshot precisely */}
          <div className="relative w-full max-w-md hidden sm:block">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search Courses,assesments, or resources..."
              className="w-full bg-white text-gray-800 placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2.5 outline-none shadow-sm border border-gray-100/50 focus:border-[#5D3EFC] transition-all"
            />
          </div>
        </div>

        {/* Right side: Premium profile block precisely matching user screenshot */}
        <div className="flex items-center gap-3">
          {/* User profile layout */}
          <div
            onClick={goToProfile}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Go to Profile"
          >
            {/* User Name & Role aligned right */}
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#5D3EFC] transition-colors">
                {profileName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                Admin
              </p>
            </div>

            {/* Premium Gradient Circle Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#5D3EFC] flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-md shadow-[#5D3EFC]/25 group-hover:scale-105 transition-transform">
              {initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;