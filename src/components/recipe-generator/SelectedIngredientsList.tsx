import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import React from "react";

interface SelectedIngredientsListProps {
  selectedIngredients: string[];
  removeIngredient: (index: number) => void;
}

const SelectedIngredientsList: React.FC<SelectedIngredientsListProps> = ({
  selectedIngredients,
  removeIngredient,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Selected Ingredients</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="list-disc pl-5 space-y-2">
        {selectedIngredients.map((ingredient, index) => (
          <li
            key={index}
            className="flex items-center justify-between text-base font-medium">
            <span>{ingredient}</span>
            <button
              onClick={() => removeIngredient(index)}
              className="ml-2 hover:text-red-600"
              aria-label="Remove ingredient">
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export default SelectedIngredientsList;
