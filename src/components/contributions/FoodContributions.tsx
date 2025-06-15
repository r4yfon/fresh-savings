
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, MapPin, Calendar, Package } from "lucide-react";
import { format } from "date-fns";

interface FoodContribution {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  available_until: string | null;
  quantity: number | null;
  is_active: boolean | null;
  created_at: string;
  user_id: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

interface FoodContributionsProps {
  userId: string;
}

const FoodContributions = ({ userId }: FoodContributionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contributions = [], isLoading } = useQuery({
    queryKey: ['food-contributions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_contributions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('is_active', true)
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const stopSharingMutation = useMutation({
    mutationFn: async (contributionId: string) => {
      const { error } = await supabase
        .from('food_contributions')
        .update({ is_active: false })
        .eq('id', contributionId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-contributions', userId] });
      toast({
        title: "Success",
        description: "Food contribution removed from sharing.",
      });
    },
    onError: (error) => {
      console.error('Stop sharing error:', error);
      toast({
        title: "Error",
        description: "Failed to stop sharing. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStopSharing = (contributionId: string) => {
    stopSharingMutation.mutate(contributionId);
  };

  const isExpiringSoon = (availableUntil: string | null) => {
    if (!availableUntil) return false;
    const expiry = new Date(availableUntil);
    const now = new Date();
    const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  const isExpired = (availableUntil: string | null) => {
    if (!availableUntil) return false;
    return new Date(availableUntil) <= new Date();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Community Kitchen</h1>
            <p className="text-muted-foreground">Share and discover food in your community</p>
          </div>
        </div>
      </div>

      {/* My Contributions */}
      {myContributions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Shared Food</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myContributions.map((contribution) => (
              <Card key={contribution.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{contribution.title}</CardTitle>
                    <div className="flex items-center gap-1">
                      {contribution.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contribution.description && (
                    <p className="text-sm text-muted-foreground">{contribution.description}</p>
                  )}
                  
                  {contribution.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{contribution.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Quantity: {contribution.quantity || 1}</span>
                  </div>
                  
                  {contribution.available_until && (
                    <div className={`flex items-center gap-1 text-sm ${
                      isExpired(contribution.available_until) 
                        ? 'text-red-600' 
                        : isExpiringSoon(contribution.available_until) 
                          ? 'text-orange-600' 
                          : 'text-muted-foreground'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        Available until: {format(new Date(contribution.available_until), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}

                  {contribution.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopSharing(contribution.id)}
                      disabled={stopSharingMutation.isPending}
                    >
                      {stopSharingMutation.isPending ? "Stopping..." : "Stop Sharing"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Food */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Food in Community</h2>
        {contributions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No food contributions available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-2">Check back later or be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributions
              .filter(contribution => contribution.user_id !== userId)
              .map((contribution) => (
              <Card key={contribution.id} className={`${
                contribution.available_until && isExpired(contribution.available_until) ? 'opacity-60' : ''
              }`}>
                <CardHeader>
                  <CardTitle className="text-lg">{contribution.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Shared by {contribution.profiles?.full_name || 'Anonymous'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {contribution.description && (
                    <p className="text-sm text-muted-foreground">{contribution.description}</p>
                  )}
                  
                  {contribution.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{contribution.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>Quantity: {contribution.quantity || 1}</span>
                  </div>
                  
                  {contribution.available_until && (
                    <div className={`flex items-center gap-1 text-sm ${
                      isExpired(contribution.available_until) 
                        ? 'text-red-600' 
                        : isExpiringSoon(contribution.available_until) 
                          ? 'text-orange-600' 
                          : 'text-muted-foreground'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      <span>
                        Available until: {format(new Date(contribution.available_until), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}

                  {contribution.available_until && isExpired(contribution.available_until) && (
                    <Badge variant="destructive" className="w-fit">
                      Expired
                    </Badge>
                  )}

                  {contribution.available_until && isExpiringSoon(contribution.available_until) && !isExpired(contribution.available_until) && (
                    <Badge variant="outline" className="w-fit border-orange-500 text-orange-600">
                      Expiring Soon
                    </Badge>
                  )}
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
