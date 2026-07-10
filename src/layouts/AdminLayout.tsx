import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./admin/Sidebar";
import Header from "./admin/Header";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      // Collapse sidebar automatically when resizing below md threshold
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <Header
        isCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <main className={cn(
        "transition-all duration-300 pt-16 min-h-screen bg-[#F8F9FB]",
        isSidebarCollapsed ? "ml-0 md:ml-[96px]" : "ml-0 md:ml-[288px]"
      )}>
        <div className="p-4 sm:p-6 pt-3 sm:pt-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
