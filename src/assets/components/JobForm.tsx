import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";

/** ===== Types (keep in sync with JobList) ===== */
export type Job = {
  id?: number | string;
  userId?: number | string;
  company: string;
  role: string;
  status: "Applied" | "Interviewed" | "Rejected";
  dateApplied: string; // yyyy-mm-dd
  details?: string;
};

type ViteEnvMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
type GlobalWithCRA = typeof globalThis & {
  process?: { env?: { REACT_APP_API_URL?: string } };
};

/** ===== API base (Vite or CRA, no "any") ===== */
function getApiBase(): string {
  const viteUrl: string | undefined = (import.meta as ViteEnvMeta).env
    ?.VITE_API_URL;
  if (viteUrl) return viteUrl;
  const craUrl: string | undefined = (globalThis as GlobalWithCRA).process?.env
    ?.REACT_APP_API_URL;
  if (craUrl) return craUrl;
  return "https://json-server-vded.onrender.com";
}
const API_BASE = getApiBase();

const STATUS_OPTIONS = ["Applied", "Interviewed", "Rejected"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

type LocationState = { job?: Job } | null;

type Props = {
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function JobForm({ onSaved, onCancel }: Props = {}) {
  const { id } = useParams(); // if present => edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { state } = useLocation();
  const passed = (state as LocationState)?.job;

  // current logged-in user (same pattern as JobList)
  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  }, []);
  const myId = auth?.id ?? null;

  const [form, setForm] = useState<Job>(() => {
    // Prefill instantly if we got the row via Link state
    if (passed)
      return {
        id: passed.id,
        userId: passed.userId ?? myId ?? undefined,
        company: passed.company,
        role: passed.role,
        status: passed.status,
        dateApplied: passed.dateApplied,
        details: passed.details ?? "",
      };
    // Otherwise default blank (create) or await fetch (edit)
    return {
      company: "",
      role: "",
      status: "Applied",
      dateApplied: new Date().toISOString().slice(0, 10),
      details: "",
    };
  });

  const [loading, setLoading] = useState(isEdit && !passed); // only fetch if editing without state
  const [error, setError] = useState<string | null>(null);

  // If editing and no state was passed, fetch the record
  useEffect(() => {
    const abort = new AbortController();
    if (isEdit && !passed) {
      setLoading(true);
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/jobs/${id}`, {
            signal: abort.signal,
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as Job;
          setForm({
            id: data.id,
            userId: data.userId ?? myId ?? undefined,
            company: data.company ?? "",
            role: data.role ?? "",
            status: (STATUS_OPTIONS as readonly string[]).includes(
              data.status as string
            )
              ? (data.status as Status)
              : "Applied",
            dateApplied:
              data.dateApplied ?? new Date().toISOString().slice(0, 10),
            details: data.details ?? "",
          });
        } catch (e) {
          if ((e as Error).name !== "AbortError") {
            setError("Failed to load job for editing.");
          }
        } finally {
          setLoading(false);
        }
      })();
    }
    return () => abort.abort();
  }, [isEdit, id, passed, myId]);

  function onChange<K extends keyof Job>(key: K, value: Job[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!myId) {
      setError("Please log in first.");
      return;
    }

    const payload: Job = { ...form, userId: myId };

    try {
      const res = await fetch(
        isEdit ? `${API_BASE}/jobs/${id}` : `${API_BASE}/jobs`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // ✅ After save, use callback if provided, else default navigation
      if (onSaved) {
        onSaved();
      } else {
        navigate("/jobpage", { replace: true });
      }
    } catch (e) {
      setError(
        isEdit ? "Update failed. Try again." : "Create failed. Try again."
        
      );
      console.error(e);
    }
  }

  if (loading) return <div className="pageCenter">Loading form…</div>;

  return (
    <div className="jobformShell">
      <NavBar />
      <div className="jobformPage">
        <section className="jobform">
      <header className="jobform__header">
        <h1 className="jobform__title">{isEdit ? "Edit Job" : "Add Job"}</h1>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => (onCancel ? onCancel() : navigate(-1))} // ← Back to previous page
        >
          ← Back
        </button>
      </header>

      {error && <div className="alert alert--danger">{error}</div>}

      <form onSubmit={onSubmit} className="jobform__form">
        <div className="form__row">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            value={form.company}
            onChange={(e) => onChange("company", e.target.value)}
            required
          />
        </div>

        <div className="form__row">
          <label htmlFor="role">Role</label>
          <input
            id="role"
            value={form.role}
            onChange={(e) => onChange("role", e.target.value)}
            required
          />
        </div>

        <div className="form__row">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => onChange("status", e.target.value as Status)}
            required
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form__row">
          <label htmlFor="dateApplied">Date applied</label>
          <input
            id="dateApplied"
            type="date"
            value={form.dateApplied}
            onChange={(e) => onChange("dateApplied", e.target.value)}
            required
          />
        </div>

        <div className="form__row">
          <label htmlFor="details">Details</label>
          <textarea
            id="details"
            value={form.details ?? ""}
            onChange={(e) => onChange("details", e.target.value)}
            rows={5}
            placeholder="Job duties, requirements, notes…"
          />
        </div>

        <div className="form__actions">
          <button type="submit" className="btn btn--primary">
            {isEdit ? "Save changes" : "Create job"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => (onCancel ? onCancel() : navigate(-1))}
          >
            Cancel
          </button>
        </div>
          </form>
        </section>
      </div>
      <Footer />
    </div>
  );
}
