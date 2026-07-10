import React from "react";
import { BsCheckCircle } from "react-icons/bs";
import { HiOutlineClock } from "react-icons/hi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface QuizzesStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

export const QuizzesStatusModal: React.FC<QuizzesStatusModalProps> = ({
  open,
  onOpenChange,
  message,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-[28px] p-6 sm:p-8 max-w-[420px] border border-gray-100 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.15)] outline-none">
        <div className="flex flex-col items-center justify-center text-center">
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-full mb-5 ${
              message.includes("Approved")
                ? "bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30 text-white"
                : "bg-gradient-to-tr from-amber-500 to-orange-400 shadow-lg shadow-amber-500/30 text-white"
            }`}
          >
            {message.includes("Approved") ? (
              <BsCheckCircle className="text-3xl animate-pulse" />
            ) : (
              <HiOutlineClock className="text-3xl animate-pulse" />
            )}
          </div>

          <AlertDialogHeader className="flex flex-col items-center justify-center space-y-2 text-center sm:text-center w-full">
            <AlertDialogTitle className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight text-center w-full">
              Status Updated
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-[15px] font-medium text-[#6B7280] leading-relaxed text-center w-full">
              {message}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="mt-6 sm:mt-8 flex sm:justify-center w-full">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-[220px] h-11 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer border-none outline-none"
          >
            Done
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
