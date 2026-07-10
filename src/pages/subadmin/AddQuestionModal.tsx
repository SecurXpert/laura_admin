import React, { useState, useEffect } from "react";
import { Quiz } from "./Quizzes";
import { PlusCircle, HelpCircle, Info, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

interface AddQuestionModalProps {
  quizzes: Quiz[];
  onClose: () => void;
}

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ quizzes, onClose }) => {
  const [quizId, setQuizId] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("");
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/admin/instructors`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTrainers(data);
          } else if (data && Array.isArray(data.data)) {
            setTrainers(data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trainers", err);
      }
    };
    fetchTrainers();
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quizId || !trainerId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    const correct = correctOption.toLowerCase().trim();
    if (!["a", "b", "c", "d"].includes(correct)) {
      toast({
        title: "Validation Error",
        description: "Correct option must be A, B, C or D",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("quiz_id", quizId);
      payload.append("question_text", questionText.trim());
      payload.append("option_a", optionA.trim());
      payload.append("option_b", optionB.trim());
      payload.append("option_c", optionC.trim());
      payload.append("option_d", optionD.trim());
      payload.append("correct_option", correct);
      payload.append("trainer_id", trainerId.trim());

      const token = getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/subadmin/questions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result.message || "Failed to add question");
      }

      toast({
        title: "Added",
        description: "Question Added Successfully",
        className: "bg-emerald-600 text-white",
        duration: 2000,
      });
      onClose();
    } catch (error: any) {
      console.error("Failed to add question:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
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
            Add Question
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Create a new question for the selected quiz
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <Button
            onClick={handleAddQuestion}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md text-sm font-medium rounded-xl px-6 py-2.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            <span>Save Question</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <Card className="bg-white rounded-2xl border shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>
                Question Details
              </CardTitle>
              <CardDescription>Select the quiz and write the question text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QUIZ SELECT */}
              <div>
                <Label>Select Quiz <span className="text-red-500">*</span></Label>
                <Select value={quizId} onValueChange={setQuizId}>
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

              {/* TRAINER ID */}
              <div>
                <Label>Trainer <span className="text-red-500">*</span></Label>
                <Select value={trainerId} onValueChange={setTrainerId}>
                  <SelectTrigger className="mt-1.5 bg-white max-w-xs">
                    <SelectValue placeholder="Select Trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id.toString()}>
                        {trainer.first_name || trainer.name || trainer.username || trainer.email} (ID: {trainer.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* QUESTION TEXT */}
              <div>
                <Label className="flex justify-between w-full">
                  <span>Question <span className="text-red-500">*</span></span>
                  <span className={`text-[11px] font-medium ${questionText.length === 60 ? 'text-red-500' : 'text-gray-400'}`}>

                  </span>
                </Label>
                <Textarea
                  placeholder="Enter your question here..."
                  value={questionText}
                  maxLength={120}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={4}
                  className="mt-1.5 bg-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* OPTIONS CARD */}
          <Card className="bg-white rounded-2xl border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                </div>
                Answer Options
              </CardTitle>
              <CardDescription>Provide multiple choice options and specify correct option</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["a", "b", "c", "d"] as const).map((letter) => (
                <div
                  key={letter}
                  className="flex items-center p-3 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 mr-3">
                    {letter.toUpperCase()}
                  </div>
                  <Input
                    className="flex-1 p-2 border-0 bg-white"
                    placeholder={`Option ${letter.toUpperCase()}`}
                    value={letter === "a" ? optionA : letter === "b" ? optionB : letter === "c" ? optionC : optionD}
                    onChange={(e) => {
                      if (letter === "a") setOptionA(e.target.value);
                      if (letter === "b") setOptionB(e.target.value);
                      if (letter === "c") setOptionC(e.target.value);
                      if (letter === "d") setOptionD(e.target.value);
                    }}
                  />
                  <input
                    type="radio"
                    name="correctOption"
                    value={letter}
                    checked={correctOption === letter}
                    onChange={() => setCorrectOption(letter)}
                    className="ml-4 w-5 h-5 accent-purple-600 cursor-pointer"
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="text-blue-600">•</span>
                Select the radio button on the right to mark the correct option
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit lg:sticky lg:top-[130px]">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-800">Question Info</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-2.5 rounded-lg border">
              <span>Type</span>
              <span className="font-medium">MCQ</span>
            </div>

            <div className="bg-white p-3 rounded-lg border overflow-hidden">
              <span className="text-gray-500 text-xs">Options</span>
              <div className="mt-2 space-y-1">
                {optionA && <p className="font-medium break-all">A. {optionA}</p>}
                {optionB && <p className="font-medium break-all">B. {optionB}</p>}
                {optionC && <p className="font-medium break-all">C. {optionC}</p>}
                {optionD && <p className="font-medium break-all">D. {optionD}</p>}
                {!optionA && !optionB && !optionC && !optionD && (
                  <p className="text-gray-400">No options added</p>
                )}
              </div>
            </div>

            {correctOption && (
              <div className="flex flex-col sm:flex-row justify-between bg-green-50 p-2.5 rounded-lg border border-green-200 gap-2 overflow-hidden">
                <span className="text-green-700 whitespace-nowrap">Correct Answer</span>
                <span className="text-green-700 font-medium break-all text-left sm:text-right">
                  {correctOption.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p className="font-semibold text-gray-700">Quick Tips</p>
            <p>✔ Select a quiz and input the Trainer ID</p>
            <p>✔ Provide clear question text and four options</p>
            <p>✔ Make sure to check the radio button for the correct option</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;
