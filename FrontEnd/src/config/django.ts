// Local ambient to avoid requiring @types/node in the browser build
declare const process: any;
// Django Backend Configuration for depressoAssist
export const DJANGO_CONFIG = {
  // Development settings
  DEV: {
    API_BASE_URL: 'http://localhost:8000/api',
    WEBSOCKET_URL: 'ws://localhost:8000/ws',
    MEDIA_UPLOAD_URL: 'http://localhost:8000/api/upload',
  },
  
  // Production settings
  PROD: {
    API_BASE_URL: 'https://your-domain.com/api',
    WEBSOCKET_URL: 'wss://your-domain.com/ws',
    MEDIA_UPLOAD_URL: 'https://your-domain.com/api/upload',
  }
};

// API Endpoints for Django integration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
  },
  
  // Media Analysis (DeepFace)
  ANALYSIS: {
    UPLOAD_IMAGE: '/analysis/image/',
    UPLOAD_VIDEO: '/analysis/video/',
    GET_RESULTS: '/analysis/results',
    BATCH_ANALYSIS: '/analysis/batch',
  },
  
  // AI Chat (Gemma2B)
  CHAT: {
    WEBSOCKET: '/chat',
    INTENT: '/chat/intent/',
    GENERATE: '/chat/generate/',
    HISTORY: '/chat/history',
    EXPORT: '/chat/export',
    CLEAR: '/chat/clear',
  },
  
  // User Management
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    SESSIONS: '/user/sessions',
    ANALYTICS: '/user/analytics',
  }
};

// File upload configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large files
};

// WebSocket message types for Django Channels
export const WS_MESSAGE_TYPES = {
  // Client to server
  CHAT_MESSAGE: 'chat_message',
  ANALYSIS_REQUEST: 'analysis_request',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Server to client
  AI_RESPONSE: 'ai_response',
  AI_TYPING: 'ai_typing',
  ANALYSIS_RESULT: 'analysis_result',
  STREAMING_RESPONSE: 'streaming_response',
  ERROR: 'error',
  SYSTEM_MESSAGE: 'system_message',
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  return isDev ? DJANGO_CONFIG.DEV : DJANGO_CONFIG.PROD;
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  const config = getCurrentConfig();
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to build WebSocket URLs
export const buildWebSocketUrl = (endpoint: string) => {
  const config = getCurrentConfig();
  return `${config.WEBSOCKET_URL}${endpoint}`;
};