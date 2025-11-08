import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Bot, 
  Users, 
  Search,
  Plus,
  Settings,
  LogOut,
  Trash2,
  Filter,
  UserCheck,
  Circle,
  User,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ChibiAvatar } from "./Mascot";
import { AdminPanel } from "./AdminPanel";

interface MainAppProps {
  mode: 'ai' | 'human';
  userType: 'helper' | 'needer';
  gender: 'male' | 'female' | 'other';
  userId: string;
  username: string;
  onLogout: () => void;
  onProfileUpdate: (userType: 'helper' | 'needer', mode: 'ai' | 'human') => void;
  posts: Post[];
  comments: Comment[];
  onCreatePost: (content: string, author: string, userType: 'helper' | 'needer') => void;
  onHeartPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, content: string, author: string) => void;
  getCommentsForPost: (postId: string) => Comment[];
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  replies: number;
  hearts: number;
  tags: string[];
  anonymous: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'other' | 'ai';
  content: string;
  timestamp: string;
}

interface ActiveUser {
  id: string;
  username: string;
  userType: 'helper' | 'needer';
  gender: 'male' | 'female' | 'other';
  status: 'online' | 'away' | 'busy';
  specialties: string[];
  lastActive: string;
  isAvailable: boolean;
}

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timestamp: string;
}

export function MainApp({ 
  mode, 
  userType, 
  gender, 
  userId, 
  username, 
  onLogout, 
  onProfileUpdate,
  posts,
  comments,
  onCreatePost,
  onHeartPost,
  onDeletePost,
  onAddComment,
  getCommentsForPost
}: MainAppProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'matches' | 'browse'>('feed');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newPost, setNewPost] = useState('');
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [newComment, setNewComment] = useState<{[key: string]: string}>({});
  const [userFilter, setUserFilter] = useState<'all' | 'helpers' | 'needers'>('all');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [tempUserType, setTempUserType] = useState<'helper' | 'needer'>(userType);
  const [tempMode, setTempMode] = useState<'ai' | 'human'>(mode);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Check if current user is admin (in a real app, this would come from authentication)
  const isAdmin = username === 'admin' || username === 'Admin' || username.toLowerCase().includes('admin');

  // Dynamic chat messages state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: mode === 'ai' ? 'ai' : 'other',
      content: mode === 'ai' 
        ? "Hello! I'm here to listen and support you. How are you feeling today?"
        : "Hi there! I saw your post and wanted to reach out. I've been through something similar.",
      timestamp: '10:30 AM'
    },
    {
      id: '2',
      sender: 'user',
      content: "Thanks for reaching out. I've been struggling with anxiety lately.",
      timestamp: '10:32 AM'
    },
    {
      id: '3',
      sender: mode === 'ai' ? 'ai' : 'other',
      content: mode === 'ai' 
        ? "I understand that anxiety can be really challenging. Would you like to talk about what's been triggering these feelings?"
        : "I completely understand. Anxiety can feel so overwhelming. What's been helping me is...",
      timestamp: '10:35 AM'
    }
  ]);

  // Active users data (simulated online users)
  const [activeUsers] = useState<ActiveUser[]>([
    {
      id: '1',
      username: 'CompassionateHeart',
      userType: 'helper',
      gender: gender, // Same gender matching
      status: 'online',
      specialties: ['anxiety', 'depression', 'grief'],
      lastActive: 'now',
      isAvailable: true
    },
    {
      id: '2', 
      username: 'GentleListener',
      userType: 'helper',
      gender: gender,
      status: 'online',
      specialties: ['anxiety', 'selfcare', 'meditation'],
      lastActive: 'now',
      isAvailable: true
    },
    {
      id: '3',
      username: 'HopefulJourney',
      userType: 'needer',
      gender: gender,
      status: 'online',
      specialties: ['support', 'sharing'],
      lastActive: 'now',
      isAvailable: true
    },
    {
      id: '4',
      username: 'WarmSupport',
      userType: 'helper',
      gender: gender,
      status: 'away',
      specialties: ['depression', 'positivity', 'encouragement'],
      lastActive: '5 min ago',
      isAvailable: true
    },
    {
      id: '5',
      username: 'BraveSpirit',
      userType: 'needer',
      gender: gender,
      status: 'online',
      specialties: ['anxiety', 'support'],
      lastActive: 'now',
      isAvailable: true
    },
    {
      id: '6',
      username: 'KindSoul',
      userType: 'helper',
      gender: gender,
      status: 'busy',
      specialties: ['meditation', 'mindfulness', 'selfcare'],
      lastActive: '2 min ago',
      isAvailable: false
    }
  ]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Add user message
      setChatMessages(prev => [...prev, userMessage]);
      const messageContent = newMessage.trim();
      setNewMessage('');

      // Generate response after a short delay
      setTimeout(() => {
        const responseMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: mode === 'ai' ? 'ai' : 'other',
          content: generateResponse(messageContent, mode),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, responseMessage]);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
  };

  // Generate contextual responses
  const generateResponse = (userMessage: string, chatMode: 'ai' | 'human'): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (chatMode === 'ai') {
      // AI responses based on keywords
      if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious')) {
        const responses = [
          "I understand that anxiety can feel overwhelming. Would you like to try a brief breathing exercise together?",
          "Anxiety is very common and treatable. What situations tend to trigger these feelings for you?",
          "Let's work through this anxiety together. Can you tell me what thoughts are going through your mind right now?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else if (lowerMessage.includes('depression') || lowerMessage.includes('depressed') || lowerMessage.includes('sad')) {
        const responses = [
          "I hear that you're going through a difficult time. Depression can make everything feel harder, but you're not alone.",
          "Thank you for sharing that with me. Depression affects many people, and seeking support is a brave step.",
          "It takes courage to talk about depression. What has been the most challenging part for you lately?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        const responses = [
          "I'm here to support you through this. What kind of help would be most useful for you right now?",
          "Asking for help shows strength, not weakness. Let's explore what support options might work best for you.",
          "You've taken an important step by reaching out. What would feeling supported look like to you?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else {
        const responses = [
          "Thank you for sharing that with me. Can you tell me more about how you're feeling?",
          "I appreciate you opening up. What would be most helpful for you to discuss right now?",
          "It sounds like you have a lot on your mind. Would you like to explore any particular aspect further?",
          "I'm listening. What thoughts or feelings are coming up for you as we talk?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    } else {
      // Human helper responses
      if (lowerMessage.includes('anxiety') || lowerMessage.includes('anxious')) {
        const responses = [
          "I've struggled with anxiety too, and I want you to know it does get better. What helps me is focusing on small, manageable steps.",
          "Anxiety can be so isolating, but you're not alone in this. I've found that talking about it really helps.",
          "I understand that feeling. When my anxiety peaks, I try to remember that feelings pass, even the intense ones."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else if (lowerMessage.includes('depression') || lowerMessage.includes('depressed') || lowerMessage.includes('sad')) {
        const responses = [
          "I've been through similar struggles, and I want you to know that there is hope, even when it doesn't feel like it.",
          "Depression can make everything feel impossible, but please know that you matter and your feelings are valid.",
          "I hear you, and I'm glad you reached out. Some days are harder than others, but you don't have to face this alone."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      } else {
        const responses = [
          "Thank you for trusting me with this. I'm here to listen and support you however I can.",
          "I appreciate you sharing your experience with me. What you're going through sounds really challenging.",
          "It takes courage to open up about these things. I'm honored that you feel comfortable sharing with me.",
          "I hear you, and what you're experiencing sounds really difficult. You're not alone in feeling this way."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }
  };

  const createPost = () => {
    if (newPost.trim()) {
      onCreatePost(newPost.trim(), username, userType);
      setNewPost('');
    }
  };

  // Handle comment toggling
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Handle adding comments
  const addComment = (postId: string) => {
    const commentText = newComment[postId];
    if (commentText?.trim()) {
      onAddComment(postId, commentText.trim(), username);
      
      // Clear the comment input
      setNewComment(prev => ({
        ...prev,
        [postId]: ''
      }));
    }
  };

  // Handle deleting posts (only for user's own posts)
  const deletePost = (postId: string) => {
    onDeletePost(postId);
    // Also clear any related comment state
    setShowComments(prev => {
      const newComments = { ...prev };
      delete newComments[postId];
      return newComments;
    });
    setNewComment(prev => {
      const newComments = { ...prev };
      delete newComments[postId];
      return newComments;
    });
  };

  // Filter active users based on current filter and matching criteria
  const getFilteredUsers = (): ActiveUser[] => {
    let filtered = activeUsers.filter(user => {
      // Don't show the current user
      if (user.username === username) return false;
      
      // Gender-based matching (same gender only)
      if (user.gender !== gender) return false;
      
      return true;
    });

    // Apply user type filter
    if (userFilter === 'helpers') {
      filtered = filtered.filter(user => user.userType === 'helper');
    } else if (userFilter === 'needers') {
      filtered = filtered.filter(user => user.userType === 'needer');
    }

    return filtered;
  };

  // Handle connecting with a user
  const connectWithUser = (user: ActiveUser) => {
    // In a real app, this would initiate a connection
    console.log(`Connecting with ${user.username}`);
    // For now, switch to chat tab to simulate starting a conversation
    setActiveTab('chat');
  };

  // Get status color for online indicators
  const getStatusColor = (status: 'online' | 'away' | 'busy'): string => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'busy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Handle profile save
  const handleProfileSave = () => {
    onProfileUpdate(tempUserType, tempMode);
    setShowProfileDialog(false);
  };

  // Handle profile dialog open
  const handleProfileOpen = () => {
    setTempUserType(userType);
    setTempMode(mode);
    setShowProfileDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChibiAvatar size="md" mood="happy" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Depresso Assist
              </h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100">
                {mode === 'ai' ? 'AI Support' : 'Human Connection'} • {userType === 'helper' ? 'Helper' : 'Seeking Support'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleProfileOpen}>
                    <User className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Profile Settings
                    </DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                      Update your user type and support preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-base">I want to be a:</Label>
                      <RadioGroup 
                        value={tempUserType} 
                        onValueChange={(value: 'helper' | 'needer') => {
                          setTempUserType(value);
                          if (value === 'helper') {
                            setTempMode('human'); // Helpers default to human mode
                          }
                        }}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-purple-50/50 transition-colors">
                          <RadioGroupItem value="helper" id="helper" />
                          <div className="flex-1">
                            <Label htmlFor="helper" className="cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-purple-600" />
                                <span>Helper</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Support others who need help</p>
                            </Label>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-blue-50/50 transition-colors">
                          <RadioGroupItem value="needer" id="needer" />
                          <div className="flex-1">
                            <Label htmlFor="needer" className="cursor-pointer">
                              <div className="flex items-center space-x-2">
                                <Heart className="h-4 w-4 text-blue-600" />
                                <span>Seeking Support</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">Get help and support for yourself</p>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Mode Selection - Only show for needers */}
                    {tempUserType === 'needer' && (
                      <div className="space-y-3 pt-4 border-t">
                        <Label className="text-base">How would you like to receive support?</Label>
                        <RadioGroup 
                          value={tempMode} 
                          onValueChange={(value: 'ai' | 'human') => setTempMode(value)}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50/50 transition-colors">
                            <RadioGroupItem value="ai" id="ai-mode" />
                            <div className="flex-1">
                              <Label htmlFor="ai-mode" className="cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <Bot className="h-4 w-4 text-green-600" />
                                  <span>AI Assistant</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Get instant support from our AI companion</p>
                              </Label>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-indigo-50/50 transition-colors">
                            <RadioGroupItem value="human" id="human-mode" />
                            <div className="flex-1">
                              <Label htmlFor="human-mode" className="cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <Users className="h-4 w-4 text-indigo-600" />
                                  <span>Human Connection</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Connect with real people who understand</p>
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Current Status Display */}
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Current Profile:</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Type:</span>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {userType === 'helper' ? 'Helper' : 'Seeking Support'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Mode:</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {mode === 'ai' ? 'AI Support' : 'Human Connection'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowProfileDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleProfileSave}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
                        disabled={tempUserType === userType && tempMode === mode}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAdminPanel(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Admin Panel"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-1 mt-4">
            <Button
              variant={activeTab === 'feed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('feed')}
              className={activeTab === 'feed' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
            >
              Community Feed
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"  
              onClick={() => mode === 'ai' ? window.location.href = 'http://localhost:3000' : setActiveTab('chat')}
              className={activeTab === 'chat' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
            >
              {mode === 'ai' ? 'AI Chat' : 'Messages'}
            </Button>
            <Button
              variant={activeTab === 'browse' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('browse')}
              className={activeTab === 'browse' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
            >
              <Users className="h-4 w-4 mr-1" />
              Active People
            </Button>
            {mode === 'human' && (
              <Button
                variant={activeTab === 'matches' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('matches')}
                className={activeTab === 'matches' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
              >
                Connections
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Create Post */}
            <Card className="p-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500">
                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                      {username ? username.charAt(0).toUpperCase() : <ChibiAvatar size="sm" mood="happy" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3>Share anonymously as {username}</h3>
                    <p className="text-sm text-gray-500">Your identity is always protected</p>
                  </div>
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={userType === 'helper' 
                    ? "Share some encouragement or advice..." 
                    : "Share what's on your mind..."}
                  className="w-full p-3 border rounded-lg resize-none h-20 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">anonymous</Badge>
                    <Badge variant="outline" className="text-xs">safe space</Badge>
                  </div>
                  <Button 
                    onClick={createPost}
                    disabled={!newPost.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Posts */}
            {posts.map((post) => (
              <Card key={post.id} className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-green-400 to-teal-500">
                        <AvatarFallback className="bg-gradient-to-br from-green-400 to-teal-500 text-white">
                          {post.author.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{post.author}</h3>
                        <p className="text-sm text-gray-500">{post.timestamp}</p>
                      </div>
                    </div>
                    
                    {/* Delete button - only show for user's own posts */}
                    {post.author === username && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-500 transition-colors opacity-70 hover:opacity-100"
                        onClick={() => deletePost(post.id)}
                        title="Delete post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        #{tag}  
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-6 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      onClick={() => onHeartPost(post.id)}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {post.hearts}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.replies}
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Display Real Comments */}
                      {getCommentsForPost(post.id).length > 0 && (
                        <div className="space-y-3">
                          {getCommentsForPost(post.id).map((comment) => (
                            <div key={comment.id} className="flex space-x-3">
                              <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-400 to-rose-500">
                                <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-sm">
                                  {comment.author.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-sm font-medium text-purple-700">{comment.author}</p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {comment.content}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Show message if no comments yet */}
                      {getCommentsForPost(post.id).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-400 to-blue-500">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-sm">
                            {username ? username.charAt(0).toUpperCase() : 'Y'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({
                              ...prev,
                              [post.id]: e.target.value
                            }))}
                            placeholder="Share your support or thoughts..."
                            className="w-full p-2 text-sm border rounded-lg resize-none h-16 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <div className="flex justify-end">
                            <Button 
                              size="sm"
                              onClick={() => addComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <Card className="h-[calc(100vh-200px)] flex flex-col shadow-lg bg-white/90 backdrop-blur-sm">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
                    {mode === 'ai' ? (
                      <ChibiAvatar size="sm" mood="thinking" />
                    ) : (
                      <Users className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {mode === 'ai' ? 'AI Support Assistant' : 'Anonymous Helper'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {mode === 'ai' ? 'Available 24/7 for support' : 'Here to listen and help'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[70%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm">
                        {message.sender === 'user' ? (
                          <div className="bg-gradient-to-br from-purple-400 to-blue-500 h-full w-full rounded-full flex items-center justify-center">
                            {username.charAt(0).toUpperCase()}
                          </div>
                        ) : message.sender === 'ai' ? (
                          <div className="bg-gradient-to-br from-green-400 to-teal-500 h-full w-full rounded-full flex items-center justify-center">
                            <ChibiAvatar size="sm" mood="happy" />
                          </div>
                        ) : (
                          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 h-full w-full rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'browse' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Filter Tabs */}
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 shadow-sm">
                <Button
                  variant={userFilter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserFilter('all')}
                  className={userFilter === 'all' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
                >
                  <Users className="h-4 w-4 mr-1" />
                  All People
                </Button>
                <Button
                  variant={userFilter === 'helpers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserFilter('helpers')}
                  className={userFilter === 'helpers' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Helpers
                </Button>
                <Button
                  variant={userFilter === 'needers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setUserFilter('needers')}
                  className={userFilter === 'needers' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Seeking Support
                </Button>
              </div>
            </div>

            {/* Active Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredUsers().map((user) => (
                <Card key={user.id} className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-indigo-400 to-purple-500">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{user.username}</h3>
                          <Circle className={`h-3 w-3 ${getStatusColor(user.status)} fill-current`} />
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="outline" className={user.userType === 'helper' ? 'border-purple-200 text-purple-700' : 'border-blue-200 text-blue-700'}>
                            {user.userType === 'helper' ? 'Helper' : 'Seeking Support'}
                          </Badge>
                          <span>•</span>
                          <span className="capitalize">{user.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        {user.userType === 'helper' ? 'Specializes in:' : 'Looking for help with:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {user.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs bg-indigo-100 text-indigo-700">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Last Active */}
                    <p className="text-xs text-gray-500">
                      Last active: {user.lastActive}
                    </p>

                    {/* Connect Button */}
                    <Button 
                      onClick={() => connectWithUser(user)}
                      disabled={!user.isAvailable}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
                    >
                      {user.isAvailable ? (
                        <>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      ) : (
                        'Busy'
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {getFilteredUsers().length === 0 && (
              <div className="text-center py-12">
                <ChibiAvatar size="lg" mood="sad" />
                <h3 className="mt-4 font-medium text-gray-700">No users found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filter or check back later</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'matches' && mode === 'human' && (
          <div className="max-w-4xl mx-auto text-center py-12">
            <ChibiAvatar size="lg" mood="thinking" />
            <h2 className="mt-6 text-2xl font-medium text-gray-700">Your Connections</h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">
              When you connect with helpers or other members, they'll appear here. Start by browsing active people!
            </p>
            <Button 
              onClick={() => setActiveTab('browse')}
              className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Browse People
            </Button>
          </div>
        )}
      </div>
      
      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  );
}