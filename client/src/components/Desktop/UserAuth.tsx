import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { UserPermission } from "@/types/desktop";
import { 
  Brain, 
  Shield, 
  Users, 
  Settings, 
  Check, 
  X, 
  Clock,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  status: 'active' | 'pending' | 'denied';
  permissions: UserPermission[];
}

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    status: 'active',
    permissions: []
  },
  {
    id: '2',
    email: 'guest@example.com',
    firstName: 'Guest',
    lastName: 'User',
    status: 'pending',
    permissions: []
  },
  {
    id: '3',
    email: 'developer@example.com',
    firstName: 'Developer',
    lastName: 'User',
    status: 'active',
    permissions: []
  }
];

const availablePermissions = [
  {
    id: 'file_access',
    name: 'File System Access',
    description: 'Access to file system operations',
    icon: <Settings className="w-4 h-4" />,
    critical: false
  },
  {
    id: 'terminal_access',
    name: 'Terminal Access',
    description: 'Execute terminal commands',
    icon: <Key className="w-4 h-4" />,
    critical: true
  },
  {
    id: 'ai_features',
    name: 'AI Features',
    description: 'Access to AI-powered tools',
    icon: <Brain className="w-4 h-4" />,
    critical: false
  },
  {
    id: 'system_admin',
    name: 'System Administration',
    description: 'Administrative privileges',
    icon: <Shield className="w-4 h-4" />,
    critical: true
  },
  {
    id: 'neural_training',
    name: 'Neural Network Training',
    description: 'Train and deploy AI models',
    icon: <Brain className="w-4 h-4" />,
    critical: false
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage other users and permissions',
    icon: <Users className="w-4 h-4" />,
    critical: true
  }
];

export default function UserAuth() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Get user permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ["/api/permissions"],
    retry: false,
  });

  // Grant/revoke permission
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission, granted }: { userId: string; permission: string; granted: boolean }) => {
      const response = await apiRequest('POST', '/api/permissions', {
        userId,
        permission,
        granted,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({
        title: "Permission Updated",
        description: `Permission has been ${data.granted ? 'granted' : 'revoked'} successfully.`,
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
        description: "Failed to update permission",
        variant: "destructive",
      });
    },
  });

  const handlePermissionChange = (userId: string, permission: string, granted: boolean) => {
    updatePermissionMutation.mutate({ userId, permission, granted });
  };

  const handleUserStatusChange = (userId: string, status: 'active' | 'pending' | 'denied') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    
    toast({
      title: "User Status Updated",
      description: `User status changed to ${status}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'pending':
        return 'bg-amber-500';
      case 'denied':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="h-full flex">
      {/* User List */}
      <div className="w-1/2 border-r border-slate-700/50">
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="text-blue-500 w-5 h-5" />
            <h2 className="text-lg font-semibold text-slate-100">AI OS Access Control</h2>
          </div>
          <p className="text-sm text-slate-400">
            Secure neural interface authentication and permission management
          </p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {users.map((user) => (
              <Card
                key={user.id}
                className={`glass-light border-slate-700/50 cursor-pointer transition-all duration-200 ${
                  selectedUser?.id === user.id ? 'border-blue-500/50 bg-blue-500/10' : 'hover:border-slate-600'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      {user.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} />
                      ) : (
                        <AvatarFallback className="bg-slate-600 text-slate-200">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-100">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.email
                            }
                          </h3>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(user.status)}
                          <Badge 
                            variant="outline" 
                            className={`text-xs text-white border-none ${getStatusColor(user.status)}`}
                          >
                            {user.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-slate-400">
                        {user.id === currentUser?.id ? 'Current User' : 
                         user.status === 'active' ? 'Full system access' :
                         user.status === 'pending' ? 'Awaiting approval' :
                         'Access denied'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Permission Management */}
      <div className="w-1/2 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="w-12 h-12">
                  {selectedUser.profileImageUrl ? (
                    <AvatarImage src={selectedUser.profileImageUrl} />
                  ) : (
                    <AvatarFallback className="bg-slate-600 text-slate-200">
                      {selectedUser.firstName?.[0] || selectedUser.email[0].toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-100">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.email
                    }
                  </h3>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={selectedUser.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleUserStatusChange(selectedUser.id, 'active')}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={selectedUser.status === 'pending' ? 'default' : 'outline'}
                  onClick={() => handleUserStatusChange(selectedUser.id, 'pending')}
                  className="text-xs"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Button>
                <Button
                  size="sm"
                  variant={selectedUser.status === 'denied' ? 'destructive' : 'outline'}
                  onClick={() => handleUserStatusChange(selectedUser.id, 'denied')}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Denied
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-200 mb-3">Permissions</h4>
                
                {availablePermissions.map((permission) => {
                  const isGranted = selectedUser.permissions?.some(p => 
                    p.permission === permission.id && p.granted
                  ) || false;
                  
                  return (
                    <Card key={permission.id} className="glass-light border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              permission.critical ? 'bg-red-500/20' : 'bg-blue-500/20'
                            }`}>
                              {permission.icon}
                            </div>
                            <div>
                              <h5 className="font-medium text-slate-100 flex items-center space-x-2">
                                <span>{permission.name}</span>
                                {permission.critical && (
                                  <AlertTriangle className="w-3 h-3 text-red-400" />
                                )}
                              </h5>
                              <p className="text-sm text-slate-400">{permission.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isGranted}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(selectedUser.id, permission.id, checked)
                              }
                              disabled={selectedUser.id === currentUser?.id}
                            />
                            {isGranted ? (
                              <Unlock className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                Select a User
              </h3>
              <p className="text-slate-400">
                Choose a user from the list to manage their permissions
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
