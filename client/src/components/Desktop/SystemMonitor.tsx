import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useDesktop } from "./DesktopContext";
import { SystemMetrics } from "@/types/desktop";
import { 
  BarChart3, 
  Cpu, 
  HardDrive, 
  Brain, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";

export default function SystemMonitor() {
  const [optimizations, setOptimizations] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { systemStatus, setSystemStatus } = useDesktop();

  // Get system metrics
  const { data: metrics = [] } = useQuery({
    queryKey: ["/api/metrics"],
    retry: false,
  });

  // Get system optimization recommendations
  const optimizeSystemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/ai/optimize-system', {
        metrics: {
          cpu: systemStatus.cpu,
          memory: systemStatus.memory,
          neural: systemStatus.neural,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      setOptimizations(data.optimizations);
      setIsOptimizing(false);
      toast({
        title: "System Analysis Complete",
        description: "AI has analyzed your system and provided optimization recommendations.",
      });
    },
    onError: (error) => {
      setIsOptimizing(false);
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
        description: "Failed to optimize system",
        variant: "destructive",
      });
    },
  });

  // Record system metrics
  const recordMetricMutation = useMutation({
    mutationFn: async (metric: { metricType: string; value: number }) => {
      const response = await apiRequest('POST', '/api/metrics', metric);
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
      }
    },
  });

  // WebSocket for real-time metrics
  const { sendMessage } = useWebSocket('/ws', {
    onMessage: (data) => {
      if (data.type === 'metrics_update') {
        setSystemStatus(data.metrics);
        
        // Record metrics to database
        recordMetricMutation.mutate({ metricType: 'cpu', value: data.metrics.cpu });
        recordMetricMutation.mutate({ metricType: 'memory', value: data.metrics.memory });
        recordMetricMutation.mutate({ metricType: 'neural', value: data.metrics.neural });
      }
    }
  });

  // Request metrics updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      sendMessage({ type: 'system_metrics' });
    }, 2000);

    return () => clearInterval(interval);
  }, [sendMessage]);

  const handleOptimize = () => {
    setIsOptimizing(true);
    optimizeSystemMutation.mutate();
  };

  const getMetricColor = (value: number) => {
    if (value < 30) return 'text-emerald-500';
    if (value < 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getMetricStatus = (value: number) => {
    if (value < 30) return 'Optimal';
    if (value < 70) return 'Normal';
    return 'High';
  };

  const getStatusIcon = (value: number) => {
    if (value < 30) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (value < 70) return <Activity className="w-4 h-4 text-amber-500" />;
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-emerald-500 w-5 h-5" />
          <span className="font-semibold text-slate-200">System Monitor</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {/* System Metrics */}
        <div className="space-y-4">
          {/* CPU Usage */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>CPU Usage</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.cpu)}
                  <span className={`text-sm ${getMetricColor(systemStatus.cpu)}`}>
                    {systemStatus.cpu}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={systemStatus.cpu} className="h-2" />
              <div className="text-xs text-slate-400 mt-1">
                Status: {getStatusStatus(systemStatus.cpu)}
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-blue-500" />
                  <span>Memory Usage</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.memory)}
                  <span className={`text-sm ${getMetricColor(systemStatus.memory)}`}>
                    {systemStatus.memory}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={systemStatus.memory} className="h-2" />
              <div className="text-xs text-slate-400 mt-1">
                Status: {getMetricStatus(systemStatus.memory)}
              </div>
            </CardContent>
          </Card>

          {/* Neural Processing */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-violet-500" />
                  <span>Neural Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.neural)}
                  <span className={`text-sm ${getMetricColor(systemStatus.neural)}`}>
                    {systemStatus.neural}%
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={systemStatus.neural} className="h-2" />
              <div className="text-xs text-slate-400 mt-1">
                Status: {getMetricStatus(systemStatus.neural)}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span>AI Insights</span>
                </div>
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1 h-auto"
                >
                  {isOptimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Optimize
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {optimizations.length > 0 ? (
                <div className="space-y-2">
                  {optimizations.map((optimization, index) => (
                    <div key={index} className="text-xs text-slate-300 flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{optimization}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  System running optimally. Click "Optimize" for AI analysis.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-800/30 border-slate-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {metrics.slice(0, 3).map((metric: SystemMetrics, index: number) => (
                  <div key={index} className="text-xs text-slate-300 flex items-center justify-between">
                    <span>{metric.metricType.toUpperCase()}</span>
                    <span className={getMetricColor(metric.value)}>{metric.value}%</span>
                  </div>
                ))}
                {metrics.length === 0 && (
                  <div className="text-xs text-slate-400">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
