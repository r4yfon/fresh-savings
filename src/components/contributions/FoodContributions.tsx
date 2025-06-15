
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
import { Plus, MapPin, Calendar, Users } from "lucide-react";
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

interface FoodContributionsProps {
  userId: string;
}

const FoodContributions = ({ userId }: FoodContributionsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    unit: "piece",
    location: "",
    available_until: "",
    category: "",
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

  const addContributionMutation = useMutation({
    mutationFn: async (newContribution: typeof formData) => {
      const { data, error } = await supabase
        .from('food_contributions')
        .insert({
          contributor_id: userId,
          name: newContribution.name,
          description: newContribution.description || null,
          quantity: newContribution.quantity,
          unit: newContribution.unit,
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
      queryClient.invalidateQueries({ queryKey: ['my-contributions'] });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        quantity: 1,
        unit: "piece",
        location: "",
        available_until: "",
        category: "",
      });
      toast({
        title: "Success",
        description: "Food contribution added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add food contribution",
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
    addContributionMutation.mutate(formData);
  };

  const handleClaim = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'claimed' });
  };

  const handleMarkAsExpired = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'expired' });
  };

  if (isLoading) {
    return <div>Loading food contributions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Food Sharing</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Any additional details..."
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
                      <SelectItem value="package">Package</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where can people pick this up?"
                />
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
                    <SelectItem value="canned">Canned Goods</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <Button type="submit" className="w-full" disabled={addContributionMutation.isPending}>
                {addContributionMutation.isPending ? "Sharing..." : "Share Food"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
