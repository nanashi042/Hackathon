import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, LogIn, UserPlus } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ChibiAvatar } from "./Mascot";

interface AuthPageProps {
  onAuthSuccess: (userData: {
    userId: string;
    username: string;
    userType: 'helper' | 'needer';
    gender: 'male' | 'female' | 'other';
    mode: 'ai' | 'human';
  }) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<'selection' | 'login' | 'signup'>('selection');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <ChibiAvatar size="lg" mood="neutral" className="mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Depresso Assist
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            A safe, anonymous space for mental health support
          </p>
        </div>

        {currentView === 'selection' && (
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
            <h2 className="text-2xl text-center mb-6 text-gray-700">Welcome</h2>
            <div className="space-y-4">
              <Button
                onClick={() => setCurrentView('login')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </Button>
              
              <Button
                onClick={() => setCurrentView('signup')}
                variant="outline"
                className="w-full border-2 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
                size="lg"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  100% Anonymous
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                  Safe & Secure
                </div>
              </div>
            </div>
          </Card>
        )}

        {currentView === 'login' && (
          <LoginForm 
            onSuccess={onAuthSuccess}
            onBack={() => setCurrentView('selection')}
          />
        )}

        {currentView === 'signup' && (
          <SignupForm 
            onSuccess={onAuthSuccess}
            onBack={() => setCurrentView('selection')}
          />
        )}
      </div>
    </div>
  );
}