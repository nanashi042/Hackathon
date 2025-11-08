import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Shield, Users, Bot, MessageCircle, Clock } from "lucide-react";
import { ChibiAvatar } from "./Mascot";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ChibiAvatar size="lg" mood="happy" className="mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Depresso Assist
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A safe, anonymous space where people support each other through mental health challenges. 
            Connect with caring individuals or get AI assistance in a completely judgment-free environment.
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-3"
          >
            Get Started - It's Free
          </Button>
        </div>

        {/* How It Works */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl text-center mb-12 text-gray-700">How Depresso Assist Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Those Seeking Support */}
            <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center p-2">
                  <ChibiAvatar size="md" mood="speaking" />
                </div>
                <h3 className="text-2xl mb-4">Need Support?</h3>
                <div className="space-y-3 text-gray-600">
                  <p>✓ Connect with trained volunteers who understand</p>
                  <p>✓ Get 24/7 AI support when you need it most</p>
                  <p>✓ Join a caring community that listens</p>
                  <p>✓ Share anonymously without judgment</p>
                </div>
              </div>
            </Card>

            {/* For Helpers */}
            <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl mb-4">Want to Help?</h3>
                <div className="space-y-3 text-gray-600">
                  <p>✓ Support others with your experience</p>
                  <p>✓ Make a real difference in someone's day</p>
                  <p>✓ Build a stronger, caring community</p>
                  <p>✓ Help train our AI to be more compassionate</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl text-center mb-12 text-gray-700">Why Choose Depresso Assist?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-3">100% Anonymous</h3>
              <p className="text-gray-600">Your privacy is our top priority. No personal information required. Share freely without fear.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg p-2">
                <ChibiAvatar size="sm" mood="neutral" />
              </div>
              <h3 className="text-xl mb-3">Safe Space</h3>
              <p className="text-gray-600">Carefully moderated community built on empathy, understanding, and genuine human connection.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-3">Real Community</h3>
              <p className="text-gray-600">Connect with others who truly understand your journey and experiences.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-3">AI Support</h3>
              <p className="text-gray-600">Get immediate help from our compassionate AI assistant, available 24/7.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-3">Gender Matching</h3>
              <p className="text-gray-600">Connect with helpers of the same gender for more comfortable conversations.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-3">Always Available</h3>
              <p className="text-gray-600">Support is available when you need it most, day or night.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
            <h2 className="text-2xl mb-4 text-gray-700">Ready to Begin Your Journey?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of people who have found support, friendship, and hope in our community.
              Whether you need help or want to help others, there's a place for you here.
            </p>
            <Button 
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
            >
              Join Our Community Today
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Free • Anonymous • Safe • Supportive
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}