import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Layers,
  BookOpen,
  GraduationCap,
  CheckSquare,
  FileQuestion,
  Calendar,
  UserPlus,
  Briefcase,
  ClipboardList,
  Shield,
  User,
  Puzzle,
  ScrollText,
  Terminal,
  Brain,
  Code,
  Star,
  BarChart,
  Medal,
  FileText,
  Award,
  UserCircle,
  LogOut,
  X,
  Video,
  Film,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { PiCertificateFill } from "react-icons/pi";

import { Button } from "@/components/ui/button";
import logo from "@/Assets/lauratek.png";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/", { replace: true });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Users", path: "/Allusers" },
    { icon: UserCheck, label: "Guest Users", path: "/registered-users" },
    { icon: Layers, label: "Categories", path: "/categories" },

    {
      icon: GraduationCap,
      label: "Instructors",
      path: "/instructors",
    },
    { icon: BookOpen, label: "Courses", path: "/courses" },
    { icon: Video, label: "Live Classes", path: "/live-classes" },
    { icon: Film, label: "Recorded Videos", path: "/recorded-videos" },
    {
      icon: CheckSquare,
      label: "Instructor Quizzes",
      path: "/quizzes",
    },
    {
      icon: FileQuestion,
      label: "Admin Quizzes",
      path: "/admin-quizzes",
    },
    {
      icon: Calendar,
      label: "Attendance",
      path: "/attendance",
    },
    {
      icon: UserPlus,
      label: "Student Enrollments",
      path: "/ADMINENROLLMENTS",
    },
    {
      icon: Briefcase,
      label: "Assign Course → Instructor",
      path: "/assign-course",
    },
    {
      icon: ClipboardList,
      label: "Assign Course → Student",
      path: "/assign-course-student",
    },
    {
      icon: Shield,
      label: "Sub admins",
      path: "/sub-admins",
    },
    { icon: User, label: "students", path: "/Students" },
    {
      icon: Puzzle,
      label: "Guest Quizzes",
      path: "/GuestQUizzes",
    },
    {
      icon: ScrollText,
      label: "Guest Exams",
      path: "/guest-exams",
    },
    {
      icon: Terminal,
      label: "Guest Compiler Questions",
      path: "/guest-compiler-questions",
    },
    {
      icon: Brain,
      label: "Student Exams",
      path: "/student-exams",
    },
    {
      icon: Code,
      label: "Student Compiler Questions",
      path: "/student-compiler-questions",
    },
    { icon: Star, label: "Student Reviews", path: "/reviews" },
    {
      icon: BarChart,
      label: "Performance Review",
      path: "/PerformanceReview",
    },
    { icon: Medal, label: "Guest Result", path: "/Guest" },

    { icon: PiCertificateFill, label: "Certificates", path: "/certificates" },
    { icon: FileText, label: "Resumes", path: "/resumes" },
    { icon: Award, label: "Student Results", path: "/results" },

    { icon: UserCircle, label: "Profile", path: "/profile" },

    { icon: LogOut, label: "Logout", path: "#logout" },
  ];

  const isActive = (path: string) => {
    if (path === "#logout") return false;

    let currentPath = location.pathname;
    if (currentPath.startsWith("/dashboard/") && currentPath !== "/dashboard/") {
      currentPath = currentPath.replace("/dashboard", "");
    }

    // Dashboard exact match
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }

    // SubAdmins special case
    if (path === "/sub-admins") {
      return (
        currentPath.toLowerCase().startsWith("/sub-admins") ||
        currentPath.toLowerCase() === "/create-sub-admin"
      );
    }

    // Exact match for Assign Course pages
    if (
      path === "/assign-course" ||
      path === "/assign-course-student"
    ) {
      return currentPath.toLowerCase() === path.toLowerCase();
    }

    // Guest exact match
    if (path === "/Guest") {
      return currentPath.toLowerCase() === "/guest";
    }

    // Default
    return currentPath.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <>
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col select-none border border-gray-100/50",
          "top-4 bottom-4 rounded-[24px]",
          isCollapsed
            ? "-translate-x-full md:translate-x-0 md:w-16 left-0 md:left-4"
            : "w-64 left-4"
        )}
      >
        {/* Logo Section matching the requested screenshot */}
        <div className={cn(
          "pt-6 pb-4 flex items-center justify-between px-4 relative transition-all duration-300 flex-shrink-0",
          isCollapsed && "flex-col gap-4 px-2 justify-center"
        )}>
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-gray-600 hover:bg-gray-100 h-10 w-10 flex items-center justify-center rounded-lg"
                aria-label="Expand Sidebar"
              >
                <MdKeyboardDoubleArrowRight className="w-8 h-8 text-gray-700" />
              </Button>
              <img
                src={logo}
                alt="Lauratek Small Logo"
                className="w-10 h-10 object-contain transition-all duration-300 animate-in fade-in zoom-in duration-300"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full relative">
              <img
                src={logo}
                alt="Lauratek Logo"
                className="h-11 object-contain transition-all duration-300 animate-in fade-in duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="text-gray-600 hover:bg-gray-100 h-8 w-8 flex items-center justify-center rounded-lg absolute right-0"
                aria-label="Collapse Sidebar"
              >
                <MdKeyboardDoubleArrowLeft className="w-6 h-6 text-gray-700" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation List perfectly aligned with crisp outline icons */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain scrollbar-hide mt-1">
          <nav className="flex flex-col space-y-0.5 py-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isLogout = item.path === "#logout";

              if (isLogout) {
                return (
                  <button
                    key={item.path}
                    onClick={handleSignOut}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium rounded-xl text-left w-auto",
                      isCollapsed ? "md:justify-center md:mx-1.5 md:px-0" : ""
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0 stroke-[1.75] text-gray-400" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              }

              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-2.5 mx-3 my-0.5 text-[16px] transition-all duration-200 relative rounded-xl",
                    active
                      ? "bg-[#F3E8FF] text-[#5D3EFC] font-semibold"
                      : "text-[#64748B] hover:bg-gray-50/80 hover:text-gray-900 font-medium",
                    isCollapsed && "md:justify-center md:mx-1.5 md:px-0"
                  )}
                >
                  {/* Left accent bar for active item precisely matching image */}
                  {active && !isCollapsed && (
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#5D3EFC] rounded-full" />
                  )}

                  <Icon
                    className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 stroke-[1.75]",
                      active ? "text-[#5D3EFC]" : "text-gray-400"
                    )}
                  />

                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;