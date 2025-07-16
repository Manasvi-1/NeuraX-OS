import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Terminal, FileText, Bot, Settings, Shield, Zap, Code } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "AI-Powered Interface",
      description: "Interact with your system using natural language commands and AI assistance."
    },
    {
      icon: <Terminal className="w-8 h-8 text-green-500" />,
      title: "Smart Terminal",
      description: "Terminal that understands natural language and provides intelligent command suggestions."
    },
    {
      icon: <FileText className="w-8 h-8 text-amber-500" />,
      title: "Intelligent File Manager",
      description: "AI-powered file organization, search, and content analysis."
    },
    {
      icon: <Bot className="w-8 h-8 text-violet-500" />,
      title: "Personal AI Assistant",
      description: "Get help with system tasks, troubleshooting, and optimization."
    },
    {
      icon: <Code className="w-8 h-8 text-emerald-500" />,
      title: "AI Code Editor",
      description: "Write code with intelligent suggestions and real-time analysis."
    },
    {
      icon: <Settings className="w-8 h-8 text-red-500" />,
      title: "System Optimization",
      description: "AI-driven performance monitoring and optimization recommendations."
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-500" />,
      title: "Secure Access Control",
      description: "Permission-based user management with AI-enhanced security."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Real-time Collaboration",
      description: "Work together with AI-powered collaborative features."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-desktop">
        <div className="absolute inset-0 bg-slate-900/80"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 glass-effect">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI OS</h1>
                <p className="text-sm text-slate-300">Neural Desktop Environment</p>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Access System
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-white mb-4">
                The Future of
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Computing</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Experience the next generation of operating systems with AI-enhanced capabilities, 
                natural language interaction, and intelligent automation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors ai-glow"
                >
                  Enter AI OS
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 bg-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                AI-Enhanced Features
              </h2>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Discover how artificial intelligence revolutionizes every aspect of your computing experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="glass-effect border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-lg mb-3 mx-auto">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg text-white text-center">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-slate-300 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="glass-effect border-slate-700/50 ai-glow">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl text-white mb-4">
                  Ready to Experience the Future?
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Join thousands of users who are already leveraging AI to transform their computing experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-300 ai-glow"
                >
                  Get Started Now
                </Button>
                <p className="text-sm text-slate-400 mt-4">
                  Secure authentication • Permission-based access • AI-powered experience
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 glass-effect border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-300">AI OS - Neural Desktop Environment</p>
                <p className="text-xs text-slate-500">Powered by OpenAI GPT-4o</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span>© 2024 AI OS</span>
              <span>•</span>
              <span>Professional Computing Platform</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
