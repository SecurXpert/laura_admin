import React, { useState } from "react";
import axios from "axios";
import { GuestQuiz } from "./GuestQuiz";
import { FiPlus, FiHelpCircle, FiInfo, FiArrowLeft } from "react-icons/fi";

const API_BASE = "https://lauratek.in:8000";
const getToken = () => localStorage.getItem("access_token");

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

    try {
      await axios.post(
        `${API_BASE}/sub-admin/guest-quiz/questions`,
        {
          quiz_id: Number(quizId),
          question_text: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_option: correctOption,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
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
    <div className="w-full pb-10 space-y-6">
      {/* HEADER */}
      <div className="sticky -top-4 sm:-top-6 md:-top-8 z-40 bg-[#F8FAFC] py-4 border-b border-gray-200/60 shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 -mt-4 sm:-mt-6 md:-mt-8 pt-4 sm:pt-6 md:pt-8 mb-6 flex flex-col gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#6366f1] font-medium transition-colors w-fit"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Guest Quizzes</span>
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Add Question
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Create a new question for the selected quiz
            </p>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={handleAddQuestion}
              className="flex w-full sm:w-auto justify-center items-center gap-2 bg-gradient-to-r from-[#3B5BDB] to-[#7B2FF7] text-white px-6 py-2.5 rounded-full shadow-[0_4px_12px_rgba(123,47,247,0.3)] text-sm font-semibold hover:shadow-[0_6px_16px_rgba(123,47,247,0.4)] transition-all cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>Save Question</span>
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
                <select
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={quizId}
                  onChange={(e) => setQuizId(e.target.value)}
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id.toString()}>
                      {quiz.id} - {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* QUESTION TEXT */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex justify-between items-center w-full">
                  <span>Question <span className="text-red-500">*</span></span>
                  
                </label>
                <textarea
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your question here..."
                  value={questionText}
                  maxLength={120}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                />
              </div>

              {/* OPTIONS */}
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-gray-700 mr-3">
                    A
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option A"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                  />
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-gray-700 mr-3">
                    B
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option B"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                  />
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-gray-700 mr-3">
                    C
                  </div>
                  <input
                    className="flex-1 p-2 border border-white rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    placeholder="Option C"
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                  />
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full text-sm font-medium text-gray-700 mr-3">
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

              {/* CORRECT OPTION */}
              <div className="flex items-center p-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-green-300 transition-colors mt-4">
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

        {/* RIGHT PREVIEW */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm h-fit lg:sticky lg:top-6">
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

            <div className="bg-white p-3 rounded-lg overflow-hidden">
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
              <div className="flex flex-col sm:flex-row justify-between bg-green-50 p-2 rounded-lg border border-green-200 gap-2 overflow-hidden">
                <span className="text-green-700 whitespace-nowrap">Correct Answer</span>
                <span className="text-green-700 font-medium break-all text-left sm:text-right">
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
