import {
  users,
  files,
  chatSessions,
  chatMessages,
  terminalSessions,
  terminalCommands,
  userPermissions,
  systemMetrics,
  type User,
  type UpsertUser,
  type File,
  type InsertFile,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type TerminalSession,
  type InsertTerminalSession,
  type TerminalCommand,
  type InsertTerminalCommand,
  type UserPermission,
  type InsertUserPermission,
  type SystemMetric,
  type InsertSystemMetric,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, isNull } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // File system operations
  getFiles(userId: string, parentId?: number): Promise<File[]>;
  getFile(id: number, userId: string): Promise<File | undefined>;
  createFile(file: InsertFile & { userId: string }): Promise<File>;
  updateFile(id: number, userId: string, updates: Partial<InsertFile>): Promise<File>;
  deleteFile(id: number, userId: string): Promise<void>;
  searchFiles(userId: string, query: string): Promise<File[]>;
  
  // Chat operations
  getChatSessions(userId: string): Promise<ChatSession[]>;
  getChatSession(id: number, userId: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession & { userId: string }): Promise<ChatSession>;
  getChatMessages(sessionId: number, userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Terminal operations
  getTerminalSession(userId: string): Promise<TerminalSession | undefined>;
  createTerminalSession(session: InsertTerminalSession & { userId: string }): Promise<TerminalSession>;
  updateTerminalSession(id: number, userId: string, updates: Partial<InsertTerminalSession>): Promise<TerminalSession>;
  getTerminalCommands(sessionId: number, limit?: number): Promise<TerminalCommand[]>;
  createTerminalCommand(command: InsertTerminalCommand): Promise<TerminalCommand>;
  
  // Permission operations
  getUserPermissions(userId: string): Promise<UserPermission[]>;
  createUserPermission(permission: InsertUserPermission): Promise<UserPermission>;
  updateUserPermission(id: number, granted: boolean, grantedBy: string): Promise<UserPermission>;
  
  // System metrics operations
  getSystemMetrics(userId: string, metricType?: string, limit?: number): Promise<SystemMetric[]>;
  createSystemMetric(metric: InsertSystemMetric & { userId: string }): Promise<SystemMetric>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // File system operations
  async getFiles(userId: string, parentId?: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          parentId ? eq(files.parentId, parentId) : isNull(files.parentId)
        )
      )
      .orderBy(asc(files.type), asc(files.name));
  }

  async getFile(id: number, userId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, id), eq(files.userId, userId)));
    return file;
  }

  async createFile(file: InsertFile & { userId: string }): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async updateFile(id: number, userId: string, updates: Partial<InsertFile>): Promise<File> {
    const [updatedFile] = await db
      .update(files)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(files.id, id), eq(files.userId, userId)))
      .returning();
    return updatedFile;
  }

  async deleteFile(id: number, userId: string): Promise<void> {
    await db.delete(files).where(and(eq(files.id, id), eq(files.userId, userId)));
  }

  async searchFiles(userId: string, query: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          // Using ILIKE for case-insensitive search
          // In production, you might want to use full-text search
        )
      )
      .orderBy(asc(files.name));
  }

  // Chat operations
  async getChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async getChatSession(id: number, userId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
    return session;
  }

  async createChatSession(session: InsertChatSession & { userId: string }): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatMessages(sessionId: number, userId: string): Promise<ChatMessage[]> {
    // Verify session belongs to user
    const session = await this.getChatSession(sessionId, userId);
    if (!session) {
      throw new Error("Session not found");
    }

    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Terminal operations
  async getTerminalSession(userId: string): Promise<TerminalSession | undefined> {
    const [session] = await db
      .select()
      .from(terminalSessions)
      .where(eq(terminalSessions.userId, userId))
      .orderBy(desc(terminalSessions.updatedAt))
      .limit(1);
    return session;
  }

  async createTerminalSession(session: InsertTerminalSession & { userId: string }): Promise<TerminalSession> {
    const [newSession] = await db.insert(terminalSessions).values(session).returning();
    return newSession;
  }

  async updateTerminalSession(id: number, userId: string, updates: Partial<InsertTerminalSession>): Promise<TerminalSession> {
    const [updatedSession] = await db
      .update(terminalSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(terminalSessions.id, id), eq(terminalSessions.userId, userId)))
      .returning();
    return updatedSession;
  }

  async getTerminalCommands(sessionId: number, limit = 50): Promise<TerminalCommand[]> {
    return await db
      .select()
      .from(terminalCommands)
      .where(eq(terminalCommands.sessionId, sessionId))
      .orderBy(desc(terminalCommands.createdAt))
      .limit(limit);
  }

  async createTerminalCommand(command: InsertTerminalCommand): Promise<TerminalCommand> {
    const [newCommand] = await db.insert(terminalCommands).values(command).returning();
    return newCommand;
  }

  // Permission operations
  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return await db
      .select()
      .from(userPermissions)
      .where(eq(userPermissions.userId, userId))
      .orderBy(asc(userPermissions.permission));
  }

  async createUserPermission(permission: InsertUserPermission): Promise<UserPermission> {
    const [newPermission] = await db.insert(userPermissions).values(permission).returning();
    return newPermission;
  }

  async updateUserPermission(id: number, granted: boolean, grantedBy: string): Promise<UserPermission> {
    const [updatedPermission] = await db
      .update(userPermissions)
      .set({ granted, grantedBy, createdAt: new Date() })
      .where(eq(userPermissions.id, id))
      .returning();
    return updatedPermission;
  }

  // System metrics operations
  async getSystemMetrics(userId: string, metricType?: string, limit = 100): Promise<SystemMetric[]> {
    const conditions = [eq(systemMetrics.userId, userId)];
    if (metricType) {
      conditions.push(eq(systemMetrics.metricType, metricType));
    }

    return await db
      .select()
      .from(systemMetrics)
      .where(and(...conditions))
      .orderBy(desc(systemMetrics.timestamp))
      .limit(limit);
  }

  async createSystemMetric(metric: InsertSystemMetric & { userId: string }): Promise<SystemMetric> {
    const [newMetric] = await db.insert(systemMetrics).values(metric).returning();
    return newMetric;
  }
}

export const storage = new DatabaseStorage();
