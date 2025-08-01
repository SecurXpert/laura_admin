import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FileQuestion, 
  Users, 
  Menu, 
  X,
  GraduationCap,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: FileQuestion,
      label: "Quizzes",
      path: "/quizzes",
    },
    {
      icon: Users,
      label: "Attendance",
      path: "/attendance",
    },
    // {
    //   icon: User,
    //   label: "Profile",
    //   path: "/dashboard/profile",
    // },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-all duration-300 ease-in-out",
          isCollapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          <div className={cn("flex items-center gap-2", isCollapsed && "md:justify-center")}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-info rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg">CourseAdmin</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="md:hidden"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "md:justify-center md:px-2"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;