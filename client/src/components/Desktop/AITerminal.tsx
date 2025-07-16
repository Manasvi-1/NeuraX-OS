import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { TerminalCommand, CommandInterpretation } from "@/types/desktop";
import { Terminal, Brain, History, Rainbow } from "lucide-react";

export default function AITerminal() {
  const [currentCommand, setCurrentCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create terminal session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/terminal/session"],
    retry: false,
  });

  // Get command history
  const { data: commands = [], isLoading: commandsLoading } = useQuery({
    queryKey: ["/api/terminal/sessions", session?.id, "commands"],
    enabled: !!session?.id,
    retry: false,
  });

  const executeCommandMutation = useMutation({
    mutationFn: async (command: string) => {
      if (!session?.id) throw new Error("No terminal session");
      
      const response = await apiRequest('POST', `/api/terminal/sessions/${session.id}/commands`, {
        command,
        executed: true,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/terminal/sessions", session?.id, "commands"] 
      });
      
      setCommandHistory(prev => [...prev, currentCommand]);
      setCurrentCommand("");
      setHistoryIndex(-1);
      setIsProcessing(false);
    },
    onError: (error) => {
      setIsProcessing(false);
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
        description: "Failed to execute command",
        variant: "destructive",
      });
    },
  });

  // WebSocket for real-time command interpretation
  const { sendMessage } = useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'terminal_response') {
        // Handle real-time interpretation feedback
        console.log('AI interpretation:', data.interpretation);
      }
    }
  });

  // Scroll to bottom when new commands are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [commands]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentCommand.trim() && !isProcessing) {
        setIsProcessing(true);
        executeCommandMutation.mutate(currentCommand.trim());
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand("");
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const clearTerminal = () => {
    queryClient.setQueryData(
      ["/api/terminal/sessions", session?.id, "commands"],
      []
    );
  };

  if (sessionLoading || commandsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading terminal...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      {/* Terminal Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Terminal className="text-emerald-500 w-4 h-4" />
          <span className="text-sm font-medium text-slate-200">AI Terminal</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearTerminal}
            className="h-7 px-2 text-slate-400 hover:text-slate-200"
          >
            <Rainbow className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-slate-200"
          >
            <History className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="font-mono text-sm space-y-2">
          {/* Welcome Message */}
          <div className="text-slate-400 mb-4">
            <div>Welcome to AI Terminal</div>
            <div>Type commands in natural language or use traditional syntax</div>
            <div className="text-xs mt-1">Current directory: {session?.currentDirectory || '/home'}</div>
          </div>

          {/* Command History */}
          {commands.map((cmd: TerminalCommand, index: number) => (
            <div key={cmd.id} className="space-y-1">
              {/* Command Input */}
              <div className="flex items-center space-x-2">
                <span className="text-emerald-500">admin@ai-os</span>
                <span className="text-slate-400">:</span>
                <span className="text-blue-500">{session?.currentDirectory || '~'}</span>
                <span className="text-slate-400">$</span>
                <span className="text-slate-100">{cmd.command}</span>
              </div>

              {/* AI Interpretation */}
              {cmd.aiInterpretation && (
                <div className="flex items-center space-x-2 text-blue-400 text-xs">
                  <Brain className="w-3 h-3" />
                  <span>AI: {cmd.aiInterpretation}</span>
                </div>
              )}

              {/* Command Output */}
              {cmd.output && (
                <div className="text-slate-300 whitespace-pre-wrap pl-2 border-l-2 border-slate-700">
                  {cmd.output}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-slate-500 ml-2">
                {formatTimestamp(cmd.createdAt)}
              </div>
            </div>
          ))}

          {/* Current Command Input */}
          <div className="flex items-center space-x-2">
            <span className="text-emerald-500">admin@ai-os</span>
            <span className="text-slate-400">:</span>
            <span className="text-blue-500">{session?.currentDirectory || '~'}</span>
            <span className="text-slate-400">$</span>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command or natural language..."
                className="bg-transparent border-none outline-none text-slate-100 p-0 h-auto focus:ring-0 focus:border-none"
                disabled={isProcessing}
              />
              {isProcessing && (
                <div className="absolute right-0 top-0 h-full flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-emerald-500"></div>
                </div>
              )}
            </div>
            <span className="animate-pulse text-emerald-500 font-mono">▋</span>
          </div>
        </div>
      </ScrollArea>

      {/* Terminal Footer */}
      <div className="p-2 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Commands: {commands.length}</span>
            <span>History: {commandHistory.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Brain className="w-3 h-3 text-blue-400" />
            <span>AI-Enhanced Terminal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
