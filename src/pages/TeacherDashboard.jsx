import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

function TeacherDashboard() {
  const [userId, setUserId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // form state for creating a new lesson
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonNotes, setNewLessonNotes] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        setMessage("Not logged in");
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      // Fetch subjects owned by this teacher
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("sub_id, name")
        .eq("teacher_id", session.user.id);
      if (subjectError) setMessage(`Error loading subjects: ${subjectError.message}`);
      else setSubjects(subjectData);

      // Fetch all lessons (frontend filters to this teacher's subjects)
      const { data: lessonData, error: lessonError } = await supabase
        .from("lesson")
        .select("l_id, name, notes, sub_id");
      if (lessonError) setMessage(`Error loading lessons: ${lessonError.message}`);
      else setLessons(lessonData);

      // Fetch all students (teachers can see all profiles per RLS policy)
      const { data: studentData, error: studentError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "student");
      if (studentError) setMessage(`Error loading students: ${studentError.message}`);
      else setStudents(studentData);

      // Fetch all progress records (teachers can see all per RLS policy)
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("student_id, l_id, status");
      if (progressError) setMessage(`Error loading progress: ${progressError.message}`);
      else setProgress(progressData);

      setLoading(false);
    }
    init();
  }, []);

  async function createLesson(e) {
    e.preventDefault();
    if (!selectedSubject) {
      setMessage("Select a subject first");
      return;
    }
    const { data, error } = await supabase
      .from("lesson")
      .insert({ name: newLessonName, notes: newLessonNotes, sub_id: selectedSubject })
      .select();

    if (error) {
      setMessage(`Error creating lesson: ${error.message}`);
    } else {
      setMessage("Lesson created");
      setLessons((prev) => [...prev, data[0]]);
      setNewLessonName("");
      setNewLessonNotes("");
    }
  }

  function getStudentProgressForLesson(studentId, lessonId) {
    const record = progress.find((p) => p.student_id === studentId && p.l_id === lessonId);
    return record ? record.status : "not_started";
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Teacher Dashboard</h1>
      <p>{message}</p>

      <h2>Your Subjects</h2>
      <ul>
        {subjects.map((s) => (
          <li key={s.sub_id}>{s.name}</li>
        ))}
      </ul>

      <h2>Create Lesson</h2>
      <form onSubmit={createLesson}>
        <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="">Select subject</option>
          {subjects.map((s) => (
            <option key={s.sub_id} value={s.sub_id}>{s.name}</option>
          ))}
        </select>
        <br />
        <input
          type="text"
          placeholder="Lesson name"
          value={newLessonName}
          onChange={(e) => setNewLessonName(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Lesson content"
          value={newLessonNotes}
          onChange={(e) => setNewLessonNotes(e.target.value)}
          required
        />
        <br />
        <button type="submit">Add Lesson</button>
      </form>

      <h2>Student Progress</h2>
      {students.map((student) => (
        <div key={student.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h3>{student.name} ({student.email})</h3>
          {lessons.map((lesson) => (
            <p key={lesson.l_id}>
              {lesson.name}: {getStudentProgressForLesson(student.id, lesson.l_id)}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default TeacherDashboard;