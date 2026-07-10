import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutGrid,
  HelpCircle,
  Contact,
  UserCircle,
  Database,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  Layers,
  Calendar,
  Star,
  MessageSquare,
  Award,
  FileText,
  Video,
  Play,
  FileCheck,
  UserCheck,
  GraduationCap,
  Backpack,
  Link,
  UserPlus,
  ClipboardList,
  ShieldQuestion,
  FileQuestion,
  Code2,
  ScrollText,
  Terminal,
  FileBadge,
  ListChecks,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from "@/Assets/lauratek.png";
import ProfileModal from '@/components/subadmin/ProfileModal';

const SubadminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isSubadminPrefix = window.location.pathname.startsWith('/subadmin');
  const formatPath = (p: string) => {
    if (!isSubadminPrefix) return p;
    return p.startsWith('/') ? `/subadmin${p}` : `/subadmin/${p}`;
  };

  const handleLogout = () => {
    logout();
    navigate(isSubadminPrefix ? '/subadmin-login' : '/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { path: "/dashboard/users", label: "All Users", icon: Users },
    { path: '/RegisteredUsers', label: 'Guest Users', icon: UserCheck },
    { path: "/dashboard/categories", label: "Categories", icon: Layers },
    { path: "/dashboard/instructors", label: "Instructors", icon: GraduationCap },
    { path: "/dashboard/courses", label: "Courses", icon: BookOpen },
    { path: "/dashboard/certificates", label: "Certificates", icon: Award },
    { path: "/dashboard/resumes", label: "Resumes", icon: FileText },
    { path: "/dashboard/live-classes", label: "Live Classes", icon: Video },
    { path: "/dashboard/recorded-videos", label: "Recorded Videos", icon: Play },
    { path: '/dashboard/students', label: 'Students', icon: Backpack },
    { path: "/dashboard/assign-course", label: "Assign Course-Instructor", icon: Link },
    { path: "/dashboard/assign-course-student", label: "Assign Course-Student", icon: UserPlus },
    { path: "/dashboard/enrollments", label: "Student Enrollments", icon: ClipboardList },
    { path: "/dashboard/reviews", label: "Trainer Performance", icon: Star },
    { path: "/dashboard/student-reviews", label: "Student Reviews", icon: MessageSquare },
    { path: "/dashboard/attendance", label: "Attendance", icon: Calendar },
    { path: '/dashboard/instructor-quizzes', label: 'Instructor Quizzes', icon: HelpCircle },
    { path: '/GuestQuiz', label: 'Guest Quizzes', icon: ShieldQuestion },
    { path: '/dashboard/guest-exams', label: 'Guest Exams', icon: FileQuestion },
    { path: '/dashboard/guest-compiler-questions', label: 'Guest Compiler Qs', icon: Code2 },
    { path: '/dashboard/exams', label: 'student Exams', icon: ScrollText },
    { path: '/dashboard/compiler-questions', label: 'student Compiler Qs', icon: Terminal },
    { path: '/Guest', label: 'Guest Result', icon: FileBadge },
    { path: '/dashboard/student-results', label: 'Student Results', icon: ListChecks },
    { path: "/quizzes", label: "Quizzes", icon: Target },
    { path: '/profile1', label: 'Profile', icon: User },
  ];

  const filteredNavItems = navItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-[#F8FAFC] font-sans relative overflow-hidden">

      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed top-4 left-4 bottom-4 bg-white border border-slate-100/50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] rounded-[32px] z-50 flex flex-col py-6 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-[120%] md:translate-x-0",
        isSidebarCollapsed ? "w-20" : "w-[280px] md:w-[280px]"
      )}>

        {/* LOGO & TOGGLE BUTTONS */}
        <div className={cn(
          "pb-1 flex w-full relative transition-all duration-300",
          isSidebarCollapsed ? "flex-col items-center gap-1 px-2 -mt-2" : "items-center justify-center px-6 pt-6"
        )}>
          <img
            src={logo}
            alt="Lauratek Logo"
            className={cn(
              "object-contain transition-all duration-300",
              isSidebarCollapsed ? "h-10 w-12 order-2" : "h-16 order-1"
            )}
          />
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 md:hidden transition-colors cursor-pointer absolute right-6 top-6 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(
              "p-2 rounded-xl hover:bg-slate-100 text-slate-500 hidden md:flex items-center justify-center transition-colors cursor-pointer",
              isSidebarCollapsed ? "relative order-1" : "absolute right-6 z-10"
            )}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronsRight className="w-5 h-5" /> : <ChevronsLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className={cn(
          "px-6 space-y-1.5 flex-1 transition-all duration-300 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          isSidebarCollapsed ? "mt-2 md:px-3" : "mt-6"
        )}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={formatPath(item.path)}
              end={item.path === '/dashboard'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-medium text-[15px] overflow-hidden",
                  isActive
                    ? "text-[#615FFF] bg-[#F5F3FF] font-semibold before:absolute before:left-2.5 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:bg-[#615FFF] before:rounded-full"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  isSidebarCollapsed && "md:justify-center md:px-0"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-[22px] h-[22px] transition-colors shrink-0", isActive ? "text-[#615FFF]" : "text-slate-400 group-hover:text-slate-600")} />
                  <span className={cn(
                    "transition-all duration-300 whitespace-nowrap",
                    isSidebarCollapsed ? "md:hidden" : "md:inline",
                    isActive ? "font-semibold" : ""
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {/* LOGOUT */}
          <button
            onClick={() => {
              setIsSidebarOpen(false);
              handleLogout();
            }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-50/80 hover:text-slate-900 transition-all font-medium text-[15px] cursor-pointer",
              isSidebarCollapsed && "md:justify-center md:px-0"
            )}
          >
            <LogOut className="w-5 h-5 text-slate-400 shrink-0" />
            <span className={cn(
              "transition-all duration-300 whitespace-nowrap",
              isSidebarCollapsed ? "md:hidden" : "md:inline"
            )}>
              Logout
            </span>
          </button>
        </nav>

      </aside>

      {/* MAIN CONTENT */}
      <div className={cn(
        "flex-1 min-w-0 h-screen flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        isSidebarCollapsed ? "md:ml-[112px]" : "md:ml-[312px]"
      )}>
        {/* HEADER */}
        <header className="shrink-0 z-30 bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-4 gap-4">

            {/* LEFT SIDE: BURGER MENU & SEARCH BAR */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 md:hidden transition flex items-center justify-center shrink-0 cursor-pointer"
                title="Open Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* SEARCH BAR */}
              <div className="relative w-full">
                <div className="flex items-center bg-white border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-4 py-2.5 rounded-full w-full">
                  <Search className="w-5 h-5 text-slate-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent outline-none text-sm w-full placeholder-slate-400 text-slate-700"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  />
                </div>

                {/* SEARCH RESULTS DROPDOWN */}
                {isSearchOpen && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden max-h-[300px] overflow-y-auto">
                    {filteredNavItems.length > 0 ? (
                      <div className="py-2">
                        {filteredNavItems.map((item) => (
                          <div
                            key={item.path}
                            onClick={() => {
                              navigate(formatPath(item.path));
                              setSearchQuery('');
                              setIsSearchOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-slate-500" />
                            </div>
                            <span className="text-[14px] text-slate-700 font-medium">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-[14px] text-slate-500 text-center flex flex-col items-center gap-2">
                        <Search className="w-6 h-6 text-slate-300" />
                        <p>No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-6">

              {/* PROFILE */}
              <div
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate(formatPath('/profile1'))}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[14px] font-bold text-slate-800 group-hover:text-blue-600 transition">
                    {user?.name || "Sub Admin"}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {user?.role || "Sub Admin"}
                  </p>
                </div>

                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#615FFF] to-[#AD46FF] text-white font-bold text-sm shadow-[0_4px_12px_rgba(173,70,255,0.3)]">
                  {user?.name?.slice(0, 2)?.toUpperCase() || "AU"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* PROFILE MODAL */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default SubadminLayout;