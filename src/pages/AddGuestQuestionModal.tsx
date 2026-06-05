import React, { useState } from "react";
import api from "@/lib/api";import { GuestQuiz } from "./GuestQuizzes";
import { FiPlus, FiHelpCircle, FiInfo } from "react-icons/fi";
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
    <div className="bg-[#F5F7FB] p-4 sm:p-6 rounded-xl mt-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Question</h1>
          <p className="text-gray-500 text-xs sm:text-sm">
            Create a new question for the selected quiz
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button onClick={onClose} className="text-gray-500 text-xs sm:text-sm">
            Cancel
          </button>

          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4F46E5] to-[#9333EA] text-white px-5 py-2 rounded-lg shadow-md text-sm sm:text-base font-medium"
          >
            <FiPlus className="w-4 h-4" strokeWidth={2.5} />
            <span>Add Question</span>
          </button>
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
                  Quiz ID
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
                <label className="text-sm font-medium text-gray-700">
                  Question
                </label>
                <textarea
                  className="w-full mt-1 border bg-gray-50 p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your question here..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={3}
                />
              </div>

              {/* OPTIONS */}
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

              {/* CORRECT OPTION */}
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
