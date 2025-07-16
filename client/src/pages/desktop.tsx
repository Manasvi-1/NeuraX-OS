import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import TopBar from "@/components/Desktop/TopBar";
import Taskbar from "@/components/Desktop/Taskbar";
import WindowManager from "@/components/Desktop/WindowManager";
import { DesktopProvider } from "@/components/Desktop/DesktopContext";

export default function Desktop() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
    
    if (isAuthenticated && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isAuthenticated, isLoading, toast, isInitialized]);

  if (isLoading || !isAuthenticated || !isInitialized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Initializing AI OS...</p>
        </div>
      </div>
    );
  }

  return (
    <DesktopProvider>
      <div className="h-screen w-full bg-desktop overflow-hidden relative">
        {/* Desktop Background */}
        <div className="absolute inset-0 bg-slate-900/70 z-0"></div>
        
        {/* Desktop Container */}
        <div className="relative z-10 h-screen flex flex-col">
          {/* Top Bar */}
          <TopBar />
          
          {/* Main Desktop Area */}
          <div className="flex-1 relative overflow-hidden">
            <WindowManager />
          </div>
          
          {/* Taskbar */}
          <Taskbar />
        </div>
      </div>
    </DesktopProvider>
  );
}
