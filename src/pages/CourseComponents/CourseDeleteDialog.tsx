import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CourseDeleteDialogProps {
  deleteCourse: any | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const CourseDeleteDialog: React.FC<CourseDeleteDialogProps> = ({
  deleteCourse,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={!!deleteCourse} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Delete Course
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Are you sure you want to permanently delete{" "}
          <b className="text-gray-900 font-semibold">{deleteCourse?.title}</b>?
        </p>

        <div className="flex justify-end gap-2.5 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs sm:text-sm rounded-lg"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="text-xs sm:text-sm rounded-lg"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
