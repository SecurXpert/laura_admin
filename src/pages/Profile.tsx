import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  joinDate: string;
  avatar: string;
  department: string;
  employeeId: string;
}

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<AdminProfile>({
    name: "John Administrator",
    email: "admin@gmail.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    role: "Sub-Admin",
    joinDate: "January 2024",
    avatar: "",
    department: "Academic Management",
    employeeId: "EMP001"
  });

  const [editedProfile, setEditedProfile] = useState<AdminProfile>(profile);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleInputChange = (field: keyof AdminProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile</h1>
          <p className="text-muted-foreground">Manage your account information and settings</p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Overview */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentProfile.avatar} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {currentProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{currentProfile.name}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  {currentProfile.role}
                </Badge>
                <p className="text-sm text-muted-foreground">{currentProfile.department}</p>
                <p className="text-xs text-muted-foreground">ID: {currentProfile.employeeId}</p>
              </div>

              <Separator />

              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{currentProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{currentProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{currentProfile.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {currentProfile.joinDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={currentProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={currentProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={currentProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                {isEditing ? (
                  <Input
                    id="location"
                    value={currentProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={currentProfile.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                ) : (
                  <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{currentProfile.employeeId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Account Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-sm text-muted-foreground">Total Logins</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">23</div>
              <div className="text-sm text-muted-foreground">Quizzes Created</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">Attendance Records</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">System Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;