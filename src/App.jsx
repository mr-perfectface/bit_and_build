import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/roleselection";
import StudentLogin from "./pages/studentlogin";
import TeacherAuth from "./pages/teacherauth";

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

      </Routes>

    </BrowserRouter>
  );
}

export default App;