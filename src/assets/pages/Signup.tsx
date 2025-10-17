import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import signup from "../images/signup.svg";

const API_BASE =
  import.meta.env.VITE_API_URL ?? "https://json-server-vded.onrender.com";

type User = {
  id: string;
  username: string;
  name?: string;
};

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // used as username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // 1) Check if user already exists (username = email)
      const qs = new URLSearchParams({ username: email.trim() }).toString();
      const checkRes = await fetch(`${API_BASE}/users?${qs}`);
      if (!checkRes.ok)
        throw new Error(`User check failed: HTTP ${checkRes.status}`);
      const existing = (await checkRes.json()) as User[];
      if (existing.length > 0) {
        setError("An account with this email already exists. Please log in.");
        setLoading(false);
        return;
      }

      // 2) Create user; server assigns random id
      const createRes = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password: password, // NOTE: json-server stores plain text; OK for demo only
          name: name.trim(),
        }),
      });
      if (!createRes.ok)
        throw new Error(`Sign up failed: HTTP ${createRes.status}`);
      const user = (await createRes.json()) as User;

      // 3) Save session and go home
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          id: user.id,
          username: user.username,
          name: user.name ?? "",
        })
      );
      nav("/home");
    } catch (err) {
      setError("Sign up failed. Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      {/* Top bar */}
      <NavBar />

      {/* Main grid (match Login layout) */}
      <main className="login__main">
        {/* Left: illustration */}
        <section className="login__art" aria-hidden="true">
          <div className="login__artCard">
            {signup ? (
              <img src={signup} alt="" />
            ) : (
              <div className="login__artFallback">📝</div>
            )}
          </div>
        </section>

        {/* Right: form */}
        <section className="login__formwrap">
          <h1 className="login__welcome">
            <span>Get Started,</span>
            <br />
            <strong>Create your account</strong>
          </h1>

          <p className="login__hint">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="login__form" noValidate>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
            />

            <label htmlFor="email" className="mt-12">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />

            <label htmlFor="password" className="mt-12">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </section>
      </main>

      {/* Bottom bar */}
      <footer className="login__footer" />
    </div>
  );
}
