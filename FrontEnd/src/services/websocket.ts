import { buildWebSocketUrl, API_ENDPOINTS, WS_MESSAGE_TYPES } from '../config/django';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'worried';
  isStreaming?: boolean;
}

interface AnalysisResult {
  depression_indicators: {
    facial_expression: number;
    body_language: number;
    overall_score: number;
  };
  recommendations: string[];
  mood_analysis: string;
}

class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<(message: ChatMessage) => void> = new Set();
  private analysisHandlers: Set<(analysis: AnalysisResult) => void> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();
  private typingHandlers: Set<(isTyping: boolean) => void> = new Set();

  constructor(private baseUrl: string = buildWebSocketUrl(API_ENDPOINTS.CHAT.WEBSOCKET)) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.baseUrl);
        
        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout - Django backend not available'));
          }
        }, 3000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('🌸 Connected to Django backend');
          this.notifyConnectionHandlers(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🍃 Disconnected from backend');
          this.notifyConnectionHandlers(false);
          
          // Only auto-reconnect if it was an unexpected close and we were previously connected
          if (event.code !== 1000 && this.ws?.readyState === WebSocket.CLOSED) {
            setTimeout(() => {
              console.log('Attempting to reconnect...');
              this.connect().catch(() => {
                // Silently fail reconnection attempts
              });
            }, 5000);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          // Don't log error details in production, just reject
          reject(new Error('WebSocket connection failed - Django backend not available'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'chat_message':
        const message: ChatMessage = {
          id: data.id || crypto.randomUUID(),
          type: data.sender === 'ai' ? 'ai' : 'user',
          content: data.content,
          timestamp: new Date(data.timestamp),
          mood: data.mood
        };
        this.notifyMessageHandlers(message);
        break;

      case 'ai_typing':
        this.notifyTypingHandlers(data.is_typing);
        break;

      case 'analysis_result':
        this.notifyAnalysisHandlers(data.analysis);
        break;

      case 'streaming_response':
        // Handle token-by-token streaming from Gemma2B
        this.handleStreamingResponse(data);
        break;
    }
  }

  sendMessage(content: string, mood?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: WS_MESSAGE_TYPES.CHAT_MESSAGE,
        content,
        mood,
        timestamp: new Date().toISOString()
      }));
    }
  }

  requestAnalysis(fileId: string, fileType: 'image' | 'video'): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: WS_MESSAGE_TYPES.ANALYSIS_REQUEST,
        file_id: fileId,
        file_type: fileType
      }));
    }
  }

  private handleStreamingResponse(data: any) {
    // Handle streaming AI responses for natural conversation flow
    const partialMessage: ChatMessage = {
      id: data.message_id,
      type: 'ai',
      content: data.partial_content,
      timestamp: new Date(),
      mood: data.mood
    };
    this.notifyMessageHandlers(partialMessage);
  }

  // Event handlers
  onMessage(handler: (message: ChatMessage) => void) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onAnalysis(handler: (analysis: AnalysisResult) => void) {
    this.analysisHandlers.add(handler);
    return () => this.analysisHandlers.delete(handler);
  }

  onConnection(handler: (connected: boolean) => void) {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  onTyping(handler: (isTyping: boolean) => void) {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  private notifyMessageHandlers(message: ChatMessage) {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private notifyAnalysisHandlers(analysis: AnalysisResult) {
    this.analysisHandlers.forEach(handler => handler(analysis));
  }

  private notifyConnectionHandlers(connected: boolean) {
    this.connectionHandlers.forEach(handler => handler(connected));
  }

  private notifyTypingHandlers(isTyping: boolean) {
    this.typingHandlers.forEach(handler => handler(isTyping));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const chatService = new ChatWebSocketService();
export type { ChatMessage, AnalysisResult };