
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthComponent from "@/components/auth/AuthComponent";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import FoodContributions from "@/components/contributions/FoodContributions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Package, Users, Home, Menu, Utensils, Share2, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // If no session and not on landing page, show auth
  if (!session && activeTab !== "landing") {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <AuthComponent />
        </div>
      </div>
    );
  }

  // If session exists and still on landing, switch to pantry
  if (session && activeTab === "landing") {
    setActiveTab("pantry");
  }

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  if (activeTab === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-green-700">FreshSavings</h1>
            <Button onClick={() => setActiveTab("pantry")} size="lg">
              Get Started
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Food Management for Everyone
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Reduce food waste, save money, and share with your community. 
            FreshSavings helps you manage your pantry, discover recipes, and connect with neighbors.
          </p>
          <Button onClick={() => setActiveTab("pantry")} size="lg" className="px-8 py-6 text-lg">
            Start Managing Your Pantry
            <ChefHat className="ml-2 w-5 h-5" />
          </Button>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-16">
          <h3 className="text-3xl font-bold text-center mb-12">Everything You Need</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Package className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Smart Pantry</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your ingredients, monitor expiry dates, and get alerts before food goes bad.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Sparkles className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>AI Recipe Generator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get personalized recipe suggestions based on what you have in your pantry.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <Share2 className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <CardTitle>Community Kitchen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share surplus food with neighbors and discover what others are offering.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-16 text-center bg-white rounded-lg mx-6 mb-16 shadow-lg">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Saving?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who are reducing food waste and saving money.
          </p>
          <Button onClick={() => setActiveTab("pantry")} size="lg" className="px-8 py-6 text-lg">
            Enter App
            <Utensils className="ml-2 w-5 h-5" />
          </Button>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <AuthComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">FreshSavings</h1>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant={activeTab === "landing" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("landing")}
                className="px-3"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant={activeTab === "pantry" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("pantry")}
                className="px-3"
              >
                <Package className="w-4 h-4 mr-2" />
                Pantry
              </Button>
              <Button
                variant={activeTab === "recipes" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("recipes")}
                className="px-3"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Recipe Generator
              </Button>
              <Button
                variant={activeTab === "community" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation("community")}
                className="px-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Community Kitchen
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">FreshSavings</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "landing" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("landing")}
              >
                <Home className="w-4 h-4" />
              </Button>
              <Popover open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-56 p-2">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant={activeTab === "pantry" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => handleNavigation("pantry")}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Pantry
                    </Button>
                    <Button
                      variant={activeTab === "recipes" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => handleNavigation("recipes")}
                    >
                      <ChefHat className="w-4 h-4 mr-2" />
                      Recipe Generator
                    </Button>
                    <Button
                      variant={activeTab === "community" ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => handleNavigation("community")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Community Kitchen
                    </Button>
                    <div className="border-t pt-2 mt-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => supabase.auth.signOut()}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4">
        {activeTab === "pantry" && (
          <PantryManager userId={session?.user?.id || ""} />
        )}

        {activeTab === "recipes" && (
          <RecipeGenerator 
            userId={session?.user?.id || ""} 
            onNavigateToPantry={() => setActiveTab("pantry")}
          />
        )}

        {activeTab === "community" && (
          <FoodContributions userId={session?.user?.id || ""} />
        )}
      </div>
    </div>
  );
};

export default Index;
