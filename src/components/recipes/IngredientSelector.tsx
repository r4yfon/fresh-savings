
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface IngredientSelectorProps {
  userId: string;
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

const IngredientSelector = ({ userId, selectedIngredients, onIngredientsChange }: IngredientSelectorProps) => {
  const [customIngredient, setCustomIngredient] = useState("");
  const [customQuantity, setCustomQuantity] = useState("");
  const [customUnit, setCustomUnit] = useState("pieces");

  // Capitalize input function
  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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

  const handlePantryItemToggle = (item: any, checked: boolean) => {
    const ingredientText = `${item.quantity || 1} ${item.unit || 'pieces'}${item.quantity > 1 && item.unit !== 'pieces' ? '' : ''} ${item.name}`;
    
    if (checked) {
      onIngredientsChange([...selectedIngredients, ingredientText]);
    } else {
      onIngredientsChange(selectedIngredients.filter(ingredient => ingredient !== ingredientText));
    }
  };

  const handleAddCustomIngredient = () => {
    if (customIngredient.trim()) {
      const quantity = customQuantity.trim() || "1";
      const unit = customUnit;
      const capitalizedIngredient = capitalizeWords(customIngredient.trim());
      const ingredientText = `${quantity} ${unit} ${capitalizedIngredient}`;
      
      if (!selectedIngredients.includes(ingredientText)) {
        onIngredientsChange([...selectedIngredients, ingredientText]);
        setCustomIngredient("");
        setCustomQuantity("");
        setCustomUnit("pieces");
      }
    }
  };

  const handleRemoveIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
  };

  const isItemSelected = (item: any) => {
    const ingredientText = `${item.quantity || 1} ${item.unit || 'pieces'}${item.quantity > 1 && item.unit !== 'pieces' ? '' : ''} ${item.name}`;
    return selectedIngredients.includes(ingredientText);
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
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {pantryItems.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.name}
                    checked={isItemSelected(item)}
                    onCheckedChange={(checked) => 
                      handlePantryItemToggle(item, checked as boolean)
                    }
                  />
                  <label htmlFor={item.name} className="text-sm cursor-pointer flex-1">
                    {item.quantity || 1} {item.unit || 'pieces'} {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add custom ingredient */}
        <div className="space-y-3">
          <h4 className="font-medium">Add Other Ingredients:</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="quantity" className="text-xs">Quantity</Label>
              <Input
                id="quantity"
                placeholder="1"
                value={customQuantity}
                onChange={(e) => setCustomQuantity(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="unit" className="text-xs">Unit</Label>
              <Select value={customUnit} onValueChange={setCustomUnit}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kilograms">Kilograms</SelectItem>
                  <SelectItem value="litres">Litres</SelectItem>
                  <SelectItem value="pieces">Pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ingredient" className="text-xs">Ingredient</Label>
              <Input
                id="ingredient"
                placeholder="flour, sugar, etc."
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomIngredient()}
                className="h-8"
              />
            </div>
          </div>
          <Button onClick={handleAddCustomIngredient} variant="outline" className="w-full">
            Add Ingredient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IngredientSelector;
