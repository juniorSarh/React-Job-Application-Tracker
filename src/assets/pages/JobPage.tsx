import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/** Types */
type Job = {
  id: number | string;
  company: string;
  role: string;
  status: "Applied" | "Interviewed" | "Rejected";
  dateApplied: string; // yyyy-mm-dd
  details?: string;
  userId?: number | string; // present if you've added ownership
};

/** Same API base logic you used in JobList */
type ViteEnvMeta = ImportMeta & { env?: { VITE_API_URL?: string } };
type GlobalWithCRA = typeof globalThis & {
  process?: { env?: { REACT_APP_API_URL?: string } };
};
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

/** Status colors (match JobList) */
const statusColor: Record<Job["status"], string> = {
  Applied: "#fbbf24",
  Interviewed: "#10b981",
  Rejected: "#ef4444",
};

export default function JobPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Current logged-in user */
  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  }, []);
  const myId = auth?.id ?? null;

  useEffect(() => {
    if (!jobId) {
      setError("No job selected.");
      return;
    }
    if (!myId) {
      setError("Please log in to view job details.");
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/jobs/${encodeURIComponent(String(jobId))}`,
          {
            signal: ctrl.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Job;

        // Ownership check (if userId field exists on jobs)
        if (data?.userId != null && String(data.userId) !== String(myId)) {
          setError("You can only view your own job details.");
          setJob(null);
          return;
        }

        setJob(data);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [jobId, myId]);

  return (
    <section className="jobs" style={{ padding: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/home" className="btn btn--ghost">
          ← Back to Jobs
        </Link>
      </div>

      {loading && <p className="jobs__center">Loading…</p>}
      {error && !loading && <p className="jobs__error">{error}</p>}
      {!loading && !error && !job && (
        <p className="jobs__center">No job found.</p>
      )}

      {job && (
        <div className="jobform" style={{ maxWidth: 800 }}>
          <h2 className="jobform__title">Job Details</h2>

          <div className="jobform__grid">
            <label>
              Company
              <input type="text" value={job.company} readOnly />
            </label>

            <label>
              Role
              <input type="text" value={job.role} readOnly />
            </label>

            <label>
              Status
              <div className="jobform__statusWrap">
                <select value={job.status} disabled>
                  <option>{job.status}</option>
                </select>
                <span
                  className="jobform__statusDot"
                  style={{ backgroundColor: statusColor[job.status] }}
                  aria-hidden="true"
                  title={job.status}
                />
              </div>
            </label>

            <label>
              Date applied
              <input type="date" value={job.dateApplied} readOnly />
            </label>

            <label className="jobform__full">
              Extra details
              <textarea rows={6} value={job.details || ""} readOnly />
            </label>
          </div>

          <div
            className="jobform__actions"
            style={{ justifyContent: "flex-start" }}
          >
            <Link to={`/jobs/${job.id}/edit`} className="btn btn--primary">
              Edit
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
