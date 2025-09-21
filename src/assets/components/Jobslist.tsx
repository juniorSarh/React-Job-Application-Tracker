import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/** ===== Types ===== */
export type Job = {
  id: number | string;
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

/** ===== Constants ===== */
const STATUS_OPTIONS = ["Applied", "Interviewed", "Rejected"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const statusColor: Record<Status, string> = {
  Applied: "#fbbf24", // yellow
  Interviewed: "#10b981", // green
  Rejected: "#ef4444", // red
};

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const q = searchParams.get("q") ?? "";
  const statusParam = (searchParams.get("status") ?? "all") as "all" | Status;
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  // Local input mirror for search box (committed on submit)
  const [queryInput, setQueryInput] = useState(q);

  // Data state
  const [rows, setRows] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Current logged-in user
  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth_user") || "null");
    } catch {
      return null;
    }
  })();
  const myId = auth?.id ?? null;

  // Build the json-server URL from params
  const listUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (statusParam !== "all") p.set("status", statusParam);
    // sort by dateApplied
    p.set("_sort", "dateApplied");
    p.set("_order", order);
    if (myId) p.set("userId", String(myId));
    return `${API_BASE}/jobs?${p.toString()}`;
  }, [q, statusParam, order]);

  // Fetch whenever URL params change
  useEffect(() => {
    const ctrl = new AbortController();
    async function run() {
      if (!myId) {
        setRows([]);
        setError("Please log in to see your jobs.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(listUrl, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Job[];
        setRows(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          "Failed to load jobs. Is json-server running and /jobs available?"
        );
      } finally {
        setLoading(false);
      }
    }
    run();
    return () => ctrl.abort();
  }, [listUrl]);

  // Actions
  function commitSearch() {
    const next = new URLSearchParams(searchParams);
    if (queryInput.trim()) next.set("q", queryInput.trim());
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  function onStatusChange(nextStatus: "all" | Status) {
    const next = new URLSearchParams(searchParams);
    if (nextStatus === "all") next.delete("status");
    else next.set("status", nextStatus);
    setSearchParams(next, { replace: true });
  }

  function onOrderChange(nextOrder: "asc" | "desc") {
    const next = new URLSearchParams(searchParams);
    next.set("order", nextOrder);
    setSearchParams(next, { replace: true });
  }

  async function handleDelete(id: Job["id"]) {
    const ok = window.confirm("Delete this job?");
    if (!ok) return;
    try {
      // Optimistic UI
      setRows((r) => r.filter((x) => x.id !== id));
      const res = await fetch(`${API_BASE}/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch {
      setError("Delete failed. Please try again.");
    }
  }

  return (
    <section className="jobs">
      {/* Controls */}
      <div className="jobs__toolbar">
        <div className="jobs__left">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commitSearch();
            }}
            className="jobs__searchForm"
            role="search"
            aria-label="Search jobs"
          >
            <input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search by company, role, details..."
              className="jobs__searchInput"
              aria-label="Search jobs"
            />
            <button type="submit" className="btn btn--primary">
              Search
            </button>
          </form>

          <select
            className="jobs__select"
            value={statusParam}
            onChange={(e) => onStatusChange(e.target.value as "all" | Status)}
            aria-label="Filter status"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="jobs__select"
            value={order}
            onChange={(e) => onOrderChange(e.target.value as "asc" | "desc")}
            aria-label="Sort by date applied"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>

          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setQueryInput("");
              setSearchParams({}, { replace: true });
            }}
          >
            Reset
          </button>
        </div>

        <div className="jobs__right">
          <Link to="/jobform" className="btn btn--primary">
            + Add Job
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="jobs__tableWrap">
        <table className="jobs__table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date applied</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="jobs__center">
                  Loading…
                </td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td colSpan={5} className="jobs__error">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="jobs__center">
                  No jobs found.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((j) => (
                <tr key={j.id}>
                  <td>{j.company}</td>
                  <td>{j.role}</td>
                  <td>
                    <span
                      className="jobs__statusPill"
                      style={{ backgroundColor: statusColor[j.status] }}
                      title={j.status}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td>{j.dateApplied}</td>
                  <td className="jobs__actions">
                    <Link
                      to={`/jobpage?jobId=${j.id}`}
                      className="btn btn-info btn-sm"
                    >
                      View details
                    </Link>
                    <Link to={`/jobs/${j.id}/jobform`} className="btn btn-warning">
                      Edit
                    </Link>

                    <button
                      className="btn btn--sm btn--danger"
                      onClick={() => handleDelete(j.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
