import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowLeft, Heart, Shield, Users, Bot, Loader2, Eye, EyeOff, Shuffle } from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ChibiAvatar } from "./Mascot";

interface SignupFormProps {
  onSuccess: (userData: {
    userId: string;
    username: string;
    userType: 'helper' | 'needer';
    gender: 'male' | 'female' | 'other';
    mode: 'ai' | 'human';
  }) => void;
  onBack: () => void;
}

export function SignupForm({ onSuccess, onBack }: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '' as 'helper' | 'needer' | '',
    gender: '' as 'male' | 'female' | 'other' | '',
    mode: '' as 'ai' | 'human' | ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'ok' | 'migration_required' | 'error'>('unknown');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const initialUsernameGenerated = useRef(false);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-8532b137`;

  // Generate random anonymous username
  const generateUsername = () => {
    const adjectives = [
      'Gentle', 'Brave', 'Kind', 'Peaceful', 'Strong', 'Caring', 'Wise', 'Hopeful', 
      'Calm', 'Resilient', 'Bright', 'Serene', 'Compassionate', 'Mindful', 'Healing',
      'Radiant', 'Tranquil', 'Courageous', 'Nurturing', 'Empathetic', 'Supportive',
      'Understanding', 'Patient', 'Encouraging', 'Uplifting', 'Inspiring', 'Soothing'
    ];
    
    const nouns = [
      'Soul', 'Heart', 'Spirit', 'Light', 'Phoenix', 'Butterfly', 'Sunrise', 'Ocean',
      'Mountain', 'Garden', 'Bridge', 'Journey', 'Path', 'Dawn', 'Willow', 'River',
      'Star', 'Moon', 'Cloud', 'Flower', 'Tree', 'Breeze', 'Sanctuary', 'Haven',
      'Oasis', 'Guardian', 'Guide', 'Beacon', 'Voice', 'Anchor', 'Rainbow', 'Dove'
    ];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 99) + 1;
    
    return `${adjective}${noun}${number}`;
  };

  // Generate username when component mounts (only once)
  useEffect(() => {
    if (!initialUsernameGenerated.current) {
      setFormData(prev => ({ 
        ...prev, 
        username: generateUsername() 
      }));
      initialUsernameGenerated.current = true;
    }
  }, []);

  const runQuickDiagnosis = async () => {
    setDiagnosing(true);
    try {
      console.log('Testing server connection to:', serverUrl);
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Server response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Server response data:', data);
        
        if (data.database === 'connected') {
          setServerStatus('ok');
        } else if (data.database === 'migration_required' || data.database === 'error') {
          setServerStatus('migration_required');
        } else {
          setServerStatus('error');
        }
      } else {
        console.log('Server responded with error:', response.status, response.statusText);
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Failed to connect to server:', error);
      setServerStatus('error');
    }
    setDiagnosing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // For helpers, automatically set mode to 'human'
    const finalMode = formData.userType === 'helper' ? 'human' : formData.mode;

    // Validation
    if (!formData.email || !formData.password || !formData.userType || !formData.gender) {
      setError('Please fill in all fields');
      return;
    }

    // Only check mode for needers (helpers automatically get 'human' mode)
    if (formData.userType === 'needer' && !formData.mode) {
      setError('Please select your preferred support type');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Mock signup for demo - in real app this would hit the server
      setTimeout(() => {
        onSuccess({
          userId: Math.random().toString(36).substr(2, 9),
          username: formData.username,
          userType: formData.userType,
          gender: formData.gender,
          mode: finalMode
        });
        setLoading(false);
      }, 1500); // Simulate network delay

    } catch (error) {
      console.error('Signup error:', error);
      setError('Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl ml-2 text-gray-700">Create Your Account</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label>Your Anonymous Identity</Label>
            <div className="flex space-x-2">
              <div className="flex-1 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center p-1">
                    <ChibiAvatar size="sm" mood="happy" />
                  </div>
                  <span className="font-medium text-purple-700">{formData.username}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, username: generateUsername() })}
                className="px-3 border-purple-200 hover:bg-purple-50"
                title="Generate new username"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your identity will always remain anonymous. Click the shuffle button to generate a new name.
            </p>
          </div>

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
                placeholder="Create a secure password"
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

          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                className="focus:ring-2 focus:ring-purple-500 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* User Type Selection */}
        <div>
          <Label className="text-base mb-3 block">How would you like to participate?</Label>
          <div className="grid grid-cols-1 gap-3">
            <Card 
              className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                formData.userType === 'needer' 
                  ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setFormData({ ...formData, userType: 'needer', mode: '' })}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center p-2">
                  <ChibiAvatar size="sm" mood="thinking" />
                </div>
                <div>
                  <h3 className="font-medium">I need support</h3>
                  <p className="text-sm text-gray-600">Get help from caring volunteers or AI assistance</p>
                </div>
              </div>
            </Card>

            <Card 
              className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                formData.userType === 'helper' 
                  ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 to-teal-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setFormData({ ...formData, userType: 'helper', mode: 'human' })}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">I want to help</h3>
                  <p className="text-sm text-gray-600">Connect with others who need support through real conversations</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <Label className="text-base mb-3 block">Gender</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as any })}>
            <SelectTrigger className="focus:ring-2 focus:ring-purple-500">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mode Selection - Only show for needers */}
        {formData.userType === 'needer' && (
          <div>
            <Label className="text-base mb-3 block">Preferred support type</Label>
            <div className="grid grid-cols-1 gap-3">
              <Card 
                className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  formData.mode === 'ai' 
                    ? 'ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setFormData({ ...formData, mode: 'ai' })}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">AI Assistant</h3>
                    <p className="text-sm text-gray-600">24/7 AI support and guidance</p>
                  </div>
                </div>
              </Card>

              <Card 
                className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  formData.mode === 'human' 
                    ? 'ring-2 ring-pink-500 bg-gradient-to-br from-pink-50 to-rose-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setFormData({ ...formData, mode: 'human' })}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Human Connection</h3>
                    <p className="text-sm text-gray-600">Connect with real people who understand</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Helper confirmation message */}
        {formData.userType === 'helper' && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Ready to Help Others</h3>
                <p className="text-green-700 text-sm mt-1">
                  As a helper, you'll be connected with people who need support. You'll use human-to-human conversations to provide comfort and guidance.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Account Creation Failed</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                
                {error.includes('email already exists') && (
                  <p className="text-red-600 text-sm mt-2">
                    <strong>Tip:</strong> If you already have an account, try logging in instead.
                  </p>
                )}
                
                {(error.includes('Database not initialized') || error.includes('Failed to create user profile') || error.includes('Failed to create account')) && (
                  <div className="mt-3 space-y-2">
                    <p className="text-red-600 text-sm">
                      <strong>This looks like a database issue.</strong> Let's diagnose it:
                    </p>
                    
                    <Button
                      onClick={runQuickDiagnosis}
                      disabled={diagnosing}
                      variant="outline"
                      size="sm"
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      {diagnosing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        '🔍 Run Quick Diagnosis'
                      )}
                    </Button>
                    
                    {serverStatus === 'migration_required' && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <p className="text-yellow-800 font-medium">⚠️ Database Migration Required</p>
                        <p className="text-yellow-700 mt-1">
                          The database tables haven't been created yet. You need to run the migration:
                        </p>
                        <ol className="text-yellow-700 mt-2 ml-4 list-decimal text-xs">
                          <li>Go to your Supabase Dashboard</li>
                          <li>Navigate to <strong>SQL Editor</strong></li>
                          <li>Copy the SQL from <code>/supabase/database-schema.sql</code></li>
                          <li>Paste and <strong>Run</strong> it</li>
                        </ol>
                      </div>
                    )}
                    
                    {serverStatus === 'ok' && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded text-sm">
                        <p className="text-green-800">✅ Database is working! Try signing up again.</p>
                      </div>
                    )}
                    
                    {serverStatus === 'error' && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-sm">
                        <p className="text-red-800 font-medium">❌ Server Connection Error</p>
                        <p className="text-red-700 mt-1">
                          The Edge Function is not deployed. You need to:
                        </p>
                        <ol className="text-red-700 mt-2 ml-4 list-decimal text-xs">
                          <li>Install Supabase CLI: <code>npm install -g supabase</code></li>
                          <li>Login: <code>supabase login</code></li>
                          <li>Link project: <code>supabase link --project-ref {projectId}</code></li>
                          <li>Deploy: <code>supabase functions deploy server</code></li>
                        </ol>
                        <p className="text-red-700 mt-2 text-xs">
                          See <strong>/SETUP_GUIDE.md</strong> for detailed instructions.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-center text-sm text-gray-500">
          By creating an account, you agree to our commitment to providing a safe, anonymous space for mental health support.
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-500">
            Already have an account?{' '}
            <span 
              className="text-purple-600 hover:text-purple-700 cursor-pointer underline"
              onClick={onBack}
            >
              Sign in instead
            </span>
          </div>
        </div>
      </form>
    </Card>
  );
}