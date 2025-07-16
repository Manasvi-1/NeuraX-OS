import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage, ChatSession } from "@/types/desktop";
import { Bot, User, Send, Plus, MessageSquare, Sparkles } from "lucide-react";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get chat sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["/api/chat/sessions"],
    retry: false,
  });

  // Get messages for current session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat/sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
    retry: false,
  });

  // Create new session
  const createSessionMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest('POST', '/api/chat/sessions', { title });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/sessions"] });
      setCurrentSessionId(session.id);
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
        description: "Failed to create chat session",
        variant: "destructive",
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentSessionId) throw new Error("No active session");
      
      const response = await apiRequest('POST', `/api/chat/sessions/${currentSessionId}/messages`, {
        role: 'user',
        content,
      });
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/sessions", currentSessionId, "messages"] 
      });
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
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
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // WebSocket for real-time AI responses
  const { sendMessage: sendWsMessage } = useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'ai_response') {
        // Handle real-time AI response
        setIsTyping(false);
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat/sessions", currentSessionId, "messages"] 
        });
      }
    }
  });

  // Initialize with first session or create new one
  useEffect(() => {
    if (sessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(sessions[0].id);
    } else if (sessions.length === 0 && !sessionsLoading) {
      createSessionMutation.mutate("AI Assistant Chat");
    }
  }, [sessions, currentSessionId, sessionsLoading]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hour ago`;
    return date.toLocaleDateString();
  };

  const createNewSession = () => {
    const title = `Chat ${sessions.length + 1}`;
    createSessionMutation.mutate(title);
  };

  if (sessionsLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading AI Assistant...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Bot className="text-violet-500 w-5 h-5" />
          <span className="font-semibold text-slate-200">AI Assistant</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={createNewSession}
          className="text-slate-400 hover:text-slate-200"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-violet-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-200 mb-2">
                Welcome to AI Assistant
              </h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                I'm here to help you navigate your system, troubleshoot issues, and optimize your AI OS experience.
              </p>
            </div>
          ) : (
            messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {msg.role === 'user' ? (
                    <>
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-violet-500 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 max-w-xs">
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-500/20 text-slate-100 ml-auto'
                        : 'bg-slate-700/50 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div
                    className={`text-xs text-slate-400 mt-1 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTimestamp(msg.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-violet-500 text-white">
                  <Bot className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            className="flex-1 bg-slate-700/50 border-slate-600 focus:border-violet-500"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Suggestions */}
        <div className="flex items-center space-x-2 mt-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <div className="flex space-x-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("How can I optimize my system performance?")}
              className="text-xs px-2 py-1 h-auto border-slate-600 text-slate-300"
            >
              System optimization
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("Show me my recent files")}
              className="text-xs px-2 py-1 h-auto border-slate-600 text-slate-300"
            >
              Recent files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMessage("Help me with terminal commands")}
              className="text-xs px-2 py-1 h-auto border-slate-600 text-slate-300"
            >
              Terminal help
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
