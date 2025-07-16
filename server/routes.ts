import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./aiService";
import { fileSystemService } from "./fileSystem";
import { insertFileSchema, insertChatSessionSchema, insertChatMessageSchema, insertTerminalCommandSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Initialize file system for new users
      await fileSystemService.initializeUserFileSystem(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File system routes
  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      const files = await storage.getFiles(userId, parentId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId, userId);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  app.post('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileData = insertFileSchema.parse(req.body);
      
      const file = await storage.createFile({
        ...fileData,
        userId,
      });
      
      res.status(201).json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.put('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileId = parseInt(req.params.id);
      const updates = insertFileSchema.partial().parse(req.body);
      
      const file = await storage.updateFile(fileId, userId, updates);
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const fileId = parseInt(req.params.id);
      
      await storage.deleteFile(fileId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  app.get('/api/files/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const files = await storage.searchFiles(userId, query);
      
      // Use AI to rank search results
      const filesForAI = files.map(file => ({
        name: file.name,
        path: file.path,
        content: file.content || undefined
      }));
      const rankedResults = await aiService.searchFiles(query, filesForAI);
      
      res.json(rankedResults);
    } catch (error) {
      console.error("Error searching files:", error);
      res.status(500).json({ message: "Failed to search files" });
    }
  });

  // Chat routes
  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertChatSessionSchema.parse(req.body);
      
      const session = await storage.createChatSession({
        ...sessionData,
        userId,
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get('/api/chat/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.id);
      
      const messages = await storage.getChatMessages(sessionId, userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = parseInt(req.params.id);
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Verify session belongs to user
      const session = await storage.getChatSession(sessionId, userId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const message = await storage.createChatMessage({
        ...messageData,
        sessionId,
      });
      
      // If user message, generate AI response
      if (messageData.role === 'user') {
        const aiResponse = await aiService.chatResponse(messageData.content);
        
        const aiMessage = await storage.createChatMessage({
          sessionId,
          role: 'assistant',
          content: aiResponse.content,
        });
        
        res.status(201).json({ userMessage: message, aiMessage });
      } else {
        res.status(201).json({ userMessage: message });
      }
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // Terminal routes
  app.get('/api/terminal/session', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let session = await storage.getTerminalSession(userId);
      
      if (!session) {
        session = await storage.createTerminalSession({
          userId,
          currentDirectory: '/home',
        });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching terminal session:", error);
      res.status(500).json({ message: "Failed to fetch terminal session" });
    }
  });

  app.get('/api/terminal/sessions/:id/commands', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const commands = await storage.getTerminalCommands(sessionId);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching terminal commands:", error);
      res.status(500).json({ message: "Failed to fetch terminal commands" });
    }
  });

  app.post('/api/terminal/sessions/:id/commands', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const commandData = insertTerminalCommandSchema.parse(req.body);
      
      // Interpret command with AI
      const interpretation = await aiService.interpretCommand(commandData.command);
      
      const command = await storage.createTerminalCommand({
        ...commandData,
        sessionId,
        aiInterpretation: interpretation.interpretation,
      });
      
      res.status(201).json({
        command,
        interpretation,
      });
    } catch (error) {
      console.error("Error creating terminal command:", error);
      res.status(500).json({ message: "Failed to create terminal command" });
    }
  });

  // AI routes
  app.post('/api/ai/analyze-file', isAuthenticated, async (req: any, res) => {
    try {
      const { fileName, content } = req.body;
      
      if (!fileName || !content) {
        return res.status(400).json({ message: "fileName and content are required" });
      }
      
      const analysis = await aiService.analyzeFile(fileName, content);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing file:", error);
      res.status(500).json({ message: "Failed to analyze file" });
    }
  });

  app.post('/api/ai/code-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const suggestions = await aiService.generateCodeSuggestions(code, language || 'javascript');
      res.json(suggestions);
    } catch (error) {
      console.error("Error generating code suggestions:", error);
      res.status(500).json({ message: "Failed to generate code suggestions" });
    }
  });

  app.post('/api/ai/optimize-system', isAuthenticated, async (req: any, res) => {
    try {
      const { metrics } = req.body;
      
      if (!metrics) {
        return res.status(400).json({ message: "Metrics are required" });
      }
      
      const optimizations = await aiService.optimizeSystem(metrics);
      res.json({ optimizations });
    } catch (error) {
      console.error("Error optimizing system:", error);
      res.status(500).json({ message: "Failed to optimize system" });
    }
  });

  // System metrics routes
  app.get('/api/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const metricType = req.query.type as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const metrics = await storage.getSystemMetrics(userId, metricType, limit);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.post('/api/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { metricType, value } = req.body;
      
      if (!metricType || value === undefined) {
        return res.status(400).json({ message: "metricType and value are required" });
      }
      
      const metric = await storage.createSystemMetric({
        userId,
        metricType,
        value,
      });
      
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating system metric:", error);
      res.status(500).json({ message: "Failed to create system metric" });
    }
  });

  // Permission routes
  app.get('/api/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const permissions = await storage.getUserPermissions(userId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.post('/api/permissions', isAuthenticated, async (req: any, res) => {
    try {
      const grantedBy = req.user.claims.sub;
      const { userId, permission, granted } = req.body;
      
      if (!userId || !permission) {
        return res.status(400).json({ message: "userId and permission are required" });
      }
      
      const newPermission = await storage.createUserPermission({
        userId,
        permission,
        granted: granted || false,
        grantedBy,
      });
      
      res.status(201).json(newPermission);
    } catch (error) {
      console.error("Error creating permission:", error);
      res.status(500).json({ message: "Failed to create permission" });
    }
  });

  app.put('/api/permissions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const grantedBy = req.user.claims.sub;
      const permissionId = parseInt(req.params.id);
      const { granted } = req.body;
      
      if (granted === undefined) {
        return res.status(400).json({ message: "granted is required" });
      }
      
      const permission = await storage.updateUserPermission(permissionId, granted, grantedBy);
      res.json(permission);
    } catch (error) {
      console.error("Error updating permission:", error);
      res.status(500).json({ message: "Failed to update permission" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time features
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'terminal_command':
            // Handle real-time terminal commands
            const interpretation = await aiService.interpretCommand(data.command);
            ws.send(JSON.stringify({
              type: 'terminal_response',
              interpretation,
            }));
            break;
            
          case 'system_metrics':
            // Handle real-time system metrics
            // In a real implementation, this would collect actual system metrics
            const mockMetrics = {
              cpu: Math.floor(Math.random() * 100),
              memory: Math.floor(Math.random() * 100),
              neural: Math.floor(Math.random() * 100),
            };
            ws.send(JSON.stringify({
              type: 'metrics_update',
              metrics: mockMetrics,
            }));
            break;
            
          case 'ai_chat':
            // Handle real-time AI chat
            const response = await aiService.chatResponse(data.message);
            ws.send(JSON.stringify({
              type: 'ai_response',
              response,
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process request',
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
