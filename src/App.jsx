import { BrowserRouter, Routes, Route } from "react-router-dom";

import StudentDashboard from "./pages/studentdashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<StudentDashboard />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;