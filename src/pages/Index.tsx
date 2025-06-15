
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthComponent from "@/components/auth/AuthComponent";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import FoodContributions from "@/components/contributions/FoodContributions";
import LandingPage from "@/components/landing/LandingPage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Package, Users, Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

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
      <div>
        <LandingPage />
        <div className="fixed top-4 right-4">
          <Button onClick={() => setActiveTab("pantry")}>
            Enter App
          </Button>
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("landing")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <h1 className="text-xl font-bold">FreshSavings</h1>
              </div>
              
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        activeTab === "pantry" 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => handleNavigation("pantry")}
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Pantry
                      </div>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        activeTab === "recipes" 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => handleNavigation("recipes")}
                    >
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Recipe Generator
                      </div>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${
                        activeTab === "community" 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => handleNavigation("community")}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Community Kitchen
                      </div>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("landing")}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <h1 className="text-xl font-bold">FreshSavings</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <div className="flex flex-col gap-4 mt-8">
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
                    <div className="border-t pt-4 mt-4">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => supabase.auth.signOut()}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
