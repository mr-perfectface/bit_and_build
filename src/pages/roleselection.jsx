import { useNavigate } from "react-router-dom";
import teacherImg from '../assets/teacher-illustration.png';
import studentImg from '../assets/student-illustration.png';

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoIcon}>📖</span>
          <span style={styles.logoText}>Jumblrr</span>
        </div>
        <h1 style={styles.title}>Welcome to Jumblrr</h1>
        <p style={styles.subtitle}>Choose how you want to sign in</p>
      </div>

      <div style={styles.container}>
        {/* Teacher Card */}
        <div style={{ ...styles.card, ...styles.teacherCard }}>
          <div style={styles.imageWrapper}>
            {/* Replace this with: <img src="/assets/teacher-illustration.png" style={styles.image} /> */}
            <img src={teacherImg} style={styles.image} />
          </div>
          
          <button
            style={{ ...styles.button, ...styles.teacherButton }}
            onClick={() => navigate("/teacher-auth")}
          >
            Teacher
          </button>
        </div>

        {/* Student Card */}
        <div style={{ ...styles.card, ...styles.studentCard }}>
          <div style={styles.imageWrapper}>
            {/* Replace this with: <img src="/assets/student-illustration.png" style={styles.image} /> */}
            <img src={studentImg} style={styles.image} />
          </div>
          
          <button
            style={{ ...styles.button, ...styles.studentButton }}
            onClick={() => navigate("/student-login")}
          >
            Student
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
    backgroundColor: "#faf3e7",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "2rem 1rem",
    color: "#3f3a34",
  },
  header: {
    textAlign: "center",
    marginBottom: "3rem",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  logoIcon: {
    fontSize: "1.8rem",
  },
  logoText: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#3f9c8f",
    letterSpacing: "-0.02em",
  },
  title: {
    fontSize: "2.4rem",
    fontWeight: "800",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.02em",
    color: "#2f2b26",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#6b6459",
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
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    flex: "1 1 300px",
    maxWidth: "360px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
  },
  teacherCard: {
    backgroundColor: "#ffffff",
  },
  studentCard: {
    backgroundColor: "#F5AE8E",
  },
  imageWrapper: {
    width: "100%",
    height: "180px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },
  placeholderIcon: {
    fontSize: "5rem",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: "700",
    margin: "0 0 1.5rem 0",
    color: "#2f2b26",
  },
  button: {
    width: "100%",
    padding: "0.85rem 1.5rem",
    borderRadius: "10px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  teacherButton: {
    backgroundColor: "#3f9c8f",
    color: "#ffffff",
  },
  studentButton: {
    backgroundColor: "#ffffff",
    color: "#F5AE8E",
  },
};

export default RoleSelection;