import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Apple,
  Beef,
  Carrot,
  HelpCircle,
  Milk,
  Package,
  Package2,
  Settings,
  Sigma,
  Snowflake,
  Trash2,
  Utensils,
  Wheat,
} from "lucide-react";
import { useState } from "react";
import AddPantryItemDialog from "./AddPantryItemDialog";
import PantryItemCard from "./PantryItemCard";
import { PantryItemFormData } from "./PantryItemForm";

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  category: string | null;
  created_at: string;
}

interface PantryManagerProps {
  userId: string;
}

const categoryIcons = {
  fruits: Apple,
  vegetables: Carrot,
  dairy: Milk,
  meat: Beef,
  grains: Wheat,
  spices: Utensils,
  canned: Package2,
  frozen: Snowflake,
  other: HelpCircle,
};

const categories = [
  { value: "all", label: "All Categories", icon: Sigma },
  { value: "fruits", label: "Fruits", icon: Apple },
  { value: "vegetables", label: "Vegetables", icon: Carrot },
  { value: "dairy", label: "Dairy", icon: Milk },
  { value: "meat", label: "Meat", icon: Beef },
  { value: "grains", label: "Grains", icon: Wheat },
  { value: "spices", label: "Spices", icon: Utensils },
  { value: "canned", label: "Canned Goods", icon: Package2 },
  { value: "frozen", label: "Frozen", icon: Snowflake },
  { value: "other", label: "Other", icon: HelpCircle },
];

const PantryManager = ({ userId }: PantryManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isManageMode, setIsManageMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PantryItem[];
    },
  });

  const addItemMutation = useMutation({
    mutationFn: async (newItem: PantryItemFormData) => {
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
      toast({
        title: "Success",
        description: "Item added to pantry!",
      });
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

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry-items"] });
      toast({
        title: "Success",
        description: "Item removed from pantry!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (itemIds: string[]) => {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .in("id", itemIds);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry-items"] });
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Selected items removed from pantry!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove selected items",
        variant: "destructive",
      });
    },
  });

  const clearPantryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("pantry_items")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pantry-items"] });
      setSelectedItems([]);
      toast({
        title: "Success",
        description: "Pantry cleared successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear pantry",
        variant: "destructive",
      });
    },
  });

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleCardClick = (itemId: string) => {
    if (isManageMode) {
      const isSelected = selectedItems.includes(itemId);
      handleItemSelection(itemId, !isSelected);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredPantryItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0) {
      bulkDeleteMutation.mutate(selectedItems);
    }
  };

  const handleClearPantry = () => {
    clearPantryMutation.mutate();
  };

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000,
    );
    return expiry <= threeDaysFromNow;
  };

  // Filter pantry items based on category
  const filteredPantryItems = pantryItems.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  if (isLoading) {
    return <div>Loading pantry items...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Pantry</h2>
        <div className="flex gap-2">
          {pantryItems.length > 0 && (
            <>
              <Button
                variant={isManageMode ? "default" : "outline"}
                className={
                  isManageMode ? "bg-green-600 hover:bg-green-700" : ""
                }
                onClick={() => setIsManageMode(!isManageMode)}>
                <Settings className="w-4 h-4" />
                {isManageMode ? "Pantry Tidied" : "Manage Pantry"}
              </Button>
              {isManageMode && selectedItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={bulkDeleteMutation.isPending}>
                      <Trash2 size={18} />
                      Delete Selected ({selectedItems.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedItems.length}{" "}
                        selected item(s)? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          <AddPantryItemDialog
            onAdd={(data) => addItemMutation.mutate(data)}
            isPending={addItemMutation.isPending}
          />
        </div>
      </div>

      {/* Category Filter and Select All */}
      {pantryItems.length > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Label>Filter by Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {isManageMode && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.length === filteredPantryItems.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">
                Select All ({filteredPantryItems.length} items)
              </Label>
            </div>
          )}
        </div>
      )}

      {pantryItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Your pantry is empty</p>
            <p className="text-sm text-muted-foreground">
              Add some items to get started!
            </p>
          </CardContent>
        </Card>
      ) : filteredPantryItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No items in this category</p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different category or add some items!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPantryItems.map((item) => (
            <PantryItemCard
              key={item.id}
              item={item}
              isManageMode={isManageMode}
              isSelected={selectedItems.includes(item.id)}
              categoryIcons={categoryIcons}
              onDelete={deleteItemMutation.mutate}
              onSelect={handleItemSelection}
              onCardClick={handleCardClick}
              isExpiringSoon={isExpiringSoon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PantryManager;
//                     className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteItemMutation.mutate(item.id);
//                     }}
//                     disabled={deleteItemMutation.isPending}>
//                     <Trash2 size={18} />
//                   </Button>

//                   <div className="flex flex-col items-start text-left space-y-3">
//                     {/* Icon at top when not in manage mode */}
//                     {!isManageMode && (
//                       <IconComponent className="w-9 h-9 text-muted-foreground" />
//                     )}

//                     {/* Item name with checkbox in manage mode */}
//                     <div className="flex items-center justify-between w-full pr-12">
//                       <div className="flex items-center gap-2">
//                         {isManageMode && (
//                           <Checkbox
//                             id={`item-${item.id}`}
//                             checked={selectedItems.includes(item.id)}
//                             onCheckedChange={(checked) =>
//                               handleItemSelection(item.id, checked as boolean)
//                             }
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         )}
//                         <div className="space-y-1">
//                           <h3 className="font-semibold text-lg">{item.name}</h3>
//                         </div>
//                       </div>
//                       {isManageMode && (
//                         <IconComponent className="w-6 h-6 text-muted-foreground" />
//                       )}
//                     </div>

//                     {/* Category and quantity info - not shifted in manage mode */}
//                     <div className="w-full">
//                       <p className="text-sm text-muted-foreground">
//                         {item.category
//                           ? `${
//                               item.category.charAt(0).toUpperCase() +
//                               item.category.slice(1)
//                             } · `
//                           : ""}
//                         {item.quantity} {item.unit}
//                       </p>
//                     </div>

//                     {/* Additional info */}
//                     <div className="space-y-1 w-full">
//                       {item.expiry_date && (
//                         <div
//                           className={`flex items-center gap-1 text-xs ${
//                             isExpiringSoon(item.expiry_date)
//                               ? "text-red-600"
//                               : "text-muted-foreground"
//                           }`}>
//                           <Calendar className="w-3 h-3" />
//                           <span>
//                             Expires:{" "}
//                             {format(new Date(item.expiry_date), "MMM dd, yyyy")}
//                           </span>
//                         </div>
//                       )}
//                       {isExpiringSoon(item.expiry_date) && (
//                         <p className="text-xs text-red-600 font-medium">
//                           ⚠️ Expiring soon!
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PantryManager;
//                 onCheckedChange={handleSelectAll}
//               />
//               <Label htmlFor="select-all" className="text-sm font-medium">
//                 Select All ({filteredPantryItems.length} items)
//               </Label>
//             </div>
//           )}
//         </div>
//       )}

//       {pantryItems.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-8">
//             <p className="text-muted-foreground">Your pantry is empty</p>
//             <p className="text-sm text-muted-foreground">
//               Add some items to get started!
//             </p>
//           </CardContent>
//         </Card>
//       ) : filteredPantryItems.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-8">
//             <Package className="w-12 h-12 text-muted-foreground mb-4" />
//             <p className="text-muted-foreground">No items in this category</p>
//             <p className="text-sm text-muted-foreground">
//               Try selecting a different category or add some items!
//             </p>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredPantryItems.map((item) => (
//             <PantryItemCard
//               key={item.id}
//               item={item}
//               isManageMode={isManageMode}
//               isSelected={selectedItems.includes(item.id)}
//               categoryIcons={categoryIcons}
//               onDelete={deleteItemMutation.mutate}
//               onSelect={handleItemSelection}
//               onCardClick={handleCardClick}
//               isExpiringSoon={isExpiringSoon}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PantryManager;
//                     className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       deleteItemMutation.mutate(item.id);
//                     }}
//                     disabled={deleteItemMutation.isPending}>
//                     <Trash2 size={18} />
//                   </Button>

//                   <div className="flex flex-col items-start text-left space-y-3">
//                     {/* Icon at top when not in manage mode */}
//                     {!isManageMode && (
//                       <IconComponent className="w-9 h-9 text-muted-foreground" />
//                     )}

//                     {/* Item name with checkbox in manage mode */}
//                     <div className="flex items-center justify-between w-full pr-12">
//                       <div className="flex items-center gap-2">
//                         {isManageMode && (
//                           <Checkbox
//                             id={`item-${item.id}`}
//                             checked={selectedItems.includes(item.id)}
//                             onCheckedChange={(checked) =>
//                               handleItemSelection(item.id, checked as boolean)
//                             }
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         )}
//                         <div className="space-y-1">
//                           <h3 className="font-semibold text-lg">{item.name}</h3>
//                         </div>
//                       </div>
//                       {isManageMode && (
//                         <IconComponent className="w-6 h-6 text-muted-foreground" />
//                       )}
//                     </div>

//                     {/* Category and quantity info - not shifted in manage mode */}
//                     <div className="w-full">
//                       <p className="text-sm text-muted-foreground">
//                         {item.category
//                           ? `${
//                               item.category.charAt(0).toUpperCase() +
//                               item.category.slice(1)
//                             } · `
//                           : ""}
//                         {item.quantity} {item.unit}
//                       </p>
//                     </div>

//                     {/* Additional info */}
//                     <div className="space-y-1 w-full">
//                       {item.expiry_date && (
//                         <div
//                           className={`flex items-center gap-1 text-xs ${
//                             isExpiringSoon(item.expiry_date)
//                               ? "text-red-600"
//                               : "text-muted-foreground"
//                           }`}>
//                           <Calendar className="w-3 h-3" />
//                           <span>
//                             Expires:{" "}
//                             {format(new Date(item.expiry_date), "MMM dd, yyyy")}
//                           </span>
//                         </div>
//                       )}
//                       {isExpiringSoon(item.expiry_date) && (
//                         <p className="text-xs text-red-600 font-medium">
//                           ⚠️ Expiring soon!
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PantryManager;
