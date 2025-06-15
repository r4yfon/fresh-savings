import AuthComponent from "@/components/auth/AuthComponent";
import FoodContributions from "@/components/contributions/FoodContributions";
import LandingPage from "@/components/landing/LandingPage";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Menu, Moon, Package, Sun, Users } from "lucide-react";
import React, { useState } from "react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [authTabValue, setAuthTabValue] = useState("signin");
  const [darkMode, setDarkMode] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const handleGetStarted = () => {
    if (session) {
      setActiveTab("pantry");
    } else {
      setAuthTabValue("signin");
      setIsAuthDialogOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveTab("landing");
    window.location.reload();
  };

  const handleSignUpClick = () => {
    setAuthTabValue("signup");
    setIsAuthDialogOpen(true);
  };

  const handleLoginClick = () => {
    setAuthTabValue("signin");
    setIsAuthDialogOpen(true);
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  // Ensure theme is set on mount
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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

  return (
    <div className="min-h-screen">
      {/* Desktop Navigation */}
      <div className="hidden md:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">FreshSavings</h1>
            </div>

            {/* Navigation buttons (Pantry, Recipes, Community) */}
            {session && (
              <div className="flex items-center gap-1">
                <Button
                  variant={activeTab === "pantry" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation("pantry")}
                  className="px-3">
                  <Package className="w-4 h-4" />
                  Pantry
                </Button>
                <Button
                  variant={activeTab === "recipes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation("recipes")}
                  className="px-3">
                  <ChefHat className="w-4 h-4" />
                  Recipe Generator
                </Button>
                <Button
                  variant={activeTab === "community" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleNavigation("community")}
                  className="px-3">
                  <Users className="w-4 h-4" />
                  Community Kitchen
                </Button>
              </div>
            )}

            {/* Rightmost controls: dark mode toggle and auth buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
                onClick={handleToggleDarkMode}>
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              {session ? (
                <Button variant="destructive" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLoginClick}
                    className="px-3">
                    Log in
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignUpClick}
                    className="px-3">
                    Sign up
                  </Button>
                </>
              )}
            </div>
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
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
                onClick={handleToggleDarkMode}>
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <Popover
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="end" className="w-56 p-2">
                  <div className="flex flex-col gap-1">
                    {session ? (
                      <>
                        <Button
                          variant={activeTab === "pantry" ? "default" : "ghost"}
                          className="justify-start"
                          onClick={() => handleNavigation("pantry")}>
                          <Package className="w-4 h-4" />
                          Pantry
                        </Button>
                        <Button
                          variant={
                            activeTab === "recipes" ? "default" : "ghost"
                          }
                          className="justify-start"
                          onClick={() => handleNavigation("recipes")}>
                          <ChefHat className="w-4 h-4" />
                          Recipe Generator
                        </Button>
                        <Button
                          variant={
                            activeTab === "community" ? "default" : "ghost"
                          }
                          className="justify-start"
                          onClick={() => handleNavigation("community")}>
                          <Users className="w-4 h-4" />
                          Community Kitchen
                        </Button>
                        <div className="border-t pt-2 mt-2 flex gap-2">
                          <Button
                            variant="destructive"
                            className="w-full justify-start"
                            onClick={handleSignOut}>
                            Sign Out
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={handleLoginClick}>
                          Log in
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start"
                          onClick={handleSignUpClick}>
                          Sign up
                        </Button>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="max-w-md p-0">
          {/* <DialogHeader> */}
          {/* <DialogTitle>Authentication</DialogTitle> */}
          {/* </DialogHeader> */}
          <AuthComponent
            defaultTab={authTabValue}
            onClose={() => setIsAuthDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Content */}
      {activeTab === "landing" ? (
        <LandingPage onGetStarted={handleGetStarted} />
      ) : activeTab === "auth" || (!session && activeTab !== "landing") ? (
        <div className="container mx-auto p-4">
          <div className="max-w-md mx-auto">
            <AuthComponent />
          </div>
        </div>
      ) : !session ? (
        <div className="container mx-auto p-4">
          <div className="max-w-md mx-auto">
            <AuthComponent />
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default Index;
