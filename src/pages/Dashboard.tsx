import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Phone, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SubAdminDialog = ({ open, setOpen, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch('https://lauratek.in:8000/admin/create-subadmin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create sub-admin: ${response.status} - ${errorText}`);
      }

      onSubmit();
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Sub Admin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Add Sub Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const JobDialog = ({ open, setOpen, onSubmit }) => {
  const [formData, setFormData] = useState({
    company_name: "",
    designation: "",
    salary: "",
    experience: "",
    location: "",
    url: "",
    icon_link: ""
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please sign in.');
      }

      const response = await fetch('https://lauratek.in:8000/company/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create job: ${response.status} - ${errorText}`);
      }

      onSubmit();
      setFormData({
        company_name: "",
        designation: "",
        salary: "",
        experience: "",
        location: "",
        url: "",
        icon_link: ""
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Enter experience required"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="Enter job URL"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon_link">Icon Link</Label>
              <Input
                id="icon_link"
                name="icon_link"
                type="url"
                value={formData.icon_link}
                onChange={handleChange}
                placeholder="Enter icon URL"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Add Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Dashboard = () => {
  const [contacts, setContacts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [isLoadingSubAdmins, setIsLoadingSubAdmins] = useState(true);
  const [errorContacts, setErrorContacts] = useState(null);
  const [errorCandidates, setErrorCandidates] = useState(null);
  const [errorSubAdmins, setErrorSubAdmins] = useState(null);
  const [isSubAdminDialogOpen, setIsSubAdminDialogOpen] = useState(false);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);

  // Mock stats data
  const stats = [
    {
      title: "Total Contacts",
      value: "1,234",
      icon: Phone,
      color: "from-primary to-blue-600",
    },
    {
      title: "Registered Candidates",
      value: "856",
      icon: UserCheck,
      color: "from-success to-green-600",
    },
  ];

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('https://lauratek.in:8000/enrollments/admin_view/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token');
          }
          throw new Error(`Failed to fetch contacts: ${response.statusText}`);
        }

        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setErrorContacts(err.message);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    fetchContacts();
  }, []);

  // Fetch candidates from API
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('https://lauratek.in:8000/guest/admin/view-guest-profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token');
          }
          throw new Error(`Failed to fetch candidates: ${response.statusText}`);
        }

        const data = await response.json();
        setCandidates(data);
      } catch (err) {
        setErrorCandidates(err.message);
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  // Fetch sub-admins from API
  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('https://lauratek.in:8000/admin/list-of-sbuadmins', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized: Invalid or expired token');
          }
          throw new Error(`Failed to fetch sub-admins: ${response.statusText}`);
        }

        const data = await response.json();
        setSubAdmins(data);
      } catch (err) {
        setErrorSubAdmins(err.message);
      } finally {
        setIsLoadingSubAdmins(false);
      }
    };

    fetchSubAdmins();
  }, []);

  const handleAddSubAdmin = () => {
    setIsSubAdminDialogOpen(true);
  };

  const handleSubAdminSubmit = () => {
    setIsSubAdminDialogOpen(false);
    const fetchSubAdmins = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No authentication token found. Please sign in.');
        }

        const response = await fetch('https://lauratek.in:8000/admin/list-of-sbuadmins', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch sub-admins: ${response.statusText}`);
        }

        const data = await response.json();
        setSubAdmins(data);
      } catch (err) {
        setErrorSubAdmins(err.message);
      }
    };

    fetchSubAdmins();
  };

  const handleAddJob = () => {
    setIsJobDialogOpen(true);
  };

  const handleJobSubmit = () => {
    setIsJobDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your course platform overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.title === "Total Contacts" ? contacts.length : 
                   stat.title === "Registered Candidates" ? candidates.length : 
                   stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contacts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Recent Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingContacts && <p>Loading contacts...</p>}
            {errorContacts && <p className="text-red-500">Error: {errorContacts}</p>}
            {!isLoadingContacts && !errorContacts && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Year of Passed Out</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {contact.mobile_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                      </TableCell>
                      <TableCell>{contact.year_of_passedout}</TableCell>
                      <TableCell>{contact.qualification}</TableCell>
                      <TableCell>{contact.city}</TableCell>
                      <TableCell>{new Date(contact.submitted_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Recent Registrations
              </CardTitle>
              
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingCandidates && <p>Loading candidates...</p>}
            {errorCandidates && <p className="text-red-500">Error: {errorCandidates}</p>}
            {!isLoadingCandidates && !errorCandidates && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Passed Out Year</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate, index) => (
                    <TableRow key={candidate.id || index}>
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {candidate.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {candidate.email}
                        </div>
                      </TableCell>
                      <TableCell>{candidate.qualification}</TableCell>
                      <TableCell>{candidate.passedout_year}</TableCell>
                      <TableCell>{candidate.city}</TableCell>
                      <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Button
                variant="outline"
                size="sm"
                onClick={handleAddJob}
              >
                Add Job
              </Button>
      </div>

      {/* Sub-Admins Section */}
      <div className="space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddSubAdmin}
        >
          Add Sub Admin
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Sub-Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSubAdmins && <p>Loading sub-admins...</p>}
            {errorSubAdmins && <p className="text-red-500">Error: {errorSubAdmins}</p>}
            {!isLoadingSubAdmins && !errorSubAdmins && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subAdmins.map((subAdmin, index) => (
                    <TableRow key={subAdmin.email || index}>
                      <TableCell className="font-medium">{subAdmin.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {subAdmin.email}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <SubAdminDialog
        open={isSubAdminDialogOpen}
        setOpen={setIsSubAdminDialogOpen}
        onSubmit={handleSubAdminSubmit}
      />
      <JobDialog
        open={isJobDialogOpen}
        setOpen={setIsJobDialogOpen}
        onSubmit={handleJobSubmit}
      />
    </div>
  );
};

export default Dashboard;