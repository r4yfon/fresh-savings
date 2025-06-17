import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Sparkles } from "lucide-react";

interface AIRecipeGeneratorProps {
  selectedIngredients: string[];
  onRecipeGenerated: (recipe: any) => void;
}

const AIRecipeGenerator = ({
  selectedIngredients,
  onRecipeGenerated,
}: AIRecipeGeneratorProps) => {
  const { toast } = useToast();

  const generateRecipeMutation = useMutation({
    mutationFn: async (ingredients: string[]) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-recipe",
        {
          body: { ingredients },
        },
      );

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.recipe) {
        onRecipeGenerated(data.recipe);
        toast({
          title: "Recipe Generated!",
          description: "Your AI-generated recipe is ready to save.",
        });
      }
    },
    onError: (error) => {
      console.error("Recipe generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateRecipe = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No ingredients selected",
        description:
          "Please select at least one ingredient to generate a recipe.",
        variant: "destructive",
      });
      return;
    }
    generateRecipeMutation.mutate(selectedIngredients);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          AI Recipe Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a creative recipe based on your selected ingredients using
            AI.
          </p>
          <Button
            onClick={handleGenerateRecipe}
            disabled={
              selectedIngredients.length === 0 ||
              generateRecipeMutation.isPending
            }
            className="w-full">
            {generateRecipeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Recipe ({selectedIngredients.length} ingredients)
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecipeGenerator;
