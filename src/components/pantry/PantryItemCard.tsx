import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PantryItem } from "@/types/pantry";
import { format } from "date-fns";
import { Calendar, HelpCircle, Trash2 } from "lucide-react";

interface PantryItemCardProps {
  item: PantryItem;
  isManageMode: boolean;
  isSelected: boolean;
  categoryIcons: Record<string, React.ComponentType<{ className?: string }>>;
  onDelete: (id: string) => void;
  onSelect: (id: string, checked: boolean) => void;
  onCardClick: (id: string) => void;
  isExpiringSoon: (expiryDate: string | null) => boolean;
}

const PantryItemCard = ({
  item,
  isManageMode,
  isSelected,
  categoryIcons,
  onDelete,
  onSelect,
  onCardClick,
  isExpiringSoon,
}: PantryItemCardProps) => {
  const IconComponent =
    categoryIcons[item.category as keyof typeof categoryIcons] || HelpCircle;

  return (
    <Card
      className={`
        ${isExpiringSoon(item.expiry_date) ? "border-red-500" : ""}
        ${isManageMode ? "cursor-pointer hover:bg-muted/50" : ""}
        ${isSelected ? "ring-2 ring-primary" : ""}
        relative
      `}
      onClick={() => onCardClick(item.id)}>
      <CardContent className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}>
          <Trash2 size={18} />
        </Button>
        <div className="flex flex-col items-start text-left space-y-3">
          <IconComponent className="w-9 h-9 text-muted-foreground" />
          <div className="flex items-center justify-between w-full pr-12">
            <div className="flex items-center gap-2">
              {isManageMode && (
                <Checkbox
                  id={`item-${item.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onSelect(item.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
              </div>
            </div>
          </div>
          <div className="w-full">
            <p className="text-sm text-muted-foreground">
              {item.category
                ? `${
                    item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)
                  } · `
                : ""}
              {item.quantity} {item.unit}
            </p>
          </div>
          <div className="space-y-1 w-full">
            {item.expiry_date && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  isExpiringSoon(item.expiry_date)
                    ? "text-red-600"
                    : "text-muted-foreground"
                }`}>
                <Calendar className="w-3 h-3" />
                <span>
                  Expires: {format(new Date(item.expiry_date), "dd MMM yyyy")}
                </span>
              </div>
            )}
            {isExpiringSoon(item.expiry_date) && (
              <p className="text-xs text-red-600 font-medium">
                ⚠️ Expiring soon!
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PantryItemCard;
