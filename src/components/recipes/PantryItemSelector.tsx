import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Apple, Carrot, Milk, Beef, Wheat, Utensils, Package2, Snowflake, HelpCircle, Calendar, X } from "lucide-react";
import { format } from "date-fns";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  category: string | null;
  created_at: string;
}

interface PantryItemSelectorProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
}

const categoryIcons = {
  fruits: Apple,
  vegetables: Carrot,
  dairy: Milk,
  meat: Beef,
  grains: Wheat,
  spices: Utensils,
  canned: Package2,
  frozen: Snowflake,
  other: HelpCircle,
};

const PantryItemSelector = ({ 
  userId, 
  isOpen, 
  onClose, 
  selectedIngredients, 
  onIngredientsChange 
}: PantryItemSelectorProps) => {
  const [localSelectedItems, setLocalSelectedItems] = useState<string[]>(selectedIngredients);

  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      
      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return expiry <= threeDaysFromNow;
  };

  const handleItemToggle = (item: PantryItem, checked: boolean) => {
    const ingredientText = `${item.quantity} ${item.unit} ${item.name}`;
    
    if (checked) {
      setLocalSelectedItems([...localSelectedItems, ingredientText]);
    } else {
      setLocalSelectedItems(localSelectedItems.filter(ingredient => ingredient !== ingredientText));
    }
  };

  const handleSelectAll = () => {
    const allIngredients = pantryItems.map(item => `${item.quantity} ${item.unit} ${item.name}`);
    setLocalSelectedItems(allIngredients);
  };

  const handleClearAll = () => {
    setLocalSelectedItems([]);
  };

  const handleConfirm = () => {
    onIngredientsChange(localSelectedItems);
    onClose();
  };

  const isItemSelected = (item: PantryItem) => {
    const ingredientText = `${item.quantity} ${item.unit} ${item.name}`;
    return localSelectedItems.includes(ingredientText);
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setLocalSelectedItems(localSelectedItems.filter(item => item !== ingredient));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Pantry Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Selected ingredients with delete icons */}
          {localSelectedItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Ingredients:</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {localSelectedItems.map((ingredient) => (
                  <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                    {ingredient}
                    <X 
                      className="cursor-pointer" 
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => handleRemoveIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Choose All Pantry Items
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
            <Badge variant="secondary">
              {localSelectedItems.length} selected
            </Badge>
          </div>

          {/* Pantry items grid */}
          <div className="max-h-96 overflow-y-auto">
            {pantryItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pantry items available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pantryItems.map((item) => {
                  const IconComponent = categoryIcons[item.category as keyof typeof categoryIcons] || HelpCircle;
                  const isSelected = isItemSelected(item);
                  
                  return (
                    <Card 
                      key={item.id} 
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      } ${isExpiringSoon(item.expiry_date) ? 'border-red-500' : ''}`}
                      onClick={() => handleItemToggle(item, !isSelected)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => {}} // Handled by card click
                            />
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {item.category && (
                            <p className="text-sm text-muted-foreground capitalize">
                              {item.category} · {item.quantity} {item.unit}
                            </p>
                          )}
                          {!item.category && (
                            <p className="font-medium">{item.quantity} {item.unit}</p>
                          )}
                          {item.expiry_date && (
                            <div className={`flex items-center gap-1 text-sm ${isExpiringSoon(item.expiry_date) ? 'text-red-600' : 'text-muted-foreground'}`}>
                              <Calendar className="w-3 h-3" />
                              <span>Expires: {format(new Date(item.expiry_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                          {isExpiringSoon(item.expiry_date) && (
                            <p className="text-xs text-red-600 font-medium">⚠️ Expiring soon!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Add Selected Items ({localSelectedItems.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PantryItemSelector;
