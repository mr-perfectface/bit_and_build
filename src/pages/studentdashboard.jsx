import { useState } from "react";
import { supabase } from "../supabase";

function StudentDashboard() {

  // ================= ACCESSIBILITY SETTINGS =================

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(18);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [wordSpacing, setWordSpacing] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState("#FFF8E7");

  const [readingRuler, setReadingRuler] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // ================= READING RULER =================

  const [mouseY, setMouseY] = useState(0);

  function handleMouseMove(e) {
    if (readingRuler) {
      setMouseY(e.clientY);
    }
  }

  // ================= TEXT TO SPEECH =================

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.8);

  function speakLesson() {

    window.speechSynthesis.cancel();

    const text = `
      Understanding Fractions.

      A fraction represents a part of a whole.
      It has two numbers: a numerator and a denominator.

      The numerator is the number on top.
      It tells us how many parts we have.

      The denominator is the number at the bottom.
      It tells us how many equal parts the whole is divided into.

      Example.

      If a pizza is divided into 4 equal pieces
      and you eat 1 piece, you have eaten one fourth of the pizza.
    `;

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = speechRate;
    speech.pitch = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
    };

    speech.onend = () => {
      setIsSpeaking(false);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(speech);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  // ================= SUBJECTS =================

  const subjects = [
    {
      name: "Math",
      icon: "🔢",
      chapter: "Chapter 3 — Fractions",
      description: "Understanding parts of a whole",
    },
    {
      name: "Science",
      icon: "🧪",
      chapter: "Chapter 5 — Ecosystems",
      description: "Exploring habitats",
    },
    {
      name: "English",
      icon: "📜",
      chapter: "Chapter 2 — Story Structure",
      description: "Learning about plot",
    },
    {
      name: "History",
      icon: "📜",
      chapter: "Chapter 4 — Ancient Egypt",
      description: "Pyramids and pharaohs",
    },
    {
      name: "Geography",
      icon: "🌍",
      chapter: "Chapter 1 — Maps & Compass",
      description: "Navigating the world",
    },
    {
      name: "Art",
      icon: "🎨",
      chapter: "Chapter 6 — Color Theory",
      description: "Mixing and matching",
    },
  ];

  // ================= SAVE PREFERENCES =================

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
        reading_speed: speechRate,

        reading_ruler: readingRuler,
        bold_text: boldText,
        highlight_links: highlightLinks,
        reduce_motion: reduceMotion,

        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } else {
      alert("Preferences saved successfully!");
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
        backgroundColor: backgroundColor,
      }}
      onMouseMove={handleMouseMove}
    >

      {/* ================= MAIN CONTENT ================= */}

      <main className="student-main">

        {/* HEADER */}

        <header className="student-header">

          <div className="logo">
            📖 <span>LearnEase</span>
          </div>

          <h2>
            Hi, Aarav — ready to learn?
          </h2>

          <div className="profile-small">
            👨‍🎓
          </div>

        </header>


        {/* ================= SUBJECTS ================= */}

        <h1>
          My Subjects
        </h1>

        <p className="subtitle">
          Tap a card to start reading
        </p>


        <div className="subjects-grid">

          {subjects.map((subject) => (

            <div
              className="subject-card"
              key={subject.name}
            >

              <div className="subject-icon">
                {subject.icon}
              </div>

              <h2>
                {subject.name}
              </h2>

              <p>
                {subject.chapter}
              </p>

              <small>
                {subject.description}
              </small>

            </div>

          ))}

        </div>


        {/* ================= LESSON READER ================= */}

        <div className="lesson-reader">

          <p className="lesson-label">
            CURRENT LESSON
          </p>

          <h1>
            Understanding Fractions
          </h1>


          {/* LESSON CONTENT */}

          <div
            className="lesson-content"
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight,
              wordSpacing: `${wordSpacing}px`,
              fontWeight: boldText ? "700" : "400",
            }}
          >

            <p>
              A fraction represents a part of a whole.
              It has two numbers: a numerator and a denominator.
            </p>

            <p>
              The numerator is the number on top.
              It tells us how many parts we have.
            </p>

            <p>
              The denominator is the number at the bottom.
              It tells us how many parts the whole is divided into.
            </p>


            {/* EXAMPLE */}

            <div className="lesson-example">

              <strong>
                Example:
              </strong>

              <p>
                If a pizza is divided into 4 equal pieces
                and you eat 1 piece, you have eaten
                <strong> 1/4 </strong>
                of the pizza.
              </p>

            </div>

          </div>


          {/* ================= READ ALOUD ================= */}

          <div className="speech-controls">

            {!isSpeaking ? (

              <button
                className="speak-button"
                onClick={speakLesson}
              >
                🔊 Read Aloud
              </button>

            ) : (

              <button
                className="stop-button"
                onClick={stopSpeaking}
              >
                ⏹ Stop
              </button>

            )}

          </div>

        </div>

      </main>


      {/* ================= ACCESSIBILITY PANEL ================= */}

      <aside className="accessibility-panel">

        <h2>
          Accessibility & Profile
        </h2>


        {/* PROFILE */}

        <div className="profile-card">

          <div className="profile-image">
            👨‍🎓
          </div>

          <div>

            <strong>
              Aarav Sharma
            </strong>

            <br />

            <span>
              Class 5
            </span>

          </div>

        </div>


        <h3>
          Reading Settings
        </h3>


        {/* FONT FAMILY */}

        <label>
          Font Family
        </label>

        <select
          value={fontFamily}
          onChange={(e) =>
            setFontFamily(e.target.value)
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


        {/* FONT SIZE */}

        <label>
          Font Size: {fontSize}px
        </label>

        <input
          type="range"
          min="14"
          max="30"
          value={fontSize}
          onChange={(e) =>
            setFontSize(Number(e.target.value))
          }
        />


        {/* LETTER SPACING */}

        <label>
          Letter Spacing: {letterSpacing}px
        </label>

        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={letterSpacing}
          onChange={(e) =>
            setLetterSpacing(Number(e.target.value))
          }
        />


        {/* LINE HEIGHT */}

        <label>
          Line Height: {lineHeight}
        </label>

        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={lineHeight}
          onChange={(e) =>
            setLineHeight(Number(e.target.value))
          }
        />


        {/* WORD SPACING */}

        <label>
          Word Spacing: {wordSpacing}px
        </label>

        <input
          type="range"
          min="0"
          max="10"
          value={wordSpacing}
          onChange={(e) =>
            setWordSpacing(Number(e.target.value))
          }
        />


        {/* READING SPEED */}

        <label>
          Reading Speed: {speechRate}x
        </label>

        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={speechRate}
          onChange={(e) =>
            setSpeechRate(Number(e.target.value))
          }
        />


        {/* BACKGROUND */}

        <label>
          Background Tint
        </label>

        <div className="color-options">

          <button
            className="color-box cream"
            onClick={() =>
              setBackgroundColor("#FFF8E7")
            }
          />

          <button
            className="color-box white"
            onClick={() =>
              setBackgroundColor("#FFFFFF")
            }
          />

          <button
            className="color-box blue"
            onClick={() =>
              setBackgroundColor("#E8F1FF")
            }
          />

          <button
            className="color-box green"
            onClick={() =>
              setBackgroundColor("#E8F5E9")
            }
          />

          <button
            className="color-box peach"
            onClick={() =>
              setBackgroundColor("#FFE8D6")
            }
          />

        </div>


        {/* TOGGLES */}

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


        {/* SAVE */}

        <button
          className="save-button"
          onClick={savePreferences}
        >
          Save Preferences
        </button>

      </aside>


      {/* ================= VOICE NOTES ================= */}

      <button className="voice-button">

        🎤

        <span>
          Voice Notes
        </span>

      </button>


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


/* ================= TOGGLE COMPONENT ================= */

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

        <span></span>

      </button>

    </div>

  );
}


export default StudentDashboard;