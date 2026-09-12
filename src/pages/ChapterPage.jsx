import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ChapterPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subjectName, setSubjectName] = useState("");
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapters();
  }, [subjectId]);

  async function loadChapters() {
    setLoading(true);

    // ================= GET SUBJECT NAME =================

    const { data: subject, error: subjectError } = await supabase
      .from("subjects")
      .select("name")
      .eq("sub_id", subjectId)
      .single();

    if (subjectError) {
      console.error("Error loading subject:", subjectError);
    } else {
      setSubjectName(subject.name);
    }

    // ================= GET CHAPTERS =================

    const { data, error } = await supabase
      .from("lesson")
      .select("chapter")
      .eq("sub_id", subjectId)
      .not("chapter", "is", null);

    if (error) {
      console.error("Error loading chapters:", error);
      setChapters([]);
    } else {
      // Remove duplicate chapters
      const uniqueChapters = [
        ...new Set(
          data
            .map((item) => item.chapter)
            .filter(Boolean)
        ),
      ];

      setChapters(uniqueChapters);
    }

    setLoading(false);
  }

  // ================= OPEN CHAPTER =================

function openChapter(chapter) {
  navigate(
    `/lessons/${subjectId}/${encodeURIComponent(chapter)}`
  );
}

  return (
    <div className="student-page chapter-page">

      {/* ================= HEADER ================= */}

      <header className="student-header">

        <div className="logo">
          📖 <span>Jumblrr</span>
        </div>

        <div className="welcome-text">

          <span>YOUR LEARNING SPACE</span>

          <h2>
            Hi, Ishan Awasthi — ready to learn?
          </h2>

        </div>

        <div className="header-profile">
          👨‍🎓
        </div>

      </header>


      {/* ================= MAIN ================= */}

      <main className="student-main">

        {/* BACK BUTTON */}

        <button
          className="page-back-button"
          onClick={() => navigate("/student-dashboard")}
        >
          <span>←</span>
          <span>Back to Subjects</span>
        </button>


        {/* ================= TITLE ================= */}

        <section className="page-heading">

          <div className="page-heading-icon">
            📚
          </div>

          <div>

            <p className="eyebrow">
              SUBJECT
            </p>

            <h1>
              {subjectName || "Subject"}
            </h1>

            <p>
              Choose a chapter to continue learning.
            </p>

          </div>

        </section>


        {/* ================= LOADING ================= */}

        {loading && (

          <div className="loading-card">

            <div className="loading-icon">
              📚
            </div>

            <h3>
              Loading chapters...
            </h3>

          </div>

        )}


        {/* ================= NO CHAPTERS ================= */}

        {!loading && chapters.length === 0 && (

          <div className="empty-message">

            <div className="empty-icon">
              📖
            </div>

            <h2>
              No chapters yet
            </h2>

            <p>
              Your teacher has not added chapters
              for this subject yet.
            </p>

          </div>

        )}


        {/* ================= CHAPTERS ================= */}

        {!loading && chapters.length > 0 && (

          <div className="chapter-grid">

            {chapters.map((chapter, index) => (

              <button
                key={chapter}
                className="chapter-card"
                onClick={() => openChapter(chapter)}
              >

                <div className="chapter-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="chapter-icon">
                  📘
                </div>

                <h2>
                  {chapter}
                </h2>

                <p>
                  Explore lessons in this chapter
                </p>

                <div className="chapter-arrow">
                  Start learning
                  <span>→</span>
                </div>

              </button>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default ChapterPage;