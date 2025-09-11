import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { UploadPage } from './components/UploadPage';
import { AIChatPage } from './components/AIChatPage';
import { CherryBlossomIcon } from './components/CherryBlossomIcon';
import React from 'react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'upload' | 'chat'>('upload');

  return (
    <div className="min-h-screen gradient-glossy-primary relative">
      {/* Japanese-inspired floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-sakura/5 rounded-full blur-3xl zen-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-indigo/8 rounded-full blur-2xl zen-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-mist/6 rounded-full blur-xl zen-pulse" style={{ animationDelay: '4s' }} />
        
        {/* Floating cherry blossoms - hidden on mobile for cleaner look */}
        <div className="absolute top-1/4 left-1/3 hidden sm:block">
          <CherryBlossomIcon size={32} className="text-sakura opacity-20" animated />
        </div>
        <div className="absolute top-3/4 right-1/3 hidden sm:block">
          <CherryBlossomIcon size={24} className="text-sakura opacity-15" animated />
        </div>
        <div className="absolute top-1/2 right-1/4 hidden lg:block">
          <CherryBlossomIcon size={28} className="text-sakura opacity-10" animated />
        </div>
        
        {/* Zen wave patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-8" viewBox="0 0 100 100">
          <path d="M0,50 Q25,30 50,50 T100,50" stroke="rgba(255, 183, 197, 0.15)" strokeWidth="0.8" fill="none" className="animate-pulse" />
          <path d="M0,40 Q30,60 60,40 T100,40" stroke="rgba(102, 126, 234, 0.1)" strokeWidth="0.6" fill="none" className="animate-pulse" style={{ animationDelay: '1s' }} />
          <path d="M0,60 Q20,40 40,60 T80,60" stroke="rgba(168, 178, 200, 0.12)" strokeWidth="0.4" fill="none" className="animate-pulse" style={{ animationDelay: '2s' }} />
        </svg>
      </div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header with Japanese aesthetic */}
        <header className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Brand/Logo area */}
              <div className="text-center space-y-2 sm:space-y-3 lg:space-y-4">
                <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-2 sm:mb-3 lg:mb-4">
                  <CherryBlossomIcon size={24} className="text-sakura sm:block hidden" animated />
                  <CherryBlossomIcon size={32} className="text-sakura sm:hidden" animated />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-primary">
                    depressoAssist
                  </h1>
                  <CherryBlossomIcon size={24} className="text-indigo sm:block hidden" animated />
                  <CherryBlossomIcon size={32} className="text-indigo sm:hidden" animated />
                </div>
                <p className="text-xs text-mist font-medium tracking-wider uppercase opacity-75">
                  AI-Powered Mental Health Support
                </p>
                <p className="text-soft text-sm sm:text-base lg:text-lg px-4 sm:px-0">
                  Gentle AI companion for mental wellness and inner peace
                </p>
              </div>
              
              {/* Navigation */}
              <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 px-4 sm:px-6 pb-8 sm:pb-12">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'upload' ? <UploadPage /> : <AIChatPage />}
          </div>
        </main>
        
        {/* Enhanced footer with Japanese elements */}
        <footer className="mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-4">
                  <CherryBlossomIcon size={16} className="text-sakura opacity-60 sm:hidden" />
                  <CherryBlossomIcon size={20} className="text-sakura opacity-60 hidden sm:block" />
                  <p className="text-xs sm:text-sm text-indigo font-medium">
                    AI Mental Wellness Companion
                  </p>
                  <div className="w-2 h-2 bg-gradient-to-r from-sakura to-indigo rounded-full zen-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-subtle max-w-md mb-1">
                    For immediate help, contact a licensed mental health professional
                  </p>
                  <p className="text-xs text-mist">
                    Crisis Helpline: 9152987821 (KIRAN) • 91-44-2464-0050 (Sneha India)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}