import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginFormProps {
  onSuccess: (userData: {
    userId: string;
    username: string;
    userType: 'helper' | 'needer';
    gender: 'male' | 'female' | 'other';
    mode: 'ai' | 'human';
  }) => void;
  onBack: () => void;
}

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-8532b137`;

  const generateUsername = () => {
    const adjectives = [
      'Gentle', 'Brave', 'Kind', 'Peaceful', 'Strong', 'Caring', 'Wise', 'Hopeful', 
      'Calm', 'Resilient', 'Bright', 'Serene', 'Compassionate', 'Mindful', 'Healing',
      'Radiant', 'Tranquil', 'Courageous', 'Nurturing', 'Empathetic', 'Supportive'
    ];
    
    const nouns = [
      'Soul', 'Heart', 'Spirit', 'Light', 'Phoenix', 'Butterfly', 'Sunrise', 'Ocean',
      'Mountain', 'Garden', 'Bridge', 'Journey', 'Path', 'Dawn', 'Willow', 'River',
      'Star', 'Moon', 'Cloud', 'Flower', 'Tree', 'Breeze', 'Sanctuary', 'Haven'
    ];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    
    return `${adjective}${noun}${number}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Mock login for demo - in real app this would hit the server
      // Simple demo credentials
      if (formData.email === 'demo@example.com' && formData.password === 'demo123') {
        setTimeout(() => {
          onSuccess({
            userId: 'demo-user-123',
            username: generateUsername(),
            userType: 'needer',
            gender: 'other',
            mode: 'human'
          });
          setLoading(false);
        }, 1000);
        return;
      }

      // For any other email/password, create a mock user
      setTimeout(() => {
        onSuccess({
          userId: Math.random().toString(36).substr(2, 9),
          username: generateUsername(),
          userType: Math.random() > 0.5 ? 'helper' : 'needer',
          gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)] as any,
          mode: Math.random() > 0.5 ? 'ai' : 'human'
        });
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl ml-2 text-gray-700">Welcome Back</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com"
            className="focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter your password"
              className="focus:ring-2 focus:ring-purple-500 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center">
          <Button variant="link" className="text-purple-600 hover:text-purple-700">
            Forgot your password?
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500">
          Your privacy and anonymity are always protected in our safe space.
        </div>
      </form>
    </Card>
  );
}