
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface IngredientSelectorProps {
  userId: string;
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

const IngredientSelector = ({ userId, selectedIngredients, onIngredientsChange }: IngredientSelectorProps) => {
  const [customIngredient, setCustomIngredient] = useState("");

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('name')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handlePantryItemToggle = (itemName: string, checked: boolean) => {
    if (checked) {
      onIngredientsChange([...selectedIngredients, itemName]);
    } else {
      onIngredientsChange(selectedIngredients.filter(item => item !== itemName));
    }
  };

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      onIngredientsChange([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient("");
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Ingredients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected ingredients */}
        {selectedIngredients.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Selected Ingredients:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                  {ingredient}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => handleRemoveIngredient(ingredient)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Pantry items */}
        {pantryItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">From Your Pantry:</h4>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {pantryItems.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.name}
                    checked={selectedIngredients.includes(item.name)}
                    onCheckedChange={(checked) => 
                      handlePantryItemToggle(item.name, checked as boolean)
                    }
                  />
                  <label htmlFor={item.name} className="text-sm cursor-pointer">
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add custom ingredient */}
        <div className="space-y-2">
          <h4 className="font-medium">Add Other Ingredients:</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ingredient name"
              value={customIngredient}
              onChange={(e) => setCustomIngredient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
            />
            <Button onClick={handleAddCustomIngredient} variant="outline">
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientSelector;
