import { useAuth } from "@/hooks/useAuth";
import { Brain, Wifi, Battery, Settings, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesktop } from "./DesktopContext";

export default function TopBar() {
  const { user } = useAuth();
  const { systemStatus } = useDesktop();

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className="flex justify-between items-center px-4 py-2 glass-effect border-b border-slate-700/50">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Brain className="text-blue-500 w-5 h-5" />
          <span className="font-semibold text-lg">AI OS</span>
        </div>
        <div className="text-sm text-slate-400">Neural Desktop Environment</div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <Wifi className="text-emerald-500 w-4 h-4" />
          <span className="text-slate-300">Connected</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Battery className="text-emerald-500 w-4 h-4" />
          <span className="text-slate-300">{systemStatus.battery}%</span>
        </div>
        <div className="text-sm font-mono text-slate-300">{currentTime}</div>
        <div className="flex items-center space-x-2 text-sm">
          {user?.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt="User Avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </span>
            </div>
          )}
          <span className="text-slate-300">
            {user?.firstName || user?.email?.split('@')[0] || 'User'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/api/logout'}
          className="text-slate-400 hover:text-slate-200"
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
