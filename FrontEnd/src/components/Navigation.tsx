import { Button } from "./ui/button";
import { CherryBlossomIcon } from "./CherryBlossomIcon";
import { Upload, MessageCircleHeart } from "lucide-react";

interface NavigationProps {
  currentPage: 'upload' | 'chat';
  onPageChange: (page: 'upload' | 'chat') => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="glass-morphism rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-2xl hover-lift w-full max-w-md sm:max-w-lg">
      <div className="flex gap-2 sm:gap-3">
        <Button
          variant={currentPage === 'upload' ? 'default' : 'outline'}
          onClick={() => onPageChange('upload')}
          className={`flex-1 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-semibold transition-all duration-500 ${
            currentPage === 'upload' 
              ? 'gradient-glossy-accent text-white shadow-xl gradient-glow transform scale-105 border-0' 
              : 'glass-morphism-soft text-indigo hover:text-indigo-dark hover:scale-105 border-soft hover:border-sakura/40 hover:bg-sakura/5'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 lg:gap-3">
            {currentPage === 'upload' ? (
              <CherryBlossomIcon size={16} className="text-current opacity-90 sm:block hidden" />
            ) : (
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 opacity-75" />
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm sm:text-base lg:text-lg font-medium">Upload</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:block">Media</span>
            </div>
          </div>
        </Button>
        <Button
          variant={currentPage === 'chat' ? 'default' : 'outline'}
          onClick={() => onPageChange('chat')}
          className={`flex-1 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl font-semibold transition-all duration-500 ${
            currentPage === 'chat' 
              ? 'gradient-glossy-accent text-white shadow-xl gradient-glow transform scale-105 border-0' 
              : 'glass-morphism-soft text-indigo hover:text-indigo-dark hover:scale-105 border-soft hover:border-sakura/40 hover:bg-sakura/5'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 lg:gap-3">
            {currentPage === 'chat' ? (
              <CherryBlossomIcon size={16} className="text-current opacity-90 sm:block hidden" />
            ) : (
              <MessageCircleHeart className="h-4 w-4 sm:h-5 sm:w-5 opacity-75" />
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm sm:text-base lg:text-lg font-medium">AI Chat</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:block">Therapy</span>
            </div>
          </div>
        </Button>
      </div>
    </nav>
  );
}