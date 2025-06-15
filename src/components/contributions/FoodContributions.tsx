
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Users, Package } from "lucide-react";
import { format } from "date-fns";

interface FoodContribution {
  id: string;
  contributor_id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  location: string | null;
  available_until: string | null;
  category: string | null;
  status: string;
  created_at: string;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  category: string | null;
  created_at: string;
}

interface FoodContributionsProps {
  userId: string;
}

const FoodContributions = ({ userId }: FoodContributionsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPantryItem, setSelectedPantryItem] = useState<string>("");
  const [formData, setFormData] = useState({
    description: "",
    quantity: 1,
    location: "",
    available_until: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allContributions = [], isLoading } = useQuery({
    queryKey: ['food-contributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_contributions')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FoodContribution[];
    },
  });

  const { data: myContributions = [] } = useQuery({
    queryKey: ['my-contributions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_contributions')
        .select('*')
        .eq('contributor_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FoodContribution[];
    },
  });

  const { data: pantryItems = [] } = useQuery({
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

  const addContributionMutation = useMutation({
    mutationFn: async (newContribution: { pantryItemId: string; description: string; quantity: number; location: string; available_until: string }) => {
      const selectedItem = pantryItems.find(item => item.id === newContribution.pantryItemId);
      if (!selectedItem) throw new Error("Selected item not found");
      
      if (newContribution.quantity > selectedItem.quantity) {
        throw new Error("Cannot share more than what you have in inventory");
      }

      const { data, error } = await supabase
        .from('food_contributions')
        .insert({
          contributor_id: userId,
          name: selectedItem.name,
          description: newContribution.description || null,
          quantity: newContribution.quantity,
          unit: selectedItem.unit,
          location: newContribution.location || null,
          available_until: newContribution.available_until || null,
          category: selectedItem.category || null,
          status: 'available',
        })
        .select()
        .single();
      
      if (error) throw error;

      // Update pantry item quantity
      const newQuantity = selectedItem.quantity - newContribution.quantity;
      if (newQuantity === 0) {
        // Remove item if quantity becomes 0
        const { error: deleteError } = await supabase
          .from('pantry_items')
          .delete()
          .eq('id', newContribution.pantryItemId);
        
        if (deleteError) throw deleteError;
      } else {
        // Update quantity
        const { error: updateError } = await supabase
          .from('pantry_items')
          .update({ quantity: newQuantity })
          .eq('id', newContribution.pantryItemId);
        
        if (updateError) throw updateError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['pantry-items'] });
      setIsAddDialogOpen(false);
      setSelectedPantryItem("");
      setFormData({
        description: "",
        quantity: 1,
        location: "",
        available_until: "",
      });
      toast({
        title: "Success",
        description: "Food contribution added successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add food contribution",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('food_contributions')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-contributions'] });
      toast({
        title: "Success",
        description: "Status updated successfully!",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPantryItem) {
      toast({
        title: "Error",
        description: "Please select an item from your pantry",
        variant: "destructive",
      });
      return;
    }
    
    addContributionMutation.mutate({
      pantryItemId: selectedPantryItem,
      ...formData
    });
  };

  const handleClaim = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'claimed' });
  };

  const handleMarkAsExpired = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'expired' });
  };

  const handleRedirectToPantry = () => {
    // This will switch to the pantry tab
    const pantryTab = document.querySelector('[value="pantry"]') as HTMLElement;
    if (pantryTab) {
      pantryTab.click();
    }
  };

  const selectedItem = pantryItems.find(item => item.id === selectedPantryItem);

  if (isLoading) {
    return <div>Loading food contributions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Food Sharing</h2>
        <div className="flex gap-2">
          {pantryItems.length === 0 && (
            <Button variant="outline" onClick={handleRedirectToPantry}>
              <Package className="w-4 h-4 mr-2" />
              Add to Pantry First
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={pantryItems.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                Share Food
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Food from Your Pantry</DialogTitle>
              </DialogHeader>
              {pantryItems.length === 0 ? (
                <div className="text-center py-4">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">You need items in your pantry before you can share food.</p>
                  <Button onClick={handleRedirectToPantry}>
                    <Package className="w-4 h-4 mr-2" />
                    Go to Pantry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pantry-item">Select Item from Pantry</Label>
                    <Select
                      value={selectedPantryItem}
                      onValueChange={setSelectedPantryItem}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an item from your pantry" />
                      </SelectTrigger>
                      <SelectContent>
                        {pantryItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedItem && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Available:</strong> {selectedItem.quantity} {selectedItem.unit}</p>
                      {selectedItem.category && (
                        <p className="text-sm"><strong>Category:</strong> {selectedItem.category}</p>
                      )}
                      {selectedItem.expiry_date && (
                        <p className="text-sm"><strong>Expires:</strong> {format(new Date(selectedItem.expiry_date), 'MMM dd, yyyy')}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity to Share</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedItem?.quantity || 1}
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Any additional details..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Pickup Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Where can people pick this up?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="available_until">Available Until</Label>
                    <Input
                      id="available_until"
                      type="date"
                      value={formData.available_until}
                      onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={addContributionMutation.isPending || !selectedPantryItem}>
                    {addContributionMutation.isPending ? "Sharing..." : "Share Food"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">Available Food</TabsTrigger>
          <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          {allContributions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No food available yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share food with your community!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allContributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{contribution.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contribution.description && (
                        <p className="text-sm text-muted-foreground">{contribution.description}</p>
                      )}
                      
                      <p className="font-medium">{contribution.quantity} {contribution.unit}</p>
                      
                      {contribution.category && (
                        <p className="text-sm text-muted-foreground capitalize">{contribution.category}</p>
                      )}
                      
                      {contribution.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{contribution.location}</span>
                        </div>
                      )}
                      
                      {contribution.available_until && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Until: {format(new Date(contribution.available_until), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      
                      {contribution.contributor_id !== userId && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleClaim(contribution.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          Claim This Food
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-contributions" className="mt-6">
          {myContributions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">You haven't shared any food yet</p>
                <p className="text-sm text-muted-foreground">Start sharing to help your community!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myContributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{contribution.name}</CardTitle>
                      <span className={`px-2 py-1 rounded text-xs ${
                        contribution.status === 'available' ? 'bg-green-100 text-green-800' :
                        contribution.status === 'claimed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contribution.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contribution.description && (
                        <p className="text-sm text-muted-foreground">{contribution.description}</p>
                      )}
                      
                      <p className="font-medium">{contribution.quantity} {contribution.unit}</p>
                      
                      {contribution.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{contribution.location}</span>
                        </div>
                      )}
                      
                      {contribution.available_until && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Until: {format(new Date(contribution.available_until), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      
                      {contribution.status === 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleMarkAsExpired(contribution.id)}
                        >
                          Mark as Expired
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodContributions;
