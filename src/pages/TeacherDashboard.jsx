import { useState, useEffect, useMemo } from "react";
import { supabase } from "../supabaseClient";

const AVATAR_PALETTE = [
  { bg: "#F3D2B6", fg: "#9A5A26" },
  { bg: "#F0C4C6", fg: "#A14257" },
  { bg: "#E7D8AE", fg: "#8A6A1E" },
  { bg: "#CFE0D6", fg: "#3E6A54" },
];

function initialsOf(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function TeacherDashboard() {
  const [userId, setUserId] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("students");
  const [search, setSearch] = useState("");

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonNotes, setNewLessonNotes] = useState("");
  const [newLessonChapter, setNewLessonChapter] = useState(""); // <-- ADDED MISSING STATE
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", session.user.id)
        .single();
      if (profile) setTeacherName(profile.name);

      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("sub_id, name");
        
      if (subjectError) setMessage(`Error loading subjects: ${subjectError.message}`);
      else setSubjects(subjectData || []);

      const { data: lessonData, error: lessonError } = await supabase
        .from("lesson")
        .select("l_id, name, notes, sub_id, chapter");
      if (lessonError) setMessage(`Error loading lessons: ${lessonError.message}`);
      else setLessons(lessonData || []);

      const { data: studentData, error: studentError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("role", "student");
      if (studentError) setMessage(`Error loading students: ${studentError.message}`);
      else setStudents(studentData || []);

      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("student_id, l_id, status");
      if (progressError) setMessage(`Error loading progress: ${progressError.message}`);
      else setProgress(progressData || []);

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
      .insert({ 
        name: newLessonName, 
        notes: newLessonNotes, 
        sub_id: selectedSubject, 
        chapter: newLessonChapter 
      })
      .select();

    if (error) {
      setMessage(`Error creating lesson: ${error.message}`);
    } else {
      setLessons((prev) => [...prev, data[0]]);
      setNewLessonName("");
      setNewLessonNotes("");
      setNewLessonChapter("");
      setShowLessonForm(false);
      setMessage("Lesson created");
    }
  }

  function lessonsForSubject(subId) {
    return lessons.filter((l) => l.sub_id === subId);
  }

  function progressSummary(studentId) {
    const records = progress.filter((p) => p.student_id === studentId);
    const done = records.filter((r) => r.status === "completed").length;
    const total = lessons.length;
    return { done, total };
  }

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
    );
  }, [students, search]);

  if (loading) return <div className="le-loading">Loading your class…</div>;

  return (
    <div className="le-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');

        .le-root {
          --bg: #F1ECD6;
          --card: #FBF8EC;
          --ink: #2B2620;
          --muted: #7A7362;
          --line: #E4DEC5;
          --teal: #4C8577;
          --teal-deep: #2F6B5A;
          --teal-tint: #DCEAE1;
          --coral: #C8654A;
          --coral-tint: #F5DACF;
          font-family: 'Inter', -apple-system, "Segoe UI", sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }
        .le-loading { font-family: 'Inter', sans-serif; padding: 3rem; color: #7A7362; }
        .le-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 2.5rem; border-bottom: 1px solid var(--line);
        }
        .le-brand { display: flex; align-items: center; gap: 0.75rem; }
        .le-brand-icon {
          width: 40px; height: 40px; border-radius: 10px; background: var(--teal);
          color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
        }
        .le-brand-name { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.15rem; line-height: 1.1; }
        .le-brand-sub { font-size: 0.78rem; color: var(--muted); }
        .le-nav-right { display: flex; align-items: center; gap: 0.85rem; }
        .le-pill-static {
          background: var(--teal-tint); color: var(--teal-deep); font-size: 0.78rem;
          font-weight: 500; padding: 0.4rem 0.85rem; border-radius: 999px;
        }
        .le-avatar-sm {
          width: 32px; height: 32px; border-radius: 50%; background: var(--teal); color: white;
          font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; justify-content: center;
        }
        .le-nav-name { font-size: 0.88rem; font-weight: 600; }
        .le-main { max-width: 1100px; margin: 0 auto; padding: 2.5rem; }
        .le-eyebrow {
          letter-spacing: 0.12em; text-transform: uppercase; font-size: 0.72rem;
          font-weight: 600; color: var(--teal-deep); margin-bottom: 0.5rem;
        }
        .le-header-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 2rem; flex-wrap: wrap; }
        .le-title { font-family: 'Fraunces', serif; font-weight: 600; font-size: 2.5rem; line-height: 1.15; margin: 0 0 0.65rem 0; }
        .le-subtitle { color: var(--muted); font-size: 0.95rem; max-width: 34ch; line-height: 1.5; margin: 0; }
        .le-actions { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .le-btn {
          border: none; border-radius: 999px; padding: 0.6rem 1.05rem; font-size: 0.85rem;
          font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem;
        }
        .le-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .le-btn-primary { background: var(--teal); color: white; }
        .le-btn-outline { background: var(--card); color: var(--ink); border: 1px solid var(--line); }
        .le-btn-coral { background: var(--coral-tint); color: var(--coral); border: 1px solid #EBC2AE; }
        .le-message { margin-top: 0.9rem; font-size: 0.85rem; color: var(--teal-deep); }
        .le-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0 1.6rem; }
        .le-stat-card {
          background: var(--card); border: 1px solid var(--line); border-radius: 16px;
          padding: 1.1rem 1.3rem; display: flex; align-items: center; gap: 0.9rem;
        }
        .le-stat-icon {
          width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
          justify-content: center; font-size: 1.2rem; flex-shrink: 0;
        }
        .le-stat-num { font-family: 'Fraunces', serif; font-size: 1.5rem; font-weight: 600; line-height: 1; }
        .le-stat-label { font-size: 0.8rem; color: var(--muted); margin-top: 0.2rem; }
        .le-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .le-tabs { display: inline-flex; background: #EAE4C9; border-radius: 999px; padding: 0.25rem; gap: 0.2rem; }
        .le-tab { border: none; background: transparent; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; color: var(--muted); cursor: pointer; }
        .le-tab.active { background: var(--teal); color: white; }
        .le-search { background: var(--card); border: 1px solid var(--line); border-radius: 999px; padding: 0.5rem 1rem; font-size: 0.85rem; width: 220px; color: var(--ink); }
        .le-search::placeholder { color: var(--muted); }
        .le-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .le-row {
          background: var(--card); border: 1px solid var(--line); border-radius: 16px;
          padding: 1rem 1.2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .le-row-left { display: flex; align-items: center; gap: 0.9rem; }
        .le-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; }
        .le-row-name { font-weight: 600; font-size: 0.95rem; }
        .le-row-email { font-size: 0.8rem; color: var(--muted); }
        .le-row-right { display: flex; align-items: center; gap: 0.6rem; }
        .le-badge { font-size: 0.75rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 999px; background: var(--teal-tint); color: var(--teal-deep); white-space: nowrap; }
        .le-tag { font-size: 0.8rem; font-weight: 600; color: var(--teal-deep); }
        .le-empty { text-align: center; color: var(--muted); padding: 2.5rem 0; font-size: 0.9rem; }
        .le-form { background: var(--card); border: 1px solid var(--line); border-radius: 16px; padding: 1.2rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.7rem; }
        .le-form input, .le-form select, .le-form textarea { border: 1px solid var(--line); border-radius: 10px; padding: 0.6rem 0.8rem; font-family: inherit; font-size: 0.88rem; background: white; color: var(--ink); }
        .le-form textarea { min-height: 80px; resize: vertical; }
        .le-footer { text-align: center; color: var(--muted); font-size: 0.82rem; font-style: italic; padding: 2.5rem 0 1.5rem; }
      `}</style>

      <div className="le-nav">
        <div className="le-brand">
          <div className="le-brand-icon">📖</div>
          <div>
            <div className="le-brand-name">Jumblrr</div>
            <div className="le-brand-sub">Teacher workspace</div>
          </div>
        </div>
        <div className="le-nav-right">
          <span className="le-pill-static">✨ Dyslexia-friendly by default</span>
          <div className="le-avatar-sm">{initialsOf(teacherName) || "TE"}</div>
          <span className="le-nav-name">{teacherName || "Teacher"}</span>
        </div>
      </div>

      <div className="le-main">
        <div className="le-eyebrow">Teacher Dashboard</div>
        <div className="le-header-row">
          <div>
            <h1 className="le-title">
              Hi, {teacherName?.split(" ")[0] || "there"} — <br />
              let's build a great class.
            </h1>
            <p className="le-subtitle">
              Write lessons your class can read with ease. Students join by
              signing up on their own.
            </p>
          </div>
          <div className="le-actions">
            <button
              className="le-btn le-btn-coral"
              onClick={() => { setActiveTab("lessons"); setShowLessonForm(true); }}
            >
              + Add Lesson
            </button>
          </div>
        </div>

        {message && <div className="le-message">{message}</div>}

        <div className="le-stats">
          <div className="le-stat-card">
            <div className="le-stat-icon" style={{ background: "#D7E4DC" }}>👥</div>
            <div>
              <div className="le-stat-num">{students.length}</div>
              <div className="le-stat-label">Students in your class</div>
            </div>
          </div>
          <div className="le-stat-card">
            <div className="le-stat-icon" style={{ background: "#F1D6C7" }}>📚</div>
            <div>
              <div className="le-stat-num">{subjects.length}</div>
              <div className="le-stat-label">Subjects offered</div>
            </div>
          </div>
          <div className="le-stat-card">
            <div className="le-stat-icon" style={{ background: "#E9DDB8" }}>📋</div>
            <div>
              <div className="le-stat-num">{lessons.length}</div>
              <div className="le-stat-label">Lessons published</div>
            </div>
          </div>
        </div>

        <div className="le-controls">
          <div className="le-tabs">
            {["students", "subjects", "lessons"].map((tab) => (
              <button
                key={tab}
                className={`le-tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab[0].toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {activeTab === "students" && (
            <input
              className="le-search"
              placeholder="Search students…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
        </div>

        {activeTab === "students" && (
          <div className="le-list">
            {filteredStudents.length === 0 && (
              <div className="le-empty">No students yet — they'll appear here once they sign up.</div>
            )}
            {filteredStudents.map((student, i) => {
              const palette = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
              const { done, total } = progressSummary(student.id);
              return (
                <div key={student.id} className="le-row">
                  <div className="le-row-left">
                    <div className="le-avatar" style={{ background: palette.bg, color: palette.fg }}>
                      {initialsOf(student.name)}
                    </div>
                    <div>
                      <div className="le-row-name">{student.name}</div>
                      <div className="le-row-email">✉ {student.email}</div>
                    </div>
                  </div>
                  <div className="le-row-right">
                    <span className="le-badge">{done}/{total} lessons done</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "subjects" && (
          <div className="le-list">
            {subjects.length === 0 && <div className="le-empty">No subjects yet.</div>}
            {subjects.map((s) => (
              <div key={s.sub_id} className="le-row">
                <div className="le-row-left">
                  <div className="le-avatar" style={{ background: "#DCEAE1", color: "#2F6B5A" }}>{initialsOf(s.name)}</div>
                  <div className="le-row-name">{s.name}</div>
                </div>
                <div className="le-row-right">
                  <span className="le-tag">{lessonsForSubject(s.sub_id).length} lessons</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "lessons" && (
          <>
            {showLessonForm ? (
              <form className="le-form" onSubmit={createLesson}>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} required>
                  <option value="">Select subject</option>
                  {subjects.map((s) => <option key={s.sub_id} value={s.sub_id}>{s.name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Lesson name"
                  value={newLessonName}
                  onChange={(e) => setNewLessonName(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Lesson content"
                  value={newLessonNotes}
                  onChange={(e) => setNewLessonNotes(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Chapter"
                  value={newLessonChapter}
                  onChange={(e) => setNewLessonChapter(e.target.value)}
                  required
                />
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button type="submit" className="le-btn le-btn-primary">Save lesson</button>
                  <button type="button" className="le-btn le-btn-outline" onClick={() => setShowLessonForm(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                <button className="le-btn le-btn-coral" onClick={() => setShowLessonForm(true)}>
                  + Add Lesson
                </button>
              </div>
            )}
            <div className="le-list">
              {lessons.length === 0 && <div className="le-empty">No lessons published yet.</div>}
              {lessons.map((lesson) => {
                const subject = subjects.find((s) => s.sub_id === lesson.sub_id);
                return (
                  <div key={lesson.l_id} className="le-row">
                    <div className="le-row-left">
                      <div className="le-avatar" style={{ background: "#F1D6C7", color: "#B75B3E" }}>{initialsOf(lesson.name)}</div>
                      <div>
                        <div className="le-row-name">{lesson.name}</div>
                        <div className="le-row-email">{subject?.name || "No subject"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="le-footer">Built with care · Jumblrr makes reading easier for every learner.</div>
      </div>
    </div>
  );
}

export default TeacherDashboard;