import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Health check
app.get('/make-server-8532b137/health', async (c) => {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'running'
    };
    
    // Quick database connectivity check
    try {
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      health.database = error ? 'error' : 'connected';
      if (error && error.message.includes('does not exist')) {
        health.database = 'migration_required';
      }
    } catch (dbError) {
      health.database = 'unreachable';
    }
    
    return c.json(health);
  } catch (error) {
    return c.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: error.toString()
    }, 500);
  }
});

// Check database tables existence
app.get('/make-server-8532b137/check-database', async (c) => {
  try {
    // Try to query profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    // Try to query other tables
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    const tablesStatus = {
      profiles: !profilesError,
      posts: !postsError,
      migrationComplete: !profilesError && !postsError
    };
    
    if (profilesError) {
      console.log(`Profiles table error: ${profilesError.message}`);
    }
    if (postsError) {
      console.log(`Posts table error: ${postsError.message}`);
    }
    
    return c.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: tablesStatus
    });
  } catch (error) {
    console.log(`Database check error: ${error}`);
    return c.json({ 
      status: 'error',
      error: error.toString(),
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// User signup
app.post('/make-server-8532b137/signup', async (c) => {
  try {
    const { email, password, username, userType, gender, mode } = await c.req.json();
    
    console.log(`Signup attempt for: ${email}, username: ${username}, type: ${userType}`);
    
    // First check if profiles table exists by attempting to query it
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('Profiles table does not exist - database migration required');
      return c.json({ 
        error: 'Database not initialized. Please run the database migration from /supabase/database-schema.sql in your Supabase SQL Editor.',
        details: 'The profiles table does not exist. Check the migration guide in /supabase/MIGRATION_GUIDE.md'
      }, 500);
    }
    
    // Check if username already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();
    
    if (checkError) {
      console.log(`Username check error: ${checkError.message}`);
      // Continue anyway if it's just a query error
    }
    
    if (existingProfile) {
      return c.json({ error: 'Username already taken. Please choose a different username.' }, 400);
    }
    
    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        username,
        user_type: userType,
        gender,
        mode
      },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (authError) {
      console.log(`Signup auth error: ${authError.message}`);
      
      // Provide more user-friendly error messages
      if (authError.message.includes('already registered')) {
        return c.json({ error: 'An account with this email already exists. Please use a different email or try logging in.' }, 400);
      } else if (authError.message.includes('password')) {
        return c.json({ error: 'Password must be at least 6 characters long.' }, 400);
      } else if (authError.message.includes('email')) {
        return c.json({ error: 'Please enter a valid email address.' }, 400);
      }
      
      return c.json({ error: authError.message }, 400);
    }

    const userId = authData.user.id;
    console.log(`Auth user created successfully: ${userId}`);
    
    // Manually create the profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username,
        user_type: userType,
        gender,
        mode,
        interests: [],
        is_online: true,
        last_active: new Date().toISOString()
      });

    if (profileError) {
      console.log(`Profile creation error: ${profileError.message}`);
      console.log(`Profile creation error details:`, profileError);
      
      // If profile creation fails, clean up the auth user
      try {
        await supabase.auth.admin.deleteUser(userId);
        console.log(`Cleaned up auth user: ${userId}`);
      } catch (cleanupError) {
        console.log(`Failed to cleanup auth user: ${cleanupError}`);
      }
      
      if (profileError.message.includes('duplicate key')) {
        return c.json({ error: 'Username already taken. Please choose a different username.' }, 400);
      }
      
      if (profileError.message.includes('does not exist')) {
        return c.json({ 
          error: 'Database not initialized. Please run the database migration from /supabase/database-schema.sql in your Supabase SQL Editor.',
          details: profileError.message
        }, 500);
      }
      
      return c.json({ 
        error: 'Failed to create user profile. Please try again.',
        details: profileError.message
      }, 500);
    }
    
    console.log(`User signed up successfully: ${userId}, username: ${username}, type: ${userType}, mode: ${mode}, gender: ${gender}`);
    
    return c.json({ 
      success: true, 
      userId,
      username,
      userType,
      gender,
      mode,
      message: 'Account created successfully' 
    });
  } catch (error) {
    console.log(`Error during signup: ${error}`);
    console.log(`Error details:`, error);
    return c.json({ 
      error: 'Failed to create account. Please try again.',
      details: error.toString()
    }, 500);
  }
});

// User login
app.post('/make-server-8532b137/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Sign in with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.log(`Login auth error: ${authError.message}`);
      return c.json({ error: 'Invalid email or password' }, 400);
    }

    const userId = authData.user.id;
    
    // Get user profile from PostgreSQL
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError || !profile) {
      console.log(`Profile error: ${profileError?.message}`);
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Update online status
    await supabase
      .from('profiles')
      .update({ 
        is_online: true, 
        last_active: new Date().toISOString() 
      })
      .eq('id', userId);

    console.log(`User logged in: ${userId}, username: ${profile.username}`);
    
    return c.json({ 
      success: true, 
      userId,
      username: profile.username,
      userType: profile.user_type,
      gender: profile.gender,
      mode: profile.mode,
      message: 'Logged in successfully' 
    });
  } catch (error) {
    console.log(`Error during login: ${error}`);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get user matches (for human mode)
app.get('/make-server-8532b137/matches/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get current user profile
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError || !userProfile) {
      return c.json({ error: 'User not found' }, 404);
    }

    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', userId)
      .eq('mode', 'human')
      .eq('is_online', true)
      .neq('user_type', userProfile.user_type);

    // Gender-based matching for needers
    if (userProfile.user_type === 'needer') {
      query = query
        .eq('user_type', 'helper')
        .eq('gender', userProfile.gender);
    } else {
      // Helpers can help anyone
      query = query.eq('user_type', 'needer');
    }

    const { data: matches, error: matchError } = await query
      .order('last_active', { ascending: false })
      .limit(20);

    if (matchError) {
      console.log(`Error getting matches: ${matchError.message}`);
      return c.json({ error: 'Failed to get matches' }, 500);
    }

    // Transform data to match frontend expectations
    const transformedMatches = matches.map(match => ({
      id: match.id,
      userType: match.user_type,
      mode: match.mode,
      gender: match.gender,
      interests: match.interests || [],
      isOnline: match.is_online,
      lastActive: match.last_active
    }));

    console.log(`Found ${transformedMatches.length} gender-filtered matches for user ${userId} (${userProfile.user_type}, ${userProfile.gender})`);
    
    return c.json({ matches: transformedMatches });
  } catch (error) {
    console.log(`Error getting matches for user: ${error}`);
    return c.json({ error: 'Failed to get matches' }, 500);
  }
});

// Create a conversation
app.post('/make-server-8532b137/conversations', async (c) => {
  try {
    const { user1Id, user2Id, type } = await c.req.json();
    
    const conversationData = {
      type,
      participant_1: user1Id,
      participant_2: type === 'ai' ? null : user2Id,
      is_active: true
    };
    
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();

    if (convError) {
      console.log(`Error creating conversation: ${convError.message}`);
      return c.json({ error: 'Failed to create conversation' }, 500);
    }

    console.log(`Created conversation: ${conversation.id}, type: ${type}`);
    
    // Transform data to match frontend expectations
    const transformedConversation = {
      id: conversation.id,
      participants: type === 'ai' ? [user1Id] : [user1Id, user2Id],
      type: conversation.type,
      createdAt: conversation.created_at,
      lastActivity: conversation.last_activity,
      isActive: conversation.is_active
    };
    
    return c.json({ 
      success: true, 
      conversationId: conversation.id,
      conversation: transformedConversation
    });
  } catch (error) {
    console.log(`Error creating conversation: ${error}`);
    return c.json({ error: 'Failed to create conversation' }, 500);
  }
});

// Send a message
app.post('/make-server-8532b137/messages', async (c) => {
  try {
    const { conversationId, senderId, content, senderType } = await c.req.json();
    
    const messageData = {
      conversation_id: conversationId,
      sender_id: senderType === 'ai' ? null : senderId,
      sender_type: senderType,
      content
    };
    
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (msgError) {
      console.log(`Error creating message: ${msgError.message}`);
      return c.json({ error: 'Failed to send message' }, 500);
    }

    console.log(`Message sent in conversation ${conversationId} by ${senderId}`);
    
    // If this is an AI conversation, generate AI response
    if (senderType === 'user') {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('type')
        .eq('id', conversationId)
        .single();
        
      if (conversation?.type === 'ai') {
        setTimeout(async () => {
          const aiResponse = generateAIResponse(content);
          
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: null,
              sender_type: 'ai',
              content: aiResponse
            });
          
          console.log(`AI response generated for conversation ${conversationId}`);
        }, 1000);
      }
    }
    
    // Transform data to match frontend expectations
    const transformedMessage = {
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id || 'ai_assistant',
      senderType: message.sender_type,
      content: message.content,
      timestamp: message.created_at
    };
    
    return c.json({ 
      success: true, 
      message: transformedMessage
    });
  } catch (error) {
    console.log(`Error sending message: ${error}`);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get messages for a conversation
app.get('/make-server-8532b137/conversations/:conversationId/messages', async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.log(`Error getting messages: ${msgError.message}`);
      return c.json({ error: 'Failed to get messages' }, 500);
    }
    
    // Transform data to match frontend expectations
    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id || 'ai_assistant',
      senderType: msg.sender_type,
      content: msg.content,
      timestamp: msg.created_at
    }));
    
    return c.json({ messages: transformedMessages });
  } catch (error) {
    console.log(`Error getting messages: ${error}`);
    return c.json({ error: 'Failed to get messages' }, 500);
  }
});

// Get user's conversations
app.get('/make-server-8532b137/users/:userId/conversations', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_activity', { ascending: false });

    if (convError) {
      console.log(`Error getting conversations: ${convError.message}`);
      return c.json({ error: 'Failed to get conversations' }, 500);
    }
    
    // Transform data to match frontend expectations
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      participants: conv.participant_2 ? [conv.participant_1, conv.participant_2] : [conv.participant_1],
      type: conv.type,
      createdAt: conv.created_at,
      lastActivity: conv.last_activity,
      isActive: conv.is_active
    }));
    
    return c.json({ conversations: transformedConversations });
  } catch (error) {
    console.log(`Error getting user conversations: ${error}`);
    return c.json({ error: 'Failed to get conversations' }, 500);
  }
});

// Create a post
app.post('/make-server-8532b137/posts', async (c) => {
  try {
    const { authorId, content, tags } = await c.req.json();
    
    const postData = {
      author_id: authorId,
      content,
      tags: tags || []
    };
    
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert(postData)
      .select(`
        *,
        profiles!author_id (username)
      `)
      .single();

    if (postError) {
      console.log(`Error creating post: ${postError.message}`);
      return c.json({ error: 'Failed to create post' }, 500);
    }

    console.log(`Post created: ${post.id} by ${authorId} (${post.profiles?.username})`);
    
    // Transform data to match frontend expectations
    const transformedPost = {
      id: post.id,
      authorId: post.author_id,
      authorName: post.profiles?.username || 'Anonymous User',
      content: post.content,
      tags: post.tags,
      timestamp: post.created_at,
      hearts: post.hearts,
      replies: 0, // Will be calculated in feed
      isAnonymous: post.is_anonymous
    };
    
    return c.json({ 
      success: true, 
      post: transformedPost
    });
  } catch (error) {
    console.log(`Error creating post: ${error}`);
    return c.json({ error: 'Failed to create post' }, 500);
  }
});

// Get feed posts
app.get('/make-server-8532b137/feed', async (c) => {
  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts_with_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) {
      console.log(`Error getting feed: ${postsError.message}`);
      return c.json({ error: 'Failed to get feed' }, 500);
    }
    
    // Transform data to match frontend expectations
    const transformedPosts = posts.map(post => ({
      id: post.id,
      authorId: post.author_id,
      authorName: post.author_name || 'Anonymous User',
      content: post.content,
      tags: post.tags || [],
      timestamp: post.created_at,
      hearts: post.hearts,
      replies: post.replies_count || 0,
      isAnonymous: post.is_anonymous
    }));
    
    return c.json({ posts: transformedPosts });
  } catch (error) {
    console.log(`Error getting feed: ${error}`);
    return c.json({ error: 'Failed to get feed' }, 500);
  }
});

// Create a comment
app.post('/make-server-8532b137/comments', async (c) => {
  try {
    const { postId, authorId, content } = await c.req.json();
    
    const commentData = {
      post_id: postId,
      author_id: authorId,
      content
    };
    
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        profiles!author_id (username)
      `)
      .single();

    if (commentError) {
      console.log(`Error creating comment: ${commentError.message}`);
      return c.json({ error: 'Failed to create comment' }, 500);
    }

    console.log(`Comment created: ${comment.id} on post ${postId} by ${authorId}`);
    
    // Transform data to match frontend expectations
    const transformedComment = {
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      authorName: comment.profiles?.username || 'Anonymous User',
      content: comment.content,
      timestamp: comment.created_at,
      hearts: comment.hearts
    };
    
    return c.json({ 
      success: true, 
      comment: transformedComment
    });
  } catch (error) {
    console.log(`Error creating comment: ${error}`);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// Get comments for a post
app.get('/make-server-8532b137/posts/:postId/comments', async (c) => {
  try {
    const postId = c.req.param('postId');
    
    const { data: comments, error: commentsError } = await supabase
      .from('comments_with_authors')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.log(`Error getting comments: ${commentsError.message}`);
      return c.json({ error: 'Failed to get comments' }, 500);
    }
    
    // Transform data to match frontend expectations
    const transformedComments = comments.map(comment => ({
      id: comment.id,
      postId: comment.post_id,
      authorId: comment.author_id,
      authorName: comment.author_name || 'Anonymous User',
      content: comment.content,
      timestamp: comment.created_at,
      hearts: comment.hearts
    }));
    
    return c.json({ comments: transformedComments });
  } catch (error) {
    console.log(`Error getting comments: ${error}`);
    return c.json({ error: 'Failed to get comments' }, 500);
  }
});

// Helper function to generate AI responses
function generateAIResponse(userMessage: string): string {
  const responses = [
    "I hear you, and I want you to know that what you're feeling is valid. Can you tell me more about what's been on your mind?",
    "Thank you for sharing that with me. It takes courage to open up. How long have you been experiencing these feelings?",
    "I understand this must be difficult for you. Have you tried any coping strategies that have helped in the past?",
    "Your feelings are important, and I'm here to listen. What would be most helpful for you right now?",
    "That sounds really challenging. Remember that it's okay to take things one day at a time. What's one small thing that might help you feel a bit better today?",
    "I appreciate you trusting me with this. You're not alone in feeling this way. What kind of support would feel most meaningful to you?",
    "It's completely understandable to feel overwhelmed sometimes. Have you been able to talk to anyone else about this?",
    "Your strength in reaching out shows a lot about your character. What are some things that usually bring you comfort?"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Update user online status
app.post('/make-server-8532b137/users/:userId/status', async (c) => {
  try {
    const userId = c.req.param('userId');
    const { isOnline } = await c.req.json();
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_online: isOnline, 
        last_active: new Date().toISOString() 
      })
      .eq('id', userId);
      
    if (error) {
      console.log(`Error updating user status: ${error.message}`);
      return c.json({ error: 'Failed to update status' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating user status: ${error}`);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

Deno.serve(app.fetch);