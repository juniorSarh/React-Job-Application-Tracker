import { useState} from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import signup from "../images/signup.svg";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

      // check if email already exists
      const existsRes = await fetch(
        `http://localhost:3000/users?email=${encodeURIComponent(email)}`
      );
      const existing = await existsRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        setError("An account with this email already exists.");
        return;
      }

      // create user (username = email for simpler login)
      const createRes = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          username: email,
          password,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!createRes.ok) {
        setError("Could not create the account. Please try again.");
        return;
      }

      // redirect to home
      nav("/home");
    } catch {
      setError("Unable to reach the server. Is json-server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup">
      {/* Top bar */}
     <NavBar />

      <main className="signup__main">
        {/* Left: form */}
        <section className="signup__formwrap">
          <h1 className="signup__welcome">
            <span>Create Account</span>
            <br />
            <strong>Join Us</strong>
          </h1>

          <form className="signup__form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">Name*</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />

            <label htmlFor="email" className="mt-12">
              Email*
            </label>
            <input
              id="email"
              type="email"
              placeholder="e.g. example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label htmlFor="password" className="mt-12">
              Password*
            </label>
            <input
              id="password"
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            {error && (
              <p className="signup__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          <p className="signup__cta">
            Already have an account?
            <Link to="/login" className="signup__login">
              {" "}
              Login
            </Link>
          </p>
        </section>

        {/* Right: illustration */}
        <section className="signup__art" aria-hidden="true">
          <div className="signup__artCard">
            {signup? (
              <img src={signup} alt="" />
            ) : (
              <div className="signup__artFallback">📱</div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom bar */}
      <footer className="signup__footer" />
    </div>
  );
}
