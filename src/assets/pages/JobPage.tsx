import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/** ===== Types ===== */
type Job = {
  id: number | string;
  company: string;
  role: string;
  status: "Applied" | "Interviewed" | "Rejected";
  dateApplied: string; // yyyy-mm-dd
  details?: string;
  userId?: number | string;
};

/** ===== API base (Vite or CRA) ===== */
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

/** ===== Status colors (match list) ===== */
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

  // Current logged-in user
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
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Job;

        // Ownership check if userId present
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
        {/* If your list route is /jobpage, link back there */}
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
        <article
          className="jobcard"
          style={{
            maxWidth: 900,
            margin: "0 auto",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            background: "#fff",
          }}
        >
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>{job.role}</h2>
              <p style={{ margin: "4px 0 0 0", color: "#4b5563" }}>
                {job.company}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                title={job.status}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 9999,
                  padding: "6px 12px",
                  fontSize: 14,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: statusColor[job.status],
                  }}
                />
                {job.status}
              </span>

              <Link to={`/jobform/${job.id}`} className="btn btn--primary">
                Edit
              </Link>
            </div>
          </header>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "12px 0 16px",
            }}
          />

          <div
            className="jobcard__meta"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                Date applied
              </div>
              <div style={{ fontWeight: 600 }}>{job.dateApplied}</div>
            </div>

            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
                Job ID
              </div>
              <div
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                }}
              >
                {String(job.id)}
              </div>
            </div>
          </div>

          <section>
            <h3 style={{ margin: "8px 0 8px" }}>Details</h3>
            {job.details ? (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                {job.details}
              </div>
            ) : (
              <p style={{ color: "#6b7280", fontStyle: "italic" }}>
                No extra details provided.
              </p>
            )}
          </section>

          <footer style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Link to="/home" className="btn btn--ghost">
              Back to list
            </Link>
            <Link to={`/jobform/${job.id}`} className="btn btn--primary">
              Edit Job
            </Link>
          </footer>
        </article>
      )}
    </section>
  );
}
