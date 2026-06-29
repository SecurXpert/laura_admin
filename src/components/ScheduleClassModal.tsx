import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface ScheduleClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ScheduleClassModal = ({ isOpen, onClose, onSuccess }: ScheduleClassModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    scheduled_at: "",
    duration: "",
    join_link: "",
    recorded_link: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Assuming you have an API service configured. For now using fetch directly.
      const token = localStorage.getItem("token"); // or wherever you store it
      const response = await fetch("https://api.lauratek.com/admin/schedule-live-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course_id: parseInt(formData.course_id),
          title: formData.title,
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          duration: parseInt(formData.duration),
          join_link: formData.join_link,
          recorded_link: formData.recorded_link || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule class");
      }

      toast({
        title: "Success",
        description: "Class scheduled successfully",
      });
      if (onSuccess) onSuccess();
      onClose();
      setFormData({
        course_id: "",
        title: "",
        scheduled_at: "",
        duration: "",
        join_link: "",
        recorded_link: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule class. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[450px] p-0 bg-[#F8F9FE] border-none shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-[#F8F9FE] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <DialogTitle className="text-[#3B41E3] text-lg font-semibold">
            Schedule New class
          </DialogTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-200 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 bg-white m-4 mt-0 rounded-xl">
          <div className="space-y-2 pt-4">
            <Label htmlFor="course_id" className="text-sm font-medium text-gray-700">Course ID</Label>
            <Input
              id="course_id"
              name="course_id"
              type="number"
              required
              placeholder="Enter Course Id"
              value={formData.course_id}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">Title</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Enter Title"
              value={formData.title}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at" className="text-sm font-medium text-gray-700">Schedule Date& Time</Label>
            <Input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              required
              value={formData.scheduled_at}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1] text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              required
              placeholder="Enter duration in minutes"
              value={formData.duration}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="join_link" className="text-sm font-medium text-gray-700">Join Link</Label>
            <Input
              id="join_link"
              name="join_link"
              type="url"
              required
              placeholder="https://meet.google.com"
              value={formData.join_link}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recorded_link" className="text-sm font-medium text-gray-700">Recorded Link (optional)</Label>
            <Input
              id="recorded_link"
              name="recorded_link"
              type="url"
              placeholder="https://meet.google.com"
              value={formData.recorded_link}
              onChange={handleChange}
              className="bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-[#6366F1]"
            />
          </div>

          <div className="pt-4 pb-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white py-6 rounded-lg font-medium text-[16px] transition-colors"
            >
              {loading ? "Scheduling..." : "Schedule Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleClassModal;
