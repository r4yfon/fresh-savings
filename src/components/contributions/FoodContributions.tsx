
import { useState, useEffect } from "react";
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
import { Plus, MapPin, Calendar, Users, Check, Share2 } from "lucide-react";
import { format } from "date-fns";

interface FoodContribution {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string | null;
  description: string | null;
  location: string | null;
  available_until: string | null;
  status: string;
  created_at: string;
  contributor_id: string;
}

interface FoodContributionsProps {
  userId: string;
}

const FoodContributions = ({ userId }: FoodContributionsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    quantity: 1,
    unit: "pieces",
    category: "",
    description: "",
    location: "",
    available_until: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-fill available_until date to 1 week from now
  const getOneWeekFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  // Capitalize input function
  const capitalizeWords = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

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
          category: newContribution.category || null,
          description: newContribution.description || null,
          location: newContribution.location || null,
          available_until: newContribution.available_until || null,
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
      setFormData({
        name: "",
        quantity: 1,
        unit: "pieces",
        category: "",
        description: "",
        location: "",
        available_until: "",
      });
      toast({
        title: "Success",
        description: "Food item shared with the community!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to share food item",
        variant: "destructive",
      });
      console.error('Error adding contribution:', error);
    },
  });

  const collectContributionMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      console.info('Attempting to collect contribution:', contributionId);
      const { data, error } = await supabase
        .from('food_contributions')
        .update({ status: 'collected' })
        .eq('id', contributionId)
        .select()
        .single();
      
      if (error) {
        console.error('Error collecting contribution:', error);
        throw error;
      }
      console.info('Successfully collected contribution:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions'] });
      toast({
        title: "Success",
        description: "Food item collected successfully!",
      });
    },
    onError: (error) => {
      console.error('Collect mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to collect food item",
        variant: "destructive",
      });
    },
  });

  const stopSharingMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      console.info('handleStopSharing called with contributionId:', contributionId);
      console.info('Attempting to stop sharing contribution:', contributionId);
      const { data, error } = await supabase
        .from('food_contributions')
        .update({ status: 'unavailable' })
        .eq('id', contributionId)
        .eq('contributor_id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error stopping sharing:', error);
        throw error;
      }
      console.info('Successfully stopped sharing contribution:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions'] });
      toast({
        title: "Success",
        description: "Stopped sharing food item",
      });
    },
    onError: (error) => {
      console.error('Stop sharing mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to stop sharing food item",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContributionMutation.mutate(formData);
  };

  const handleCollectItem = (contributionId: string) => {
    collectContributionMutation.mutate(contributionId);
  };

  const handleStopSharing = (contributionId: string) => {
    stopSharingMutation.mutate(contributionId);
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      quantity: 1,
      unit: "pieces",
      category: "",
      description: "",
      location: "",
      available_until: getOneWeekFromNow(),
    });
    setIsAddDialogOpen(true);
  };

  if (isLoading) {
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
                <Label htmlFor="name">Food Item Name</Label>
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
                      <SelectItem value="servings">Servings</SelectItem>
                      <SelectItem value="portions">Portions</SelectItem>
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
                    <SelectItem value="prepared">Prepared Food</SelectItem>
                    <SelectItem value="baked">Baked Goods</SelectItem>
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
                {addContributionMutation.isPending ? "Sharing..." : "Share with Community"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Available Contributions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Food Items</h3>
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
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-lg">{contribution.name}</h4>
                      
                      {/* Updated layout: Category · Quantity */}
                      <p className="text-sm text-muted-foreground">
                        {contribution.category ? `${contribution.category.charAt(0).toUpperCase() + contribution.category.slice(1)} · ` : ''}
                        {contribution.quantity} {contribution.unit}
                      </p>

                      {contribution.description && (
                        <p className="text-sm">{contribution.description}</p>
                      )}

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

                      {/* Added icon for shared date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Share2 className="w-3 h-3" />
                        <span>Shared: {format(new Date(contribution.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    {/* Only show collect button for items not contributed by current user */}
                    {contribution.contributor_id !== userId && (
                      <Button
                        size="sm"
                        onClick={() => handleCollectItem(contribution.id)}
                        disabled={collectContributionMutation.isPending}
                        className="bg-green-700 hover:bg-green-800 ml-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Collect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Contributions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">My Shared Items</h3>
        {myContributions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground">You haven't shared any items yet</p>
              <p className="text-sm text-muted-foreground">Share food with your community to help reduce waste!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myContributions.map((contribution) => (
              <Card key={contribution.id} className={contribution.status === 'collected' ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-lg">{contribution.name}</h4>
                      
                      {/* Updated layout: Category · Quantity */}
                      <p className="text-sm text-muted-foreground">
                        {contribution.category ? `${contribution.category.charAt(0).toUpperCase() + contribution.category.slice(1)} · ` : ''}
                        {contribution.quantity} {contribution.unit}
                      </p>

                      {contribution.description && (
                        <p className="text-sm">{contribution.description}</p>
                      )}

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

                      {/* Added icon for shared date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Share2 className="w-3 h-3" />
                        <span>Shared: {format(new Date(contribution.created_at), 'MMM dd, yyyy')}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-medium">
                        <span className={`
                          ${contribution.status === 'available' ? 'text-green-600' : ''}
                          ${contribution.status === 'collected' ? 'text-blue-600' : ''}
                          ${contribution.status === 'unavailable' ? 'text-gray-600' : ''}
                        `}>
                          Status: {contribution.status === 'collected' ? 'Item Collected' : contribution.status}
                        </span>
                      </div>
                    </div>

                    {/* Show stop sharing button only for available items */}
                    {contribution.status === 'available' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopSharing(contribution.id)}
                        disabled={stopSharingMutation.isPending}
                        className="ml-4"
                      >
                        Stop Sharing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodContributions;
