import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface AttendanceDetailsHeaderProps {
  studentName: string;
  onBack: () => void;
}

export const AttendanceDetailsHeader: React.FC<AttendanceDetailsHeaderProps> = ({
  studentName,
  onBack,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button
        variant="outline"
        size="icon"
        onClick={onBack}
        className="rounded-full shadow-sm hover:bg-gray-100"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </Button>
      <div>
        <h1 className="text-2xl font-semibold text-[#1F2937]">
          Attendance Details
        </h1>
        <h3 className="text-sm text-gray-500">
          View full attendance history for {studentName}
        </h3>
      </div>
    </div>
  );
};
