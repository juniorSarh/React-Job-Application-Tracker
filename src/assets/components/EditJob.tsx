import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import JobForm from "./JobForm";
import { API_BASE } from "../api";

type Status = "Applied" | "Interviewed" | "Rejected";

type Job = {
  id: number | string;
  company: string;
  role: string;
  status: Status;
  dateApplied: string; // yyyy-mm-dd
  details?: string;
  userId?: number | string; // present if you store ownership
};

type Props = {
  /** If omitted, component will read ":id" from the current route via useParams */
  jobId?: number | string;
  /** Called after a successful save (defaults to navigate("/home")) */
  onSaved?: () => void;
  /** Called when the user hits "Cancel" (defaults to navigate("/home")) */
  onCancel?: () => void;
};

export default function EditJob({ jobId, onSaved, onCancel }: Props) {
  const params = useParams<{ id?: string }>();
  const effectiveId = jobId ?? params.id;
  const nav = useNavigate();

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
    if (!effectiveId) {
      setError("Missing job id.");
      return;
    }
    if (!myId) {
      setError("Please log in to edit jobs.");
      return;
    }

    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/jobs/${encodeURIComponent(String(effectiveId))}`,
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Job;

        // Enforce ownership if userId exists on jobs
        if (data?.userId != null && String(data.userId) !== String(myId)) {
          setError("You can only edit your own jobs.");
          setJob(null);
          return;
        }

        setJob(data);
      } catch (e) {
        setError("Failed to load the job.");
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [effectiveId, myId]);

  const handleSaved =
    onSaved ?? (() => nav("/home", { replace: true }));
  const handleCancel =
    onCancel ?? (() => nav("/home", { replace: true }));

  return (
    <section className="jobs" style={{ padding: 16 }}>
      {loading && <p className="jobs__center">Loading…</p>}
      {error && !loading && <p className="jobs__error">{error}</p>}

      {job && !loading && !error && (
        <div className="page">
          <JobForm
            job={job}
            onSaved={() => handleSaved()}
            onCancel={() => handleCancel()}
          />
        </div>
      )}
    </section>
  );
}
