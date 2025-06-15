import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Minus, Package, Plus, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  category: string | null;
  created_at: string;
}

interface RecipeGeneratorProps {
  userId: string;
  onNavigateToPantry: () => void;
}

const RecipeGenerator = ({
  userId,
  onNavigateToPantry,
}: RecipeGeneratorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  interface GeneratedRecipe {
    name: string;
    ingredients: string[];
    instructions: string[];
    cookingTime?: string;
  }

  const [generatedRecipe, setGeneratedRecipe] =
    useState<GeneratedRecipe | null>(null);
  const [manualIngredient, setManualIngredient] = useState("");
  const [manualQuantity, setManualQuantity] = useState(1);
  const [manualUnit, setManualUnit] = useState("pieces");
  const [pantryItemQuantities, setPantryItemQuantities] = useState<{
    [key: string]: number;
  }>({});
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    unit: "pieces",
    expiry_date: "",
    category: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-fill expiry date to 2 weeks from now
  const getTwoWeeksFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split("T")[0];
  };

  // Capitalize input function
  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ["pantry-items", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: typeof formData) => {
      const { data, error } = await supabase
        .from("pantry_items")
        .insert({
          user_id: userId,
          name: capitalizeWords(newItem.name),
          quantity: newItem.quantity,
          unit: newItem.unit,
          expiry_date: newItem.expiry_date || null,
          category: newItem.category || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry-items"] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        quantity: 1,
        unit: "pieces",
        expiry_date: "",
        category: "",
      });
      toast({
        title: "Success",
        description: "Item added to pantry!",
      });
      // Navigate to pantry after successful addition
      onNavigateToPantry();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to pantry",
        variant: "destructive",
      });
      console.error("Error adding item:", error);
    },
  });

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
        setGeneratedRecipe(data.recipe);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItemMutation.mutate(formData);
  };

  const handleAddToPantryFirst = () => {
    setFormData({
      name: "",
      quantity: 1,
      unit: "pieces",
      expiry_date: getTwoWeeksFromNow(),
      category: "",
    });
    setIsAddDialogOpen(true);
  };

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

  const removeIngredient = (indexToRemove: number) => {
    setSelectedIngredients(
      selectedIngredients.filter((_, index) => index !== indexToRemove),
    );
  };

  const addManualIngredient = () => {
    if (manualIngredient.trim()) {
      const ingredientWithQuantity = `${manualQuantity} ${manualUnit} ${capitalizeWords(
        manualIngredient.trim(),
      )}`;
      setSelectedIngredients([...selectedIngredients, ingredientWithQuantity]);
      setManualIngredient("");
      setManualQuantity(1);
      setManualUnit("pieces");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addManualIngredient();
    }
  };

  const togglePantryItem = (item: PantryItem) => {
    const selectedQuantity = pantryItemQuantities[item.id] || 1;
    const ingredientText = `${selectedQuantity} ${item.unit} ${item.name}`;
    const isSelected = selectedIngredients.some((ingredient) =>
      ingredient.includes(item.name),
    );

    if (isSelected) {
      setSelectedIngredients(
        selectedIngredients.filter(
          (ingredient) => !ingredient.includes(item.name),
        ),
      );
      // Remove quantity tracking when unselected
      const newQuantities = { ...pantryItemQuantities };
      delete newQuantities[item.id];
      setPantryItemQuantities(newQuantities);
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientText]);
      // Set initial quantity when selected
      setPantryItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    }
  };

  const updatePantryItemQuantity = (item: PantryItem, newQuantity: number) => {
    // Ensure quantity doesn't exceed available amount or go below 1
    const clampedQuantity = Math.max(1, Math.min(newQuantity, item.quantity));
    setPantryItemQuantities((prev) => ({
      ...prev,
      [item.id]: clampedQuantity,
    }));

    // Update the ingredient in the selected list
    const ingredientText = `${clampedQuantity} ${item.unit} ${item.name}`;
    const updatedIngredients = selectedIngredients.map((ingredient) =>
      ingredient.includes(item.name) ? ingredientText : ingredient,
    );
    setSelectedIngredients(updatedIngredients);
  };

  if (isLoading) {
    return <div>Loading pantry items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recipe Generator</h2>
        {pantryItems.length === 0 && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddToPantryFirst}>
                <Package className="w-4 h-4" />
                Add to Pantry First
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Pantry Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }>
                      <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="fruits">Fruits</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="meat">Meat</SelectItem>
                      <SelectItem value="grains">Grains</SelectItem>
                      <SelectItem value="spices">Spices</SelectItem>
                      <SelectItem value="canned">Canned Goods</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expiry_date: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addItemMutation.isPending}>
                  {addItemMutation.isPending ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {pantryItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your pantry is empty</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add some ingredients to get recipe suggestions!
            </p>
            <Button onClick={handleAddToPantryFirst}>
              <Plus className="w-4 h-4" />
              Add Ingredients
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Select Pantry Items Section - with quantity controls */}
            <Card>
              <CardHeader>
                <CardTitle>Select Pantry Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pantryItems.map((item) => {
                    const isSelected = selectedIngredients.some((ingredient) =>
                      ingredient.includes(item.name),
                    );
                    const selectedQuantity = pantryItemQuantities[item.id] || 1;

                    return (
                      <div
                        className={`flex justify-between items-center border rounded ${
                          isSelected
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
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
                                updatePantryItemQuantity(
                                  item,
                                  selectedQuantity - 1,
                                );
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
                                updatePantryItemQuantity(
                                  item,
                                  selectedQuantity + 1,
                                );
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

            {/* Manual Ingredients Section - Add quantity and unit */}
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
                        onChange={(e) =>
                          setManualQuantity(parseInt(e.target.value))
                        }
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
          </div>

          {/* Selected Ingredients Section - moved here to prevent jumpiness */}
          {selectedIngredients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="ml-2 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Simple AI Recipe Generator Button - Remove card styling */}
          {selectedIngredients.length > 0 && (
            <div className="flex justify-center">
              <Button
                onClick={handleGenerateRecipe}
                disabled={
                  selectedIngredients.length === 0 ||
                  generateRecipeMutation.isPending
                }
                className="w-full"
                size="lg">
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
          )}

          {/* Generated Recipe Display */}
          {generatedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Recipe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {generatedRecipe.name}
                  </h3>
                  <div>
                    <h4 className="font-medium mb-2">Ingredients:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {generatedRecipe.ingredients?.map(
                        (ingredient: string, index: number) => (
                          <li key={index} className="text-sm">
                            {ingredient}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {generatedRecipe.instructions?.map(
                        (instruction: string, index: number) => (
                          <li key={index} className="text-sm">
                            {instruction}
                          </li>
                        ),
                      )}
                    </ol>
                  </div>
                  {generatedRecipe.cookingTime && (
                    <p className="text-sm text-muted-foreground">
                      Cooking time: {generatedRecipe.cookingTime}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
