import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export interface PantryItemFormData {
  name: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  category: string;
}

const categories = [
  { value: "fruits", label: "Fruits" },
  { value: "vegetables", label: "Vegetables" },
  { value: "dairy", label: "Dairy" },
  { value: "meat", label: "Meat" },
  { value: "grains", label: "Grains" },
  { value: "spices", label: "Spices" },
  { value: "canned", label: "Canned Goods" },
  { value: "frozen", label: "Frozen" },
  { value: "other", label: "Other" },
];

function getTwoWeeksFromNow() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().split("T")[0];
}

interface PantryItemFormProps {
  onSubmit: (data: PantryItemFormData) => void;
  isPending: boolean;
}

const PantryItemForm = ({ onSubmit, isPending }: PantryItemFormProps) => {
  const [formData, setFormData] = useState<PantryItemFormData>({
    name: "",
    quantity: 1,
    unit: "pieces",
    expiry_date: getTwoWeeksFromNow(),
    category: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      quantity: 1,
      unit: "pieces",
      expiry_date: getTwoWeeksFromNow(),
      category: "",
    });
  };

  return (
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
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
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

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Adding..." : "Add Item"}
      </Button>
    </form>
  );
};

export default PantryItemForm;
