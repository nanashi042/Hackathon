import { useState, useRef, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Send, Mic, MicOff, Volume2, VolumeX, Heart, Brain, Sparkles, WifiOff } from "lucide-react";
import { ChibiAvatar } from "./ChibiAvatar";
import { CherryBlossomIcon } from "./CherryBlossomIcon";
import { chatService } from "../services/analysis";
import { analysisBus } from "../services/bus";

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'worried';
  isStreaming?: boolean;
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your gentle AI companion. Like a caring friend who understands the language of hearts, I'm here to listen and support you. Your feelings matter, and you're not alone. How is your heart today? 🌸",
      timestamp: new Date(),
      mood: 'happy'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Optional: initial welcome message
  useEffect(() => {
    const welcome: Message = {
      id: 'welcome',
      type: 'system',
      content: '🌸 Welcome! You are connected to the backend. Share how you feel today.',
      timestamp: new Date(),
      mood: 'neutral'
    };
    setMessages(prev => [...prev, welcome]);
    // Subscribe to analysis advice
    const unsub = analysisBus.subscribe((evt) => {
      const analysisMsg: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: `${evt.summary ?? 'Analysis ready.'}${evt.advice ? '\n\n' + evt.advice : ''}`,
        timestamp: new Date(),
        mood: 'caring'
      };
      setMessages(prev => [...prev, analysisMsg]);
    });
    return () => { unsub(); };
  }, []);



  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    try {
      setIsTyping(true);
      let reply = await chatService.generate(newMessage.content);
      if (!reply) {
        reply = await chatService.sendIntent(newMessage.content);
      }
      const aiResponse: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: reply,
        timestamp: new Date(),
        mood: 'caring'
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (e) {
      const errResponse: Message = {
        id: crypto.randomUUID(),
        type: 'system',
        content: 'Connection issue. Please try again.',
        timestamp: new Date(),
        mood: 'neutral'
      };
      setMessages(prev => [...prev, errResponse]);
    } finally {
      setIsTyping(false);
      if (audioEnabled) {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        setInputValue("I've been feeling quite overwhelmed lately with work and personal responsibilities.");
      }, 3000);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8 max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
          <CherryBlossomIcon size={40} className="text-sakura sm:hidden" animated />
          <CherryBlossomIcon size={48} className="text-sakura hidden sm:block lg:hidden" animated />
          <CherryBlossomIcon size={56} className="text-sakura hidden lg:block" animated />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient-accent">
            depressoAssist
          </h2>
          <CherryBlossomIcon size={40} className="text-indigo sm:hidden" animated />
          <CherryBlossomIcon size={48} className="text-indigo hidden sm:block lg:hidden" animated />
          <CherryBlossomIcon size={56} className="text-indigo hidden lg:block" animated />
        </div>
        <p className="text-xs text-mist font-medium tracking-wider uppercase opacity-75 mb-2 sm:mb-3 lg:mb-4">
          AI-Powered Mental Health Support
        </p>
        <p className="text-soft text-base sm:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
          Meet your gentle AI companion who speaks the language of hearts. 
          Experience nurturing guidance, warm emotional support, and healing conversations in a safe space.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 xl:gap-10 max-w-7xl mx-auto">
        {/* AI Avatar & Info Panel */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-4 sm:space-y-6 lg:space-y-8">
          <Card className="gradient-glossy-card shadow-2xl hover-lift">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center justify-between text-base sm:text-lg lg:text-xl gap-3 sm:gap-2 lg:gap-3">
                <div className="text-center lg:text-center xl:text-left">
                  <span className="text-gradient-primary font-bold text-lg sm:text-xl lg:text-2xl block">
                    AI Assistant
                  </span>
                  <span className="text-mist text-xs sm:text-sm opacity-75">Mental Health Support</span>
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="glass-morphism-soft hover:bg-sakura/10 text-indigo-dark rounded-xl sm:rounded-2xl p-2 sm:p-3"
                  >
                    {audioEnabled ? (
                      <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="glass-morphism-soft rounded-xl sm:rounded-2xl p-2 sm:p-3 text-mist hover:bg-mist/10"
                    title="Demo Mode - No Backend Connected"
                  >
                    <WifiOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="relative flex justify-center">
                <div className="relative">
                  <ChibiAvatar 
                    mood={isTyping ? 'thinking' : isSpeaking ? 'speaking' : 'neutral'} 
                    size="lg" 
                    className="mb-3 sm:mb-4" 
                  />
                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-full border-3 border-sakura animate-pulse gradient-glow" />
                  )}
                </div>
              </div>
              
              {/* AI Status */}
              <div className="mt-6 sm:mt-8 text-center space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <CherryBlossomIcon size={14} className="text-sakura zen-pulse sm:hidden" />
                  <CherryBlossomIcon size={16} className="text-sakura zen-pulse hidden sm:block" />
                  <span className="text-indigo-dark font-semibold text-sm sm:text-base lg:text-lg">
                    {isSpeaking ? 'Speaking' : isTyping ? 'Thinking' : 'Demo Mode'}
                  </span>
                  <CherryBlossomIcon size={14} className="text-indigo zen-pulse sm:hidden" />
                  <CherryBlossomIcon size={16} className="text-indigo zen-pulse hidden sm:block" />
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center mb-3 sm:mb-4">
                  <Badge className="bg-gradient-to-r from-sakura to-indigo text-white text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl">
                    AI Therapist
                  </Badge>
                  <Badge variant={isSpeaking ? "default" : "outline"} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 text-indigo-dark rounded-xl sm:rounded-2xl border-sakura">
                    {isSpeaking ? "Speaking" : "Listening"}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 text-mist rounded-xl sm:rounded-2xl border-mist opacity-75">
                    Live Mode
                  </Badge>
                </div>
                <p className="text-subtle leading-relaxed text-xs sm:text-sm">
                  Gentle companion specializing in mindfulness, emotional support, and healing conversations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Summary Card */}
          <Card className="gradient-glossy-card shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg lg:text-xl text-gradient-accent text-center">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sakura" />
                  <span>Heart Analysis</span>
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo" />
                </div>
                <p className="text-mist text-xs sm:text-sm opacity-75">Emotional Well-being Assessment</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 lg:p-5 glass-morphism-soft rounded-xl sm:rounded-2xl gap-2 sm:gap-0">
                  <span className="font-medium text-indigo-dark text-sm sm:text-base">Mood</span>
                  <Badge className="bg-gradient-to-r from-sakura to-indigo text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                    Gentle
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 lg:p-5 glass-morphism-soft rounded-xl sm:rounded-2xl gap-2 sm:gap-0">
                  <span className="font-medium text-indigo-dark text-sm sm:text-base">Depression Risk</span>
                  <Badge className="bg-gradient-forest text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                    Demo Data
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 lg:p-5 glass-morphism-soft rounded-xl sm:rounded-2xl gap-2 sm:gap-0">
                  <span className="font-medium text-indigo-dark text-sm sm:text-base">AI Support</span>
                  <Badge className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-white bg-mist text-xs sm:text-sm">
                    Demo Mode
                  </Badge>
                </div>
              </div>
              <div className="glass-morphism-soft rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <CherryBlossomIcon size={20} className="mx-auto mb-2 sm:mb-3 text-sakura opacity-60 sm:hidden" />
                <CherryBlossomIcon size={24} className="mx-auto mb-2 sm:mb-3 text-sakura opacity-60 hidden sm:block" />
                <p className="text-subtle text-xs sm:text-sm italic">
                  Based on your visual story analysis
                </p>
                <p className="text-mist text-xs mt-1 opacity-75">
                  Emotional insights from your uploaded content
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        {/* Chat Interface */}
        <div className="lg:col-span-2 xl:col-span-3">
          <Card className="h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[750px] flex flex-col gradient-glossy-card shadow-2xl hover-lift">
            <CardHeader className="border-b border-soft pb-4 sm:pb-6">
              <CardTitle className="text-lg sm:text-2xl lg:text-3xl text-gradient-primary flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 justify-center">
                <CherryBlossomIcon size={24} className="text-sakura zen-pulse sm:hidden" />
                <CherryBlossomIcon size={28} className="text-sakura zen-pulse hidden sm:block lg:hidden" />
                <CherryBlossomIcon size={32} className="text-sakura zen-pulse hidden lg:block" />
                <div className="text-center">
                  <div>Conversation & Support</div>
                  <div className="text-xs sm:text-sm text-mist font-medium opacity-75 mt-1">AI Therapy Session</div>
                </div>
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-indigo zen-pulse" />
              </CardTitle>
              <p className="text-soft mt-3 sm:mt-4 text-center text-sm sm:text-base lg:text-lg">
                Share your heart's whispers and receive gentle, personalized guidance
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
                <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 sm:gap-3 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {/* AI Avatar - hidden on mobile for space */}
                      {message.type === 'ai' && (
                        <div className="flex-shrink-0 mt-1 hidden sm:block">
                          <ChibiAvatar 
                            mood={isSpeaking ? 'speaking' : 'neutral'} 
                            size="sm" 
                          />
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 shadow-lg transition-all duration-300 ${
                          message.type === 'user'
                            ? 'gradient-glossy-accent text-white ml-auto'
                            : message.type === 'system'
                            ? 'bg-gradient-to-r from-indigo/10 to-sakura/10 border border-indigo/20 text-indigo-dark'
                            : 'glass-morphism-soft border border-soft text-indigo-dark'
                        }`}
                      >
                        {/* Mobile AI indicator */}
                        {message.type === 'ai' && (
                          <div className="flex items-center gap-2 mb-3 sm:hidden">
                            <CherryBlossomIcon size={14} className="text-sakura" />
                            <span className="text-xs font-medium text-indigo">AI Assistant</span>
                          </div>
                        )}
                        
                        {/* System message indicator */}
                        {message.type === 'system' && (
                          <div className="flex items-center gap-2 mb-3">
                            <CherryBlossomIcon size={14} className="text-indigo" />
                            <span className="text-xs font-medium text-indigo">System</span>
                          </div>
                        )}
                        
                        {/* Message content */}
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        
                        {/* Timestamp */}
                        <div className="flex justify-end mt-2 sm:mt-3">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* User Avatar - hidden on mobile for space */}
                      {message.type === 'user' && (
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 mt-1 border-2 border-sakura/30 flex-shrink-0 hidden sm:flex">
                          <AvatarFallback className="bg-gradient-to-br from-sakura/20 to-indigo/20 text-indigo-dark font-semibold text-xs sm:text-sm">
                            U
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex gap-2 sm:gap-3 justify-start">
                      <div className="flex-shrink-0 mt-1 hidden sm:block">
                        <ChibiAvatar mood="thinking" size="sm" />
                      </div>
                      <div className="glass-morphism-soft rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-soft">
                        {/* Mobile AI thinking indicator */}
                        <div className="flex items-center gap-2 mb-3 sm:hidden">
                          <CherryBlossomIcon size={14} className="text-sakura" />
                          <span className="text-xs font-medium text-indigo">AI is thinking...</span>
                        </div>
                        
                        {/* Animated dots */}
                        <div className="flex gap-2">
                          <CherryBlossomIcon size={14} className="text-sakura zen-pulse" />
                          <CherryBlossomIcon size={14} className="text-indigo zen-pulse" style={{ animationDelay: '0.5s' }} />
                          <CherryBlossomIcon size={14} className="text-mist zen-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Chat Input Area */}
              <div className="p-3 sm:p-4 lg:p-6 border-t border-soft bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm">
                {/* Input Row */}
                <div className="flex gap-2 sm:gap-3 items-end">
                  {/* Text Input */}
                  <div className="flex-1">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Share your heart's voice... (Demo Mode)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="glass-morphism-soft border-soft rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-6 text-indigo-dark placeholder:text-subtle focus:border-sakura focus:ring-2 focus:ring-sakura/20 text-sm sm:text-base resize-none min-h-[48px] sm:min-h-[52px]"
                      disabled={isTyping}
                    />
                  </div>
                  
                  {/* Mic Button */}
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleRecording}
                    className={`flex-shrink-0 rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-300 min-h-[48px] min-w-[48px] sm:min-h-[52px] sm:min-w-[52px] ${
                      isRecording 
                        ? 'bg-gradient-secondary text-white shadow-xl animate-pulse' 
                        : 'glass-morphism-soft border-soft hover:bg-sakura/10 text-indigo-dark hover:scale-105'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />
                    ) : (
                      <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </Button>
                  
                  {/* Send Button */}
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputValue.trim() || isTyping}
                    className="flex-shrink-0 gradient-glossy-accent text-white rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 gradient-glow hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base font-semibold min-h-[48px] sm:min-h-[52px] flex items-center gap-2"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
                
                {/* Recording indicator */}
                {isRecording && (
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-sakura rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm text-sakura font-medium">
                        Recording... Tap mic to stop
                      </span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <CherryBlossomIcon size={14} className="text-sakura zen-pulse" />
                      <CherryBlossomIcon size={14} className="text-indigo zen-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>
                  </div>
                )}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-mist">
                      AI is crafting a thoughtful response...
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}