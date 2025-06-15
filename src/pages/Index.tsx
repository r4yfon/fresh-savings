
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Package, Users, LogOut } from "lucide-react";
import AuthComponent from "@/components/auth/AuthComponent";
import PantryManager from "@/components/pantry/PantryManager";
import RecipeGenerator from "@/components/recipes/RecipeGenerator";
import FoodContributions from "@/components/contributions/FoodContributions";

const Index = () => {
  const [user, setUser] = useState(null);

  // Check for user session
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      return session;
    },
  });

  // Listen for auth changes with proper cleanup
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Smart Pantry</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Pantry</CardTitle>
              <Package className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your groceries and expiry dates
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recipes</CardTitle>
              <ChefHat className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate recipes from your ingredients
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community</CardTitle>
              <Users className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share and find food contributions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pantry" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pantry">
              <Package className="w-4 h-4 mr-2" />
              My Pantry
            </TabsTrigger>
            <TabsTrigger value="recipes">
              <ChefHat className="w-4 h-4 mr-2" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="contributions">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pantry" className="mt-6">
            <PantryManager userId={user.id} />
          </TabsContent>
          
          <TabsContent value="recipes" className="mt-6">
            <RecipeGenerator userId={user.id} />
          </TabsContent>
          
          <TabsContent value="contributions" className="mt-6">
            <FoodContributions userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
