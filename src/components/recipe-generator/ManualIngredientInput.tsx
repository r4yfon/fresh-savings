import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import React from "react";

interface ManualIngredientInputProps {
  manualIngredient: string;
  setManualIngredient: (v: string) => void;
  manualQuantity: number;
  setManualQuantity: (v: number) => void;
  manualUnit: string;
  setManualUnit: (v: string) => void;
  addManualIngredient: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

const ManualIngredientInput: React.FC<ManualIngredientInputProps> = ({
  manualIngredient,
  setManualIngredient,
  manualQuantity,
  setManualQuantity,
  manualUnit,
  setManualUnit,
  addManualIngredient,
  handleKeyPress,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Manually Add Ingredients</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="manual-ingredient" className="text-xs">
              Ingredient
            </Label>
            <Input
              id="manual-ingredient"
              value={manualIngredient}
              onChange={(e) => setManualIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter name..."
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="manual-quantity" className="text-xs">
              Quantity
            </Label>
            <Input
              id="manual-quantity"
              type="number"
              min="1"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(parseInt(e.target.value))}
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="manual-unit" className="text-xs">
              Unit
            </Label>
            <Select value={manualUnit} onValueChange={setManualUnit}>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="kilograms">Kilograms</SelectItem>
                <SelectItem value="litres">Litres</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={addManualIngredient}
          disabled={!manualIngredient.trim()}
          className="w-full">
          <Plus className="w-4 h-4" />
          Add Ingredient
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default ManualIngredientInput;
