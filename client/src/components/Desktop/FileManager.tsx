import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Folder, 
  File, 
  Search, 
  Home, 
  Monitor, 
  Download, 
  FileText,
  Code,
  Database,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";

interface FileItem {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState("/home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error } = useQuery({
    queryKey: ["/api/files"],
    retry: false,
  });

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["/api/files/search", searchQuery],
    enabled: searchQuery.length > 0,
    retry: false,
  });

  const createFileMutation = useMutation({
    mutationFn: async (data: { name: string; type: 'file' | 'directory'; content?: string }) => {
      return apiRequest('POST', '/api/files', {
        name: data.name,
        path: `${currentPath}/${data.name}`,
        type: data.type,
        content: data.content || '',
        size: data.content?.length || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return apiRequest('DELETE', `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => window.location.href = "/api/login", 500);
    }
  }, [error, toast]);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return <Folder className="w-4 h-4 text-amber-500" />;
    }
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'py':
        return <Code className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <Database className="w-4 h-4 text-emerald-500" />;
      case 'txt':
        return <FileText className="w-4 h-4 text-slate-400" />;
      default:
        return <File className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour ago`;
    return date.toLocaleDateString();
  };

  const handleCreateFile = (type: 'file' | 'directory') => {
    const name = prompt(`Enter ${type} name:`);
    if (name) {
      createFileMutation.mutate({ name, type });
    }
  };

  const displayFiles = searchQuery ? searchResults : files;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-1/3 bg-slate-800/50 p-3 border-r border-slate-700/50">
        <div className="text-xs text-slate-400 mb-2">QUICK ACCESS</div>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto hover:bg-slate-700/50"
            onClick={() => setCurrentPath("/home")}
          >
            <Home className="w-4 h-4 text-blue-500 mr-2" />
            <span className="text-sm">Home</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto hover:bg-slate-700/50"
            onClick={() => setCurrentPath("/home/Desktop")}
          >
            <Monitor className="w-4 h-4 text-emerald-500 mr-2" />
            <span className="text-sm">Desktop</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto hover:bg-slate-700/50"
            onClick={() => setCurrentPath("/home/Downloads")}
          >
            <Download className="w-4 h-4 text-violet-500 mr-2" />
            <span className="text-sm">Downloads</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start p-2 h-auto hover:bg-slate-700/50"
            onClick={() => setCurrentPath("/home/Documents")}
          >
            <FileText className="w-4 h-4 text-amber-500 mr-2" />
            <span className="text-sm">Documents</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-3 flex flex-col">
        {/* Search and Actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="AI-powered search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm bg-slate-700/50 border-slate-600"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateFile('directory')}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Folder
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCreateFile('file')}
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              File
            </Button>
          </div>
        </div>

        {/* File List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {displayFiles.map((file: FileItem) => (
              <div
                key={file.id}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedFile?.id === file.id
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'hover:bg-slate-700/30'
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-slate-400">
                    {file.type === 'directory' ? 'Folder' : formatFileSize(file.size || 0)} • {formatTime(file.updatedAt)}
                  </div>
                </div>
                {selectedFile?.id === file.id && (
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this file?')) {
                          deleteFileMutation.mutate(file.id);
                        }
                      }}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Status Bar */}
        <div className="mt-2 text-xs text-slate-400 flex justify-between">
          <span>{displayFiles.length} items</span>
          <span>{currentPath}</span>
        </div>
      </div>
    </div>
  );
}
