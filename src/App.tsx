import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CourseForm from "./pages/CourseForm";

import Dashboard from "./pages/Dashboard";
import Quizzes from "./pages/Quizzes";
import Attendance from "./pages/Attendance";
import AttendanceForm from "./pages/AttendanceForm";
import AttendanceDetails from "./pages/AttendanceDetails";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import AdminQuizzes from "./pages/AdminQuizzes";
import NotFound from "./pages/NotFound";
import AllUsers from "./pages/Allusers";

// Services
import Categories from "./pages/Services/Categories";
import CategoryForm from "./pages/Services/CategoryForm";
import Instructor from "./pages/Services/Instructor";
import InstructorForm from "./pages/Services/InstructorForm";
import AssignCourse from "./pages/AssignCourse";
import AssignInstructor from "./pages/AssignInstructor";
import AssignCourseToStudent from "./pages/AssignCourseToStudent";
import AssignCourseToStudentForm from "./pages/AssignCourseToStudentForm";
import ADMINENROLLMENTS from "./pages/ADMINENROLLMENTS";

// Admin pages
import SubAdmins from "./pages/SubAdmins";
import Student from "./pages/Student";
import StudentForm from "./pages/StudentForm";
import StudentEdit from "./pages/StudentEdit";
import ViewStreak from "./pages/ViewStreak";

import LiveClasses from "./pages/LiveClasses";
import RecordedVideos from "./pages/RecordedVideos";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import GuestQuizzes from "./pages/GuestQuizzes";
import Reviews from "./pages/Reviews";
import PerformanceReview from "./pages/PerformanceReview";
import Guest from "./pages/Guest";
import GuestExams from "./pages/GuestExams";
import ViewGuestExam from "./pages/ViewGuestExam";
import GuestCompilerQuestions from "./pages/GuestCompilerQuestions";
import GuestCompilerQuestion from "./pages/GuestCompilerQuestion";
import ViewGuestCompilerQuestion from "./pages/ViewGuestCompilerQuestion";

// Student components
import StudentExams from "./pages/StudentExams";
import ViewStudentExam from "./pages/ViewStudentExam";
import StudentCompilerQuestions from "./pages/StudentCompilerQuestions";
import StudentCompilerQuestion from "./pages/StudentCompilerQuestion";
import ViewStudentCompilerQuestion from "./pages/ViewStudentCompilerQuestion";

import CreateSubAdmin from "./pages/CreateSubadmin";
import ScrollToTop from "./components/ScrollToTop";
import RegisteredUsers from "./pages/RegisteredUsers";
import Certificates from "./pages/Certificates";
import ResumeBuilder from "./pages/Resume";
import Results from "./pages/Results";
import SubAdminLogin from "./subadmin/src/pages/Login";
import { SubAdminRoutes } from "./subadmin/src/App";



const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public */}
            <Route path="/" element={<AdminLogin />} />
            <Route path="/subadmin-login" element={<SubAdminLogin />} />
            <Route path="/subadmin/*" element={<SubAdminRoutes />} />

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
              <Route path="guestquizzes" element={<GuestQuizzes />} />
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
              <Route
                path="create-sub-admin"
                element={<CreateSubAdmin />}
              />
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
              <Route path="guestquizzes" element={<GuestQuizzes />} />
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
              <Route
                path="create-sub-admin"
                element={<CreateSubAdmin />}
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;



// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";


// // Pages
// import Dashboard from "./pages/Dashboard";
// import Quizzes from "./pages/Quizzes";
// import Attendance from "./pages/Attendance";
// import Courses from "./pages/Courses";
// import Profile from "./pages/Profile";
// import NotFound from "./pages/NotFound";
// import AllUsers from "./pages/Allusers";


// // Services
// import Categories from "./pages/Services/Categories";
// import Instructor from "./pages/Services/Instructor";
// import AssignCourse from "./pages/AssignCourse";
// import AssignCourseToStudent from "./pages/AssignCourseToStudent";
// import Contactlist from "./pages/Contactlist";

// // Admin
// import SubAdmins from "./pages/SubAdmins";
// import Student from "./pages/Student";

// // Layout & Auth
// import DashboardLayout from "./components/layout/DashboardLayout";
// import ProtectedRoute from "./components/ProtectedRoute";
// import AdminLogin from "./pages/Login";
// import UserProfile from "./pages/UserProfile";
// import GuestQuizzes from "./pages/GuestQuizzes";

// const queryClient = new QueryClient();

// const App = () => {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <TooltipProvider>
//         <Toaster />
//         <Sonner />

//         <BrowserRouter>
//           <Routes>
//             {/* Public */}
//             <Route path="/" element={<AdminLogin />} />

//             {/* Protected Dashboard */}
//             <Route
//               path="/dashboard"
//               element={
//                 <ProtectedRoute>
//                   <DashboardLayout />
//                 </ProtectedRoute>
//               }
//             >
//               {/* Dashboard Home */}
//               <Route index element={<Dashboard />} />

//               {/* Main Pages */}
//               <Route path="quizzes" element={<Quizzes />} />
//             <Route path="GuestQuizzes" element={<GuestQuizzes />} />

//               <Route path="attendance" element={<Attendance />} />
//               <Route path="courses" element={<Courses />} />
//               <Route path="profile" element={<Profile />} />
//               <Route path="user-profile" element={<UserProfile />} />
//               <Route path="Allusers" element={<AllUsers />} />
//               <Route path="students" element={<Student />} />

//               {/* Services */}
//               <Route path="categories" element={<Categories />} />
//               <Route path="instructors" element={<Instructor />} />
//               <Route path="assign-course" element={<AssignCourse />} />
//               <Route
//                 path="assign-course-student"
//                 element={<AssignCourseToStudent />}
//               />
//               <Route path="contacts" element={<Contactlist />} />

//               {/* Admin */}
//               <Route path="sub-admins" element={<SubAdmins />} />
//             </Route>

//             {/* 404 */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </BrowserRouter>
//       </TooltipProvider>
//     </QueryClientProvider>
//   );
// };

// export default App;

// export default App;
