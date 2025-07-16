import { useDesktop } from "./DesktopContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Grid3x3, 
  Folder, 
  Terminal, 
  Bot, 
  BarChart3, 
  Code, 
  Search, 
  Brain,
  Users,
  Settings,
  Power 
} from "lucide-react";

export default function Taskbar() {
  const { windows, openWindow, focusWindow, systemStatus } = useDesktop();

  const apps = [
    { type: 'file-manager' as const, icon: Folder, color: 'text-blue-500' },
    { type: 'terminal' as const, icon: Terminal, color: 'text-emerald-500' },
    { type: 'ai-assistant' as const, icon: Bot, color: 'text-violet-500' },
    { type: 'system-monitor' as const, icon: BarChart3, color: 'text-red-500' },
    { type: 'code-editor' as const, icon: Code, color: 'text-amber-500' },
  ];

  const handleAppClick = (type: any) => {
    const existingWindow = windows.find(w => w.type === type && w.isOpen);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        focusWindow(existingWindow.id);
      } else {
        // If already focused, minimize it
        focusWindow(existingWindow.id);
      }
    } else {
      openWindow(type);
    }
  };

  return (
    <div className="h-16 glass-effect border-t border-slate-700/50 px-4 flex items-center justify-between">
      {/* App Launcher */}
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => openWindow('app-launcher')}
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center justify-center text-white p-0"
        >
          <Grid3x3 className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          {apps.map((app) => {
            const window = windows.find(w => w.type === app.type && w.isOpen);
            const Icon = app.icon;
            
            return (
              <div key={app.type} className="relative">
                {window && !window.isMinimized && (
                  <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full"></div>
                )}
                <Button
                  variant="ghost"
                  onClick={() => handleAppClick(app.type)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors p-0 ${
                    window ? 'bg-slate-700/50' : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${app.color}`} />
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center - Search and Quick Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search or ask AI..."
            className="bg-slate-700/50 border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 w-64"
          />
        </div>
        <Button
          onClick={() => openWindow('ai-assistant')}
          className="bg-violet-500 hover:bg-violet-600 text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span>AI Assistant</span>
        </Button>
      </div>

      {/* Right Side - System Info */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-slate-400">{systemStatus.onlineUsers} users online</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => openWindow('user-auth')}
          className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 p-0"
        >
          <Users className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 p-0"
        >
          <Settings className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/api/logout'}
          className="w-10 h-10 bg-slate-700/50 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 p-0"
        >
          <Power className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
