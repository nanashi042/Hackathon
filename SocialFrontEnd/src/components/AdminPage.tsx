import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Users, 
  Shield, 
  UserCheck, 
  Heart,
  ArrowLeft
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  userType: 'helper' | 'needer';
  gender: 'male' | 'female' | 'other';
  mode: 'ai' | 'human';
  status: 'online' | 'away' | 'busy' | 'offline';
  isActive: boolean;
  joinDate: string;
  lastActive: string;
  totalPosts: number;
  totalComments: number;
  totalHearts: number;
  specialties: string[];
}

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'CompassionateHeart',
        userType: 'helper',
        gender: 'female',
        mode: 'human',
        status: 'online',
        isActive: true,
        joinDate: '2024-01-15',
        lastActive: '2024-01-20T10:30:00Z',
        totalPosts: 25,
        totalComments: 89,
        totalHearts: 156,
        specialties: ['anxiety', 'depression', 'grief']
      },
      {
        id: '2',
        username: 'GentleListener',
        userType: 'helper',
        gender: 'male',
        mode: 'human',
        status: 'online',
        isActive: true,
        joinDate: '2024-01-10',
        lastActive: '2024-01-20T09:45:00Z',
        totalPosts: 18,
        totalComments: 67,
        totalHearts: 134,
        specialties: ['anxiety', 'selfcare', 'meditation']
      },
      {
        id: '3',
        username: 'HopefulJourney',
        userType: 'needer',
        gender: 'female',
        mode: 'ai',
        status: 'online',
        isActive: true,
        joinDate: '2024-01-12',
        lastActive: '2024-01-20T11:15:00Z',
        totalPosts: 12,
        totalComments: 34,
        totalHearts: 78,
        specialties: ['support', 'sharing']
      },
      {
        id: '4',
        username: 'WarmSupport',
        userType: 'helper',
        gender: 'male',
        mode: 'human',
        status: 'away',
        isActive: true,
        joinDate: '2024-01-08',
        lastActive: '2024-01-19T16:20:00Z',
        totalPosts: 31,
        totalComments: 95,
        totalHearts: 189,
        specialties: ['depression', 'positivity', 'encouragement']
      },
      {
        id: '5',
        username: 'BraveSpirit',
        userType: 'needer',
        gender: 'other',
        mode: 'ai',
        status: 'busy',
        isActive: true,
        joinDate: '2024-01-14',
        lastActive: '2024-01-20T08:30:00Z',
        totalPosts: 8,
        totalComments: 23,
        totalHearts: 45,
        specialties: ['anxiety', 'support']
      },
      {
        id: '6',
        username: 'KindSoul',
        userType: 'helper',
        gender: 'female',
        mode: 'human',
        status: 'offline',
        isActive: true,
        joinDate: '2024-01-05',
        lastActive: '2024-01-18T14:45:00Z',
        totalPosts: 22,
        totalComments: 71,
        totalHearts: 142,
        specialties: ['meditation', 'mindfulness', 'selfcare']
      },
      {
        id: '7',
        username: 'SeekingHelp',
        userType: 'needer',
        gender: 'male',
        mode: 'human',
        status: 'online',
        isActive: true,
        joinDate: '2024-01-17',
        lastActive: '2024-01-20T12:00:00Z',
        totalPosts: 5,
        totalComments: 15,
        totalHearts: 28,
        specialties: ['support']
      },
      {
        id: '8',
        username: 'MindfulHelper',
        userType: 'helper',
        gender: 'female',
        mode: 'ai',
        status: 'online',
        isActive: true,
        joinDate: '2024-01-13',
        lastActive: '2024-01-20T13:30:00Z',
        totalPosts: 19,
        totalComments: 58,
        totalHearts: 112,
        specialties: ['meditation', 'mindfulness', 'anxiety']
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate basic stats
  const totalUsers = users.length;
  const femaleUsers = users.filter(user => user.gender === 'female').length;
  const maleUsers = users.filter(user => user.gender === 'male').length;
  const otherUsers = users.filter(user => user.gender === 'other').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-500">User Statistics Dashboard</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{totalUsers}</div>
            <div className="text-lg text-gray-600">Total Registered Users</div>
          </Card>
          
          <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <UserCheck className="h-12 w-12 text-pink-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{femaleUsers}</div>
            <div className="text-lg text-gray-600">Female Users</div>
          </Card>
          
          <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-2">{maleUsers}</div>
            <div className="text-lg text-gray-600">Male Users</div>
          </Card>
        </div>

        {/* Additional Info */}
        {otherUsers > 0 && (
          <Card className="text-center p-6 bg-white/90 backdrop-blur-sm shadow-lg mb-8">
            <div className="text-2xl font-bold text-gray-700 mb-2">{otherUsers}</div>
            <div className="text-lg text-gray-600">Other Gender Users</div>
          </Card>
        )}

        {/* Summary */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl">User Distribution Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-3xl font-bold text-gray-900">
                Total: {totalUsers} Users
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="font-semibold text-pink-700">Female Users</div>
                  <div className="text-2xl font-bold text-pink-600">{femaleUsers}</div>
                  <div className="text-sm text-pink-500">
                    {totalUsers > 0 ? Math.round((femaleUsers / totalUsers) * 100) : 0}% of total
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-700">Male Users</div>
                  <div className="text-2xl font-bold text-blue-600">{maleUsers}</div>
                  <div className="text-sm text-blue-500">
                    {totalUsers > 0 ? Math.round((maleUsers / totalUsers) * 100) : 0}% of total
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
