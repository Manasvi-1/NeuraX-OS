import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { useDesktop } from "./DesktopContext";
import { Search, X } from "lucide-react";
import { 
  Folder, 
  Terminal, 
  Bot, 
  BarChart3, 
  Code, 
  Settings, 
  Globe, 
  Calculator,
  Calendar,
  Mail,
  Music,
  Image,
  FileText,
  Shield,
  Zap,
  Brain,
  Users
} from "lucide-react";

interface AppItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  type: 'file-manager' | 'terminal' | 'ai-assistant' | 'system-monitor' | 'code-editor' | 'settings' | 'browser' | 'calculator' | 'calendar' | 'mail' | 'music' | 'image-viewer' | 'text-editor' | 'security' | 'neural-trainer' | 'user-manager';
  category: 'System' | 'Development' | 'AI Tools' | 'Productivity' | 'Media' | 'Security';
}

const applications: AppItem[] = [
  {
    id: 'file-manager',
    name: 'File Manager',
    description: 'AI-powered file organization and search',
    icon: Folder,
    color: 'bg-blue-500',
    type: 'file-manager',
    category: 'System'
  },
  {
    id: 'terminal',
    name: 'AI Terminal',
    description: 'Natural language command interface',
    icon: Terminal,
    color: 'bg-emerald-500',
    type: 'terminal',
    category: 'System'
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Personal AI helper for system tasks',
    icon: Bot,
    color: 'bg-violet-500',
    type: 'ai-assistant',
    category: 'AI Tools'
  },
  {
    id: 'system-monitor',
    name: 'System Monitor',
    description: 'Real-time performance monitoring',
    icon: BarChart3,
    color: 'bg-red-500',
    type: 'system-monitor',
    category: 'System'
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'AI-enhanced code development',
    icon: Code,
    color: 'bg-amber-500',
    type: 'code-editor',
    category: 'Development'
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'System configuration and preferences',
    icon: Settings,
    color: 'bg-indigo-500',
    type: 'settings',
    category: 'System'
  },
  {
    id: 'browser',
    name: 'Web Browser',
    description: 'Browse the internet securely',
    icon: Globe,
    color: 'bg-cyan-500',
    type: 'browser',
    category: 'Productivity'
  },
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Advanced mathematical calculations',
    icon: Calculator,
    color: 'bg-orange-500',
    type: 'calculator',
    category: 'Productivity'
  },
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'Schedule and task management',
    icon: Calendar,
    color: 'bg-teal-500',
    type: 'calendar',
    category: 'Productivity'
  },
  {
    id: 'mail',
    name: 'Mail',
    description: 'Email client with AI features',
    icon: Mail,
    color: 'bg-sky-500',
    type: 'mail',
    category: 'Productivity'
  },
  {
    id: 'music',
    name: 'Music Player',
    description: 'AI-curated music experience',
    icon: Music,
    color: 'bg-pink-500',
    type: 'music',
    category: 'Media'
  },
  {
    id: 'image-viewer',
    name: 'Image Viewer',
    description: 'AI-powered image analysis',
    icon: Image,
    color: 'bg-green-500',
    type: 'image-viewer',
    category: 'Media'
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    description: 'Simple text editing with AI assistance',
    icon: FileText,
    color: 'bg-slate-500',
    type: 'text-editor',
    category: 'Productivity'
  },
  {
    id: 'security',
    name: 'Security Center',
    description: 'AI-powered security monitoring',
    icon: Shield,
    color: 'bg-red-600',
    type: 'security',
    category: 'Security'
  },
  {
    id: 'neural-trainer',
    name: 'Neural Trainer',
    description: 'Train and deploy AI models',
    icon: Brain,
    color: 'bg-purple-500',
    type: 'neural-trainer',
    category: 'AI Tools'
  },
  {
    id: 'user-manager',
    name: 'User Manager',
    description: 'Manage user permissions and access',
    icon: Users,
    color: 'bg-yellow-500',
    type: 'user-manager',
    category: 'System'
  }
];

const categories = ['All', 'System', 'Development', 'AI Tools', 'Productivity', 'Media', 'Security'];

export default function AppLauncher() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredApps, setFilteredApps] = useState(applications);
  const { openWindow, closeWindow } = useDesktop();

  useEffect(() => {
    let filtered = applications;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApps(filtered);
  }, [searchQuery, selectedCategory]);

  const handleAppLaunch = (app: AppItem) => {
    // Only open supported window types
    if (['file-manager', 'terminal', 'ai-assistant', 'system-monitor', 'code-editor'].includes(app.type)) {
      openWindow(app.type as any);
      // Close the app launcher after launching an app
      closeWindow('app-launcher');
    } else {
      // For unsupported apps, show a placeholder notification
      console.log(`Launching ${app.name} - Feature coming soon!`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-100">Applications</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => closeWindow('app-launcher')}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`text-sm ${
                selectedCategory === category
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-4 gap-6">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.id}
                className="glass-light border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:scale-105"
                onClick={() => handleAppLaunch(app)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-16 h-16 ${app.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-100 mb-1 text-sm">
                    {app.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {app.description}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded">
                      {app.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No applications found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>{filteredApps.length} of {applications.length} applications</span>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>AI-Enhanced Application Launcher</span>
          </div>
        </div>
      </div>
    </div>
  );
}
