import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthComponent from "@/components/auth/AuthComponent";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import FoodContributions from "@/components/contributions/FoodContributions";
import LandingPage from "@/components/landing/LandingPage";
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

  const handleGetStarted = () => {
    if (session) {
      setActiveTab("pantry");
    } else {
      setActiveTab("auth");
    }
  };

  // If no session and not on landing page, show auth
  if (!session && activeTab !== "landing" && activeTab !== "auth") {
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
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (activeTab === "auth" || (!session && activeTab !== "landing")) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <AuthComponent />
        </div>
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
