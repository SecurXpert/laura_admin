import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminQuizDeleteDialogProps {
  deletingId: number | null;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const AdminQuizDeleteDialog: React.FC<AdminQuizDeleteDialogProps> = ({
  deletingId,
  onClose,
  onConfirmDelete,
}) => {
  return (
    <AlertDialog open={!!deletingId} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All questions belonging to this quiz
            will also be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
