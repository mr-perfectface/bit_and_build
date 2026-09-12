import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function LessonPage() {

  const navigate = useNavigate();

  // IMPORTANT:
  // App.jsx will send subjectId and chapter
  const { subjectId, chapter } = useParams();

  // ================= LESSON DATA =================

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= ACCESSIBILITY SETTINGS =================

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [wordSpacing, setWordSpacing] = useState(2);

  const [backgroundColor, setBackgroundColor] = useState("#FFF8E7");

  const [readingRuler, setReadingRuler] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [speechRate, setSpeechRate] = useState(0.8);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [mouseY, setMouseY] = useState(0);

  // ================= FETCH LESSONS =================

  useEffect(() => {
    fetchLessons();
  }, [subjectId, chapter]);

  async function fetchLessons() {

    setLoading(true);

    const decodedChapter = decodeURIComponent(chapter || "");

    const { data, error } = await supabase
      .from("lesson")
      .select("*")
      .eq("sub_id", subjectId)
      .eq("chapter", decodedChapter);

    if (error) {

      console.error("Error fetching lessons:", error);

      setLessons([]);

    } else {

      setLessons(data || []);

    }

    setLoading(false);
  }

  // ================= MOUSE FOR READING RULER =================

  function handleMouseMove(e) {

    if (readingRuler) {
      setMouseY(e.clientY);
    }

  }

  // ================= READ ALOUD =================

  function readAloud(lesson) {

    window.speechSynthesis.cancel();

    const text = `${lesson.name}. ${lesson.notes || ""}`;

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

  // ================= STOP READING =================

  function stopReading() {

    window.speechSynthesis.cancel();

    setIsSpeaking(false);

  }

  // ================= BACK =================

  function goBack() {

    navigate(`/chapters/${subjectId}`);

  }

  // ================= PAGE =================

  return (

    <div
      className={
        reduceMotion
          ? "lesson-page no-motion"
          : "lesson-page"
      }
      style={{
        backgroundColor: backgroundColor
      }}
      onMouseMove={handleMouseMove}
    >

      {/* ================= HEADER ================= */}

      <header className="lesson-header">

        <div className="lesson-logo">
          📖
          <span>LearnEase</span>
        </div>

        <div className="lesson-welcome">

          <span>
            YOUR LEARNING SPACE
          </span>

          <h2>
            Hi, Aarav — ready to learn?
          </h2>

        </div>

        <div className="lesson-profile">
          👨‍🎓
        </div>

      </header>


      {/* ================= MAIN LAYOUT ================= */}

      <div className="lesson-layout">

        {/* ================= CONTENT ================= */}

        <main className="lesson-content-area">

          {/* BACK BUTTON */}

        <button
  className="modern-back-button"
  onClick={() => navigate(`/chapters/${subjectId}`)}
>
  <span className="back-icon">←</span>
  <span>Back to Chapters</span>
</button>


          {/* CHAPTER HEADING */}

          <div className="lesson-title-section">

            <div className="lesson-title-icon">
              📚
            </div>

            <div>

              <p className="lesson-eyebrow">
                CHAPTER
              </p>

              <h1>
                {decodeURIComponent(chapter || "")}
              </h1>

              <p>
                Choose a lesson to start learning.
              </p>

            </div>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="lesson-status-card">

              <div>
                📚
              </div>

              <h2>
                Loading lessons...
              </h2>

            </div>

          )}


          {/* NO LESSONS */}

          {!loading && lessons.length === 0 && (

            <div className="lesson-status-card">

              <div>
                📖
              </div>

              <h2>
                No lessons available yet
              </h2>

              <p>
                Your teacher hasn't added lessons
                for this chapter yet.
              </p>

            </div>

          )}


          {/* LESSONS */}

          {!loading && lessons.length > 0 && (

            <div className="lesson-list">

              {lessons.map((lesson, index) => (

                <article
                  className="lesson-reading-card"
                  key={lesson._id || lesson.id || index}
                >

                  {/* LESSON NUMBER */}

                  <div className="lesson-number">
                    {index + 1}
                  </div>


                  {/* LESSON CONTENT */}

                  <div
                    className="lesson-text"
                    style={{
                      fontFamily: fontFamily,
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      wordSpacing: `${wordSpacing}px`,
                      fontWeight: boldText
                        ? "700"
                        : "400"
                    }}
                  >

                    <div className="lesson-small-label">
                      LESSON {index + 1}
                    </div>

                    <h2>
                      {lesson.name}
                    </h2>

                    {lesson.notes && (

                      <p>
                        {lesson.notes}
                      </p>

                    )}

                    {/* READ ALOUD */}

                    <div className="lesson-audio-row">

                      <button
                        className="read-aloud-button"
                        onClick={() =>
                          readAloud(lesson)
                        }
                      >
                        🔊 Read Aloud
                      </button>

                      {isSpeaking && (

                        <button
                          className="stop-reading-button"
                          onClick={stopReading}
                        >
                          ⏹ Stop
                        </button>

                      )}

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </main>


        {/* ================= ACCESSIBILITY PANEL ================= */}

        <aside className="lesson-accessibility">

          <div className="accessibility-heading">

            <span>
              PERSONALIZE
            </span>

            <h2>
              Accessibility
            </h2>

          </div>


          {/* PROFILE */}

          <div className="accessibility-profile">

            <div className="accessibility-avatar">
              👨‍🎓
            </div>

            <div>

              <strong>
                Aarav Sharma
              </strong>

              <p>
                Class 5 • Student
              </p>

            </div>

          </div>


          <h3>
            Reading Settings
          </h3>


          {/* FONT FAMILY */}

          <div className="setting-group">

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
                setFontSize(Number(e.target.value))
              }
            />

          </div>


          {/* LETTER SPACING */}

          <div className="setting-group">

            <label>
              Letter Spacing
              <span>{letterSpacing}px</span>
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

          </div>


          {/* LINE HEIGHT */}

          <div className="setting-group">

            <label>
              Line Height
              <span>{lineHeight}</span>
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

          </div>


          {/* WORD SPACING */}

          <div className="setting-group">

            <label>
              Word Spacing
              <span>{wordSpacing}px</span>
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

          </div>


          {/* READING SPEED */}

          <div className="setting-group">

            <label>
              Reading Speed
              <span>{speechRate}x</span>
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

          </div>


          {/* BACKGROUND */}

          <div className="setting-group">

            <label>
              Background Tint
            </label>

            <div className="lesson-color-options">

              <button
                className="lesson-color cream"
                onClick={() =>
                  setBackgroundColor("#FFF8E7")
                }
              />

              <button
                className="lesson-color white"
                onClick={() =>
                  setBackgroundColor("#FFFFFF")
                }
              />

              <button
                className="lesson-color blue"
                onClick={() =>
                  setBackgroundColor("#E8F1FF")
                }
              />

              <button
                className="lesson-color green"
                onClick={() =>
                  setBackgroundColor("#E8F5E9")
                }
              />

              <button
                className="lesson-color peach"
                onClick={() =>
                  setBackgroundColor("#FFE8D6")
                }
              />

            </div>

          </div>


          {/* TOGGLES */}

          <div className="accessibility-toggles">

            <AccessibilityToggle
              label="Reading Ruler"
              value={readingRuler}
              setValue={setReadingRuler}
            />

            <AccessibilityToggle
              label="Bold Text"
              value={boldText}
              setValue={setBoldText}
            />

            <AccessibilityToggle
              label="Highlight Links"
              value={highlightLinks}
              setValue={setHighlightLinks}
            />

            <AccessibilityToggle
              label="Reduce Motion"
              value={reduceMotion}
              setValue={setReduceMotion}
            />

          </div>

        </aside>

      </div>


      {/* ================= READING RULER ================= */}

      {readingRuler && (

        <div
          className="lesson-reading-ruler"
          style={{
            top: `${mouseY - 20}px`
          }}
        />

      )}

    </div>
  );
}


/* =====================================================
   ACCESSIBILITY TOGGLE
===================================================== */

function AccessibilityToggle({
  label,
  value,
  setValue
}) {

  return (

    <div className="accessibility-toggle-row">

      <span>
        {label}
      </span>

      <button
        className={
          value
            ? "accessibility-switch active"
            : "accessibility-switch"
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

export default LessonPage;