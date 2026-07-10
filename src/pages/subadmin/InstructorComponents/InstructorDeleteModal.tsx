import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Instructor } from "../InstructorPage";

interface Props {
  deleteInstructor: Instructor | null;
  setDeleteInstructor: (inst: Instructor | null) => void;
  confirmDelete: () => void;
}

export default function InstructorDeleteModal({
  deleteInstructor,
  setDeleteInstructor,
  confirmDelete,
}: Props) {
  return (
    <Dialog
      open={!!deleteInstructor}
      onOpenChange={() => setDeleteInstructor(null)}
    >
      <DialogContent className="w-[90vw] max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Delete Instructor
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mt-2">
          Are you sure you want to delete instructor record for{" "}
          <b className="text-gray-900">{deleteInstructor?.name}</b>? This action
          cannot be undone.
        </p>

        <div className="flex justify-end gap-2.5 sm:gap-3 mt-6 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteInstructor(null)}
            className="rounded-xl text-xs sm:text-sm h-9"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDelete}
            className="rounded-xl text-xs sm:text-sm h-9 bg-[#FF4047] hover:bg-[#e0353c]"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
