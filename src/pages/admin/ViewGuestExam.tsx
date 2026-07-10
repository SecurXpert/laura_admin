import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { FiClock, FiArrowLeft } from "react-icons/fi";
import { GuestExam } from "./GuestExams";

const ViewGuestExam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<GuestExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        // Fetch exam
        const res = await api.get(`/guest/exam/get?exam_id=${id}`);
        let foundExam: GuestExam | null = null;
        if (Array.isArray(res.data) && res.data.length > 0) {
          foundExam = res.data[0];
        } else if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          foundExam = res.data.data[0];
        } else if (!Array.isArray(res.data) && res.data?.id) {
          foundExam = res.data;
        }
        setExam(foundExam);

        // If we found the exam, try to fetch the course name
        if (foundExam && foundExam.course_id) {
          const token = localStorage.getItem("access_token");
          const headers = { Authorization: token ? `Bearer ${token}` : "" };
          const courseRes = await api.get("/admin/courses", { headers });
          const courses = Array.isArray(courseRes.data) ? courseRes.data : courseRes.data?.courses || courseRes.data?.data || [];
          const foundCourse = courses.find((c: any) => c.id === foundExam?.course_id);
          if (foundCourse) {
            setCourseName(foundCourse.title);
          }
        }
      } catch (error) {
        console.error("Failed to fetch exam details", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExamDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8 text-center text-gray-500">
        Loading exam details...
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="w-full max-w-7xl mx-auto p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Exam not found</h2>
        <button
          onClick={() => navigate("/guest-exams")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Back to List
        </button>
      </div>
    );
  }

  const isActive = exam.is_active === 1;

  const formatDate = (dateString: string) => {
    if (!dateString) return "--";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', '');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1a1744] tracking-tight">
            View Guest Exam
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 font-medium">
            Exam details — read only
          </p>
        </div>
        <button
          onClick={() => navigate("/guest-exams")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          Back to List
        </button>
      </div>

      {/* CARD CONTENT */}
      <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-gray-100/80 bg-white">
          <h3 className="text-[15px] font-bold text-gray-900">
            Exam Information
          </h3>
        </div>

        {/* Card Body - Grid */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            
            {/* EXAM ID */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                EXAM ID
              </p>
              <span className="inline-flex font-semibold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-md text-[13px]">
                GE{exam.id.toString().padStart(3, '0')}
              </span>
            </div>

            {/* TITLE */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                TITLE
              </p>
              <p className="text-[14px] font-bold text-gray-900">
                {exam.title}
              </p>
            </div>

            {/* DESCRIPTION */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                DESCRIPTION
              </p>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                {exam.description || "--"}
              </p>
            </div>

            {/* COURSE ID */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                COURSE ID
              </p>
              <p className="text-[14px] text-gray-900 font-medium">
                C{exam.course_id.toString().padStart(3, '0')} {courseName ? `— ${courseName}` : ""}
              </p>
            </div>

            {/* CATEGORY */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                CATEGORY
              </p>
              <span className="inline-flex text-[13px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                {exam.category || "--"}
              </span>
            </div>

            {/* DURATION */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                DURATION
              </p>
              <p className="text-[14px] text-gray-600 flex items-center gap-1.5 font-medium">
                <FiClock className="text-gray-400" /> {exam.duration} minutes
              </p>
            </div>

            {/* WINDOW START */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                WINDOW START
              </p>
              <p className="text-[14px] text-gray-700 font-medium">
                {formatDate(exam.window_start)}
              </p>
            </div>

            {/* WINDOW END */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                WINDOW END
              </p>
              <p className="text-[14px] text-gray-700 font-medium">
                {formatDate(exam.window_end)}
              </p>
            </div>

            {/* STATUS */}
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                STATUS
              </p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

          </div>
        </div>

        {/* ATTACHED QUESTIONS SECTION */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mt-6">
          <h3 className="text-lg font-bold text-[#1a1744] mb-4">
            Exam Questions
          </h3>
          {(() => {
            let qObj = exam.questions;
            if (typeof qObj === "string") {
              try { qObj = JSON.parse(qObj); } catch (e) { qObj = null; }
            }
            if (!qObj || typeof qObj !== "object" || Object.keys(qObj).length === 0) {
              return (
                <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-500 text-sm">
                  No questions currently assigned to this exam.
                </div>
              );
            }
            const list = Object.entries(qObj).map(([k, val]: [string, any], idx) => {
              if (val && typeof val === "object" && val.question_bank_id !== undefined) {
                return { id: val.question_bank_id, score: val.score ?? 10, index: idx + 1 };
              }
              if (val && typeof val === "object" && val.score !== undefined) {
                return { id: k, score: val.score, index: idx + 1 };
              }
              return { id: k, score: val, index: idx + 1 };
            });
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-1 border-b border-gray-100">
                  <div className="col-span-2">#</div>
                  <div className="col-span-6">Question Bank ID</div>
                  <div className="col-span-4 text-right">Points / Score</div>
                </div>
                {list.map((item) => (
                  <div key={item.index} className="grid grid-cols-12 gap-4 items-center bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 text-sm">
                    <div className="col-span-2 font-bold text-indigo-600">Q{item.index}</div>
                    <div className="col-span-6 font-medium text-gray-800">Question ID #{item.id}</div>
                    <div className="col-span-4 text-right font-semibold text-emerald-600">{item.score} pts</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ViewGuestExam;
