import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import PantryItemForm, { PantryItemFormData } from "./PantryItemForm";

interface AddPantryItemDialogProps {
  onAdd: (data: PantryItemFormData) => void;
  isPending: boolean;
}

const AddPantryItemDialog = ({
  onAdd,
  isPending,
}: AddPantryItemDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleOpen}>
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Pantry Item</DialogTitle>
        </DialogHeader>
        <PantryItemForm
          onSubmit={(data: PantryItemFormData) => {
            onAdd(data);
            handleClose();
          }}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPantryItemDialog;
