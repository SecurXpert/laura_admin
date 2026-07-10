import React, { useState, useRef } from "react";
import { Quiz } from "./Quizzes";
import { Upload, Info, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

interface BulkUploadQuestionModalProps {
  quizzes: Quiz[];
  onClose: () => void;
}

const BulkUploadQuestionModal: React.FC<BulkUploadQuestionModalProps> = ({ quizzes, onClose }) => {
  const [bulkQuizId, setBulkQuizId] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a .csv file");
      return;
    }
    setCsvFile(selected);
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkQuizId) {
      toast({
        title: "Validation Error",
        description: "Please select a quiz",
        variant: "destructive",
      });
      return;
    }
    if (!csvFile) {
      toast({
        title: "Validation Error",
        description: "Please choose a CSV file",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("quiz_id", bulkQuizId);
    formData.append("file", csvFile);

    try {
      const token = getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/subadmin/upload-mcq-csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || "Failed to upload CSV");
      }

      toast({
        title: "Success",
        description: "Bulk Uploaded Successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });
      onClose();
    } catch (error: any) {
      console.error("Failed to bulk upload:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to bulk upload",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      {/* HEADER */}
      <div className="sticky -top-4 sm:-top-6 md:-top-8 z-30 bg-[#F8FAFC] py-4 border-b border-gray-200/60 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 pt-4 sm:pt-6 md:pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
            Bulk Upload CSV
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Upload multiple questions via CSV file
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={handleBulkUpload}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md text-sm font-medium rounded-xl px-6 py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle>Upload Details</CardTitle>
              <CardDescription>Select the target quiz and select the CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QUIZ SELECT */}
              <div>
                <Label>Select Quiz *</Label>
                <Select value={bulkQuizId} onValueChange={setBulkQuizId}>
                  <SelectTrigger className="mt-1.5 bg-white">
                    <SelectValue placeholder="Choose quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.title} (ID: {quiz.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* CSV FILE */}
              <div>
                <Label>CSV File *</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-1.5 gap-2 border-dashed border-2 hover:bg-gray-50 py-6"
                >
                  <Upload className="h-4 w-4" />
                  {csvFile ? csvFile.name : "Choose CSV File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {csvFile && <p className="text-sm text-green-600 mt-2 font-medium">Selected: {csvFile.name}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit lg:sticky lg:top-[130px] z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800">Upload Info</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-2.5 rounded-lg border">
              <span>Quiz ID</span>
              <span className="font-medium">{bulkQuizId || "--"}</span>
            </div>

            <div className="flex justify-between bg-white p-2.5 rounded-lg border">
              <span>File</span>
              <span className="font-medium">
                {csvFile ? csvFile.name : "No file selected"}
              </span>
            </div>

            <div className="flex justify-between bg-white p-2.5 rounded-lg border">
              <span>Format</span>
              <span className="font-medium">CSV</span>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p className="font-semibold text-gray-700">Quick Tips</p>
            <p>✔ Select the quiz to upload questions to</p>
            <p>✔ Upload a valid CSV file with questions</p>
            <p>✔ CSV columns should match the required template: question_text, option_a, option_b, option_c, option_d, correct_option, trainer_id</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadQuestionModal;
