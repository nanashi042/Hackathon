import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  UserCheck, 
  Clock, 
  Activity,
  Filter,
  MoreVertical,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface User {
  id: string;
  username: string;
  email: string;
  userType: 'helper' | 'needer';
  gender: 'male' | 'female' | 'other';
  mode: 'ai' | 'human';
  status: 'online' | 'away' | 'busy' | 'offline';
  isActive: boolean;
  isBanned: boolean;
  joinDate: string;
  lastActive: string;
  totalPosts: number;
  totalComments: number;
  totalHearts: number;
  reportCount: number;
  specialties: string[];
}

interface AdminPanelProps {
  onClose: () => void;
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'away' | 'busy' | 'offline'>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'helper' | 'needer'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'CompassionateHeart',
        email: 'user1@example.com',
        userType: 'helper',
        gender: 'female',
        mode: 'human',
        status: 'online',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-15',
        lastActive: '2024-01-20T10:30:00Z',
        totalPosts: 25,
        totalComments: 89,
        totalHearts: 156,
        reportCount: 0,
        specialties: ['anxiety', 'depression', 'grief']
      },
      {
        id: '2',
        username: 'GentleListener',
        email: 'user2@example.com',
        userType: 'helper',
        gender: 'male',
        mode: 'human',
        status: 'online',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-10',
        lastActive: '2024-01-20T09:45:00Z',
        totalPosts: 18,
        totalComments: 67,
        totalHearts: 134,
        reportCount: 0,
        specialties: ['anxiety', 'selfcare', 'meditation']
      },
      {
        id: '3',
        username: 'HopefulJourney',
        email: 'user3@example.com',
        userType: 'needer',
        gender: 'female',
        mode: 'ai',
        status: 'online',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-12',
        lastActive: '2024-01-20T11:15:00Z',
        totalPosts: 12,
        totalComments: 34,
        totalHearts: 78,
        reportCount: 0,
        specialties: ['support', 'sharing']
      },
      {
        id: '4',
        username: 'WarmSupport',
        email: 'user4@example.com',
        userType: 'helper',
        gender: 'male',
        mode: 'human',
        status: 'away',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-08',
        lastActive: '2024-01-19T16:20:00Z',
        totalPosts: 31,
        totalComments: 95,
        totalHearts: 189,
        reportCount: 1,
        specialties: ['depression', 'positivity', 'encouragement']
      },
      {
        id: '5',
        username: 'BraveSpirit',
        email: 'user5@example.com',
        userType: 'needer',
        gender: 'other',
        mode: 'ai',
        status: 'busy',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-14',
        lastActive: '2024-01-20T08:30:00Z',
        totalPosts: 8,
        totalComments: 23,
        totalHearts: 45,
        reportCount: 0,
        specialties: ['anxiety', 'support']
      },
      {
        id: '6',
        username: 'KindSoul',
        email: 'user6@example.com',
        userType: 'helper',
        gender: 'female',
        mode: 'human',
        status: 'offline',
        isActive: true,
        isBanned: false,
        joinDate: '2024-01-05',
        lastActive: '2024-01-18T14:45:00Z',
        totalPosts: 22,
        totalComments: 71,
        totalHearts: 142,
        reportCount: 0,
        specialties: ['meditation', 'mindfulness', 'selfcare']
      },
      {
        id: '7',
        username: 'TroubledUser',
        email: 'user7@example.com',
        userType: 'needer',
        gender: 'male',
        mode: 'human',
        status: 'online',
        isActive: false,
        isBanned: true,
        joinDate: '2024-01-16',
        lastActive: '2024-01-20T12:00:00Z',
        totalPosts: 3,
        totalComments: 8,
        totalHearts: 12,
        reportCount: 5,
        specialties: ['support']
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // User type filter
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.userType === userTypeFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, userTypeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'away': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'busy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleBanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isBanned: !user.isBanned, isActive: user.isBanned }
        : user
    ));
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive && !u.isBanned).length,
    onlineUsers: users.filter(u => u.status === 'online').length,
    bannedUsers: users.filter(u => u.isBanned).length,
    helpers: users.filter(u => u.userType === 'helper').length,
    needers: users.filter(u => u.userType === 'needer').length
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Panel
                </CardTitle>
                <p className="text-sm text-gray-500">User Management & Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-orange-100">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Stats Overview */}
          <div className="p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.onlineUsers}</div>
                <div className="text-sm text-gray-600">Online Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
                <div className="text-sm text-gray-600">Banned Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.helpers}</div>
                <div className="text-sm text-gray-600">Helpers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.needers}</div>
                <div className="text-sm text-gray-600">Seekers</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userTypeFilter} onValueChange={(value: any) => setUserTypeFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="helper">Helpers</SelectItem>
                  <SelectItem value="needer">Seekers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{user.username}</h3>
                              {getStatusIcon(user.status)}
                              {user.isBanned && <Ban className="h-4 w-4 text-red-500" />}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={user.userType === 'helper' ? 'default' : 'secondary'}>
                                {user.userType === 'helper' ? 'Helper' : 'Seeker'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {user.gender}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {user.mode === 'ai' ? 'AI Mode' : 'Human Mode'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-sm">
                            <div className="text-gray-600">Last Active</div>
                            <div className="font-medium">{formatLastActive(user.lastActive)}</div>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-gray-600">Activity</div>
                            <div className="font-medium">{user.totalPosts} posts, {user.totalComments} comments</div>
                          </div>
                          {user.reportCount > 0 && (
                            <div className="text-right text-sm">
                              <div className="text-red-600">Reports</div>
                              <div className="font-medium text-red-600">{user.reportCount}</div>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewUserDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={user.isBanned ? "default" : "destructive"}
                              size="sm"
                              onClick={() => handleBanUser(user.id)}
                            >
                              {user.isBanned ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg mb-2 text-gray-600">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* User Details Modal */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-lg">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-medium">{selectedUser.username}</h3>
                    <p className="text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusIcon(selectedUser.status)}
                      <span className="text-sm">{selectedUser.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User Type</Label>
                    <p className="font-medium">{selectedUser.userType}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p className="font-medium">{selectedUser.gender}</p>
                  </div>
                  <div>
                    <Label>Mode</Label>
                    <p className="font-medium">{selectedUser.mode}</p>
                  </div>
                  <div>
                    <Label>Join Date</Label>
                    <p className="font-medium">{formatDate(selectedUser.joinDate)}</p>
                  </div>
                  <div>
                    <Label>Total Posts</Label>
                    <p className="font-medium">{selectedUser.totalPosts}</p>
                  </div>
                  <div>
                    <Label>Total Comments</Label>
                    <p className="font-medium">{selectedUser.totalComments}</p>
                  </div>
                  <div>
                    <Label>Total Hearts</Label>
                    <p className="font-medium">{selectedUser.totalHearts}</p>
                  </div>
                  <div>
                    <Label>Report Count</Label>
                    <p className={`font-medium ${selectedUser.reportCount > 0 ? 'text-red-600' : ''}`}>
                      {selectedUser.reportCount}
                    </p>
                  </div>
                </div>
                
                {selectedUser.specialties.length > 0 && (
                  <div>
                    <Label>Specialties</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUser.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">{specialty}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
