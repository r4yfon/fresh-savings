import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, Users, ChefHat, Trash2, Sparkles } from "lucide-react";
import IngredientSelector from "./IngredientSelector";
import AIRecipeGenerator from "./AIRecipeGenerator";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: any;
  instructions: string;
  prep_time: number | null;
  cook_time: number | null;
  servings: number;
  difficulty: string;
  created_at: string;
}

interface RecipeGeneratorProps {
  userId: string;
}

const RecipeGenerator = ({ userId }: RecipeGeneratorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ingredients: "",
    instructions: "",
    prep_time: 0,
    cook_time: 0,
    servings: 4,
    difficulty: "easy",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Recipe[];
    },
  });

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('name, quantity, unit')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const addRecipeMutation = useMutation({
    mutationFn: async (newRecipe: typeof formData) => {
      const ingredientsArray = newRecipe.ingredients
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.trim());

      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          title: newRecipe.title,
          description: newRecipe.description || null,
          ingredients: ingredientsArray,
          instructions: newRecipe.instructions,
          prep_time: newRecipe.prep_time || null,
          cook_time: newRecipe.cook_time || null,
          servings: newRecipe.servings,
          difficulty: newRecipe.difficulty,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        ingredients: "",
        instructions: "",
        prep_time: 0,
        cook_time: 0,
        servings: 4,
        difficulty: "easy",
      });
      toast({
        title: "Success",
        description: "Recipe added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add recipe",
        variant: "destructive",
      });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: "Success",
        description: "Recipe deleted successfully!",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRecipeMutation.mutate(formData);
  };

  const handleGeneratedRecipe = (recipe: any) => {
    setGeneratedRecipe(recipe);
    setFormData({
      title: recipe.title || "AI Generated Recipe",
      description: recipe.description || "",
      ingredients: Array.isArray(recipe.ingredients) 
        ? recipe.ingredients.join('\n') 
        : selectedIngredients.join('\n'),
      instructions: recipe.instructions || "",
      prep_time: recipe.prep_time || 0,
      cook_time: recipe.cook_time || 0,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || "medium",
    });
    setIsAddDialogOpen(true);
  };

  const generateFromPantry = () => {
    if (pantryItems.length === 0) {
      toast({
        title: "No ingredients",
        description: "Add some items to your pantry first!",
        variant: "destructive",
      });
      return;
    }

    // Format pantry items with quantities and units like the ingredient selector does
    const formattedIngredients = pantryItems.map(item => 
      `${item.quantity || 1} ${item.unit || 'piece'}${item.quantity > 1 && item.unit !== 'piece' ? 's' : ''} ${item.name}`
    );
    
    // Set the selected ingredients to trigger the AI recipe generator
    setSelectedIngredients(formattedIngredients);
    
    toast({
      title: "Pantry items selected",
      description: `Selected ${pantryItems.length} items from your pantry. You can now generate a recipe using AI!`,
    });
  };

  if (isLoading) {
    return <div>Loading recipes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Recipes</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateFromPantry}>
            <ChefHat className="w-4 h-4 mr-2" />
            Use All Pantry Items
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Recipe
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {generatedRecipe ? "Save AI Generated Recipe" : "Add New Recipe"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {generatedRecipe && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      ✨ This recipe was generated by AI based on your selected ingredients
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the recipe"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                  <Textarea
                    id="ingredients"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="1 cup flour&#10;2 eggs&#10;1 tsp salt"
                    rows={6}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Step by step cooking instructions"
                    rows={6}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prep_time">Prep Time (min)</Label>
                    <Input
                      id="prep_time"
                      type="number"
                      min="0"
                      value={formData.prep_time}
                      onChange={(e) => setFormData({ ...formData, prep_time: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cook_time">Cook Time (min)</Label>
                    <Input
                      id="cook_time"
                      type="number"
                      min="0"
                      value={formData.cook_time}
                      onChange={(e) => setFormData({ ...formData, cook_time: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={addRecipeMutation.isPending}>
                  {addRecipeMutation.isPending ? "Adding..." : "Add Recipe"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recipe Generation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IngredientSelector
          userId={userId}
          selectedIngredients={selectedIngredients}
          onIngredientsChange={setSelectedIngredients}
        />
        <AIRecipeGenerator
          selectedIngredients={selectedIngredients}
          onRecipeGenerated={handleGeneratedRecipe}
        />
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ChefHat className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recipes yet</p>
            <p className="text-sm text-muted-foreground">Create your first recipe or use your pantry items!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{recipe.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {recipe.description && (
                  <p className="text-muted-foreground">{recipe.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {recipe.prep_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Prep: {recipe.prep_time}m</span>
                      </div>
                    )}
                    {recipe.cook_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Cook: {recipe.cook_time}m</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Serves {recipe.servings}</span>
                    </div>
                    <span className="capitalize px-2 py-1 bg-muted rounded text-xs">
                      {recipe.difficulty}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <ul className="text-sm space-y-1">
                      {Array.isArray(recipe.ingredients) ? 
                        recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-muted-foreground">• {ingredient}</li>
                        )) : 
                        <li className="text-muted-foreground">• {recipe.ingredients}</li>
                      }
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Instructions:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {recipe.instructions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
