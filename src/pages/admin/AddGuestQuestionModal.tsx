import React, { useState } from "react";
import api from "@/lib/api"; import { GuestQuiz } from "./GuestQuizzes";
import { FiPlus, FiHelpCircle, FiInfo, FiArrowLeft } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface AddGuestQuestionModalProps {
  quizzes: GuestQuiz[];
  onClose: () => void;
}

const AddGuestQuestionModal: React.FC<AddGuestQuestionModalProps> = ({
  quizzes,
  onClose,
}) => {
  const [quizId, setQuizId] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("");

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (questionText.trim().length > 130) {
      alert("Question text cannot exceed 130 characters");
      return;
    }

    try {
      await api.post(
        "/admin/guest-quiz/questions",
        {
          quiz_id: Number(quizId),
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_option: correctOption,
        }
      );

      alert("Question Added");
      onClose();
    } catch (error) {
      console.error("Failed to add question:", error);
      alert("Failed to add question");
    }
  };

  return (
    <div className="w-full pb-8 relative">
      {/* HEADER */}
      <div className="sticky top-[64px] z-40 bg-[#F8F9FB]/95 backdrop-blur-sm py-4 border-b border-slate-200 mb-6 -mt-4 px-2 rounded-b-lg">
        <button onClick={onClose} className="text-gray-500 text-sm flex items-center gap-2 mb-4 hover:text-gray-700">
          <FiArrowLeft /> Back to Guest Quizzes
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Question</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Create a new question for the selected quiz
            </p>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm bg-gradient-to-r from-[#615FFF] to-[#AD46FF] hover:opacity-90 shadow-sm transition-all"
            >
              <FiPlus className="w-4 h-4" strokeWidth={2.5} />
              <span>Save question</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
                <FiHelpCircle className="text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Question Details
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* QUIZ ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Quiz ID <span className="text-red-500">*</span>
                </label>
                <Select value={quizId || undefined} onValueChange={setQuizId}>
                  <SelectTrigger className="w-full mt-1 border border-gray-200 bg-gray-50 h-[46px] rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-none">
                    <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.id} - {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* QUESTION TEXT */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Question <span className="text-red-500">*</span>
                  </label>
                 
                </div>
                <textarea
                  className={`w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 ${questionText.length >= 130 ? "border-amber-500" : ""}`}
                  placeholder="Enter your question here ..."
                  value={questionText}
                  onChange={(e) => {
                    if (e.target.value.length <= 130) {
                      setQuestionText(e.target.value);
                    }
                  }}
                  maxLength={130}
                  rows={3}
                />
              </div>

              {/* OPTIONS */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Options <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                <div
                  className="flex items-center p-3 rounded-lg border border-blue-200 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239, 246, 255, 0.5) 0%, rgba(250, 245, 255, 0.5) 100%)",
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 mr-3">
                    A
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option A"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                  />
                </div>

                <div
                  className="flex items-center p-3 rounded-lg border border-blue-200 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239, 246, 255, 0.5) 0%, rgba(250, 245, 255, 0.5) 100%)",
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 mr-3">
                    B
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option B"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                  />
                </div>

                <div
                  className="flex items-center p-3 rounded-lg border border-blue-200 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239, 246, 255, 0.5) 0%, rgba(250, 245, 255, 0.5) 100%)",
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 mr-3">
                    C
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option C"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                  />
                </div>

                <div
                  className="flex items-center p-3 rounded-lg border border-blue-200 shadow-sm"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(239, 246, 255, 0.5) 0%, rgba(250, 245, 255, 0.5) 100%)",
                  }}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 mr-3">
                    D
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option D"
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                  />
                </div>
              </div>
            </div>

              {/* CORRECT OPTION */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Correct Option <span className="text-red-500">*</span>
                </label>
              <div
                className="flex items-center p-3 rounded-lg border border-blue-200 shadow-sm"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(239, 246, 255, 0.5) 0%, rgba(250, 245, 255, 0.5) 100%)",
                }}
              >
                <input
                  className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="Correct option (A,B,C,D)"
                  value={correctOption}
                  onChange={(e) => setCorrectOption(e.target.value)}
                />
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW */}
        <div className="bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] rounded-2xl p-6 border h-fit">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-indigo-500 text-white p-2.5 rounded-lg shadow-sm">
              <FiInfo className="text-base" />
            </div>
            <h3 className="font-semibold text-gray-800">Question Info</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between bg-white p-2 rounded-lg">
              <span>Type</span>
              <span className="font-medium">MCQ</span>
            </div>

            <div className="bg-white p-3 rounded-lg">
              <span className="text-gray-500 text-xs">Options</span>
              <div className="mt-2 space-y-1">
                {optionA && <p className="font-medium">A. {optionA}</p>}
                {optionB && <p className="font-medium">B. {optionB}</p>}
                {optionC && <p className="font-medium">C. {optionC}</p>}
                {optionD && <p className="font-medium">D. {optionD}</p>}
                {!optionA && !optionB && !optionC && !optionD && (
                  <p className="text-gray-400">No options added</p>
                )}
              </div>
            </div>

            {correctOption && (
              <div className="flex justify-between bg-green-50 p-2 rounded-lg border border-green-200">
                <span className="text-green-700">Correct Answer</span>
                <span className="text-green-700 font-medium">
                  {correctOption}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500 space-y-2 border-t pt-4">
            <p className="font-semibold text-gray-700">Quick Tips</p>
            <p>✔ Enter quiz ID to link question</p>
            <p>✔ Provide question text and options</p>
            <p>✔ Mark the correct answer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGuestQuestionModal;
