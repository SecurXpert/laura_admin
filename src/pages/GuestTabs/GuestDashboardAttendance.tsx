import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface AttendanceRecord {
  id: number;
  guest_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  name: string;
  duration_hours: number;
  date: string;
  status: string;
}

export default function GuestDashboardAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const todayStr = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!token) {
        setAttendanceError("No authentication token found. Please log in again.");
        setAttendanceLoading(false);
        return;
      }

      setAttendanceLoading(true);
      setAttendanceError(null);

      try {
        const response = await api.get<AttendanceRecord[]>("/guest/attendance/admin/view-attendance", {
          params: { 
            from_date: fromDate,
            to_date: toDate
          }
        });
        const sortedData = [...(response.data || [])].sort((a: any, b: any) => b.id - a.id);
        setAttendance(sortedData);
      } catch (err: any) {
        console.error(err);
        setAttendanceError(err.response?.data?.detail || err.message || "Failed to load attendance records");
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendance();
  }, [token, fromDate, toDate]);

  const getDurationBadgeClass = (minutes: number) => {
    return minutes < 10 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700";
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const renderSkeleton = () => (
    <div className="space-y-4 mt-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      {/* Date Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-base font-semibold text-gray-800">Attendance Records</h2>
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
          <input 
            type="date" 
            value={fromDate} 
            max={todayStr}
            onChange={(e) => setFromDate(e.target.value)} 
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-500"
          />
          <span className="text-gray-400 text-xs font-medium">to</span>
          <input 
            type="date" 
            value={toDate} 
            max={todayStr}
            onChange={(e) => setToDate(e.target.value)} 
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5 bg-white text-gray-700 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {attendanceLoading ? (
        renderSkeleton()
      ) : attendanceError ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {attendanceError}
        </div>
      ) : attendance.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          No attendance records found for the selected dates.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="w-full bg-white text-left">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left text-sm">Guest</th>
                <th className="px-4 py-3 text-left text-sm">Date</th>
                <th className="px-4 py-3 text-left text-sm">Check-in</th>
                <th className="px-4 py-3 text-left text-sm">Check-out</th>
                <th className="px-4 py-3 text-left text-sm">Duration</th>
                <th className="px-4 py-3 text-left text-sm">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((record, index) => {
                const initials = record.name
                  ?.split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={record.id ?? index} className="border-b">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #615FFF 0%, #AD46FF 100%)",
                          }}
                        >
                          {initials}
                        </div>
                      </div>
                      {record.name}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">{record.date || "—"}</td>

                    <td className="px-4 py-4">{formatDateTime(record.check_in_time)}</td>

                    <td className="px-4 py-4">{record.check_out_time ? formatDateTime(record.check_out_time) : (record.check_in_time ? "In Progress" : "—")}</td>

                    <td className="px-4 py-4">
                      {(() => {
                        const durationMinutes = Math.round(Number(record.duration_hours || 0) * 60);
                        if (durationMinutes === 0 && (!record.check_in_time || !record.check_out_time)) return <span className="text-gray-400">—</span>;
                        return (
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getDurationBadgeClass(durationMinutes)}`}>
                            {durationMinutes} min
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        record.status?.toLowerCase() === 'present' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!attendanceLoading && attendance.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 mt-2">
          <p className="text-sm text-gray-500 mb-4 sm:mb-0">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, attendance.length)} of {attendance.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Previous
            </button>
            {Array.from({ length: Math.ceil(attendance.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(attendance.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(attendance.length / itemsPerPage)}
              className="px-3 py-1.5 rounded border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
