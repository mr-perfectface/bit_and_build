import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/roleselection";
import StudentLogin from "./pages/studentLogin";
import TeacherAuth from "./pages/teacherauth";

import StudentDashboard from "./pages/studentdashboard";
import ChapterPage from "./pages/ChapterPage";
import LessonPage from "./pages/lessonpage";
import TeacherDashboard from "./pages/TeacherDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<RoleSelection />} />

        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        <Route
          path="/teacher-auth"
          element={<TeacherAuth />}
        />
        <Route
         path="/teacher-dashboard"
         element={<TeacherDashboard />}
        />
        <Route
         
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* Subject → Chapters */}
        <Route
          path="/chapters/:subjectId"
          element={<ChapterPage />}
        />

        {/* Chapter → Lessons */}
        <Route
          path="/lessons/:subjectId/:chapter"
          element={<LessonPage />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;