import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File system table
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  path: varchar("path").notNull(),
  type: varchar("type").notNull(), // 'file' or 'directory'
  content: text("content"),
  size: integer("size").default(0),
  userId: varchar("user_id").references(() => users.id),
  parentId: integer("parent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI chat sessions
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Terminal sessions
export const terminalSessions = pgTable("terminal_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  currentDirectory: varchar("current_directory").default("/home"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Terminal commands history
export const terminalCommands = pgTable("terminal_commands", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => terminalSessions.id),
  command: text("command").notNull(),
  output: text("output"),
  aiInterpretation: text("ai_interpretation"),
  executed: boolean("executed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User permissions
export const userPermissions = pgTable("user_permissions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  permission: varchar("permission").notNull(),
  granted: boolean("granted").default(false),
  grantedBy: varchar("granted_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// System metrics
export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  metricType: varchar("metric_type").notNull(), // 'cpu', 'memory', 'neural'
  value: integer("value").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertFile = typeof files.$inferInsert;
export type File = typeof files.$inferSelect;

export type InsertChatSession = typeof chatSessions.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertTerminalSession = typeof terminalSessions.$inferInsert;
export type TerminalSession = typeof terminalSessions.$inferSelect;

export type InsertTerminalCommand = typeof terminalCommands.$inferInsert;
export type TerminalCommand = typeof terminalCommands.$inferSelect;

export type InsertUserPermission = typeof userPermissions.$inferInsert;
export type UserPermission = typeof userPermissions.$inferSelect;

export type InsertSystemMetric = typeof systemMetrics.$inferInsert;
export type SystemMetric = typeof systemMetrics.$inferSelect;

// Schema validation
export const insertFileSchema = createInsertSchema(files).pick({
  name: true,
  path: true,
  type: true,
  content: true,
  size: true,
  parentId: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  title: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
});

export const insertTerminalCommandSchema = createInsertSchema(terminalCommands).pick({
  sessionId: true,
  command: true,
  output: true,
  aiInterpretation: true,
  executed: true,
});

export const insertUserPermissionSchema = createInsertSchema(userPermissions).pick({
  userId: true,
  permission: true,
  granted: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).pick({
  metricType: true,
  value: true,
});
