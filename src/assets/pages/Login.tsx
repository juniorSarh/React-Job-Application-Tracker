import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import loginimg from "../images/loginimg.png";

type AuthUser = { id: number | string; username: string };

// Prefer env, fall back to localhost:3001 (keep React/Vite dev server on a different port)
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000";


export default function Login() {
  const nav = useNavigate();

  const rememberedUsername = useMemo(
    () => localStorage.getItem("remember_username") || "",
    []
  );

  const [username, setUsername] = useState(rememberedUsername);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(!!rememberedUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1) Auto-redirect if a valid session already exists
  useEffect(() => {
    const controller = new AbortController();

    const saved = localStorage.getItem("auth_user");
    if (!saved) return;

    try {
      const parsed: AuthUser = JSON.parse(saved);

      fetch(`${API_BASE}/users/${encodeURIComponent(String(parsed.id))}`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((user) => {
          if (user && user.id != null) {
            nav("/home", { replace: true });
          } else {
            // Stale session — clear it so the user can log in again
            localStorage.removeItem("auth_user");
          }
        })
        .catch(() => {
          // On network error, keep user on login page.
        });
    } catch {
      localStorage.removeItem("auth_user");
    }

    return () => controller.abort();
  }, [nav]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT: Keys must match your db.json (username/password here).
      const url = `${API_BASE}/users?username=${encodeURIComponent(
        u
      )}&password=${encodeURIComponent(p)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const users = (await res.json()) as Array<{
        id: number | string;
        username: string;
      }>;

      if (Array.isArray(users) && users.length >= 1) {
        const user = users[0];

        // "Session"
        localStorage.setItem(
          "auth_user",
          JSON.stringify({
            id: user.id,
            username: user.username,
          } satisfies AuthUser)
        );
        console.log(`Logged in as ${user.username}`)

       
        if (remember) localStorage.setItem("remember_username", u);
        else localStorage.removeItem("remember_username");

        nav("/home");
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError(
        
        "Unable to reach the server. Is json-server running on the right port?"
      );
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
