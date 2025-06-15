
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AuthComponent from "@/components/auth/AuthComponent";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import FoodContributions from "@/components/contributions/FoodContributions";
import LandingPage from "@/components/landing/LandingPage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Package, Users, Home } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("landing");
  
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("landing")}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <h1 className="text-3xl font-bold">PantryPal</h1>
        </div>
        <Button
          variant="outline"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pantry" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Pantry
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center gap-2">
            <ChefHat className="w-4 h-4" />
            Recipes
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pantry" className="mt-6">
          <PantryManager userId={session?.user?.id || ""} />
        </TabsContent>

        <TabsContent value="recipes" className="mt-6">
          <RecipeGenerator 
            userId={session?.user?.id || ""} 
            onNavigateToPantry={() => setActiveTab("pantry")}
          />
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <FoodContributions userId={session?.user?.id || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
