import { useState } from "react";
import { supabase } from "../supabaseClient";

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    } else {
      setMessage("Login Successful!");
      console.log("Logged in user:", data.user);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      <h1>Student Login</h1>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "300px" }}>
        <input
          type="email"
          placeholder="Student Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "8px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "8px" }}
        />

        <button type="submit" disabled={loading} style={{ padding: "8px" }}>
          {loading ? "Testing..." : "Login"}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "bold" }}>
          {message}
        </div>
      )}
    </div>
  );
}

export default StudentLogin;