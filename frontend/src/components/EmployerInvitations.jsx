import { useEffect, useState } from "react";
import { getSentJobInvitations } from "../api/jobsApi.js";

function EmployerInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedInvitationId, setExpandedInvitationId] = useState(null);
  
  useEffect(() => {
    let cancelled = false;

    const loadInvitations = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const result = await getSentJobInvitations(token);

        if (!cancelled) {
          setInvitations(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error.message || "Failed to load invitations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInvitations();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusLabels = {
    pending: "Awaiting response",
    accepted: "Accepted",
    declined: "Declined",
  };

  return (
    <section className="employer-invitations">
      <h2>Sent Invitations</h2>
      <p>Track candidates' responses to your invitations.</p>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p>Loading invitations...</p>
      ) : invitations.length === 0 && !message ? (
        <p className="no-jobs">
          You haven't sent any invitations yet.
        </p>
      ) : (
        invitations.map((invitation) => (
          <article className="job-card" key={invitation.id}>
  <button
    type="button"
    aria-expanded={
      String(expandedInvitationId) === String(invitation.id)
    }
    onClick={() =>
      setExpandedInvitationId((current) =>
        String(current) === String(invitation.id)
          ? null
          : invitation.id
      )
    }
    style={{
      background: "transparent",
      border: "none",
      padding: "8px 0",
      cursor: "pointer",
      fontSize: "1.1rem",
      fontWeight: 700,
      textAlign: "left",
    }}
  >
    {invitation.candidate_name}
    {String(expandedInvitationId) === String(invitation.id)
      ? " ▲"
      : " ▼"}
  </button>

  {String(expandedInvitationId) === String(invitation.id) && (
    <div className="candidate-full-profile">
      {invitation.candidate_profile_image && (
        <img
          src={invitation.candidate_profile_image}
          alt={invitation.candidate_name}
          className="job-seeker-photo"
        />
      )}

      <p>
        <strong>Email:</strong>{" "}
        {invitation.candidate_email || "Not specified"}
      </p>

      <p>
        <strong>Position:</strong>{" "}
        {invitation.candidate_job_title || "Not specified"}
      </p>

      <p>
        <strong>City:</strong>{" "}
        {invitation.candidate_city || "Not specified"}
      </p>

      <p>
        <strong>Skills:</strong>{" "}
        {invitation.candidate_skills || "Not specified"}
      </p>

      <p>
        <strong>Experience:</strong>{" "}
        {invitation.candidate_experience || "Not specified"}
      </p>

      <p>
        <strong>Education:</strong>{" "}
        {invitation.candidate_education || "Not specified"}
      </p>

      <p>
        <strong>Job offered:</strong>{" "}
        {invitation.job_title}
      </p>

      <p>
        <strong>Company:</strong>{" "}
        {invitation.company || "Not specified"}
      </p>

      <p>
        <strong>Response:</strong>{" "}
        {statusLabels[invitation.status] || invitation.status}
      </p>
    </div>
  )}
</article>
        ))
      )}
    </section>
  );
}

export default EmployerInvitations;