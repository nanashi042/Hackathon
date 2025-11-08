import React, { useState, useEffect, useRef } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { MainApp } from "./components/MainApp";
import { AdminPage } from "./components/AdminPage";

type Mode = 'ai' | 'human';
type UserType = 'helper' | 'needer';
type Gender = 'male' | 'female' | 'other';

interface UserData {
  userId: string;
  username: string;
  userType: UserType;
  gender: Gender;
  mode: Mode;
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

interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  timestamp: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app' | 'admin'>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);
  const hasLoadedFromStorage = useRef(false);

  // Check if we're on the admin route
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setCurrentView('admin');
    }
  }, []);

  // Persistent posts state
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Anonymous Butterfly',
      content: 'Having a really tough day today. Feeling overwhelmed with everything going on. Anyone else feeling this way?',
      timestamp: '2h ago',
      replies: 12,
      hearts: 8,
      tags: ['anxiety', 'support'],
      anonymous: true
    },
    {
      id: '2', 
      author: 'Helpful Soul',
      content: 'Remember that its okay to not be okay sometimes. Take things one step at a time. You got this! 💙',
      timestamp: '4h ago',
      replies: 5,
      hearts: 15,
      tags: ['encouragement', 'positivity'],
      anonymous: true
    },
    {
      id: '3',
      author: 'Anonymous Phoenix',
      content: 'Been using meditation apps lately and they actually help. Would recommend trying even 5 minutes a day.',
      timestamp: '6h ago',
      replies: 8,
      hearts: 12,
      tags: ['meditation', 'selfcare'],
      anonymous: true
    }
  ]);

  // Persistent comments state
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      postId: '1',
      author: 'Anonymous Helper',
      content: 'I understand how you\'re feeling. You\'re not alone in this journey. 💜',
      timestamp: '2h ago'
    },
    {
      id: '2', 
      postId: '1',
      author: 'SupportiveSoul',
      content: 'Thank you for sharing. Your courage to post this helps others feel less alone too.',
      timestamp: '1h ago'
    }
  ]);

  // Load user data from localStorage on component mount
  useEffect(() => {
    if (hasLoadedFromStorage.current) return;

    const savedUserData = localStorage.getItem('depressoAssist_userData');
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        setUserData(parsedUserData);
        if (window.location.pathname !== '/admin') {
          setCurrentView('app');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('depressoAssist_userData');
      }
    }

    // Load posts
    const savedPosts = localStorage.getItem('depressoAssist_posts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        setPosts(parsedPosts);
      } catch (error) {
        console.error('Error parsing saved posts:', error);
        localStorage.removeItem('depressoAssist_posts');
      }
    }

    // Load comments
    const savedComments = localStorage.getItem('depressoAssist_comments');
    if (savedComments) {
      try {
        const parsedComments = JSON.parse(savedComments);
        setComments(parsedComments);
      } catch (error) {
        console.error('Error parsing saved comments:', error);
        localStorage.removeItem('depressoAssist_comments');
      }
    }

    hasLoadedFromStorage.current = true;
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    
    if (userData) {
      localStorage.setItem('depressoAssist_userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('depressoAssist_userData');
    }
  }, [userData]);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    localStorage.setItem('depressoAssist_posts', JSON.stringify(posts));
  }, [posts]);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    localStorage.setItem('depressoAssist_comments', JSON.stringify(comments));
  }, [comments]);

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleAuthSuccess = (authUserData: UserData) => {
    setUserData(authUserData);
    setCurrentView('app');
  };

  const handleLogout = () => {
    setUserData(null);
    setCurrentView('landing');
    localStorage.removeItem('depressoAssist_userData');
  };

  const handleProfileUpdate = (newUserType: UserType, newMode: Mode) => {
    if (userData) {
      setUserData({
        ...userData,
        userType: newUserType,
        mode: newMode
      });
    }
  };

  // Post management functions
  const handleCreatePost = (content: string, author: string, userType: UserType) => {
    const extractTagsFromContent = (content: string): string[] => {
      const lowerContent = content.toLowerCase();
      const possibleTags: string[] = [];
      
      if (lowerContent.includes('anxiety') || lowerContent.includes('anxious') || lowerContent.includes('worried')) {
        possibleTags.push('anxiety');
      }
      if (lowerContent.includes('depression') || lowerContent.includes('depressed') || lowerContent.includes('sad')) {
        possibleTags.push('depression');
      }
      if (lowerContent.includes('meditation') || lowerContent.includes('mindful')) {
        possibleTags.push('meditation');
      }
      if (lowerContent.includes('help') || lowerContent.includes('support')) {
        possibleTags.push('support');
      }
      if (lowerContent.includes('better') || lowerContent.includes('positive') || lowerContent.includes('good')) {
        possibleTags.push('positivity');
      }
      if (lowerContent.includes('care') || lowerContent.includes('self')) {
        possibleTags.push('selfcare');
      }
      
      if (possibleTags.length === 0) {
        if (userType === 'helper') {
          possibleTags.push('encouragement');
        } else {
          possibleTags.push('sharing');
        }
      }
      
      return possibleTags;
    };

    const newPost: Post = {
      id: Date.now().toString(),
      author,
      content: content.trim(),
      timestamp: 'now',
      replies: 0,
      hearts: 0,
      tags: extractTagsFromContent(content),
      anonymous: true
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleHeartPost = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, hearts: post.hearts + 1 }
          : post
      )
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setComments(prevComments => prevComments.filter(comment => comment.postId !== postId));
  };

  const handleAddComment = (postId: string, content: string, author: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: postId,
      author: author,
      content: content.trim(),
      timestamp: 'now'
    };
    
    setComments(prevComments => [...prevComments, newComment]);
    
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, replies: post.replies + 1 }
          : post
      )
    );
  };

  const getCommentsForPost = (postId: string): Comment[] => {
    return comments.filter(comment => comment.postId === postId);
  };

  return (
    <div className="size-full">
      {currentView === 'landing' && (
        <LandingPage onGetStarted={handleGetStarted} />
      )}
      
      {currentView === 'auth' && (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
      
      {currentView === 'app' && userData && (
        <MainApp 
          mode={userData.mode} 
          userType={userData.userType} 
          gender={userData.gender}
          userId={userData.userId}
          username={userData.username}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
          posts={posts}
          comments={comments}
          onCreatePost={handleCreatePost}
          onHeartPost={handleHeartPost}
          onDeletePost={handleDeletePost}
          onAddComment={handleAddComment}
          getCommentsForPost={getCommentsForPost}
        />
      )}

      {currentView === 'admin' && (
        <AdminPage />
      )}
    </div>
  );
}