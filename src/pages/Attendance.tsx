import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Search, Download } from "lucide-react";

interface AttendanceRecord {
  id: number;
  guest_id: number;
  check_in_time: string;
  check_out_time: string;
  name: string | null; // Allow name to be null
  duration_hours: number;
}

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('https://lauratek.in:8000/guest/attendance/admin/view-attendance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token');
          }
          throw new Error(`Failed to fetch attendance data: ${response.statusText}`);
        }

        const data: AttendanceRecord[] = await response.json();
        // Log any records with missing name for debugging
        data.forEach(record => {
          if (!record.name) {
            console.warn(`Record with ID ${record.id} has missing or null name`);
          }
        });
        setAttendanceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error("Error fetching attendance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const filteredData = attendanceData.filter(record =>
    // Check if name exists and is a string before applying toLowerCase
    record.name && typeof record.name === 'string' 
      ? record.name.toLowerCase().includes(searchTerm.toLowerCase())
      : false // Exclude records with null/undefined name from search
  );

  const getStatusColor = (duration: number) => {
    if (duration === 0) return "bg-destructive/10 text-destructive";
    return duration > 0 ? "bg-success/10 text-success" : "bg-warning/10 text-warning";
  };

  const handleExportAttendance = () => {
    const csvContent = [
      ["Name", "Date", "Check-in Time", "Check-out Time", "Duration (hours)"],
      ...filteredData.map(record => [
        record.name || 'Unknown', // Fallback for null/undefined name
        new Date(record.check_in_time).toLocaleDateString(),
        new Date(record.check_in_time).toLocaleTimeString(),
        new Date(record.check_out_time).toLocaleTimeString(),
        record.duration_hours.toString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const totalRecords = filteredData.length;
  const presentCount = filteredData.filter(r => r.duration_hours > 0).length;
  const absentCount = filteredData.filter(r => r.duration_hours === 0).length;
  const totalDuration = filteredData.reduce((sum, r) => sum + r.duration_hours, 0);
  const averageDuration = totalRecords > 0 ? Math.round(totalDuration / totalRecords) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">Track and manage guest attendance</p>
      </div>

      {isLoading && <div>Loading...</div>}
      {error && (
        <div className="text-destructive">
          {error}
          {error.includes('token') && (
            <p>
              <a href="/login" className="underline">Click here to sign in</a>
            </p>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <div className="w-3 h-3 rounded-full bg-success"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{presentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{absentCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDuration} hrs</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by guest name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleExportAttendance} variant="outline" className="flex items-center kiedy gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Attendance Records ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Check-out Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
           <TableBody>
  {filteredData.map((record) => {
    // Initialize variables for date and time
    let dateIST = 'N/A';
    let checkInIST = 'N/A';
    let checkOutIST = 'N/A';

    // Parse check-in time if it exists
    if (record.check_in_time) {
      const checkInDate = new Date(record.check_in_time + 'Z');
      dateIST = checkInDate.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
      checkInIST = checkInDate.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }

    // Parse check-out time if it exists
    if (record.check_out_time) {
      const checkOutDate = new Date(record.check_out_time + 'Z');
      checkOutIST = checkOutDate.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    }

    // Return the TableRow component
    return (
      <TableRow key={record.id}>
        <TableCell className="font-medium">{record.name || 'Unknown'}</TableCell>
        <TableCell>{dateIST}</TableCell>
        <TableCell>{checkInIST}</TableCell>
        <TableCell>{checkOutIST}</TableCell>
        <TableCell>{record.duration_hours} hrs</TableCell>
      </TableRow>
    );
  })}
</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;