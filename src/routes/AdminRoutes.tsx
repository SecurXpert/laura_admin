import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/layouts/AdminLayout";

import Dashboard from "@/pages/admin/Dashboard";
import Quizzes from "@/pages/admin/Quizzes";
import Attendance from "@/pages/admin/Attendance";
import AttendanceForm from "@/pages/admin/AttendanceForm";
import AttendanceDetails from "@/pages/admin/AttendanceDetails";
import Courses from "@/pages/admin/Courses";
import CourseForm from "@/pages/admin/CourseForm";
import Profile from "@/pages/admin/Profile";
import AdminQuizzes from "@/pages/admin/AdminQuizzes";
import AllUsers from "@/pages/admin/Allusers";
import Categories from "@/pages/admin/Services/Categories";
import CategoryForm from "@/pages/admin/Services/CategoryForm";
import Instructor from "@/pages/admin/Services/Instructor";
import InstructorForm from "@/pages/admin/Services/InstructorForm";
import AssignCourse from "@/pages/admin/AssignCourse";
import AssignInstructor from "@/pages/admin/AssignInstructor";
import AssignCourseToStudent from "@/pages/admin/AssignCourseToStudent";
import AssignCourseToStudentForm from "@/pages/admin/AssignCourseToStudentForm";
import ADMINENROLLMENTS from "@/pages/admin/ADMINENROLLMENTS";
import SubAdmins from "@/pages/admin/SubAdmins";
import Student from "@/pages/admin/Student";
import StudentForm from "@/pages/admin/StudentForm";
import StudentEdit from "@/pages/admin/StudentEdit";
import ViewStreak from "@/pages/admin/ViewStreak";
import LiveClasses from "@/pages/admin/LiveClasses";
import RecordedVideos from "@/pages/admin/RecordedVideos";
import UserProfile from "@/pages/admin/UserProfile";
import GuestQuizzes from "@/pages/admin/GuestQuizzes";
import Reviews from "@/pages/admin/Reviews";
import PerformanceReview from "@/pages/admin/PerformanceReview";
import Guest from "@/pages/admin/Guest";
import GuestExams from "@/pages/admin/GuestExams";
import ViewGuestExam from "@/pages/admin/ViewGuestExam";
import GuestCompilerQuestions from "@/pages/admin/GuestCompilerQuestions";
import GuestCompilerQuestion from "@/pages/admin/GuestCompilerQuestion";
import ViewGuestCompilerQuestion from "@/pages/admin/ViewGuestCompilerQuestion";
import StudentExams from "@/pages/admin/StudentExams";
import ViewStudentExam from "@/pages/admin/ViewStudentExam";
import StudentCompilerQuestions from "@/pages/admin/StudentCompilerQuestions";
import StudentCompilerQuestion from "@/pages/admin/StudentCompilerQuestion";
import ViewStudentCompilerQuestion from "@/pages/admin/ViewStudentCompilerQuestion";
import CreateSubAdmin from "@/pages/admin/CreateSubadmin";
import RegisteredUsers from "@/pages/admin/RegisteredUsers";
import Certificates from "@/pages/admin/Certificates";
import ResumeBuilder from "@/pages/admin/Resume";
import Results from "@/pages/admin/Results";

export const AdminRoutes = () => (
  <Routes>
    {/* Protected Routes (No /dashboard prefix) */}
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="all-users" element={<AllUsers />} />
      <Route path="guestquizzes" element={<GuestQuizzes />} />
      <Route path="live-classes" element={<LiveClasses />} />
      <Route path="recorded-videos" element={<RecordedVideos />} />

      {/* Main */}
      <Route path="admin-quizzes" element={<AdminQuizzes />} />
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="attendance/add" element={<AttendanceForm />} />
      <Route path="attendance/edit/:id" element={<AttendanceForm />} />
      <Route path="courses" element={<Courses />} />
      <Route path="profile" element={<Profile />} />
      <Route path="allusers" element={<AllUsers />} />
      <Route path="Allusers" element={<AllUsers />} />
      <Route path="GuestQUizzes" element={<GuestQuizzes />} />
      <Route path="guest-exams" element={<GuestExams />} />
      <Route path="guest-exams/view/:id" element={<ViewGuestExam />} />
      <Route path="guest-compiler-questions" element={<GuestCompilerQuestions />} />
      <Route path="guest-compiler-questions/add" element={<GuestCompilerQuestion />} />
      <Route path="guest-compiler-questions/edit/:id" element={<GuestCompilerQuestion />} />
      <Route path="guest-compiler-questions/view/:id" element={<ViewGuestCompilerQuestion />} />

      {/* Student Exams and Compilers */}
      <Route path="student-exams" element={<StudentExams />} />
      <Route path="student-exams/view/:id" element={<ViewStudentExam />} />
      <Route path="student-compiler-questions" element={<StudentCompilerQuestions />} />
      <Route path="student-compiler-questions/add" element={<StudentCompilerQuestion />} />
      <Route path="student-compiler-questions/edit/:id" element={<StudentCompilerQuestion />} />
      <Route path="student-compiler-questions/view/:id" element={<ViewStudentCompilerQuestion />} />

      <Route path="reviews" element={<Reviews />} />
      <Route path="PerformanceReview" element={<PerformanceReview />} />
      <Route path="Guest" element={<Guest />} />
      <Route path="registered-users" element={<RegisteredUsers />} />
      <Route path="certificates" element={<Certificates />} />
      <Route path="resumes" element={<ResumeBuilder />} />
      <Route path="results" element={<Results />} />

      {/* Services */}
      <Route path="categories" element={<Categories />} />
      <Route path="categories/add" element={<CategoryForm />} />
      <Route path="categories/edit/:id" element={<CategoryForm />} />
      <Route path="instructors" element={<Instructor />} />
      <Route path="instructors/add" element={<InstructorForm />} />
      <Route path="instructors/edit/:id" element={<InstructorForm />} />
      <Route path="assign-course" element={<AssignCourse />} />
      <Route path="assign-instructor" element={<AssignInstructor />} />
      <Route path="assign-course-student" element={<AssignCourseToStudent />} />
      <Route path="assign-course-student/add" element={<AssignCourseToStudentForm />} />
      <Route path="ADMINENROLLMENTS" element={<ADMINENROLLMENTS />} />

      {/* Admin */}
      <Route path="sub-admins" element={<SubAdmins />} />
      <Route path="students" element={<Student />} />
      <Route path="Students" element={<Student />} />
      <Route path="students/add" element={<StudentForm />} />
      <Route path="Students/add" element={<StudentForm />} />
      <Route path="students/edit/:id" element={<StudentEdit />} />
      <Route path="Students/edit/:id" element={<StudentEdit />} />
      <Route path="students/streak/:id" element={<ViewStreak />} />
      <Route path="Students/streak/:id" element={<ViewStreak />} />

      <Route path="Userprofile" element={<UserProfile />} />

      <Route path="addstudents" element={<Student />} />
      <Route path="addinstructors" element={<Instructor />} />
      <Route path="addcourses" element={<Courses />} />
      <Route path="addquizzes" element={<Quizzes />} />

      <Route path="courses/add" element={<CourseForm />} />
      <Route path="courses/edit/:id" element={<CourseForm />} />
      <Route path="create-sub-admin" element={<CreateSubAdmin />} />
    </Route>

    {/* Legacy Protected Routes (With /dashboard prefix) */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="all-users" element={<AllUsers />} />
      <Route path="guestquizzes" element={<GuestQuizzes />} />
      <Route path="live-classes" element={<LiveClasses />} />
      <Route path="recorded-videos" element={<RecordedVideos />} />

      {/* Main */}
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="attendance/add" element={<AttendanceForm />} />
      <Route path="attendance/edit/:id" element={<AttendanceForm />} />
      <Route path="attendance/details/:studentId" element={<AttendanceDetails />} />
      <Route path="courses" element={<Courses />} />
      <Route path="profile" element={<Profile />} />
      <Route path="allusers" element={<AllUsers />} />
      <Route path="Allusers" element={<AllUsers />} />
      <Route path="GuestQUizzes" element={<GuestQuizzes />} />
      <Route path="reviews" element={<Reviews />} />
      <Route path="PerformanceReview" element={<PerformanceReview />} />
      <Route path="Guest" element={<Guest />} />
      <Route path="registered-users" element={<RegisteredUsers />} />
      <Route path="certificates" element={<Certificates />} />
      <Route path="results" element={<Results />} />

      {/* Services */}
      <Route path="categories" element={<Categories />} />
      <Route path="categories/add" element={<CategoryForm />} />
      <Route path="categories/edit/:id" element={<CategoryForm />} />
      <Route path="instructors" element={<Instructor />} />
      <Route path="instructors/add" element={<InstructorForm />} />
      <Route path="instructors/edit/:id" element={<InstructorForm />} />
      <Route path="assign-course" element={<AssignCourse />} />
      <Route path="assign-instructor" element={<AssignInstructor />} />
      <Route path="assign-course-student" element={<AssignCourseToStudent />} />
      <Route path="assign-course-student/add" element={<AssignCourseToStudentForm />} />
      <Route path="ADMINENROLLMENTS" element={<ADMINENROLLMENTS />} />

      {/* Admin */}
      <Route path="sub-admins" element={<SubAdmins />} />
      <Route path="students" element={<Student />} />
      <Route path="Students" element={<Student />} />
      <Route path="students/add" element={<StudentForm />} />
      <Route path="Students/add" element={<StudentForm />} />
      <Route path="students/edit/:id" element={<StudentEdit />} />
      <Route path="Students/edit/:id" element={<StudentEdit />} />
      <Route path="students/streak/:id" element={<ViewStreak />} />
      <Route path="Students/streak/:id" element={<ViewStreak />} />

      <Route path="Userprofile" element={<UserProfile />} />

      <Route path="addstudents" element={<Student />} />
      <Route path="addinstructors" element={<Instructor />} />
      <Route path="addcourses" element={<Courses />} />
      <Route path="addquizzes" element={<Quizzes />} />

      <Route path="courses/add" element={<CourseForm />} />
      <Route path="courses/edit/:id" element={<CourseForm />} />
      <Route path="create-sub-admin" element={<CreateSubAdmin />} />
    </Route>
  </Routes>
);
