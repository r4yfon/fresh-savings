
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChefHat, Package, Plus } from "lucide-react";
import AIRecipeGenerator from "./AIRecipeGenerator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

const RecipeGenerator = ({ userId, onNavigateToPantry }: RecipeGeneratorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    unit: "piece",
    expiry_date: "",
    category: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ['pantry-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: typeof formData) => {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: userId,
          name: newItem.name,
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
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      setIsAddDialogOpen(false);
      setFormData({ name: "", quantity: 1, unit: "piece", expiry_date: "", category: "" });
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
      console.error('Error adding item:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItemMutation.mutate(formData);
  };

  const handleAddToPantryFirst = () => {
    setIsAddDialogOpen(true);
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
                <Package className="w-4 h-4 mr-2" />
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData({ ...formData, unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">Grams</SelectItem>
                        <SelectItem value="l">Liters</SelectItem>
                        <SelectItem value="ml">Milliliters</SelectItem>
                        <SelectItem value="cup">Cup</SelectItem>
                        <SelectItem value="tsp">Teaspoon</SelectItem>
                        <SelectItem value="tbsp">Tablespoon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
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
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={addItemMutation.isPending}>
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
            <p className="text-sm text-muted-foreground mb-4">Add some ingredients to get recipe suggestions!</p>
            <Button onClick={handleAddToPantryFirst}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredients
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AIRecipeGenerator userId={userId} pantryItems={pantryItems} />
      )}
    </div>
  );
};

export default RecipeGenerator;
