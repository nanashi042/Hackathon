import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar } from "./ui/avatar";
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
  Loader2,
  User,
  Shield,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MainAppWithBackendProps {
  mode: 'ai' | 'human';
  userType: 'helper' | 'needer';
  gender: 'male' | 'female' | 'other';
  userId: string;
  username: string;
  onLogout: () => void;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  replies: number;
  hearts: number;
  tags: string[];
  isAnonymous: boolean;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  hearts: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participants: string[];
  type: 'ai' | 'human';
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

interface UserProfile {
  id: string;
  userType: 'helper' | 'needer';
  mode: 'ai' | 'human';
  gender: 'male' | 'female' | 'other';
  interests: string[];
  isOnline: boolean;
  lastActive: string;
}

export function MainAppWithBackend({ mode, userType, gender, userId, username, onLogout }: MainAppWithBackendProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'matches'>('feed');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State - userId is now passed as prop
  const [posts, setPosts] = useState<Post[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [comments, setComments] = useState<{[postId: string]: Comment[]}>({});
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{[postId: string]: string}>({});

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-8532b137`;

  // Load data when component mounts
  useEffect(() => {
    loadFeed();
    loadConversations();
    if (mode === 'human') {
      loadMatches();
    }
  }, []);

  // Poll for new messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id);
      }, 3000); // Poll every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  // User is already authenticated via login/signup

  const loadFeed = async () => {
    try {
      const response = await fetch(`${serverUrl}/feed`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
    }
  };

  const loadConversations = async () => {
    
    try {
      const response = await fetch(`${serverUrl}/users/${userId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${serverUrl}/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadMatches = async () => {
    
    try {
      const response = await fetch(`${serverUrl}/matches/${userId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          authorId: userId,
          content: newPost,
          tags: []
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewPost('');
        loadFeed(); // Refresh feed
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    try {
      const response = await fetch(`${serverUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: userId,
          content: newMessage,
          senderType: 'user'
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        // Messages will be updated by the polling effect
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startConversation = async (targetUserId?: string) => {
    
    try {
      const response = await fetch(`${serverUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          user1Id: userId,
          user2Id: targetUserId,
          type: mode
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedConversation(data.conversation);
        setActiveTab('chat');
        loadConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const response = await fetch(`${serverUrl}/posts/${postId}/comments`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const data = await response.json();
      if (data.comments) {
        setComments(prev => ({ ...prev, [postId]: data.comments }));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const createComment = async (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          postId,
          authorId: userId,
          content: commentText
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
        loadComments(postId); // Refresh comments
        loadFeed(); // Refresh feed to update reply count
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (expandedPosts.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
    setExpandedPosts(newExpanded);
  };

  const handleCommentClick = async (commentAuthorId: string) => {
    if (commentAuthorId === userId) return; // Can't chat with yourself
    
    try {
      // Start conversation with comment author
      await startConversation(commentAuthorId);
    } catch (error) {
      console.error('Error starting conversation with comment author:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Depresso Assist
              </h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-blue-100">
                {mode === 'ai' ? 'AI Support' : 'Human Connection'} • {userType === 'helper' ? 'Helper' : 'Seeking Support'}
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-2 rounded-full">
                <Avatar className="h-6 w-6 bg-gradient-to-br from-purple-500 to-blue-500" />
                <span className="text-sm font-medium text-gray-700">Welcome, {username}</span>
              </div>
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
              onClick={() => setActiveTab('chat')}
              className={activeTab === 'chat' ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-md' : ''}
            >
              {mode === 'ai' ? 'AI Chat' : 'Messages'}
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
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-400 to-blue-500" />
                  <div>
                    <h3>Share anonymously</h3>
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
                    disabled={!newPost.trim() || loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-md"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            {/* Posts */}
            {posts.map((post) => (
              <Card key={post.id} className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-green-400 to-teal-500" />
                    <div>
                      <h3 className="font-medium">{post.authorName}</h3>
                      <p className="text-sm text-gray-500">{formatTimestamp(post.timestamp)}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          #{tag}  
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.hearts}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-blue-500"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.replies}
                      {expandedPosts.has(post.id) ? (
                        <ChevronUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Comments Section */}
                  {expandedPosts.has(post.id) && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      {/* Add Comment */}
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-400 to-blue-500" />
                        <div className="flex-1">
                          <textarea
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            placeholder="Write a supportive comment..."
                            className="w-full p-2 text-sm border rounded-lg resize-none h-16 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          <div className="flex justify-end mt-2">
                            <Button 
                              onClick={() => createComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                              size="sm"
                              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                            >
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments List */}
                      <div className="space-y-3">
                        {comments[post.id]?.map((comment) => (
                          <div 
                            key={comment.id} 
                            className={`flex items-start space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors ${
                              comment.authorId !== userId ? 'cursor-pointer' : ''
                            }`}
                            onClick={() => comment.authorId !== userId && handleCommentClick(comment.authorId)}
                          >
                            <Avatar className="h-8 w-8 bg-gradient-to-br from-green-400 to-teal-500" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900">{comment.authorName}</p>
                                <p className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                                {comment.authorId !== userId && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                    Click to chat
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                              <div className="flex items-center space-x-3 mt-2">
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-6 px-2">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {comment.hearts}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {(!comments[post.id] || comments[post.id].length === 0) && (
                          <p className="text-center text-gray-500 text-sm py-4">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {posts.length === 0 && (
              <Card className="p-8 text-center shadow-lg bg-white/90 backdrop-blur-sm">
                <p className="text-gray-500">No posts yet. Be the first to share something!</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Conversation List */}
              <Card className="lg:col-span-1 shadow-xl bg-white/90 backdrop-blur-sm">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Conversations</h3>
                    {mode === 'ai' && (
                      <Button 
                        size="sm"
                        onClick={() => startConversation()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md"
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        AI Chat
                      </Button>
                    )}
                  </div>
                </div>
                <div className="p-2 space-y-2 overflow-y-auto h-[500px]">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-gradient-to-r from-purple-100 to-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {conversation.type === 'ai' ? (
                          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <Avatar className="h-8 w-8 bg-gradient-to-br from-pink-400 to-rose-500" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conversation.type === 'ai' ? 'AI Assistant' : 'Anonymous Helper'}
                          </p>
                          <p className="text-xs text-gray-500">{formatTimestamp(conversation.lastActivity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {conversations.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No conversations yet</p>
                      {mode === 'ai' && (
                        <Button 
                          size="sm" 
                          onClick={() => startConversation()}
                          className="mt-2 bg-gradient-to-r from-indigo-500 to-purple-600"
                        >
                          Start AI Chat
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Chat Messages */}
              <Card className="lg:col-span-2 shadow-xl bg-white/90 backdrop-blur-sm flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                      <div className="flex items-center space-x-3">
                        {selectedConversation.type === 'ai' ? (
                          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-pink-400 to-rose-500" />
                        )}
                        <div>
                          <h3 className="font-medium">
                            {selectedConversation.type === 'ai' ? 'AI Support Assistant' : 'Anonymous Helper'}
                          </h3>
                          <p className="text-sm text-gray-500">Online now</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                              message.senderId === userId
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                                : message.senderType === 'ai'
                                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-gray-800'
                                : 'bg-gradient-to-r from-green-100 to-teal-100 text-gray-800'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === userId ? 'text-purple-100' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t">
                      <div className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          className="flex-1 focus:ring-2 focus:ring-purple-500"
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
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Select a conversation to start chatting</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'matches' && mode === 'human' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl mb-2">Available {userType === 'needer' ? 'Helpers' : 'People Seeking Support'}</h2>
              <p className="text-gray-600">
                {userType === 'needer' 
                  ? `Connecting you with ${gender} helpers who understand your experience`
                  : 'People who could benefit from your support and experience'
                }
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matches.map((match) => {
                const getGenderColor = (matchGender: string) => {
                  switch(matchGender) {
                    case 'female': return 'from-pink-400 to-rose-500';
                    case 'male': return 'from-blue-400 to-indigo-500';
                    default: return 'from-purple-400 to-violet-500';
                  }
                };

                const getGenderIcon = (matchGender: string) => {
                  switch(matchGender) {
                    case 'female': return '♀';
                    case 'male': return '♂';
                    default: return '⚧';
                  }
                };

                return (
                  <Card key={match.id} className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-2 hover:border-purple-200">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <Avatar className={`h-20 w-20 mx-auto bg-gradient-to-br ${getGenderColor(match.gender)}`} />
                        <div className={`absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br ${getGenderColor(match.gender)} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                          {getGenderIcon(match.gender)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-lg">Anonymous {match.userType === 'helper' ? 'Helper' : 'Seeker'}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`bg-gradient-to-r ${getGenderColor(match.gender)} text-white border-0`}
                        >
                          {match.gender.charAt(0).toUpperCase() + match.gender.slice(1)}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          {match.isOnline ? (
                            <span className="flex items-center justify-center gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              Online now
                            </span>
                          ) : `Last seen ${formatTimestamp(match.lastActive)}`}
                        </p>
                      </div>

                      {match.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {match.interests.slice(0, 3).map((interest) => (
                            <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>
                          ))}
                          {match.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{match.interests.length - 3}</Badge>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => startConversation(match.id)}
                        size="sm" 
                        className={`w-full bg-gradient-to-r ${getGenderColor(match.gender)} hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-300 text-white border-0`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Connect Safely
                      </Button>

                      <div className="text-xs text-gray-400 mt-2">
                        <Shield className="h-3 w-3 inline mr-1" />
                        100% Anonymous
                      </div>
                    </div>
                  </Card>
                );
              })}

              {matches.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="max-w-md mx-auto">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg mb-2 text-gray-600">No {userType === 'needer' ? 'helpers' : 'seekers'} available</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {userType === 'needer' 
                        ? `No ${gender} helpers are currently online. Try the AI support option or check back later.`
                        : 'No one is currently seeking support. Check back soon to help others!'
                      }
                    </p>
                    {userType === 'needer' && (
                      <Button 
                        onClick={() => setActiveTab('chat')}
                        className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Try AI Support Instead
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}