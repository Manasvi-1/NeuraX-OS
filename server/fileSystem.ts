import { storage } from "./storage";
import { File, InsertFile } from "@shared/schema";

export interface FileSystemNode {
  id: number;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  children?: FileSystemNode[];
  parent?: FileSystemNode;
}

export class FileSystemService {
  async initializeUserFileSystem(userId: string): Promise<void> {
    // Create default directory structure for new users
    const defaultDirs = [
      { name: "home", path: "/home", type: "directory" as const },
      { name: "Desktop", path: "/home/Desktop", type: "directory" as const },
      { name: "Documents", path: "/home/Documents", type: "directory" as const },
      { name: "Downloads", path: "/home/Downloads", type: "directory" as const },
      { name: "Pictures", path: "/home/Pictures", type: "directory" as const },
      { name: "AI_Models", path: "/home/AI_Models", type: "directory" as const },
    ];

    // Create default files
    const defaultFiles = [
      {
        name: "welcome.txt",
        path: "/home/welcome.txt",
        type: "file" as const,
        content: "Welcome to AI OS!\n\nThis is your personalized Linux environment powered by artificial intelligence.\n\nGet started by:\n1. Exploring the file system\n2. Using the AI terminal\n3. Chatting with your AI assistant\n\nEnjoy your AI-enhanced computing experience!",
        size: 250,
      },
      {
        name: "neural_network.py",
        path: "/home/neural_network.py",
        type: "file" as const,
        content: "import tensorflow as tf\nfrom tensorflow import keras\n\n# Sample neural network implementation\nclass NeuralNetwork:\n    def __init__(self, input_size, hidden_size, output_size):\n        self.model = keras.Sequential([\n            keras.layers.Dense(hidden_size, activation='relu', input_shape=(input_size,)),\n            keras.layers.Dense(output_size, activation='softmax')\n        ])\n        \n    def compile(self, optimizer='adam', loss='categorical_crossentropy'):\n        self.model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])\n        \n    def train(self, X, y, epochs=10):\n        return self.model.fit(X, y, epochs=epochs, validation_split=0.2)\n        \n    def predict(self, X):\n        return self.model.predict(X)\n",
        size: 650,
      },
    ];

    // Check if user already has files
    const existingFiles = await storage.getFiles(userId);
    if (existingFiles.length > 0) {
      return; // User already has files
    }

    // Create directories first
    const dirMap = new Map<string, number>();
    
    for (const dir of defaultDirs) {
      const parentPath = dir.path.substring(0, dir.path.lastIndexOf("/"));
      const parentId = parentPath === "" ? null : dirMap.get(parentPath);
      
      const newDir = await storage.createFile({
        ...dir,
        userId,
        parentId,
      });
      
      dirMap.set(dir.path, newDir.id);
    }

    // Create files
    for (const file of defaultFiles) {
      const parentPath = file.path.substring(0, file.path.lastIndexOf("/"));
      const parentId = parentPath === "" ? null : dirMap.get(parentPath);
      
      await storage.createFile({
        ...file,
        userId,
        parentId,
      });
    }
  }

  async getDirectoryTree(userId: string, parentId?: number): Promise<FileSystemNode[]> {
    const files = await storage.getFiles(userId, parentId);
    
    const nodes: FileSystemNode[] = [];
    
    for (const file of files) {
      const node: FileSystemNode = {
        id: file.id,
        name: file.name,
        path: file.path,
        type: file.type as 'file' | 'directory',
        size: file.size || 0,
        content: file.content || undefined,
      };
      
      if (file.type === 'directory') {
        node.children = await this.getDirectoryTree(userId, file.id);
      }
      
      nodes.push(node);
    }
    
    return nodes;
  }

  async createFile(userId: string, name: string, parentPath: string, type: 'file' | 'directory', content?: string): Promise<File> {
    const path = `${parentPath}/${name}`;
    
    // Find parent directory
    let parentId: number | null = null;
    if (parentPath !== "/") {
      const parentFiles = await storage.getFiles(userId);
      const parent = parentFiles.find(f => f.path === parentPath && f.type === 'directory');
      if (parent) {
        parentId = parent.id;
      }
    }
    
    const size = content ? content.length : 0;
    
    return await storage.createFile({
      name,
      path,
      type,
      content,
      size,
      userId,
      parentId,
    });
  }

  async updateFile(userId: string, fileId: number, content: string): Promise<File> {
    return await storage.updateFile(fileId, userId, {
      content,
      size: content.length,
    });
  }

  async deleteFile(userId: string, fileId: number): Promise<void> {
    const file = await storage.getFile(fileId, userId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // If it's a directory, recursively delete children
    if (file.type === 'directory') {
      const children = await storage.getFiles(userId, fileId);
      for (const child of children) {
        await this.deleteFile(userId, child.id);
      }
    }
    
    await storage.deleteFile(fileId, userId);
  }

  async moveFile(userId: string, fileId: number, newParentPath: string): Promise<File> {
    const file = await storage.getFile(fileId, userId);
    if (!file) {
      throw new Error("File not found");
    }
    
    // Find new parent directory
    let newParentId: number | null = null;
    if (newParentPath !== "/") {
      const parentFiles = await storage.getFiles(userId);
      const parent = parentFiles.find(f => f.path === newParentPath && f.type === 'directory');
      if (parent) {
        newParentId = parent.id;
      }
    }
    
    const newPath = `${newParentPath}/${file.name}`;
    
    return await storage.updateFile(fileId, userId, {
      path: newPath,
      parentId: newParentId,
    });
  }

  async searchFiles(userId: string, query: string): Promise<File[]> {
    const allFiles = await storage.getFiles(userId);
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      (file.content && file.content.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async getFileStats(userId: string): Promise<{
    totalFiles: number;
    totalDirectories: number;
    totalSize: number;
    recentFiles: File[];
  }> {
    const allFiles = await storage.getFiles(userId);
    const files = allFiles.filter(f => f.type === 'file');
    const directories = allFiles.filter(f => f.type === 'directory');
    
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const recentFiles = files
      .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
      .slice(0, 10);
    
    return {
      totalFiles: files.length,
      totalDirectories: directories.length,
      totalSize,
      recentFiles,
    };
  }
}

export const fileSystemService = new FileSystemService();
