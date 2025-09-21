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
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 grid md:grid-cols-2 gap-8 items-center px-6 py-10 max-w-5xl mx-auto">
        <section className="order-2 md:order-1">
          <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
          <p className="text-sm text-gray-600 mb-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 underline">
              Log in
            </Link>
          </p>

          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="Jane Doe"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border px-3 py-2"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>
        </section>

        <section className="order-1 md:order-2 hidden md:block">
          <img
            src={signup}
            alt="Sign up illustration"
            className="w-full h-auto object-contain"
          />
        </section>
      </main>
    </div>
  );
}
