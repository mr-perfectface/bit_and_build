import { useState } from "react";
import { supabase } from "../supabaseClient";

function TeacherAuth() {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // --- SUPABASE SIGN UP LOGIC ---
  async function handleSignup(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: "teacher" },
      },
    });

    if (error) {
      setMessage(`Signup failed: ${error.message}`);
      setLoading(false);
      return;
    }

    // 2. Insert into profiles table ( passing EMAIL fixes the constraint error )
    if (data?.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: data.user.id,
            name: name,
            email: email, // <-- Included to fix not-null constraint
            role: "teacher",
          },
        ]);

      if (profileError) {
        setMessage(`Profile setup error: ${profileError.message}`);
      } else {
        setMessage("Teacher account created! You can now log in.");
      }
    }

    setLoading(false);
  }

  // --- SUPABASE LOGIN LOGIC ---
  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Login failed: ${error.message}`);
    } else {
      setMessage("Login successful! Redirecting...");
      console.log("Logged in user:", data.user);
    }

    setLoading(false);
  }

  return (
    <div className="auth-page">
      <h1>{isSignup ? "Teacher Sign Up" : "Teacher Login"}</h1>

      <form onSubmit={isSignup ? handleSignup : handleLogin}>
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Teacher Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </button>
      </form>

      {message && <p>{message}</p>}

      <p>
        {isSignup
          ? "Already have an account?"
          : "Don't have a teacher account?"}
      </p>

      <button
        type="button"
        onClick={() => {
          setIsSignup(!isSignup);
          setMessage("");
        }}
      >
        {isSignup ? "Login" : "Sign Up"}
      </button>
    </div>
  );
}

export default TeacherAuth;