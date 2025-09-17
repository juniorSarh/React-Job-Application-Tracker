import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginimg from "../images/loginimg.png";


import NavBar from "../components/NavBar";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState(
    localStorage.getItem("remember_username") || ""
  );
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(
    localStorage.getItem("remember_username") ? true : false
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      // Example JSON Server auth (adjust base URL to your json-server port)
      // NOTE: This is only for demo/class projects, not production security.
      const res = await fetch(
        `http://localhost:3001/users?username=${encodeURIComponent(
          username
        )}&password=${encodeURIComponent(password)}`
      );
      const users = await res.json();

      if (Array.isArray(users) && users.length === 1) {
        const user = users[0];

        // Simulate a session
        localStorage.setItem(
          "auth_user",
          JSON.stringify({ id: user.id, username: user.username })
        );

        // Remember me
        if (remember) localStorage.setItem("remember_username", username);
        else localStorage.removeItem("remember_username");

        nav("/dashboard"); // change to wherever you land post-login
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Unable to reach the server. Is json-server running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      {/* Top bar */}
      <NavBar />
      {/* Main grid */}
      <main className="login__main">
        {/* Left: form */}
        <section className="login__formwrap">
          <h1 className="login__welcome">
            <span>Hello,</span>
            <br />
            <strong>Welcome Back</strong>
          </h1>

          <form className="login__form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="username">
              Username<span aria-hidden="true">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="Enter your username"
            />

            <label htmlFor="password" className="mt-12">
              Password<span aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
            />

            <div className="login__row">
              <label className="login__remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="login__forgot">
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="login__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login__cta">
            Don’t you have account?
            <Link to="/signup" className="login__signup">
              {" "}
              SignUp
            </Link>
          </p>
        </section>

        {/* Right: illustration */}
        <section className="login__art" aria-hidden="true">
          <div className="login__artCard">
            {loginimg ? (
              <img src={loginimg} alt="" />
            ) : (
              <div className="login__artFallback">🔐</div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom bar */}
      <footer className="login__footer" />
    </div>
  );
}
