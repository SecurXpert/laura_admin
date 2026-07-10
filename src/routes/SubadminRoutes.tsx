import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/subadmin/ProtectedRoute";
import DashboardLayout from "@/layouts/SubadminLayout";

import Login from "@/pages/subadmin/Login";
import Dashboard from "@/pages/subadmin/Dashboard";
import Questions from "@/pages/subadmin/Questions";
import Quizzes from "@/pages/subadmin/Quizzes";
import GuestQuiz from "@/pages/subadmin/GuestQuiz";
import GuestExams from "@/pages/subadmin/GuestExams";
import ViewGuestExam from "@/pages/subadmin/ViewGuestExam";
import GuestCompilerQuestions from "@/pages/subadmin/GuestCompilerQuestions";
import GuestCompilerQuestion from "@/pages/subadmin/GuestCompilerQuestion";
import ViewGuestCompilerQuestion from "@/pages/subadmin/ViewGuestCompilerQuestion";
import Exams from "@/pages/subadmin/Exams";
import ViewExam from "@/pages/subadmin/ViewExam";
import CompilerQuestions from "@/pages/subadmin/CompilerQuestions";
import CompilerQuestion from "@/pages/subadmin/CompilerQuestion";
import ViewCompilerQuestion from "@/pages/subadmin/ViewCompilerQuestion";
import InstructorQuizzes from "@/pages/subadmin/InstructorQuizzes";
import Results from "@/pages/subadmin/Results";
import Guest from "@/pages/subadmin/Guest";
import GuestQuestions from "@/pages/subadmin/GuestQuestions";
import NotFound from "@/pages/subadmin/NotFound";
import QuestionBank from "@/pages/subadmin/Questions";
import Profile1 from "@/pages/subadmin/profile1";
import RegisteredUsers from "@/pages/subadmin/RegisteredUsers";
import StudentList from "@/pages/subadmin/StudentList";
import StudentForm from "@/pages/subadmin/StudentForm";
import StudentEdit from "@/pages/subadmin/StudentEdit";
import Categories from "@/pages/subadmin/Categories";
import CategoryForm from "@/pages/subadmin/CategoryForm";
import Courses from "@/pages/subadmin/Courses";
import CourseForm from "@/pages/subadmin/CourseForm";
import Certificates from "@/pages/subadmin/Certificates";
import ResumesList from "@/pages/subadmin/ResumesList";
import LiveClasses from "@/pages/subadmin/LiveClasses";
import RecordedVideos from "@/pages/subadmin/RecordedVideos";
import ViewStreak from "@/pages/subadmin/ViewStreak";
import StudentResult from "@/pages/subadmin/StudentResult";
import InstructorPage from "@/pages/subadmin/InstructorPage";
import InstructorForm from "@/pages/subadmin/InstructorForm";
import Attendance from "@/pages/subadmin/Attendance";
import AttendanceForm from "@/pages/subadmin/AttendanceForm";
import AttendanceDetails from "@/pages/subadmin/AttendanceDetails";
import AssignCourse from "@/pages/subadmin/AssignCourse";
import AssignInstructor from "@/pages/subadmin/AssignInstructor";
import AssignCourseToStudent from "@/pages/subadmin/AssignCourseToStudent";
import AssignCourseToStudentForm from "@/pages/subadmin/AssignCourseToStudentForm";
import EnrollmentAdminView from "@/pages/subadmin/EnrollmentAdminView";
import ReviewsCardUI from "@/pages/subadmin/ReviewsCardUI";
import Reviews from "@/pages/subadmin/Reviews";
import AllUsers from "@/pages/subadmin/AllUsers";

export const SubAdminRoutes = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/students" element={<StudentList />} />
        <Route path="dashboard/students/add" element={<StudentForm />} />
        <Route path="dashboard/students/edit/:id" element={<StudentEdit />} />
        <Route path="dashboard/students/view-streak/:id" element={<ViewStreak />} />
        <Route path="dashboard/student-results" element={<StudentResult />} />
        <Route path="dashboard/categories" element={<Categories />} />
        <Route path="dashboard/categories/add" element={<CategoryForm />} />
        <Route path="dashboard/categories/edit/:id" element={<CategoryForm />} />
        <Route path="dashboard/courses" element={<Courses />} />
        <Route path="dashboard/courses/add" element={<CourseForm />} />
        <Route path="dashboard/courses/edit/:id" element={<CourseForm />} />
        <Route path="dashboard/certificates" element={<Certificates />} />
        <Route path="dashboard/resumes" element={<ResumesList />} />
        <Route path="dashboard/live-classes" element={<LiveClasses />} />
        <Route path="dashboard/recorded-videos" element={<RecordedVideos />} />
        <Route path="dashboard/instructors" element={<InstructorPage />} />
        <Route path="dashboard/instructors/add" element={<InstructorForm />} />
        <Route path="dashboard/instructors/edit/:id" element={<InstructorForm />} />
        <Route path="dashboard/attendance" element={<Attendance />} />
        <Route path="dashboard/attendance/add" element={<AttendanceForm />} />
        <Route path="dashboard/attendance/edit/:id" element={<AttendanceForm />} />
        <Route path="dashboard/attendance/details/:studentId" element={<AttendanceDetails />} />
        <Route path="dashboard/assign-course" element={<AssignCourse />} />
        <Route path="dashboard/assign-instructor" element={<AssignInstructor />} />
        <Route path="dashboard/assign-course-student" element={<AssignCourseToStudent />} />
        <Route path="dashboard/assign-course-student/add" element={<AssignCourseToStudentForm />} />
        <Route path="dashboard/enrollments" element={<EnrollmentAdminView />} />
        <Route path="dashboard/reviews" element={<ReviewsCardUI />} />
        <Route path="dashboard/student-reviews" element={<Reviews />} />
        <Route path="dashboard/users" element={<AllUsers />} />
        <Route path="Questions" element={<Questions />} />

        <Route path="quizzes" element={<Quizzes />} />
        <Route path="GuestQuiz" element={<GuestQuiz />} />
        <Route path="dashboard/guest-exams" element={<GuestExams />} />
        <Route path="dashboard/guest-exams/view/:id" element={<ViewGuestExam />} />
        <Route path="dashboard/guest-compiler-questions" element={<GuestCompilerQuestions />} />
        <Route path="dashboard/guest-compiler-questions/add" element={<GuestCompilerQuestion />} />
        <Route path="dashboard/guest-compiler-questions/edit/:id" element={<GuestCompilerQuestion />} />
        <Route path="dashboard/guest-compiler-questions/view/:id" element={<ViewGuestCompilerQuestion />} />
        
        <Route path="dashboard/exams" element={<Exams />} />
        <Route path="dashboard/exams/view/:id" element={<ViewExam />} />
        <Route path="dashboard/compiler-questions" element={<CompilerQuestions />} />
        <Route path="dashboard/compiler-questions/add" element={<CompilerQuestion />} />
        <Route path="dashboard/compiler-questions/edit/:id" element={<CompilerQuestion />} />
        <Route path="dashboard/compiler-questions/view/:id" element={<ViewCompilerQuestion />} />
        <Route path="dashboard/instructor-quizzes" element={<InstructorQuizzes />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="profile1" element={<Profile1 />} />


        <Route path="Guest" element={<Guest />} />
        <Route path="GuestQuestions" element={<GuestQuestions />} />
        <Route path="RegisteredUsers" element={<RegisteredUsers />} />
        <Route path="Results" element={<Results />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthProvider>
);
