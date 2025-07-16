import { useDesktop } from "./DesktopContext";
import FileManager from "./FileManager";
import AITerminal from "./AITerminal";
import AIAssistant from "./AIAssistant";
import SystemMonitor from "./SystemMonitor";
import CodeEditor from "./CodeEditor";
import AppLauncher from "./AppLauncher";
import UserAuth from "./UserAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WindowManager() {
  const { windows, closeWindow, minimizeWindow, maximizeWindow, focusWindow } = useDesktop();

  const renderWindowContent = (window: any) => {
    switch (window.type) {
      case 'file-manager':
        return <FileManager />;
      case 'terminal':
        return <AITerminal />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'system-monitor':
        return <SystemMonitor />;
      case 'code-editor':
        return <CodeEditor />;
      case 'app-launcher':
        return <AppLauncher />;
      case 'user-auth':
        return <UserAuth />;
      default:
        return <div className="p-4 text-slate-400">Unknown window type</div>;
    }
  };

  return (
    <div className="relative w-full h-full">
      {windows
        .filter(window => window.isOpen && !window.isMinimized)
        .map((window) => (
          <Card
            key={window.id}
            className={cn(
              "absolute glass-effect border-slate-700/50 overflow-hidden window-shadow",
              window.isMaximized ? "inset-0 rounded-none" : "rounded-xl"
            )}
            style={{
              left: window.isMaximized ? 0 : window.position.x,
              top: window.isMaximized ? 0 : window.position.y,
              width: window.isMaximized ? '100%' : window.size.width,
              height: window.isMaximized ? '100%' : window.size.height,
              zIndex: window.zIndex,
            }}
            onClick={() => focusWindow(window.id)}
          >
            {/* Window Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-400 cursor-pointer" 
                     onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }} />
                <div className="w-3 h-3 bg-amber-500 rounded-full hover:bg-amber-400 cursor-pointer"
                     onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }} />
                <div className="w-3 h-3 bg-emerald-500 rounded-full hover:bg-emerald-400 cursor-pointer"
                     onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id); }} />
              </div>
              
              <div className="flex-1 text-center">
                <h2 className="text-sm font-semibold text-slate-200">{window.title}</h2>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); minimizeWindow(window.id); }}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); maximizeWindow(window.id); }}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                >
                  <Square className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); closeWindow(window.id); }}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {/* Window Content */}
            <div className="flex-1 overflow-hidden">
              {renderWindowContent(window)}
            </div>
          </Card>
        ))}
    </div>
  );
}
