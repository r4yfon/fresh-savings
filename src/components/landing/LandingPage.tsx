
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, Utensils, Calendar, MapPin, Heart } from "lucide-react";

interface LandingPageProps {
  onGetStarted?: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-green-800">FreshSavings</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your smart companion for managing your pantry, discovering recipes, and sharing food with your community.
            Reduce waste, save money, and build connections through food.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Package className="w-12 h-12 text-green-800 mx-auto mb-4" />
              <CardTitle className="text-xl">Smart Pantry Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Keep track of your food inventory with expiry date tracking, categorization, and smart notifications.
                Never let food go to waste again!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Utensils className="w-12 h-12 text-green-800 mx-auto mb-4" />
              <CardTitle className="text-xl">AI Recipe Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get personalized recipe suggestions based on what you have in your pantry. Our AI creates delicious meals from your available ingredients.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-green-800 mx-auto mb-4" />
              <CardTitle className="text-xl">Community Food Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Share excess food with your neighbors and discover available food in your community. Build connections while reducing food waste.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-800">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Your Items</h3>
              <p className="text-gray-600">
                Easily add food items to your digital pantry with quantities, expiry dates, and categories.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-800">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Recipe Ideas</h3>
              <p className="text-gray-600">
                Our AI suggests recipes based on your available ingredients, helping you create amazing meals.
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-800">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Connect</h3>
              <p className="text-gray-600">
                Share surplus food with your community and discover fresh ingredients from neighbors.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Choose FreshSavings?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <Calendar className="w-8 h-8 text-green-800 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Reduce Food Waste</h3>
                <p className="text-gray-600">
                  Track expiry dates and get timely reminders to use ingredients before they spoil.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Heart className="w-8 h-8 text-green-800 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Save Money</h3>
                <p className="text-gray-600">
                  Avoid buying duplicate items and make the most of what you already have at home.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <MapPin className="w-8 h-8 text-green-800 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Build Community</h3>
                <p className="text-gray-600">
                  Connect with neighbors through food sharing and create a stronger local community.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <Utensils className="w-8 h-8 text-green-800 mt-1" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Discover New Recipes</h3>
                <p className="text-gray-600">
                  Get creative with AI-generated recipes tailored to your available ingredients.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Kitchen Experience?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who are already saving money, reducing waste, and building community connections.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
