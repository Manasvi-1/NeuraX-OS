import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export interface Window {
  id: string;
  type: 'file-manager' | 'terminal' | 'ai-assistant' | 'system-monitor' | 'code-editor' | 'app-launcher' | 'user-auth';
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data?: any;
}

interface SystemStatus {
  cpu: number;
  memory: number;
  neural: number;
  battery: number;
  onlineUsers: number;
}

interface DesktopContextType {
  windows: Window[];
  openWindow: (type: Window['type'], data?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;
  systemStatus: SystemStatus;
  setSystemStatus: (status: Partial<SystemStatus>) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
}

export function DesktopProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<Window[]>([]);
  const [systemStatus, setSystemStatusState] = useState<SystemStatus>({
    cpu: 25,
    memory: 67,
    neural: 45,
    battery: 78,
    onlineUsers: 3,
  });
  const [nextZIndex, setNextZIndex] = useState(1000);

  const { sendMessage } = useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'metrics_update') {
        setSystemStatusState(prev => ({
          ...prev,
          cpu: data.metrics.cpu,
          memory: data.metrics.memory,
          neural: data.metrics.neural,
        }));
      }
    }
  });

  // Initialize default windows
  useEffect(() => {
    const defaultWindows: Omit<Window, 'id' | 'zIndex'>[] = [
      {
        type: 'file-manager',
        title: 'AI File Manager',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: 32, y: 32 },
        size: { width: 384, height: 320 },
      },
      {
        type: 'terminal',
        title: 'AI Terminal',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: 450, y: 32 },
        size: { width: 384, height: 320 },
      },
      {
        type: 'ai-assistant',
        title: 'AI Assistant',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: 32, y: 400 },
        size: { width: 320, height: 384 },
      },
      {
        type: 'system-monitor',
        title: 'System Monitor',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: 400, y: 32 },
        size: { width: 320, height: 256 },
      },
      {
        type: 'code-editor',
        title: 'AI Code Editor',
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: 450, y: 400 },
        size: { width: 384, height: 320 },
      },
    ];

    setWindows(defaultWindows.map((window, index) => ({
      ...window,
      id: `${window.type}-${Date.now()}-${index}`,
      zIndex: 1000 + index,
    })));
    
    setNextZIndex(1000 + defaultWindows.length);
  }, []);

  // Request system metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage({ type: 'system_metrics' });
    }, 5000);

    return () => clearInterval(interval);
  }, [sendMessage]);

  const openWindow = (type: Window['type'], data?: any) => {
    const existingWindow = windows.find(w => w.type === type && w.isOpen);
    
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }

    const newWindow: Window = {
      id: `${type}-${Date.now()}`,
      type,
      title: getWindowTitle(type),
      isOpen: true,
      isMinimized: false,
      isMaximized: false,
      position: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100 },
      size: getDefaultSize(type),
      zIndex: nextZIndex,
      data,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
    ));
    setNextZIndex(prev => prev + 1);
  };

  const updateWindow = (id: string, updates: Partial<Window>) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  };

  const setSystemStatus = (status: Partial<SystemStatus>) => {
    setSystemStatusState(prev => ({ ...prev, ...status }));
  };

  return (
    <DesktopContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      focusWindow,
      updateWindow,
      systemStatus,
      setSystemStatus,
    }}>
      {children}
    </DesktopContext.Provider>
  );
}

function getWindowTitle(type: Window['type']): string {
  const titles: Record<Window['type'], string> = {
    'file-manager': 'AI File Manager',
    'terminal': 'AI Terminal',
    'ai-assistant': 'AI Assistant',
    'system-monitor': 'System Monitor',
    'code-editor': 'AI Code Editor',
    'app-launcher': 'Applications',
    'user-auth': 'User Authentication',
  };
  return titles[type];
}

function getDefaultSize(type: Window['type']): { width: number; height: number } {
  const sizes: Record<Window['type'], { width: number; height: number }> = {
    'file-manager': { width: 384, height: 320 },
    'terminal': { width: 384, height: 320 },
    'ai-assistant': { width: 320, height: 384 },
    'system-monitor': { width: 320, height: 256 },
    'code-editor': { width: 384, height: 320 },
    'app-launcher': { width: 600, height: 400 },
    'user-auth': { width: 384, height: 300 },
  };
  return sizes[type];
}
