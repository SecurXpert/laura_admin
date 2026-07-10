import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export interface Student {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  rollNumber?: string;
  course_id?: number | null;
  is_admin: boolean;
  mfa_enabled: boolean;
  mfa_verified_at?: string | null;
  mfa_failed_attempts?: number;
  mfa_locked_until?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  about_me?: string | null;
  expertise?: string | null;
  profile_picture?: string | null;
  linked_picture?: string | null;
  linkedin?: string | null;
  resume_url?: string | null;
  resume_uri?: string | null;
  profile_image?: string | null;
  [key: string]: any;
}

interface StudentTableProps {
  students: Student[];
  totalFilteredCount: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  onDelete: (id: number) => void;
  formatNav: (path: string) => string;
}

const StudentTable: React.FC<StudentTableProps> = ({
  students,
  totalFilteredCount,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  onDelete,
  formatNav,
}) => {
  const navigate = useNavigate();
  const [selectedStudentCourses, setSelectedStudentCourses] = useState<{ studentName: string; courses: string[] } | null>(null);

  const renderStatusBadge = (status: boolean | string | null | undefined) => {
    const isEnabled = !!status;
    if (isEnabled) {
      return (
        <span className="inline-block px-3 py-1 bg-[#E6F8ED] text-[#1E854A] text-xs font-semibold rounded-full whitespace-nowrap">
          Enabled
        </span>
      );
    }
    return (
      <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-xs font-semibold rounded-full whitespace-nowrap">
        Disabled
      </span>
    );
  };

  const renderLockedUntil = (lockedUntil: string | null | undefined) => {
    if (!lockedUntil) return <span className="text-gray-400 font-semibold">—</span>;
    try {
      const date = new Date(lockedUntil);
      if (!isNaN(date.getTime())) {
        const pad = (num: number) => String(num).padStart(2, '0');
        const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        return <span className="text-[#EF4444] font-semibold text-xs whitespace-nowrap">{formatted}</span>;
      }
    } catch (e) {
      // ignore
    }
    return <span className="text-[#EF4444] font-semibold text-xs whitespace-nowrap">{lockedUntil}</span>;
  };

  if (totalFilteredCount === 0) {
    return <p className="text-center text-gray-500">No students found.</p>;
  }

  return (
    <>
      <div className="mt-6 bg-white border border-gray-100 rounded-[24px] overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] mb-10">
        <div className="px-6 py-5 border-b border-gray-100 bg-white">
          <h3 className="text-[18px] font-bold text-[#1F2937]">All Students</h3>
        </div>
        <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-sm border-collapse min-w-[1000px]">
            {/* Header */}
            <thead style={{ background: 'linear-gradient(90deg, #7B2FF7 0%, #752EF4 7.69%, #6F2EF1 15.38%, #692DEE 23.08%, #642CEB 30.77%, #5E2BE8 38.46%, #582AE5 46.15%, #5229E2 53.85%, #4C27E0 61.54%, #4626DD 69.23%, #3F25DA 76.92%, #3923D7 84.62%, #3221D4 92.31%, #2B1FD1 100%)' }}>
              <tr className="border-t-2 border-b-2 border-gray-100">
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">NAME</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">EMAIL</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">PHONE</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">DOB</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">GENDER</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">COURSES</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">MFA</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">MFA VERIFIED</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">FAILED ATTEMPTS</th>
                <th className="px-6 py-4 text-left align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">LOCKED UNTIL</th>
                <th className="px-6 py-4 text-center align-middle text-[14px] font-bold text-white tracking-wider uppercase whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y-2 divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-slate-50 hover:bg-slate-100/50 transition-colors">
                  <td className="px-6 py-5 text-left align-middle text-[16px] text-[#1F2937] font-semibold whitespace-nowrap">
                    {s.name || [s.first_name, s.last_name].filter(Boolean).join(' ') || '-'}
                  </td>
                  <td className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium">{s.email || '-'}</td>
                  <td className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium whitespace-nowrap">{s.phone || '-'}</td>
                  <td className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium whitespace-nowrap">{s.dob || '-'}</td>
                  <td className="px-6 py-5 text-left align-middle text-[16px] text-[#6B7280] font-medium">{s.gender || '-'}</td>

                  {/* Courses array */}
                  <td className="px-6 py-5 text-left align-middle">
                    {s.courses && s.courses.length > 0 ? (
                      <div className="flex flex-row gap-1.5 justify-start items-center whitespace-nowrap">
                        {s.courses.slice(0, 2).map((course: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center px-[12px] py-[5px] bg-[#ede9fe] text-[#7c3aed] text-[16px] font-semibold rounded-full">
                            {course}
                          </span>
                        ))}
                        {s.courses.length > 2 && (
                          <button
                            onClick={() => setSelectedStudentCourses({
                              studentName: s.name || s.email,
                              courses: s.courses
                            })}
                            className="text-[16px] text-[#5D3EFC] hover:underline font-bold ml-2"
                          >
                            + {s.courses.length - 2} more
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-[16px]">—</span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-left align-middle">
                    {renderStatusBadge(s.mfa_enabled)}
                  </td>

                  <td className="px-6 py-5 text-left align-middle">
                    {renderStatusBadge(s.mfa_verified_at)}
                  </td>

                  <td className="px-6 py-5 text-left align-middle text-[16px] font-semibold text-[#1F2937]">
                    {s.mfa_failed_attempts ?? 0}
                  </td>

                  <td className="px-6 py-5 text-left align-middle">
                    {renderLockedUntil(s.mfa_locked_until)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-center align-middle">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => navigate(formatNav(`/dashboard/students/view-streak/${s.id}`), { state: { student: s } })}
                        className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <button
                        onClick={() => navigate(formatNav(`/dashboard/students/edit/${s.id}`))}
                        className="flex items-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(s.id)}
                        className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalFilteredCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 border-t border-gray-100 bg-white gap-4">
            <div className="text-[13px] font-medium text-[#6B7280]">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredCount)}-{Math.min(currentPage * itemsPerPage, totalFilteredCount)} of {totalFilteredCount}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Previous
              </button>

              <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                {currentPage}
              </div>

              <button
                onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popup modal for showing all assigned courses */}
      {selectedStudentCourses && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
              Assigned Courses
            </h3>
            <p className="text-sm text-gray-500 mb-3 font-medium">
              Student: <span className="text-gray-800 font-semibold">{selectedStudentCourses.studentName}</span>
            </p>
            <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto py-2">
              {selectedStudentCourses.courses.map((course, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3.5 py-1.5 bg-[#EEF2FF] text-[#6366F1] text-xs font-semibold rounded-full"
                >
                  {course}
                </span>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudentCourses(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentTable;
