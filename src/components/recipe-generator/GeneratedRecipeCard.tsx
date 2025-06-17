import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface GeneratedRecipe {
  name: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
}

const GeneratedRecipeCard: React.FC<{ recipe: GeneratedRecipe }> = ({
  recipe,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Generated Recipe</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        <div>
          <h4 className="font-medium mb-2">Ingredients:</h4>
          <ul className="list-disc list-inside space-y-1">
            {recipe.ingredients?.map((ingredient, index) => (
              <li key={index} className="text-sm">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-2">Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1">
            {recipe.instructions?.map((instruction, index) => (
              <li key={index} className="text-sm">
                {instruction}
              </li>
            ))}
          </ol>
        </div>
        {recipe.cookingTime && (
          <p className="text-sm text-muted-foreground">
            Cooking time: {recipe.cookingTime}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default GeneratedRecipeCard;
