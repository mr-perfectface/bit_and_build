import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function StudentDashboard() {

  const navigate = useNavigate();

  // ================= ACCESSIBILITY SETTINGS =================

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(18);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [wordSpacing, setWordSpacing] = useState(2);

  const [backgroundColor, setBackgroundColor] =
    useState("#FFF8E7");

  const [readingRuler, setReadingRuler] =
    useState(false);

  const [boldText, setBoldText] =
    useState(false);

  const [highlightLinks, setHighlightLinks] =
    useState(false);

  const [reduceMotion, setReduceMotion] =
    useState(false);

  const [accessibilityOpen, setAccessibilityOpen] =
    useState(true);

  const [mouseY, setMouseY] = useState(0);

  // ================= SUBJECTS =================

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {

    setLoading(true);

    const { data, error } = await supabase
      .from("subjects")
      .select("sub_id, name")
      .order("created_at", {
        ascending: true,
      });

    if (error) {

      console.error(
        "Error loading subjects:",
        error
      );

      setSubjects([]);

    } else {

      setSubjects(data || []);

    }

    setLoading(false);
  }

  // ================= SUBJECT ICON =================

  function getSubjectIcon(name) {

    const subject = name.toLowerCase();

    if (subject.includes("math")) return "🧮";
    if (subject.includes("science")) return "🧪";
    if (subject.includes("english")) return "📖";
    if (subject.includes("history")) return "🏛️";
    if (subject.includes("geography")) return "🌍";
    if (subject.includes("art")) return "🎨";

    return "📚";
  }

  // ================= SUBJECT DESCRIPTION =================

  function getSubjectDescription(name) {

    const subject = name.toLowerCase();

    if (subject.includes("math"))
      return "Numbers, patterns and problem solving";

    if (subject.includes("science"))
      return "Explore nature and discover how things work";

    if (subject.includes("english"))
      return "Reading, stories and language";

    if (subject.includes("history"))
      return "Discover people, places and the past";

    if (subject.includes("geography"))
      return "Explore our planet and the world around us";

    if (subject.includes("art"))
      return "Creativity, colours and imagination";

    return "Explore this subject";
  }

  // ================= OPEN SUBJECT =================

  function openSubject(subject) {

    navigate(`/chapters/${subject.sub_id}`);

  }

  // ================= READING RULER =================

  function handleMouseMove(e) {

    if (readingRuler) {
      setMouseY(e.clientY);
    }

  }

  // ================= SAVE ACCESSIBILITY =================

  async function savePreferences() {

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {

      alert("Please login first.");

      return;

    }

    const { error } = await supabase
      .from("student_settings")
      .upsert({

        student_id: user.id,

        font_family: fontFamily,

        font_size: fontSize,

        line_spacing: lineHeight,

        letter_spacing: letterSpacing,

        word_spacing: wordSpacing,

        background_color: backgroundColor,

        reading_speed: 0.8,

        reading_ruler: readingRuler,

        bold_text: boldText,

        highlight_links: highlightLinks,

        reduce_motion: reduceMotion,

        updated_at:
          new Date().toISOString(),

      });

    if (error) {

      console.error(error);

      alert(
        "Failed to save preferences."
      );

    } else {

      alert(
        "Accessibility preferences saved!"
      );

    }

  }

  // ================= PAGE =================

  return (

    <div
      className={
        reduceMotion
          ? "student-page no-motion"
          : "student-page"
      }

      style={{
        backgroundColor,
      }}

      onMouseMove={handleMouseMove}
    >

      {/* ================= HEADER ================= */}

      <header className="student-header">

        <div className="logo">
          📖
          <span>LearnEase</span>
        </div>

        <div className="welcome-text">

          <span>Welcome back!</span>

          <h2>
            Hi, Aarav — ready to learn?
          </h2>

        </div>

        <div className="header-profile">
          👨‍🎓
        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="student-main">

        {/* PAGE INTRO */}

        <section className="dashboard-intro">

          <div>

            <p className="eyebrow">
              YOUR LEARNING SPACE
            </p>

            <h1>
              My Subjects
            </h1>

            <p>
              Choose a subject to explore
              chapters and lessons.
            </p>

          </div>

          <div className="learning-tip">

            <span>💡</span>

            <div>

              <strong>
                Learning Tip
              </strong>

              <p>
                Read at your own pace.
                Use the accessibility settings
                whenever you need them.
              </p>

            </div>

          </div>

        </section>


        {/* ================= SUBJECTS ================= */}

        {loading && (

          <div className="loading-card">

            <div className="loading-icon">
              📚
            </div>

            <h3>
              Loading your subjects...
            </h3>

            <p>
              Getting your learning space ready.
            </p>

          </div>

        )}


        {!loading &&
          subjects.length === 0 && (

          <div className="empty-message">

            <div className="empty-icon">
              📚
            </div>

            <h2>
              No subjects available
            </h2>

            <p>
              Your teacher has not added
              subjects yet.
            </p>

          </div>

        )}


        {!loading &&
          subjects.length > 0 && (

          <div className="subjects-grid">

            {subjects.map((subject) => (

              <button
                key={subject.sub_id}
                className="subject-card"
                onClick={() =>
                  openSubject(subject)
                }
              >

                <div className="subject-icon">

                  {getSubjectIcon(
                    subject.name
                  )}

                </div>

                <h2>
                  {subject.name}
                </h2>

                <p>
                  {getSubjectDescription(
                    subject.name
                  )}
                </p>

                <div className="card-footer">

                  <span>
                    Explore chapters
                  </span>

                  <span className="arrow">
                    →
                  </span>

                </div>

              </button>

            ))}

          </div>

        )}

      </main>


      {/* ================= ACCESSIBILITY BUTTON ================= */}

      <button
        className="accessibility-float"
        onClick={() =>
          setAccessibilityOpen(
            !accessibilityOpen
          )
        }
        aria-label="Accessibility settings"
      >

        Aa

      </button>


      {/* ================= ACCESSIBILITY PANEL ================= */}

      {accessibilityOpen && (

        <aside className="accessibility-panel">

          <div className="accessibility-header">

            <div>

              <p>
                PERSONALIZE
              </p>

              <h2>
                Accessibility
              </h2>

            </div>

            <button
              className="close-accessibility"
              onClick={() =>
                setAccessibilityOpen(false)
              }
            >
              ×
            </button>

          </div>


          {/* PROFILE */}

          <div className="profile-card">

            <div className="profile-image">
              👨‍🎓
            </div>

            <div>

              <strong>
                Piyush Kumar
              </strong>

              <span>
                Class 5 • Student
              </span>

            </div>

          </div>


          <div className="settings-title">
            Reading Settings
          </div>


          {/* FONT */}

          <div className="setting-group">

            <label>
              Font Family
            </label>

            <select
              value={fontFamily}
              onChange={(e) =>
                setFontFamily(
                  e.target.value
                )
              }
            >

              <option value="Arial">
                Arial
              </option>

              <option value="Verdana">
                Verdana
              </option>

              <option value="Georgia">
                Georgia
              </option>

              <option value="OpenDyslexic">
                OpenDyslexic
              </option>

              <option value="Lexend">
                Lexend
              </option>

            </select>

          </div>


          {/* FONT SIZE */}

          <div className="setting-group">

            <label>
              Font Size
              <span>{fontSize}px</span>
            </label>

            <input
              type="range"
              min="14"
              max="30"
              value={fontSize}
              onChange={(e) =>
                setFontSize(
                  Number(e.target.value)
                )
              }
            />

          </div>


          {/* LETTER SPACING */}

          <div className="setting-group">

            <label>
              Letter Spacing
              <span>
                {letterSpacing}px
              </span>
            </label>

            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={letterSpacing}
              onChange={(e) =>
                setLetterSpacing(
                  Number(e.target.value)
                )
              }
            />

          </div>


          {/* LINE HEIGHT */}

          <div className="setting-group">

            <label>
              Line Height
              <span>
                {lineHeight}
              </span>
            </label>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={lineHeight}
              onChange={(e) =>
                setLineHeight(
                  Number(e.target.value)
                )
              }
            />

          </div>


          {/* WORD SPACING */}

          <div className="setting-group">

            <label>
              Word Spacing
              <span>
                {wordSpacing}px
              </span>
            </label>

            <input
              type="range"
              min="0"
              max="10"
              value={wordSpacing}
              onChange={(e) =>
                setWordSpacing(
                  Number(e.target.value)
                )
              }
            />

          </div>


          {/* BACKGROUND */}

          <div className="setting-group">

            <label>
              Background Tint
            </label>

            <div className="color-options">

              <button
                className="color-box cream"
                onClick={() =>
                  setBackgroundColor(
                    "#FFF8E7"
                  )
                }
              />

              <button
                className="color-box white"
                onClick={() =>
                  setBackgroundColor(
                    "#FFFFFF"
                  )
                }
              />

              <button
                className="color-box blue"
                onClick={() =>
                  setBackgroundColor(
                    "#E8F1FF"
                  )
                }
              />

              <button
                className="color-box green"
                onClick={() =>
                  setBackgroundColor(
                    "#E8F5E9"
                  )
                }
              />

              <button
                className="color-box peach"
                onClick={() =>
                  setBackgroundColor(
                    "#FFE8D6"
                  )
                }
              />

            </div>

          </div>


          {/* TOGGLES */}

          <div className="accessibility-options">

            <SettingToggle
              name="Reading Ruler"
              value={readingRuler}
              setValue={setReadingRuler}
            />

            <SettingToggle
              name="Bold Text"
              value={boldText}
              setValue={setBoldText}
            />

            <SettingToggle
              name="Highlight Links"
              value={highlightLinks}
              setValue={setHighlightLinks}
            />

            <SettingToggle
              name="Reduce Motion"
              value={reduceMotion}
              setValue={setReduceMotion}
            />

          </div>


          {/* SAVE */}

          <button
            className="save-button"
            onClick={savePreferences}
          >
            ✓ Save Preferences
          </button>

        </aside>

      )}


      {/* ================= READING RULER ================= */}

      {readingRuler && (

        <div
          className="reading-ruler"
          style={{
            top: `${mouseY - 20}px`,
          }}
        />

      )}

    </div>

  );

}


/* ================= TOGGLE ================= */

function SettingToggle({
  name,
  value,
  setValue,
}) {

  return (

    <div className="setting-row">

      <span>
        {name}
      </span>

      <button
        className={
          value
            ? "toggle active"
            : "toggle"
        }
        onClick={() =>
          setValue(!value)
        }
      >

        <span />

      </button>

    </div>

  );

}


export default StudentDashboard;