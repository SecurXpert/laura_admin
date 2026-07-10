import React, { useState, useRef } from "react";
import { Quiz } from "./CreateAdminQuizForm";
import { Upload, Info, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

interface BulkUploadQuestionModalProps {
  quizzes: Quiz[];
  onClose: () => void;
}

const BulkUploadAdminQuizModal: React.FC<BulkUploadQuestionModalProps> = ({ quizzes, onClose }) => {
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
      toast.error("Please select a quiz");
      return;
    }
    if (!csvFile) {
      toast.error("Please choose a CSV file");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("quiz_id", bulkQuizId);
    formData.append("file", csvFile);

    try {
      const token = getToken();
      if (!token) {
        toast.error("No authentication token");
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

      toast.success("Bulk Uploaded Successfully");
      onClose();
    } catch (error: any) {
      console.error("Failed to bulk upload:", error);
      toast.error(error.message || "Failed to bulk upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB]/95 backdrop-blur-md py-4 px-4 sm:px-6 -mx-4 sm:-mx-6 -mt-3 sm:-mt-4 border-b border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 transition-all">
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
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-4 h-4 text-blue-600" />
                </div>
                Upload Details
              </CardTitle>
              <CardDescription>Select the quiz and upload the CSV file</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Quiz <span className="text-red-500">*</span></Label>
                <Select value={bulkQuizId} onValueChange={setBulkQuizId}>
                  <SelectTrigger className="mt-1.5 bg-white">
                    <SelectValue placeholder="Select Quiz" />
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

              <div>
                <Label>CSV File <span className="text-red-500">*</span></Label>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full mt-1.5 border bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit lg:sticky lg:top-[160px] z-10">
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
            <p>✔ CSV must include question, options, and correct answer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadAdminQuizModal;
