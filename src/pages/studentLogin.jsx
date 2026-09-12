import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import studentImg from "../assets/student-illustration.png";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
  setMessage(`Login Failed: ${error.message}`);
  setLoading(false);
  return;
}

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", data.user.id)
  .single();

    if (profileError) {
    setMessage(`Could not verify account: ${profileError.message}`);
    setLoading(false);
    return;
    }

    if (profile.role !== "student") {
    setMessage("This account is not registered as a student.");
    setLoading(false);
    return;
    }

    navigate("/student-dashboard");
    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.logoRow}>
        <span style={styles.logoIcon}>📖</span>
        <span style={styles.logoText}>LearnEase</span>
      </div>

      <div style={styles.content}>
        <div style={styles.illustrationWrapper}>
          <img src={studentImg} style={styles.illustration} alt="Student reading" />
        </div>

        <div style={styles.card}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            <span style={styles.backArrow}>←</span> Back
          </button>

          <h1 style={styles.title}>Student Login</h1>
          <p style={styles.subtitle}>Sign in with the details your teacher shared</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputWrapperSimple}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                type="email"
                placeholder="Email Address"
                autoComplete = "new-password"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.inputSimple}
                />
            </div>

            <div style={styles.inputWrapperSimple}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.inputSimple}
              />
              <span
                style={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div style={styles.linkRow}>
            <a href="#" style={styles.link}>Forgot Password?</a>
            <span style={styles.linkDivider}>|</span>
            <a href="#" style={styles.link}>Change Password</a>
          </div>

          <div style={styles.tipBox}>
            <span style={styles.tipIcon}>💡</span>
            <span style={styles.tipText}>
              Tip: You can update your email and password anytime from settings.
            </span>
          </div>

          {message && <div style={styles.message}>{message}</div>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#faf3e7",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "2rem 3rem",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "2rem",
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
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "3rem",
    flexWrap: "wrap",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  illustrationWrapper: {
    flex: "1 1 320px",
    display: "flex",
    justifyContent: "center",
  },
  illustration: {
    maxWidth: "100%",
    width: "350px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "2.5rem",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "none",
    border: "none",
    color: "#2f2b26",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    padding: 0,
    marginBottom: "1.5rem",
  },
  backArrow: {
    backgroundColor: "#3f9c8f",
    color: "#ffffff",
    borderRadius: "50%",
    width: "24px",
    height: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
  },
  title: {
    fontSize: "1.9rem",
    fontWeight: "800",
    margin: "0 0 0.4rem 0",
    color: "#2f2b26",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#6b6459",
    margin: "0 0 1.75rem 0",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    border: "2px solid #3f9c8f",
    borderRadius: "12px",
    padding: "0.6rem 1rem",
    backgroundColor: "#faf3e7",
  },
  inputTextGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },

  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "1rem",
    color: "#2f2b26",
    padding: 0,
  },
  inputWrapperSimple: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    border: "1px solid #e4dcc9",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    backgroundColor: "#faf3e7",
  },
  inputSimple: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "1rem",
    color: "#2f2b26",
    flex: 1,
  },
  inputIcon: {
    fontSize: "1.1rem",
  },
  eyeIcon: {
    cursor: "pointer",
    fontSize: "1rem",
  },
  button: {
    padding: "0.9rem 1.5rem",
    borderRadius: "999px",
    border: "none",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    backgroundColor: "#3f9c8f",
    color: "#ffffff",
    marginTop: "0.5rem",
  },
  linkRow: {
    display: "flex",
    justifyContent: "center",
    gap: "0.6rem",
    marginTop: "1.25rem",
    fontSize: "0.9rem",
  },
  link: {
    color: "#3f9c8f",
    textDecoration: "none",
    fontWeight: "600",
  },
  linkDivider: {
    color: "#c9c0ac",
  },
  tipBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.6rem",
    backgroundColor: "#fdf6e3",
    border: "1px solid #f0dfa8",
    borderRadius: "12px",
    padding: "1rem",
    marginTop: "1.5rem",
    fontSize: "0.85rem",
    color: "#5c554b",
  },
  tipIcon: {
    fontSize: "1rem",
  },
  tipText: {
    lineHeight: "1.4",
  },
  message: {
    marginTop: "1rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#2f2b26",
    textAlign: "center",
  },
  
};

export default StudentLogin;