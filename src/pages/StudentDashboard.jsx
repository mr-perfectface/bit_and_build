import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const SUBJECT_ICONS = {
  Math: "🧮",
  Science: "🧪",
  English: "📄",
  History: "📜",
  Geography: "🌍",
  Art: "🎨",
};

const BG_TINTS = ["#ffffff", "#e8d9c3", "#a9c4dd", "#1e2530"];

function StudentDashboard() {
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    font_size: 110,
    letter_spacing: 0.5,
    line_spacing: 1.5,
    word_spacing: 1,
    bg_color: "#ffffff",
  });
  const [hasExistingPrefs, setHasExistingPrefs] = useState(false);
  const [fontFamily, setFontFamily] = useState("OpenDyslexic");

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
      if (profile) setName(profile.name);

      // Fetch subjects, one card per subject
      const { data: subjectData, error: subjectError } = await supabase
        .from("subjects")
        .select("sub_id, name");
      if (subjectError) setMessage(`Error loading subjects: ${subjectError.message}`);
      else setSubjects(subjectData || []);

      const { data: prefData } = await supabase
        .from("preferences")
        .select("*")
        .eq("student_id", session.user.id)
        .maybeSingle();

      if (prefData) {
        setPrefs({
          font_size: prefData.font_size ?? 110,
          letter_spacing: prefData.letter_spacing ?? 0.5,
          line_spacing: prefData.line_spacing ?? 1.5,
          word_spacing: prefData.word_spacing ?? 1,
          bg_color: prefData.bg_color ?? "#ffffff",
        });
        setHasExistingPrefs(true);
      }

      setLoading(false);
    }
    init();
  }, []);

  function updatePref(key, value) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }

  async function savePreferences() {
    if (hasExistingPrefs) {
      const { error } = await supabase
        .from("preferences")
        .update(prefs)
        .eq("student_id", userId);
      if (error) {
        setMessage(`Error saving preferences: ${error.message}`);
        return;
      }
    } else {
      const { error } = await supabase
        .from("preferences")
        .insert({ student_id: userId, ...prefs });
      if (error) {
        setMessage(`Error saving preferences: ${error.message}`);
        return;
      }
      setHasExistingPrefs(true);
    }
    setMessage("Preferences saved");
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>📖</span>
          <span style={styles.logoText}>LearnEase</span>
        </div>
        <h2 style={styles.greeting}>Hi, {name || "there"} — ready to learn?</h2>
        <div style={styles.avatar}>{(name || "?").charAt(0)}</div>
      </div>

      <div style={styles.body}>
        <div style={styles.main}>
          <h1 style={styles.sectionTitle}>My Subjects</h1>
          <p style={styles.sectionSubtitle}>Tap a card to start reading</p>

          {message && <p style={styles.message}>{message}</p>}

          <div style={styles.grid}>
            {subjects.map((subject) => {
              const icon = SUBJECT_ICONS[subject.name] || "📘";
              return (
                <div
                  key={subject.sub_id}
                  style={styles.card}
                  onClick={() => navigate(`/subject/${subject.sub_id}`)}
                >
                  <div style={styles.cardIcon}>{icon}</div>
                  <h3 style={styles.cardTitle}>{subject.name}</h3>
                </div>
              );
            })}
            {subjects.length === 0 && <p>No subjects available yet.</p>}
          </div>
        </div>

        <div style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Accessibility &amp; Profile</h3>
          <div style={styles.profileRow}>
            <div style={styles.smallAvatar}>{(name || "?").charAt(0)}</div>
            <span style={styles.profileName}>{name}</span>
          </div>

          <h4 style={styles.settingsHeading}>Reading Settings</h4>

          <label style={styles.label}>Font Family</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            style={styles.select}
          >
            <option value="OpenDyslexic">OpenDyslexic</option>
            <option value="Lexend">Lexend</option>
            <option value="Default">Default</option>
          </select>

          <SliderRow
            label="Font Size"
            value={prefs.font_size}
            unit="%"
            min={80}
            max={160}
            onChange={(v) => updatePref("font_size", v)}
          />
          <SliderRow
            label="Letter Spacing"
            value={prefs.letter_spacing}
            unit=""
            prefix="+"
            min={0}
            max={3}
            step={0.1}
            onChange={(v) => updatePref("letter_spacing", v)}
          />
          <SliderRow
            label="Line Height"
            value={prefs.line_spacing}
            unit=""
            min={1}
            max={2.5}
            step={0.1}
            onChange={(v) => updatePref("line_spacing", v)}
          />
          <SliderRow
            label="Word Spacing"
            value={prefs.word_spacing}
            unit=""
            prefix="+"
            min={0}
            max={4}
            step={0.5}
            onChange={(v) => updatePref("word_spacing", v)}
          />

          <label style={styles.label}>Background Tint</label>
          <div style={styles.tintRow}>
            {BG_TINTS.map((tint) => (
              <div
                key={tint}
                onClick={() => updatePref("bg_color", tint)}
                style={{
                  ...styles.tintSwatch,
                  backgroundColor: tint,
                  border: prefs.bg_color === tint ? "3px solid #3f9c8f" : "1px solid #ccc",
                }}
              />
            ))}
          </div>

          <button style={styles.saveButton} onClick={savePreferences}>
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, value, unit, prefix = "", min, max, step = 1, onChange }) {
  return (
    <div style={styles.sliderRow}>
      <div style={styles.sliderLabelRow}>
        <span style={styles.label}>{label}</span>
        <span style={styles.sliderValue}>{prefix}{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={styles.slider}
      />
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#faf3e7", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 2rem", borderBottom: "1px solid #e8dcc4" },
  logoRow: { display: "flex", alignItems: "center", gap: "0.5rem" },
  logoIcon: { fontSize: "1.6rem" },
  logoText: { fontSize: "1.4rem", fontWeight: "800", color: "#3f9c8f" },
  greeting: { fontSize: "1.3rem", fontWeight: "700", color: "#2f2b26", margin: 0 },
  avatar: { width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "#f2c14e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  body: { display: "flex", gap: "2rem", padding: "2rem", flexWrap: "wrap" },
  main: { flex: "3 1 600px" },
  sectionTitle: { fontSize: "1.8rem", fontWeight: "800", margin: "0 0 0.25rem 0", color: "#2f2b26" },
  sectionSubtitle: { color: "#6b6459", marginBottom: "1.5rem" },
  message: { color: "#c05f3d", fontWeight: "600" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", cursor: "pointer", boxShadow: "0 6px 16px -4px rgba(0,0,0,0.06)", textAlign: "center" },
  cardIcon: { fontSize: "2.5rem", marginBottom: "0.75rem" },
  cardTitle: { fontSize: "1.2rem", fontWeight: "700", margin: "0 0 0.5rem 0", color: "#2f2b26" },
  sidebar: { flex: "1 1 300px", backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 6px 16px -4px rgba(0,0,0,0.06)", height: "fit-content" },
  sidebarTitle: { margin: "0 0 1rem 0", color: "#2f2b26" },
  profileRow: { display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" },
  smallAvatar: { width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#f2c14e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" },
  profileName: { fontWeight: "600", color: "#2f2b26" },
  settingsHeading: { margin: "0 0 0.75rem 0", color: "#2f2b26" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#2f2b26" },
  select: { width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid #e4dcc9", marginTop: "0.4rem", marginBottom: "1rem" },
  sliderRow: { marginBottom: "1rem" },
  sliderLabelRow: { display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" },
  sliderValue: { fontSize: "0.85rem", color: "#3f9c8f", fontWeight: "700" },
  slider: { width: "100%" },
  tintRow: { display: "flex", gap: "0.6rem", margin: "0.5rem 0 1.25rem 0" },
  tintSwatch: { width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer" },
  saveButton: { width: "100%", padding: "0.85rem", borderRadius: "10px", border: "none", backgroundColor: "#3f9c8f", color: "#fff", fontWeight: "700", cursor: "pointer", marginTop: "0.5rem" },
};

export default StudentDashboard;