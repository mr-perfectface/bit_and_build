import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function LessonPage() {
  const navigate = useNavigate();
  const { subjectId, chapter } = useParams();

  // ================= LESSON DATA =================

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= DIFFICULT WORDS =================

  const [wordHelp, setWordHelp] = useState({});
  const [analyzingLesson, setAnalyzingLesson] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordError, setWordError] = useState("");

  // ================= CONFUSING WORDS =================

  const [confusingWords, setConfusingWords] = useState([]);
  const [selectedConfusingGroup, setSelectedConfusingGroup] =
    useState(null);

  // ================= ACCESSIBILITY SETTINGS =================

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [letterSpacing, setLetterSpacing] = useState(1);
  const [wordSpacing, setWordSpacing] = useState(2);

  const [backgroundColor, setBackgroundColor] =
    useState("#FFF8E7");

  const [readingRuler, setReadingRuler] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [highlightLinks, setHighlightLinks] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [speechRate, setSpeechRate] = useState(0.8);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  // ================= LOAD CONFUSING WORDS =================

  useEffect(() => {
    loadConfusingWords();
  }, []);

  async function loadConfusingWords() {
    const { data, error } = await supabase
      .from("confusing_words")
      .select("*")
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading confusing words:",
        error
      );
      return;
    }

    setConfusingWords(data || []);
  }

  // ================= LOAD SAVED WORD HELP =================

  useEffect(() => {
    if (lessons.length > 0) {
      loadExistingWordHelp();
    }
  }, [lessons]);

  async function loadExistingWordHelp() {
    const lessonIds = lessons.map(
      (lesson) => lesson.l_id
    );

    if (lessonIds.length === 0) return;

    const { data, error } = await supabase
      .from("lesson_word_help")
      .select("*")
      .in("lesson_id", lessonIds);

    if (error) {
      console.error(
        "Error loading word help:",
        error
      );
      return;
    }

    const grouped = {};

    (data || []).forEach((item) => {
      if (!grouped[item.lesson_id]) {
        grouped[item.lesson_id] = [];
      }

      grouped[item.lesson_id].push(item);
    });

    setWordHelp(grouped);
  }

  // ================= AI DIFFICULT WORD ANALYSIS =================

  async function explainDifficultWords(lesson) {
    if (!lesson?.l_id || !lesson?.notes) {
      return;
    }

    setAnalyzingLesson(lesson.l_id);
    setSelectedWord(null);
    setSelectedConfusingGroup(null);
    setWordError("");

    try {
      // Check if analysis already exists

      const existingWords =
        wordHelp[lesson.l_id];

      if (
        existingWords &&
        existingWords.length > 0
      ) {
        return;
      }

      const { data, error } =
        await supabase.functions.invoke(
          "analyze-lesson",
          {
            body: {
              lessonId: lesson.l_id,
              text: lesson.notes,
            },
          }
        );

      if (error) {
        console.error(
          "AI analysis error:",
          error
        );

        setWordError(
          "Could not analyze this lesson. Please try again."
        );

        return;
      }

      if (!data?.success) {
        console.error(
          "AI analysis failed:",
          data?.error
        );

        setWordError(
          data?.error ||
            "Could not analyze this lesson."
        );

        return;
      }

      setWordHelp((previous) => ({
        ...previous,
        [lesson.l_id]: data.words || [],
      }));
    } catch (error) {
      console.error(
        "Unexpected error:",
        error
      );

      setWordError(
        "Something went wrong while explaining the difficult words."
      );
    } finally {
      setAnalyzingLesson(null);
    }
  }

  // ================= WORD CLICK =================

  function handleWordClick(word) {
    setSelectedWord(word);
    setSelectedConfusingGroup(null);
  }

  // ================= LESSON TEXT =================

  function renderLessonText(text, lessonId) {
    const difficultWords =
      wordHelp[lessonId] || [];

    if (!text) {
      return null;
    }

    // ================= DIFFICULT WORD MAP =================

    const difficultMap = new Map();

    difficultWords.forEach((item) => {
      difficultMap.set(
        item.word.toLowerCase(),
        item
      );
    });

    // ================= CONFUSING WORD MAP =================

    const confusingMap = new Map();

    confusingWords.forEach((item) => {
      confusingMap.set(
        item.word.toLowerCase(),
        item
      );
    });

    // ================= SPLIT TEXT =================

    const parts = text.split(
      /(\b[\w'-]+\b)/g
    );

    return parts.map((part, index) => {
      const cleanWord =
        part.toLowerCase();

      // =============================
      // DIFFICULT WORD
      // =============================

      const difficultHelp =
        difficultMap.get(cleanWord);

      if (difficultHelp) {
        return (
          <button
            key={index}
            type="button"
            className="difficult-word"
            onClick={() =>
              handleWordClick(
                difficultHelp
              )
            }
            title="Click for simple meaning"
          >
            {part}
          </button>
        );
      }

      // =============================
      // CONFUSING WORD
      // =============================

      const confusingHelp =
        confusingMap.get(cleanWord);

      if (confusingHelp) {
        const groupWords =
          confusingWords.filter(
            (item) =>
              item.confusion_group ===
              confusingHelp.confusion_group
          );

        const groups = [
          ...new Set(
            confusingWords.map(
              (item) =>
                item.confusion_group
            )
          ),
        ];

        const groupNumber =
          groups.indexOf(
            confusingHelp.confusion_group
          );

        const colors = [
          "#DCEBFF",
          "#FFE3D6",
          "#E4F5E1",
          "#F3E2FF",
          "#FFF0B8",
        ];

        return (
          <button
            key={index}
            type="button"
            className="confusing-word"
            style={{
              backgroundColor:
                colors[
                  groupNumber %
                    colors.length
                ],
              border: "none",
              borderRadius: "6px",
              padding: "2px 5px",
              cursor: "pointer",
              font: "inherit",
              color: "inherit",
            }}
            onClick={() => {
              setSelectedConfusingGroup(
                groupWords
              );
              setSelectedWord(null);
            }}
            title="Click to understand these confusing words"
          >
            {part}
          </button>
        );
      }

      // =============================
      // NORMAL TEXT
      // =============================

      return (
        <span key={index}>
          {part}
        </span>
      );
    });
  }

  // ================= MOUSE FOR RULER =================

  function handleMouseMove(e) {
    if (readingRuler) {
      setMouseY(e.clientY);
    }
  }

  // ================= READ ALOUD =================

// ================= READ ALOUD =================

function readAloud(lesson) {
  if (!lesson?.notes) return;

  window.speechSynthesis.cancel();

  const text = `${lesson.name}. ${lesson.notes}`;

  const speech = new SpeechSynthesisUtterance(text);

  speech.rate = speechRate;
  speech.pitch = 1;
  speech.volume = 1;

  speech.onstart = () => {
    setIsSpeaking(true);
    setIsPaused(false);
  };

  speech.onpause = () => {
    setIsPaused(true);
  };

  speech.onresume = () => {
    setIsPaused(false);
  };

  speech.onend = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };

  speech.onerror = () => {
    setIsSpeaking(false);
    setIsPaused(false);
  };

  window.speechSynthesis.speak(speech);
}


// ================= PAUSE =================

function pauseReading() {
  window.speechSynthesis.pause();
  setIsPaused(true);
}


// ================= RESUME =================

function resumeReading() {
  window.speechSynthesis.resume();
  setIsPaused(false);
}


// ================= STOP =================

function stopReading() {
  window.speechSynthesis.cancel();
  setIsSpeaking(false);
  setIsPaused(false);
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
        backgroundColor:
          backgroundColor,
      }}
      onMouseMove={handleMouseMove}
    >
      {/* ================= HEADER ================= */}

      <header className="lesson-header">
        <div className="lesson-logo">
          📖
          <span>Jumblrr</span>
        </div>

        <div className="lesson-welcome">
          <span>
            YOUR LEARNING SPACE
          </span>

          <h2>
            Hi, Ishan Awasthi — ready to learn?
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
            onClick={goBack}
          >
            <span className="back-icon">
              ←
            </span>

            <span>
              Back to Chapters
            </span>
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
                {decodeURIComponent(
                  chapter || ""
                )}
              </h1>

              <p>
                Choose a lesson to start
                learning.
              </p>
            </div>

          </div>

          {/* ================= LEGEND ================= */}

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "4px",
                  background: "#E4D5FF",
                  marginRight: "6px",
                }}
              />
              Difficult word
            </span>

            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "4px",
                  background: "#DCEBFF",
                  marginRight: "6px",
                }}
              />
              Confusing word
            </span>
          </div>

          {/* ================= WORD ERROR ================= */}

          {wordError && (
            <div
              className="lesson-status-card"
              style={{
                marginBottom: "20px",
              }}
            >
              <div>⚠️</div>

              <h2>
                {wordError}
              </h2>

              <button
                className="read-aloud-button"
                onClick={() =>
                  setWordError("")
                }
              >
                Close
              </button>
            </div>
          )}

          {/* ================= LOADING ================= */}

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

          {/* ================= NO LESSONS ================= */}

          {!loading &&
            lessons.length === 0 && (
              <div className="lesson-status-card">

                <div>
                  📖
                </div>

                <h2>
                  No lessons available yet
                </h2>

                <p>
                  Your teacher hasn't added
                  lessons for this chapter yet.
                </p>

              </div>
            )}

          {/* ================= LESSONS ================= */}

          {!loading &&
            lessons.length > 0 && (

              <div className="lesson-list">

                {lessons.map(
                  (lesson, index) => {

                    const currentWordHelp =
                      wordHelp[
                        lesson.l_id
                      ] || [];

                    const isAnalyzing =
                      analyzingLesson ===
                      lesson.l_id;

                    return (
                      <article
                        className="lesson-reading-card"
                        key={
                          lesson.l_id ||
                          index
                        }
                      >

                        {/* LESSON NUMBER */}

                        <div className="lesson-number">
                          {index + 1}
                        </div>

                        {/* LESSON CONTENT */}

                        <div
                          className="lesson-text"
                          style={{
                            fontFamily:
                              fontFamily,

                            fontSize:
                              `${fontSize}px`,

                            lineHeight:
                              lineHeight,

                            letterSpacing:
                              `${letterSpacing}px`,

                            wordSpacing:
                              `${wordSpacing}px`,

                            fontWeight:
                              boldText
                                ? "700"
                                : "400",
                          }}
                        >

                          <div className="lesson-small-label">
                            LESSON{" "}
                            {index + 1}
                          </div>

                          <h2>
                            {lesson.name}
                          </h2>

                          {/* LESSON NOTES */}

                          {lesson.notes && (
                            <>
                              <p>
                                {renderLessonText(
                                  lesson.notes,
                                  lesson.l_id
                                )}
                              </p>

                              {/* ================= AI BUTTON ================= */}

                              <div
                                className="lesson-audio-row"
                                style={{
                                  marginTop:
                                    "18px",
                                  flexWrap:
                                    "wrap",
                                }}
                              >

                                <button
                                  className="read-aloud-button"
                                  onClick={() =>
                                    explainDifficultWords(
                                      lesson
                                    )
                                  }
                                  disabled={
                                    isAnalyzing
                                  }
                                >
                                  {isAnalyzing
                                    ? "✨ Analyzing..."
                                    : currentWordHelp.length >
                                      0
                                    ? "✨ Show Difficult Words"
                                    : "✨ Explain Difficult Words"}
                                </button>

                                {currentWordHelp.length >
                                  0 && (
                                  <span
                                    style={{
                                      fontSize:
                                        "14px",
                                      opacity:
                                        0.75,
                                    }}
                                  >
                                    {
                                      currentWordHelp.length
                                    }{" "}
                                    difficult
                                    words found
                                  </span>
                                )}

                              </div>
                            </>
                          )}

                          {/* ================= READ ALOUD ================= */}
{/* ================= READ ALOUD ================= */}

                        <div
                        className="lesson-audio-row"
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginTop: "15px",
                        }}
                        >

                        {!isSpeaking && (
                            <button
                            className="read-aloud-button"
                            onClick={() => readAloud(lesson)}
                            >
                            🔊 Read Aloud
                            </button>
                        )}

                        {isSpeaking && !isPaused && (
                            <button
                            className="read-aloud-button"
                            onClick={pauseReading}
                            >
                            ⏸ Pause
                            </button>
                        )}

                        {isSpeaking && isPaused && (
                            <button
                            className="read-aloud-button"
                            onClick={resumeReading}
                            >
                            ▶ Resume
                            </button>
                        )}

                        {isSpeaking && (
                            <button
                            className="stop-reading-button"
                            onClick={stopReading}
                            >
                            ⏹ Stop
                            </button>
                        )}

                        </div>


                          {/* ================= DIFFICULT WORD CARD ================= */}

                          {selectedWord && (
                            <div
                              className="word-explanation-card"
                              style={{
                                marginTop:
                                  "22px",
                                padding:
                                  "20px",
                                borderRadius:
                                  "16px",
                                background:
                                  "#ffffff",
                                border:
                                  "2px solid #ddd",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "flex-start",
                                  gap: "15px",
                                }}
                              >

                                <div>

                                  <div
                                    style={{
                                      fontSize:
                                        "13px",
                                      fontWeight:
                                        "700",
                                      opacity:
                                        0.65,
                                      textTransform:
                                        "uppercase",
                                    }}
                                  >
                                    Difficult
                                    Word
                                  </div>

                                  <h3
                                    style={{
                                      margin:
                                        "5px 0 10px",
                                    }}
                                  >
                                    {
                                      selectedWord.word
                                    }
                                  </h3>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedWord(
                                      null
                                    )
                                  }
                                  style={{
                                    border:
                                      "none",
                                    background:
                                      "transparent",
                                    fontSize:
                                      "20px",
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  ✕
                                </button>

                              </div>

                              {/* IMAGE */}

                              {selectedWord.image_url ? (
                                <img
                                  src={
                                    selectedWord.image_url
                                  }
                                  alt={`Visual explanation of ${selectedWord.word}`}
                                  style={{
                                    width:
                                      "100%",
                                    maxWidth:
                                      "220px",
                                    borderRadius:
                                      "12px",
                                    marginBottom:
                                      "15px",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    padding:
                                      "20px",
                                    borderRadius:
                                      "12px",
                                    background:
                                      "#FFF8E7",
                                    textAlign:
                                      "center",
                                    marginBottom:
                                      "15px",
                                    fontSize:
                                      "42px",
                                  }}
                                >
                                  💡
                                </div>
                              )}

                              <div>

                                <strong>
                                  Simple meaning:
                                </strong>

                                <p>
                                  {
                                    selectedWord.simple_meaning
                                  }
                                </p>

                              </div>

                              {selectedWord.example && (
                                <div>

                                  <strong>
                                    Example:
                                  </strong>

                                  <p>
                                    {
                                      selectedWord.example
                                    }
                                  </p>

                                </div>
                              )}

                            </div>
                          )}

                          {/* ================= CONFUSING WORD CARD ================= */}

                          {selectedConfusingGroup && (
                            <div
                              className="confusing-explanation-card"
                              style={{
                                marginTop:
                                  "22px",
                                padding:
                                  "20px",
                                borderRadius:
                                  "16px",
                                background:
                                  "#ffffff",
                                border:
                                  "2px solid #ddd",
                              }}
                            >

                              <div
                                style={{
                                  display:
                                    "flex",
                                  justifyContent:
                                    "space-between",
                                  alignItems:
                                    "center",
                                }}
                              >

                                <div>

                                  <div
                                    style={{
                                      fontSize:
                                        "13px",
                                      fontWeight:
                                        "700",
                                      opacity:
                                        0.65,
                                      textTransform:
                                        "uppercase",
                                    }}
                                  >
                                    Confusing
                                    Words
                                  </div>

                                  <h3
                                    style={{
                                      margin:
                                        "5px 0",
                                    }}
                                  >
                                    Know the
                                    difference
                                  </h3>

                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedConfusingGroup(
                                      null
                                    )
                                  }
                                  style={{
                                    border:
                                      "none",
                                    background:
                                      "transparent",
                                    fontSize:
                                      "20px",
                                    cursor:
                                      "pointer",
                                  }}
                                >
                                  ✕
                                </button>

                              </div>

                              <p
                                style={{
                                  marginBottom:
                                    "16px",
                                }}
                              >
                                These words
                                can look or
                                sound similar,
                                but they have
                                different
                                meanings.
                              </p>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  flexDirection:
                                    "column",
                                  gap: "10px",
                                }}
                              >

                                {selectedConfusingGroup.map(
                                  (
                                    item,
                                    itemIndex
                                  ) => {

                                    const colors =
                                      [
                                        "#DCEBFF",
                                        "#FFE3D6",
                                        "#E4F5E1",
                                        "#F3E2FF",
                                      ];

                                    return (
                                      <div
                                        key={
                                          item.id
                                        }
                                        style={{
                                          padding:
                                            "12px 15px",
                                          borderRadius:
                                            "10px",
                                          backgroundColor:
                                            colors[
                                              itemIndex %
                                                colors.length
                                            ],
                                        }}
                                      >

                                        <strong
                                          style={{
                                            fontSize:
                                              "18px",
                                          }}
                                        >
                                          {
                                            item.word
                                          }
                                        </strong>

                                        <p
                                          style={{
                                            margin:
                                              "4px 0 0",
                                            fontSize:
                                              "15px",
                                          }}
                                        >
                                          {
                                            item.meaning
                                          }
                                        </p>

                                      </div>
                                    );
                                  }
                                )}

                              </div>

                            </div>
                          )}

                        </div>

                      </article>
                    );
                  }
                )}

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
                Ishan Awasthi Sharma
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
              <span>
                {fontSize}px
              </span>
            </label>

            <input
              type="range"
              min="14"
              max="30"
              value={fontSize}
              onChange={(e) =>
                setFontSize(
                  Number(
                    e.target.value
                  )
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
                  Number(
                    e.target.value
                  )
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
                  Number(
                    e.target.value
                  )
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
              step="0.5"
              value={wordSpacing}
              onChange={(e) =>
                setWordSpacing(
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>

          {/* READING SPEED */}

          <div className="setting-group">

            <label>
              Reading Speed
              <span>
                {speechRate}x
              </span>
            </label>

            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={speechRate}
              onChange={(e) =>
                setSpeechRate(
                  Number(
                    e.target.value
                  )
                )
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
                  setBackgroundColor(
                    "#FFF8E7"
                  )
                }
              />

              <button
                className="lesson-color white"
                onClick={() =>
                  setBackgroundColor(
                    "#FFFFFF"
                  )
                }
              />

              <button
                className="lesson-color blue"
                onClick={() =>
                  setBackgroundColor(
                    "#E8F1FF"
                  )
                }
              />

              <button
                className="lesson-color green"
                onClick={() =>
                  setBackgroundColor(
                    "#E8F5E9"
                  )
                }
              />

              <button
                className="lesson-color peach"
                onClick={() =>
                  setBackgroundColor(
                    "#FFE8D6"
                  )
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
            top: `${mouseY - 20}px`,
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
  setValue,
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