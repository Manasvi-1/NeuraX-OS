import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

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

export interface FileAnalysis {
  suggestions: string[];
  insights: string[];
  optimizations: string[];
}

export interface CodeSuggestion {
  line: number;
  suggestion: string;
  type: 'error' | 'warning' | 'improvement';
}

export class AIService {
  async interpretCommand(command: string, currentDirectory: string = "/home"): Promise<CommandInterpretation> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that interprets natural language commands and converts them to bash commands. 
            Current directory: ${currentDirectory}
            Respond with JSON in this format: {
              "interpretation": "human-readable explanation",
              "bashCommand": "actual bash command",
              "confidence": 0.95,
              "explanation": "detailed explanation of what the command does"
            }`
          },
          {
            role: "user",
            content: command,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        originalCommand: command,
        interpretation: result.interpretation || "Command interpretation unavailable",
        bashCommand: result.bashCommand || command,
        confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
        explanation: result.explanation || "No explanation available",
      };
    } catch (error) {
      console.error("AI command interpretation error:", error);
      return {
        originalCommand: command,
        interpretation: "Could not interpret command",
        bashCommand: command,
        confidence: 0.1,
        explanation: "AI service temporarily unavailable",
      };
    }
  }

  async chatResponse(message: string, context: string[] = []): Promise<AIResponse> {
    try {
      const contextString = context.length > 0 ? `\nContext: ${context.join(" ")}` : "";
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a Linux operating system. You help users with system navigation, troubleshooting, and optimization. Be helpful, concise, and technical when appropriate.${contextString}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      });

      return {
        content: response.choices[0].message.content || "I'm sorry, I couldn't process your request.",
        suggestions: [], // Could be enhanced to include suggestions
        metadata: {},
      };
    } catch (error) {
      console.error("AI chat response error:", error);
      return {
        content: "I'm experiencing technical difficulties. Please try again later.",
        suggestions: [],
        metadata: { error: true },
      };
    }
  }

  async analyzeFile(fileName: string, content: string): Promise<FileAnalysis> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a code analysis AI. Analyze the given file and provide suggestions, insights, and optimizations. 
            Respond with JSON in this format: {
              "suggestions": ["suggestion1", "suggestion2"],
              "insights": ["insight1", "insight2"],
              "optimizations": ["optimization1", "optimization2"]
            }`,
          },
          {
            role: "user",
            content: `File: ${fileName}\n\nContent:\n${content}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        suggestions: result.suggestions || [],
        insights: result.insights || [],
        optimizations: result.optimizations || [],
      };
    } catch (error) {
      console.error("AI file analysis error:", error);
      return {
        suggestions: [],
        insights: [],
        optimizations: [],
      };
    }
  }

  async generateCodeSuggestions(code: string, language: string): Promise<CodeSuggestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a code review AI. Analyze the ${language} code and provide line-specific suggestions. 
            Respond with JSON array in this format: [{
              "line": 1,
              "suggestion": "suggestion text",
              "type": "error|warning|improvement"
            }]`,
          },
          {
            role: "user",
            content: code,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return result.suggestions || [];
    } catch (error) {
      console.error("AI code suggestions error:", error);
      return [];
    }
  }

  async optimizeSystem(metrics: Record<string, number>): Promise<string[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a system optimization AI. Based on the system metrics, provide optimization recommendations. 
            Respond with JSON in this format: {
              "optimizations": ["optimization1", "optimization2"]
            }`,
          },
          {
            role: "user",
            content: `System metrics: ${JSON.stringify(metrics)}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return result.optimizations || [];
    } catch (error) {
      console.error("AI system optimization error:", error);
      return ["System optimization temporarily unavailable"];
    }
  }

  async searchFiles(query: string, files: Array<{name: string, path: string, content?: string}>): Promise<Array<{file: any, relevance: number}>> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a file search AI. Given a search query and list of files, rank them by relevance. 
            Respond with JSON in this format: {
              "results": [{"index": 0, "relevance": 0.95, "reason": "explanation"}]
            }`,
          },
          {
            role: "user",
            content: `Search query: ${query}\n\nFiles: ${JSON.stringify(files.map((f, i) => ({index: i, name: f.name, path: f.path})))}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      return (result.results || []).map((r: any) => ({
        file: files[r.index],
        relevance: r.relevance || 0,
      }));
    } catch (error) {
      console.error("AI file search error:", error);
      return files.map(file => ({ file, relevance: 0.5 }));
    }
  }
}

export const aiService = new AIService();
