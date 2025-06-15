import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, MapPin, Calendar, Package, Edit, Share, StopCircle } from "lucide-react";
import { format } from "date-fns";

interface FoodContribution {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
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
    description: "",
    quantity: 1,
    unit: "pieces",
    location: "",
    available_until: "",
    category: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-fill available until date to 2 weeks from now
  const getTwoWeeksFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  // Capitalize input function
  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Fetch pantry items for the dropdown
  const { data: pantryItems = [] } = useQuery({
    queryKey: ['pantry-items', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const { data: contributions = [], isLoading } = useQuery({
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

  const addContributionMutation = useMutation({
    mutationFn: async (newContribution: typeof formData) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .insert({
          contributor_id: userId,
          name: capitalizeWords(newContribution.name),
          description: newContribution.description || null,
          quantity: newContribution.quantity,
          unit: newContribution.unit,
          location: newContribution.location || null,
          available_until: newContribution.available_until || null,
          category: newContribution.category || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Food contribution added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add food contribution",
        variant: "destructive",
      });
      console.error('Error adding contribution:', error);
    },
  });

  const updateContributionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: typeof formData }) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .update({
          name: capitalizeWords(updates.name),
          description: updates.description || null,
          quantity: updates.quantity,
          unit: updates.unit,
          location: updates.location || null,
          available_until: updates.available_until || null,
          category: updates.category || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      setIsEditDialogOpen(false);
      setEditingContribution(null);
      resetForm();
      toast({
        title: "Success",
        description: "Food contribution updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update food contribution",
        variant: "destructive",
      });
      console.error('Error updating contribution:', error);
    },
  });

  const contributeFromPantryMutation = useMutation({
    mutationFn: async (pantryItem: PantryItem) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .insert({
          contributor_id: userId,
          name: pantryItem.name,
          quantity: pantryItem.quantity,
          unit: pantryItem.unit,
          category: pantryItem.category,
          available_until: getTwoWeeksFromNow(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      toast({
        title: "Success",
        description: "Item contributed from pantry!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to contribute item",
        variant: "destructive",
      });
      console.error('Error contributing from pantry:', error);
    },
  });

  const stopContributionMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      const { error } = await supabase
        .from('food_contributions')
        .update({ status: 'unavailable' })
        .eq('id', contributionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      toast({
        title: "Success",
        description: "Contribution stopped successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to stop contribution",
        variant: "destructive",
      });
      console.error('Error stopping contribution:', error);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      quantity: 1,
      unit: "pieces",
      location: "",
      available_until: "",
      category: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContributionMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContribution) {
      updateContributionMutation.mutate({
        id: editingContribution.id,
        updates: formData
      });
    }
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setFormData(prev => ({ ...prev, available_until: getTwoWeeksFromNow() }));
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDialog = (contribution: FoodContribution) => {
    setEditingContribution(contribution);
    setFormData({
      name: contribution.name,
      description: contribution.description || "",
      quantity: contribution.quantity,
      unit: contribution.unit,
      location: contribution.location || "",
      available_until: contribution.available_until || "",
      category: contribution.category || "",
    });
    setIsEditDialogOpen(true);
  };

  const handlePantryItemSelect = (value: string) => {
    const selectedItem = pantryItems.find(item => item.id === value);
    if (selectedItem) {
      setFormData({
        name: selectedItem.name,
        description: "",
        quantity: selectedItem.quantity,
        unit: selectedItem.unit,
        location: "",
        available_until: getTwoWeeksFromNow(),
        category: selectedItem.category || "",
      });
    }
  };

  const handleStopContribution = (contributionId: string) => {
    stopContributionMutation.mutate(contributionId);
  };

  if (isLoading) {
    return <div>Loading food contributions...</div>;
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
                <Label htmlFor="pantry-select">Select from Pantry (Optional)</Label>
                <Select onValueChange={handlePantryItemSelect}>
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

              <div className="space-y-2">
                <Label htmlFor="name">Food Item Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the food..."
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
                <Label htmlFor="location">Pickup Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where can people pick this up?"
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Food Contribution</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Food Item Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about the food..."
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Pickup Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where can people pick this up?"
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
                {updateContributionMutation.isPending ? "Updating..." : "Update Contribution"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contributions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No food contributions available</p>
            <p className="text-sm text-muted-foreground">Be the first to share food with the community!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contributions.map((contribution) => (
            <Card key={contribution.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contribution.name}</CardTitle>
                    {contribution.category && (
                      <p className="text-sm text-muted-foreground capitalize">{contribution.category}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {contribution.contributor_id === userId && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditDialog(contribution)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-xs">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStopContribution(contribution.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          disabled={stopContributionMutation.isPending}
                        >
                          <StopCircle className="w-4 h-4" />
                          <span className="text-xs">Stop</span>
                        </Button>
                      </>
                    )}
                    {contribution.contributor_id !== userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const pantryItem = pantryItems.find(item => 
                            item.name.toLowerCase() === contribution.name.toLowerCase()
                          );
                          if (pantryItem) {
                            contributeFromPantryMutation.mutate(pantryItem);
                          }
                        }}
                        disabled={!pantryItems.some(item => 
                          item.name.toLowerCase() === contribution.name.toLowerCase()
                        )}
                        className="flex items-center gap-1"
                      >
                        <Share className="w-4 h-4" />
                        <span className="text-xs">Contribute</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{contribution.quantity} {contribution.unit}</p>
                  
                  {contribution.description && (
                    <p className="text-sm text-muted-foreground">{contribution.description}</p>
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
                  
                  <p className="text-xs text-muted-foreground">
                    Shared: {format(new Date(contribution.created_at), 'MMM dd, yyyy')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodContributions;
