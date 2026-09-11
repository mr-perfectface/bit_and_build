import { useNavigate } from "react-router-dom";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to <span style={styles.brand}>LearnEase</span></h1>
        <p style={styles.subtitle}>Select your portal to continue</p>
      </div>

      <div style={styles.container}>
        {/* Student Card */}
        <div style={styles.card}>
          <div style={styles.iconWrapper}>🎓</div>
          <h2 style={styles.cardTitle}>Student</h2>
          <p style={styles.cardText}>
            Access your personalized learning portal, assignments, and class lessons.
          </p>
          <button 
            style={{ ...styles.button, ...styles.studentButton }} 
            onClick={() => navigate("/student-login")}
          >
            Student Login
          </button>
        </div>

        {/* Teacher Card */}
        <div style={styles.card}>
          <div style={styles.iconWrapper}>👩‍🏫</div>
          <h2 style={styles.cardTitle}>Teacher</h2>
          <p style={styles.cardText}>
            Manage your courses, roster, student performance, and classroom content.
          </p>
          <button 
            style={{ ...styles.button, ...styles.teacherButton }} 
            onClick={() => navigate("/teacher-auth")}
          >
            Teacher Portal
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "2rem 1rem",
    color: "#f8fafc",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.025em",
  },
  brand: {
    color: "#38bdf8",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    margin: 0,
  },
  container: {
    display: "flex",
    gap: "2rem",
    maxWidth: "800px",
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    flex: "1 1 300px",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  iconWrapper: {
    fontSize: "3rem",
    marginBottom: "1rem",
    backgroundColor: "#0f172a",
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #334155",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: "0 0 0.75rem 0",
    color: "#f8fafc",
  },
  cardText: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    lineHeight: "1.5",
    marginBottom: "2rem",
    flexGrow: 1,
  },
  button: {
    width: "100%",
    padding: "0.85rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s ease, transform 0.1s ease",
  },
  studentButton: {
    backgroundColor: "#0284c7",
    color: "#ffffff",
  },
  teacherButton: {
    backgroundColor: "#0d9488",
    color: "#ffffff",
  },
};

export default RoleSelection;