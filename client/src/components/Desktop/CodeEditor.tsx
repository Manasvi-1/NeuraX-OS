import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { CodeSuggestion } from "@/types/desktop";
import { 
  Code, 
  Save, 
  FileText, 
  Lightbulb, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle,
  Sparkles
} from "lucide-react";

const SAMPLE_CODE = `import tensorflow as tf
from tensorflow import keras

# Sample neural network implementation
class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.model = keras.Sequential([
            keras.layers.Dense(hidden_size, activation='relu', input_shape=(input_size,)),
            keras.layers.Dense(output_size, activation='softmax')
        ])
        
    def compile(self, optimizer='adam', loss='categorical_crossentropy'):
        self.model.compile(optimizer=optimizer, loss=loss, metrics=['accuracy'])
        
    def train(self, X, y, epochs=10):
        return self.model.fit(X, y, epochs=epochs, validation_split=0.2)
        
    def predict(self, X):
        return self.model.predict(X)`;

export default function CodeEditor() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("python");
  const [fileName, setFileName] = useState("neural_network.py");
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const codeAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Get AI code suggestions
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/code-suggestions', {
        code,
        language,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setIsAnalyzing(false);
      toast({
        title: "Code Analysis Complete",
        description: `Found ${data.length} suggestions for improvement.`,
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
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
        description: "Failed to analyze code",
        variant: "destructive",
      });
    },
  });

  // Analyze file with AI
  const analyzeFileMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/analyze-file', {
        fileName,
        content: code,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "File Analysis Complete",
        description: `AI found ${data.suggestions.length} suggestions and ${data.insights.length} insights.`,
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
        description: "Failed to analyze file",
        variant: "destructive",
      });
    },
  });

  // Auto-analyze code when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.trim()) {
        setIsAnalyzing(true);
        analyzeMutation.mutate();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code]);

  const handleSave = () => {
    toast({
      title: "File Saved",
      description: `${fileName} has been saved successfully.`,
    });
  };

  const handleAnalyzeFile = () => {
    analyzeFileMutation.mutate();
  };

  const getSuggestionIcon = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'improvement':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSuggestionBgColor = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'improvement':
        return 'bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const codeLines = code.split('\n');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Code className="text-blue-500 w-4 h-4" />
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-32 h-6 text-sm bg-transparent border-none focus:bg-slate-700/50 focus:border-slate-600"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-20 h-6 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAnalyzeFile}
            className="h-6 px-2 text-xs"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Analyze
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-6 px-2 text-xs"
          >
            <Save className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Code Area */}
        <div className="flex-1 flex">
          {/* Line Numbers */}
          <div className="w-12 bg-slate-800/50 text-slate-500 text-xs font-mono p-2 border-r border-slate-700/50">
            {codeLines.map((_, index) => (
              <div key={index} className="text-right leading-5">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              ref={codeAreaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full p-4 bg-transparent text-slate-100 font-mono text-sm resize-none outline-none leading-5"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              spellCheck={false}
            />
            
            {/* AI Analysis Indicator */}
            {isAnalyzing && (
              <div className="absolute top-2 right-2 bg-violet-500/20 rounded-lg px-2 py-1 text-xs flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-violet-400"></div>
                <span className="text-violet-400">AI analyzing...</span>
              </div>
            )}

            {/* Suggestions Overlay */}
            {suggestions.map((suggestion) => (
              <div
                key={`${suggestion.line}-${suggestion.type}`}
                className={`absolute right-2 border rounded-lg px-2 py-1 text-xs z-10 ${getSuggestionBgColor(suggestion.type)}`}
                style={{
                  top: `${(suggestion.line - 1) * 20 + 16}px`,
                }}
              >
                <div className="flex items-center space-x-1">
                  {getSuggestionIcon(suggestion.type)}
                  <span className="text-slate-200">{suggestion.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions Panel */}
        <div className="w-80 border-l border-slate-700/50 bg-slate-800/30">
          <div className="p-3 border-b border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-200 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-violet-500" />
              <span>AI Suggestions</span>
              {isAnalyzing && (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-violet-400"></div>
              )}
            </h3>
          </div>
          
          <ScrollArea className="h-full p-3">
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${getSuggestionBgColor(suggestion.type)} hover:opacity-80`}
                    onClick={() => setSelectedLine(suggestion.line)}
                  >
                    <div className="flex items-start space-x-2">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1">
                        <div className="text-xs font-medium text-slate-200 mb-1">
                          Line {suggestion.line}
                        </div>
                        <div className="text-xs text-slate-300">
                          {suggestion.suggestion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No suggestions available</p>
                  <p className="text-xs mt-1">AI will analyze your code automatically</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-3 py-1 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Lines: {codeLines.length}</span>
          <span>Language: {language}</span>
          <span>Suggestions: {suggestions.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span>AI-Enhanced Code Editor</span>
        </div>
      </div>
    </div>
  );
}
