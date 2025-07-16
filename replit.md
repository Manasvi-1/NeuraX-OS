# AI OS - Neural Desktop Environment

## Overview

AI OS is a sophisticated full-stack web application that simulates a Linux-like desktop environment powered by artificial intelligence. The system provides an interactive desktop interface with AI-enhanced terminal, file management, code editing, and system monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **Styling**: Tailwind CSS with custom theme variables
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Context API for desktop state, TanStack Query for server state
- **Routing**: Wouter for client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **Authentication**: Replit Auth with OpenID Connect
- **AI Integration**: OpenAI API for natural language processing

### Key Components

#### Desktop Environment
- **Window Manager**: Multi-window system with draggable, resizable windows
- **Taskbar**: Application launcher with system status indicators
- **File Manager**: Hierarchical file system with AI-powered search
- **Terminal**: Natural language command interpretation with bash execution
- **AI Assistant**: Chat-based interface for system help and automation
- **Code Editor**: Syntax highlighting with AI-powered code suggestions
- **System Monitor**: Real-time performance metrics and optimization

#### Authentication System
- **Provider**: Replit Auth with session management
- **Session Storage**: PostgreSQL-backed session store
- **User Management**: Profile management with permissions system

#### AI Services
- **Command Interpretation**: Natural language to bash command conversion
- **Code Analysis**: Syntax checking and improvement suggestions
- **System Optimization**: Performance analysis and recommendations
- **Chat Assistant**: Conversational AI for user support

## Data Flow

### User Authentication
1. User authenticates via Replit OAuth
2. Session created and stored in PostgreSQL
3. User profile and permissions loaded
4. Desktop environment initialized with user-specific data

### Real-time Communication
1. WebSocket connection established on desktop load
2. System metrics broadcast to all connected clients
3. Terminal commands and AI responses streamed in real-time
4. File system changes synchronized across sessions

### AI Integration
1. Natural language input captured from terminal or chat
2. OpenAI API processes and interprets commands
3. Responses formatted and executed in appropriate context
4. Results displayed with explanations and suggestions

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL with connection pooling
- **AI Service**: OpenAI GPT-4 API for natural language processing
- **Authentication**: Replit Auth service
- **Real-time**: WebSocket server for live updates

### Development Tools
- **Build System**: Vite with TypeScript compilation
- **Database Management**: Drizzle Kit for migrations
- **Code Quality**: ESLint and TypeScript strict mode
- **UI Framework**: Radix UI primitives with Tailwind CSS

### Production Dependencies
- **Session Management**: PostgreSQL session store
- **File Storage**: Database-backed virtual file system
- **Performance Monitoring**: Built-in system metrics collection

## Deployment Strategy

### Development Environment
- Hot reload via Vite development server
- TypeScript compilation with strict checking
- Database migrations via Drizzle Kit
- Environment variables for API keys and database connection

### Production Build
- Static asset compilation with Vite
- Server bundling with esbuild
- PostgreSQL database with connection pooling
- Session persistence and user data storage

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **OPENAI_API_KEY**: OpenAI API authentication
- **SESSION_SECRET**: Session encryption key
- **REPLIT_DOMAINS**: Allowed authentication domains

The application implements a comprehensive desktop environment with AI-enhanced capabilities, real-time communication, and persistent user data storage. The architecture supports scalable user management, efficient database operations, and responsive UI interactions while maintaining security through proper authentication and session management.