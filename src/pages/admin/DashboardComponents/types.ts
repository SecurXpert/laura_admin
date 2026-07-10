export interface DashboardSummary {
  students: number;
  instructors: number;
  courses: number;
  quizzes: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  language: string;
  category_id: number;
  image: string;
  status: string;
  schedule: string;
  instructor_id: number;
}

export interface EnrollmentChartItem {
  month: string;
  students: number;
}
