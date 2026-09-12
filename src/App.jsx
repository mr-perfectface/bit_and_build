import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/roleselection";
import StudentLogin from "./pages/studentLogin";
import TeacherAuth from "./pages/teacherauth";
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<RoleSelection />}
        />

        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        <Route
          path="/teacher-auth"
          element={<TeacherAuth />}
        />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

        

      </Routes>

    </BrowserRouter>
  );
}

export default App;