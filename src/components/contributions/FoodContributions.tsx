import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Package, Users, Share, Edit, StopCircle } from "lucide-react";
import { format } from "date-fns";

interface FoodContribution {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  description: string | null;
  location: string | null;
  available_until: string | null;
  status: string;
  category: string | null;
  contributor_id: string;
  created_at: string;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
}

interface FoodContributionsProps {
  userId: string;
}

const FoodContributions = ({ userId }: FoodContributionsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContribution, setEditingContribution] = useState<FoodContribution | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    unit: "pieces",
    description: "",
    location: "",
    available_until: "",
    category: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get tomorrow's date as default
  const getTomorrowDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Capitalize input function
  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const { data: contributions = [], isLoading: contributionsLoading } = useQuery({
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

  const { data: myContributions = [] } = useQuery({
    queryKey: ['my-food-contributions', userId],
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

  const addContributionMutation = useMutation({
    mutationFn: async (newContribution: typeof formData) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .insert({
          contributor_id: userId,
          name: capitalizeWords(newContribution.name),
          quantity: newContribution.quantity,
          unit: newContribution.unit,
          description: newContribution.description || null,
          location: newContribution.location || null,
          available_until: newContribution.available_until || null,
          category: newContribution.category || null,
          status: 'available',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions'] });
      setIsAddDialogOpen(false);
      setFormData({ name: "", quantity: 1, unit: "pieces", description: "", location: "", available_until: "", category: "" });
      toast({
        title: "Success",
        description: "Food item shared with the community!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to share food item",
        variant: "destructive",
      });
    },
  });

  const updateContributionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FoodContribution> }) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions'] });
      setIsEditDialogOpen(false);
      setEditingContribution(null);
      toast({
        title: "Success",
        description: "Food item updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update food item",
        variant: "destructive",
      });
    },
  });

  const stopSharingMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      const { error } = await supabase
        .from('food_contributions')
        .update({ status: 'unavailable' })
        .eq('id', contributionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions'] });
      toast({
        title: "Success",
        description: "Stopped sharing food item",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to stop sharing",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContributionMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContribution) {
      updateContributionMutation.mutate({
        id: editingContribution.id,
        updates: {
          name: capitalizeWords(formData.name),
          quantity: formData.quantity,
          unit: formData.unit,
          description: formData.description || null,
          location: formData.location || null,
          available_until: formData.available_until || null,
          category: formData.category || null,
        }
      });
    }
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      quantity: 1,
      unit: "pieces",
      description: "",
      location: "",
      available_until: getTomorrowDate(),
      category: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSharePantryItem = (item: PantryItem) => {
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      description: "",
      location: "",
      available_until: getTomorrowDate(),
      category: item.category || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEditContribution = (contribution: FoodContribution) => {
    setEditingContribution(contribution);
    setFormData({
      name: contribution.name,
      quantity: contribution.quantity,
      unit: contribution.unit,
      description: contribution.description || "",
      location: contribution.location || "",
      available_until: contribution.available_until || "",
      category: contribution.category || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleStopSharing = (contributionId: string) => {
    stopSharingMutation.mutate(contributionId);
  };

  // Get shared pantry item IDs
  const sharedPantryItemNames = myContributions
    .filter(c => c.status === 'available')
    .map(c => c.name.toLowerCase());

  if (contributionsLoading) {
    return <div>Loading community contributions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Kitchen</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Share Food
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Food with Community</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Food Item</Label>
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
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="kilograms">Kilograms</SelectItem>
                      <SelectItem value="litres">Litres</SelectItem>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
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
                    <SelectItem value="baked-goods">Baked Goods</SelectItem>
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any additional details..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Pickup Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Front porch, Building lobby..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="available_until">Available Until (Optional)</Label>
                <Input
                  id="available_until"
                  type="date"
                  value={formData.available_until}
                  onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={addContributionMutation.isPending}>
                {addContributionMutation.isPending ? "Sharing..." : "Share Food"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* My Pantry Items Section */}
      {pantryItems.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Share from Your Pantry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pantryItems.map((item) => {
              const isShared = sharedPantryItemNames.includes(item.name.toLowerCase());
              const sharedContribution = myContributions.find(
                c => c.name.toLowerCase() === item.name.toLowerCase() && c.status === 'available'
              );
              
              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit}
                        </p>
                        {item.category && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.category}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {!isShared ? (
                          <Button
                            size="sm"
                            onClick={() => handleSharePantryItem(item)}
                            className="flex-1"
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Share Food
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sharedContribution && handleEditContribution(sharedContribution)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => sharedContribution && handleStopSharing(sharedContribution.id)}
                              className="flex-1"
                            >
                              <StopCircle className="w-4 h-4 mr-2" />
                              Stop Sharing
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Food Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Food Items</h3>
        {contributions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No food items available</p>
              <p className="text-sm text-muted-foreground">Be the first to share something with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributions.map((contribution) => (
              <Card key={contribution.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">{contribution.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {contribution.quantity} {contribution.unit}
                      </p>
                      {contribution.category && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {contribution.category}
                        </p>
                      )}
                    </div>
                    
                    {contribution.description && (
                      <p className="text-sm">{contribution.description}</p>
                    )}
                    
                    <div className="space-y-1">
                      {contribution.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{contribution.location}</span>
                        </div>
                      )}
                      {contribution.available_until && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Until: {format(new Date(contribution.available_until), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Shared: {format(new Date(contribution.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shared Food Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Food Item</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="kilograms">Kilograms</SelectItem>
                    <SelectItem value="litres">Litres</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
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
                  <SelectItem value="baked-goods">Baked Goods</SelectItem>
                  <SelectItem value="canned">Canned Goods</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add any additional details..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-location">Pickup Location (Optional)</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Front porch, Building lobby..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-available_until">Available Until (Optional)</Label>
              <Input
                id="edit-available_until"
                type="date"
                value={formData.available_until}
                onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={updateContributionMutation.isPending}>
              {updateContributionMutation.isPending ? "Updating..." : "Update Food Item"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodContributions;
