import { useEffect, useMemo, useState, type FormEvent } from "react";

type Job = {
  id?: number | string;
  company: string;
  role: string;
  status: "Applied" | "Interviewed" | "Rejected";
  dateApplied: string; // ISO string yyyy-mm-dd
  details?: string;
};

type Props = {
  job?: Job; // pass to edit an existing job
  onSaved?: (saved: Job) => void; // called after successful save
  onCancel?: () => void; // optional cancel handler
};

/** Cross-stack env detection (Vite or CRA) with a safe fallback */
function getApiBase() {
  try {
    type ViteEnvMeta = ImportMeta & { env?: { VITE_API_URL?: string } };

    const viteUrl: string | undefined = (import.meta as ViteEnvMeta).env
      ?.VITE_API_URL;

    if (viteUrl) return viteUrl;
  } catch {
    // ignore — not running under Vite
  }
  return "http://localhost:3001";
}
const API_BASE = getApiBase();

const STATUS_OPTIONS = ["Applied", "Interviewed", "Rejected"] as const;
type Status = (typeof STATUS_OPTIONS)[number];

const statusColor: Record<Status, string> = {
  Applied: "#fbbf24", // amber/yellow
  Interviewed: "#10b981", // green
  Rejected: "#ef4444", // red
};

export default function JobForm({ job, onSaved, onCancel }: Props) {
  const [company, setCompany] = useState(job?.company ?? "");
  const [role, setRole] = useState(job?.role ?? "");
  const [status, setStatus] = useState<Status>(
    (job?.status as Status) ?? "Applied"
  );
  const [dateApplied, setDateApplied] = useState(job?.dateApplied ?? "");
  const [details, setDetails] = useState(job?.details ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // prefill today's date on create
  useEffect(() => {
    if (!job && !dateApplied) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setDateApplied(`${yyyy}-${mm}-${dd}`);
    }
  }, [job, dateApplied]);

  const isEdit = useMemo(() => Boolean(job?.id), [job]);

  function validate() {
    if (!company.trim()) return "Company name is required.";
    if (!role.trim()) return "Role is required.";
    if (!STATUS_OPTIONS.includes(status)) return "Status is invalid.";
    if (!dateApplied) return "Date applied is required.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload: Job = {
      company: company.trim(),
      role: role.trim(),
      status,
      dateApplied, // already in yyyy-mm-dd
      details: details.trim() || "",
    };

    try {
      setSaving(true);
      const url = isEdit ? `${API_BASE}/jobs/${job!.id}` : `${API_BASE}/jobs`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = (await res.json()) as Job;
      onSaved?.(saved);

      // Optionally clear form on create
      if (!isEdit) {
        setCompany("");
        setRole("");
        setStatus("Applied");
        setDetails("");
        const d = new Date();
        setDateApplied(
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(d.getDate()).padStart(2, "0")}`
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) console.error("Save job failed:", err.message);
      setError(
        "Could not save. Is json-server running and is /jobs available?"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="jobform" onSubmit={handleSubmit} noValidate>
      <h2 className="jobform__title">{isEdit ? "Edit Job" : "Add Job"}</h2>

      <div className="jobform__grid">
        <label>
          Company<span className="req">*</span>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Acme Inc."
            autoComplete="organization"
          />
        </label>

        <label>
          Role<span className="req">*</span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Frontend Engineer"
            autoComplete="organization-title"
          />
        </label>

        <label>
          Status<span className="req">*</span>
          <div className="jobform__statusWrap">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span
              className="jobform__statusDot"
              style={{ backgroundColor: statusColor[status] }}
              aria-hidden="true"
              title={status}
            />
          </div>
        </label>

        <label>
          Date applied<span className="req">*</span>
          <input
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
          />
        </label>

        <label className="jobform__full">
          Extra details
          <textarea
            rows={5}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="requirements and e.t.c."
          />
        </label>
      </div>

      {error && (
        <p className="jobform__error" role="alert">
          {error}
        </p>
      )}

      <div className="jobform__actions">
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving
            ? isEdit
              ? "Saving..."
              : "Adding..."
            : isEdit
            ? "Save"
            : "Add Job"}
        </button>
      </div>
    </form>
  );
}
