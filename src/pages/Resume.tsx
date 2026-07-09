import React, { useState, useEffect } from 'react';
import api from "@/lib/api";
import { FileText, User, MapPin, GraduationCap, Briefcase, Mail, Phone, ArrowLeft, Loader2, Eye } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

// --- Types from GET /resumes/ ---
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

interface Education {
  degree: string;
  institution: string;
  field_of_study: string;
  start_year: number;
  end_year: number;
  grade: string;
}

interface WorkExperience {
  company_name: string;
  designation: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  technologies_used: string[];
  responsibilities: string[];
  achievements: string[];
}

interface ResumeData {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  nationality: string;
  city: string;
  pin_code: string;
  job_title: string;
  professional_summary: string | any;
  permanent_address: Address[];
  education_details: Education[];
  work_experience: WorkExperience[];
  project_details: any[];
  skills: string[];
  certifications: any[];
  hobbies: string[];
  awards: any[];
  languages: any[];
  profile_photo_url: string;
  linkedin_url: string;
  github_url: string;
  extra_data: any;
  template?: 'with_photo' | 'without_photo';
}

const ResumesList = () => {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const TOKEN_STORAGE_KEY = 'access_token';
  const getToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);
  const axiosConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });

  // Fetch resumes list
  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes/', axiosConfig());
      const sortedData = [...(res.data || [])].sort((a: any, b: any) => b.id - a.id);
      setResumes(sortedData);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const getFullName = (r: ResumeData) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Unknown Candidate';

  const totalPages = Math.max(Math.ceil(resumes.length / ITEMS_PER_PAGE), 1);
  const paginatedResumes = resumes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // --- Helpers for Skills Parsing ---
  const getSkillParts = (skillStr: string) => {
    if (!skillStr) return { name: '', prof: 50 };
    const parts = skillStr.split('|');
    return { name: parts[0] || '', prof: parts[1] ? parseInt(parts[1]) : 50 };
  };

  // --- View: Single Resume Details ---
  if (selectedResume) {
    const r = selectedResume;
    return (
      <div className="w-full max-w-5xl mx-auto overflow-x-hidden pb-12">
        <button
          onClick={() => setSelectedResume(null)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Resumes
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-10 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

          <div className="flex items-start gap-8 mb-10 border-b-2 border-gray-100 pb-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex-shrink-0 border-4 border-white shadow-md flex items-center justify-center text-blue-500 overflow-hidden">
              {r.profile_photo_url ? (
                <img src={r.profile_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-blue-300" />
              )}
            </div>

            <div className="flex-1 pt-2">
              <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900">
                {r.first_name} {r.last_name}
              </h1>
              <h2 className="text-xl font-medium text-blue-600 uppercase tracking-widest mt-2">
                {r.job_title}
              </h2>

              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-sm text-gray-600 font-medium">
                {r.email && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><Mail className="w-4 h-4 text-gray-400" /> {r.email}</div>
                )}
                {r.phone_number && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><Phone className="w-4 h-4 text-gray-400" /> {r.phone_number}</div>
                )}
                {r.city && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4 text-gray-400" /> {r.city}{r.nationality ? `, ${r.nationality}` : ''}</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {r.professional_summary && typeof r.professional_summary === 'string' && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-gray-900">Professional Summary</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-[15px]">
                  {r.professional_summary}
                </p>
              </section>
            )}

            {r.work_experience && r.work_experience.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-gray-900">Experience</h3>
                </div>
                <div className="space-y-8 pl-4 border-l-2 border-gray-100">
                  {r.work_experience.map((exp, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>

                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">{exp.designation}</h4>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3" /> {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                        </span>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm mb-3">{exp.company_name}</div>

                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="text-[15px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {exp.responsibilities.join('\n')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {r.education_details && r.education_details.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-gray-900">Education</h3>
                </div>
                <div className="space-y-6 pl-4 border-l-2 border-gray-100">
                  {r.education_details.map((edu, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>

                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-900 text-[15px]">
                          {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                        </h4>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {edu.start_year} - {edu.end_year}
                        </span>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm">{edu.institution}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {r.skills && r.skills.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-base font-bold uppercase tracking-widest text-gray-900">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.skills.map((skillStr, i) => {
                    const { name } = getSkillParts(skillStr);
                    if (!name) return null;
                    return (
                      <span key={i} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold">
                        {name}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- View: Resumes Grid List ---
  return (
    <div className="w-full max-w-7xl mx-auto overflow-x-hidden pb-12">
      <div className="flex items-center justify-between gap-4 mb-6 w-full">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1744] tracking-tight">Resumes</h1>
            <p className="text-sm sm:text-md text-[#4B5563] mt-1 font-medium">View all submitted resumes</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700">No Resumes Found</h3>
          <p className="text-gray-500 mt-2">There are no resumes stored in the database yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedResumes.map((resume, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-[24px] border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Avatar icon on left, Purple View button on right */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-[#3B82F6] flex-shrink-0 overflow-hidden">
                      {resume.profile_photo_url ? (
                        <img
                          src={resume.profile_photo_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 stroke-[2.2]" />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedResume(resume)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:opacity-95 text-white font-semibold text-sm rounded-full shadow-sm transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>

                  {/* Candidate Name & Title */}
                  <div className="mt-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {getFullName(resume)}
                    </h3>
                    <p className="text-sm font-medium text-[#4B5563] mt-1 line-clamp-1">
                      {resume.job_title || "Candidate"}
                    </p>
                  </div>

                  {/* Divider & Contact Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    {resume.email && (
                      <div className="flex items-center gap-3 text-sm text-[#4B5563] line-clamp-1">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{resume.email}</span>
                      </div>
                    )}
                    {resume.phone_number && (
                      <div className="flex items-center gap-3 text-sm text-[#4B5563] line-clamp-1">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{resume.phone_number}</span>
                      </div>
                    )}
                    {resume.city && (
                      <div className="flex items-center gap-3 text-sm text-[#4B5563] line-clamp-1">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {resume.city}
                          {resume.nationality ? `, ${resume.nationality}` : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {!loading && resumes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 px-2 gap-4">
              <div className="text-[13px] font-medium text-[#6B7280]">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, resumes.length)} of {resumes.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Previous
                </button>

                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[13px] font-bold bg-[#6366F1] text-white shadow-[0_4px_10px_rgba(99,102,241,0.3)] border border-transparent">
                  {currentPage}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-1.5 rounded-full border border-gray-200 text-[#374151] text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white h-[34px] flex items-center justify-center"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResumesList;
