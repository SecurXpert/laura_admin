import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      <Header 
        isCollapsed={isSidebarCollapsed} 
        onToggleSidebar={toggleSidebar} 
      />
      
      <main className={cn(
        "transition-all duration-300 pt-16",
        isSidebarCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
      )}>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;