import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Minus, Plus } from "lucide-react";
import React from "react";

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
  pantryItems: PantryItem[];
  selectedIngredients: string[];
  pantryItemQuantities: { [key: string]: number };
  togglePantryItem: (item: PantryItem) => void;
  updatePantryItemQuantity: (item: PantryItem, newQuantity: number) => void;
}

const PantryItemSelector: React.FC<PantryItemSelectorProps> = ({
  pantryItems,
  selectedIngredients,
  pantryItemQuantities,
  togglePantryItem,
  updatePantryItemQuantity,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Select Pantry Items</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {pantryItems.map((item) => {
          const isSelected = selectedIngredients.some((ingredient) =>
            ingredient.includes(item.name),
          );
          const selectedQuantity = pantryItemQuantities[item.id] || 1;

          return (
            <div
              key={item.id}
              className={`flex justify-between items-center border rounded ${
                isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted"
              }`}>
              <div
                className="flex-1 cursor-pointer p-3"
                onClick={() => togglePantryItem(item)}>
                <span className="font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (Available: {item.quantity} {item.unit})
                </span>
              </div>
              {isSelected && (
                <div className="flex items-center gap-2 mr-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePantryItemQuantity(item, selectedQuantity - 1);
                    }}
                    disabled={selectedQuantity <= 1}>
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {selectedQuantity} {item.unit}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      updatePantryItemQuantity(item, selectedQuantity + 1);
                    }}
                    disabled={selectedQuantity >= item.quantity}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export default PantryItemSelector;
