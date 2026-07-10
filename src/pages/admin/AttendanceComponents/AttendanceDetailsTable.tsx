import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";

interface AttendanceDetailsTableProps {
  paginatedAttendance: any[];
  studentAttendanceCount: number;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
}

export const AttendanceDetailsTable: React.FC<AttendanceDetailsTableProps> = ({
  paginatedAttendance,
  studentAttendanceCount,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-xl overflow-hidden border bg-white overflow-x-auto">
      <Table>
        {/* HEADER */}
        <TableHeader>
          <TableRow className="bg-[#F3F4F6]">
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Date
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Check In
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Check Out
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Duration
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Status
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Course Id
            </TableHead>
            <TableHead className="text-[#4A5565] font-semibold whitespace-nowrap">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        {/* BODY */}
        <TableBody className="bg-gray-50">
          {studentAttendanceCount === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No attendance records found for this student.
              </TableCell>
            </TableRow>
          )}
          {paginatedAttendance.map((record, index) => (
            <TableRow
              key={record.id || index}
              className="bg-white hover:bg-gray-100 transition rounded-lg"
            >
              {/* DATE */}
              <TableCell>
                <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                  <Calendar className="w-4 h-4 text-[#99A1AF]" />
                  {record.date
                    ? new Date(record.date).toLocaleDateString()
                    : "-"}
                </div>
              </TableCell>

              {/* CHECK-IN */}
              <TableCell>
                <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                  <Clock className="w-4 h-4 text-green-600" />
                  {record.check_in_time
                    ? new Date(record.check_in_time).toLocaleTimeString()
                    : "-"}
                </div>
              </TableCell>

              {/* CHECK-OUT */}
              <TableCell>
                <div className="flex items-center gap-2 font-medium text-gray-700 whitespace-nowrap">
                  <Clock className="w-4 h-4 text-red-600" />
                  {record.check_out_time
                    ? new Date(record.check_out_time).toLocaleTimeString()
                    : "-"}
                </div>
              </TableCell>

              {/* DURATION */}
              <TableCell>
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-sm font-semibold text-gray-800">
                    {record.duration_hours || 0}
                  </span>
                  <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          (parseFloat((record.duration_hours || 0).toString()) /
                            8) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </TableCell>

              {/* STATUS */}
              <TableCell className="font-medium">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    record.status?.toLowerCase() === "present"
                      ? "bg-green-100 text-green-700"
                      : record.status?.toLowerCase() === "absent"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {record.status || "UNKNOWN"}
                </span>
              </TableCell>

              <TableCell className="font-medium text-gray-700">
                {record.course_id}
              </TableCell>

              {/* ACTIONS */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-lg"
                    onClick={() => onEdit(record)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-600 hover:bg-red-100 rounded-lg"
                    onClick={() => onDelete(record.id as number)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
