export interface SystemMetrics {
  cpu: number;
  memory: number;
  neural: number;
  timestamp: Date;
}

export interface TerminalCommand {
  id: number;
  command: string;
  output?: string;
  aiInterpretation?: string;
  executed: boolean;
  timestamp: Date;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface FileItem {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPermission {
  id: number;
  userId: string;
  permission: string;
  granted: boolean;
  grantedBy?: string;
  createdAt: Date;
}

export interface CodeSuggestion {
  line: number;
  suggestion: string;
  type: 'error' | 'warning' | 'improvement';
}

export interface AppInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  type: 'file-manager' | 'terminal' | 'ai-assistant' | 'system-monitor' | 'code-editor' | 'settings' | 'browser';
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: Date;
}

export interface CommandInterpretation {
  originalCommand: string;
  interpretation: string;
  bashCommand: string;
  confidence: number;
  explanation: string;
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  metadata?: Record<string, any>;
}
