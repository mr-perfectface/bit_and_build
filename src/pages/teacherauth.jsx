import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function TeacherAuth() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- SUPABASE SIGN UP LOGIC ---
  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "teacher" },
      },
    });

    if (error) {
      setMessage(`Signup failed: ${error.message}`);
      setIsError(true);
      setLoading(false);
      return;
    }

    if (data?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: data.user.id,
            name: name,
            email: email,
            role: "teacher",
          },
        ]);

      if (profileError) {
        setMessage(`Profile setup error: ${profileError.message}`);
        setIsError(true);
      } else {
        setMessage("Teacher account created! You can now log in.");
        setIsError(false);
      }
    }

    setLoading(false);
  }

  // --- SUPABASE LOGIN LOGIC ---
  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
      setIsError(true);
    } else {
      setMessage("Login successful! Redirecting...");
      setIsError(false);
      console.log("Logged in user:", data.user);
    }

    setLoading(false);
  }

  return (
    <div style={styles.page}>
      <div style={styles.logoRow}>
        <span style={styles.logoIcon}>📖</span>
        <span style={styles.logoText}>LearnEase</span>
      </div>

      <div style={styles.card}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <span style={styles.backArrow}>←</span> Back
        </button>

        <div style={styles.badge}>Teacher Portal</div>
        <h1 style={styles.title}>{isSignup ? "Create Account" : "Welcome Back"}</h1>
        <p style={styles.subtitle}>
          {isSignup
            ? "Sign up to manage your classroom and students"
            : "Sign in to access your teacher dashboard"}
        </p>

        <form onSubmit={isSignup ? handleSignup : handleLogin} style={styles.form}>
          {isSignup && (
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>👤</span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>✉️</span>
            <input
              type="email"
              placeholder="Teacher Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              style={styles.input}
            />
          </div>

          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <span
              style={styles.eyeIcon}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Log In"}
          </button>
        </form>

        {message && (
          <div
            style={{
              ...styles.messageBox,
              backgroundColor: isError ? "#fde8e8" : "#e6f4ea",
              color: isError ? "#c81e1e" : "#0e6251",
              borderColor: isError ? "#f8b4b4" : "#a3e0c3",
            }}
          >
            {message}
          </div>
        )}

        <div style={styles.footer}>
          <span style={styles.footerText}>
            {isSignup
              ? "Already have an account?"
              : "Don't have a teacher account?"}
          </span>
          <button
            type="button"
            style={styles.switchBtn}
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    boxSizing: "border-box",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  logoIcon: {
    fontSize: "2rem",
  },
  logoText: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#3f9c8f",
    letterSpacing: "-0.02em",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "2.5rem 2rem",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
    textAlign: "center",
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
    marginBottom: "1rem",
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
  badge: {
    display: "inline-block",
    backgroundColor: "#e8f5f3",
    color: "#3f9c8f",
    fontSize: "0.8rem",
    fontWeight: "700",
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "800",
    margin: "0 0 0.4rem 0",
    color: "#2f2b26",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#6b6459",
    margin: "0 0 1.75rem 0",
    lineHeight: "1.4",
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
    border: "1px solid #e4dcc9",
    borderRadius: "12px",
    padding: "0.85rem 1rem",
    backgroundColor: "#faf3e7",
  },
  inputIcon: {
    fontSize: "1.1rem",
  },
  input: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "0.95rem",
    color: "#2f2b26",
    flex: 1,
    width: "100%",
  },
  eyeIcon: {
    cursor: "pointer",
    fontSize: "1rem",
    userSelect: "none",
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
    transition: "background-color 0.2s ease",
  },
  messageBox: {
    marginTop: "1.25rem",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: "600",
    border: "1px solid transparent",
    textAlign: "left",
  },
  footer: {
    marginTop: "1.75rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  footerText: {
    color: "#6b6459",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#3f9c8f",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "0.9rem",
    padding: 0,
    textDecoration: "underline",
  },
};

export default TeacherAuth;