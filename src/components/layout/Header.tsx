import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Menu, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isCollapsed, onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const userEmail = localStorage.getItem("userEmail");

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 bg-card border-b border-border transition-all duration-300",
      isCollapsed ? "left-0 md:left-16" : "left-0 md:left-64"
    )}>
      <div className="flex items-center justify-between h-full px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:flex"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-info rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-muted-foreground">{userEmail}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;