import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  FiSearch, FiPieChart, FiUsers, FiUserCheck, FiUserPlus, FiShield,
  FiBookOpen, FiVideo, FiCheckSquare, FiClipboard, FiFileText,
  FiTerminal, FiAward, FiClock, FiStar, FiUser, FiFilm, FiGrid
} from "react-icons/fi";
import api from "@/lib/api";

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

const GLOBAL_SEARCH_ROUTES = [
  { title: "Dashboard Overview", path: "/dashboard", category: "Dashboard", icon: <FiPieChart className="w-4 h-4" /> },
  { title: "All Users", path: "/Allusers", category: "Users", icon: <FiUsers className="w-4 h-4" /> },
  { title: "Registered Users", path: "/registered-users", category: "Users", icon: <FiUsers className="w-4 h-4" /> },
  { title: "Categories", path: "/categories", category: "Courses", icon: <FiGrid className="w-4 h-4" /> },
  { title: "Instructors", path: "/instructors", category: "Users", icon: <FiUserCheck className="w-4 h-4" /> },
  { title: "Courses", path: "/courses", category: "Courses", icon: <FiBookOpen className="w-4 h-4" /> },
  { title: "Live Classes", path: "/live-classes", category: "Courses", icon: <FiVideo className="w-4 h-4" /> },
  { title: "Recorded Videos", path: "/recorded-videos", category: "Courses", icon: <FiFilm className="w-4 h-4" /> },
  { title: "Instructor Quizzes", path: "/quizzes", category: "Assessments", icon: <FiClipboard className="w-4 h-4" /> },
  { title: "Admin Quizzes", path: "/admin-quizzes", category: "Assessments", icon: <FiClipboard className="w-4 h-4" /> },
  { title: "Attendance", path: "/attendance", category: "Reports", icon: <FiClock className="w-4 h-4" /> },
  { title: "Student Enrollments", path: "/ADMINENROLLMENTS", category: "Courses", icon: <FiCheckSquare className="w-4 h-4" /> },
  { title: "Assign Course → Instructor", path: "/assign-course", category: "Courses", icon: <FiCheckSquare className="w-4 h-4" /> },
  { title: "Assign Course → Student", path: "/assign-course-student", category: "Courses", icon: <FiCheckSquare className="w-4 h-4" /> },
  { title: "Sub Admins", path: "/sub-admins", category: "Users", icon: <FiShield className="w-4 h-4" /> },
  { title: "Students", path: "/Students", category: "Users", icon: <FiUsers className="w-4 h-4" /> },
  { title: "Guest Quizzes", path: "/GuestQUizzes", category: "Assessments", icon: <FiAward className="w-4 h-4" /> },
  { title: "Guest Exams", path: "/guest-exams", category: "Assessments", icon: <FiFileText className="w-4 h-4" /> },
  { title: "Guest Compiler Questions", path: "/guest-compiler-questions", category: "Assessments", icon: <FiTerminal className="w-4 h-4" /> },
  { title: "Student Reviews", path: "/reviews", category: "Reports", icon: <FiStar className="w-4 h-4" /> },
  { title: "Performance Review", path: "/PerformanceReview", category: "Reports", icon: <FiStar className="w-4 h-4" /> },
  { title: "Guest Result", path: "/Guest", category: "Reports", icon: <FiAward className="w-4 h-4" /> },
  { title: "Certificates", path: "/certificates", category: "Reports", icon: <FiAward className="w-4 h-4" /> },
  { title: "Resumes", path: "/resumes", category: "Reports", icon: <FiFileText className="w-4 h-4" /> },
  { title: "Student Results", path: "/results", category: "Reports", icon: <FiAward className="w-4 h-4" /> },
  { title: "Profile", path: "/profile", category: "Settings", icon: <FiUser className="w-4 h-4" /> },
];

const Header = ({ isCollapsed, onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileName, setProfileName] = useState(" ");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProfile = () => {
    navigate("/profile");
  };

  const handleSearchNavigation = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const filteredRoutes = GLOBAL_SEARCH_ROUTES.filter(route => 
    route.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex items-center justify-between h-full px-4 sm:px-6 relative">
        {/* Left side: Menu toggle + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-gray-100 text-gray-600 flex-shrink-0 md:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </Button>

          {/* Premium Search Bar */}
          <div className="relative w-full max-w-md hidden sm:block" ref={searchRef}>
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search courses, assessments, or pages..."
              className="w-full bg-white text-gray-800 placeholder-gray-400 text-xs rounded-full pl-9 pr-4 py-2.5 outline-none shadow-sm border border-gray-100/50 focus:border-[#5D3EFC] transition-all"
            />

            {/* Dropdown Results */}
            {isSearchOpen && searchQuery.trim() !== "" && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-[400px] overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                {filteredRoutes.length > 0 ? (
                  <div className="px-2">
                    {filteredRoutes.map((route, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchNavigation(route.path)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-[#5D3EFC] transition-colors">
                          {route.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-[#5D3EFC] transition-colors">
                            {route.title}
                          </p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                            {route.category}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Premium profile block */}
        <div className="flex items-center gap-3">
          <div
            onClick={goToProfile}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Go to Profile"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-800 leading-tight group-hover:text-[#5D3EFC] transition-colors">
                {profileName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                Admin
              </p>
            </div>
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