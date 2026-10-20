import { useEffect, useState } from "react";
import {
  getMyJobInvitations,
  respondToJobInvitation,
} from "../api/jobsApi.js";

function MyInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busyInvitationId, setBusyInvitationId] = useState(null);

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
        const result = await getMyJobInvitations(token);

        if (!cancelled) {
          setInvitations(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error.message || "Failed to load invitations.");
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

  const handleResponse = async (invitationId, status) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in again.");
      return;
    }

    setBusyInvitationId(invitationId);
    setMessage("");

    try {
      const result = await respondToJobInvitation(
        invitationId,
        status,
        token
      );

      setInvitations((current) =>
        current.map((invitation) =>
          String(invitation.id) === String(invitationId)
            ? { ...invitation, ...result.invitation }
            : invitation
        )
      );

      setMessage(result.message || "Your response has been saved.");
    } catch (error) {
      setMessage(error.message || "Failed to respond to invitation.");
    } finally {
      setBusyInvitationId(null);
    }
  };

  return (
    <section className="job-invitations">
      <h2>My Invitations</h2>
      <p>Review job invitations from employers.</p>

      {message && <p className="message">{message}</p>}

      {loading ? (
        <p>Loading invitations...</p>
      ) : invitations.length === 0 ? (
        <p className="no-jobs">
          You don't have any job invitations yet.
        </p>
      ) : (
        invitations.map((invitation) => (
          <article className="job-card" key={invitation.id}>
            <h3>{invitation.job_title}</h3>

            <p>
              <strong>Company:</strong>{" "}
              {invitation.company || "Not specified"}
            </p>

            <p>
              <strong>Employer:</strong>{" "}
              {invitation.employer_name || "Not specified"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {invitation.location || "Not specified"}
            </p>

            <p>
              <strong>Salary:</strong>{" "}
              {invitation.salary || "Not specified"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {invitation.status === "pending"
                ? "Awaiting your response"
                : invitation.status === "accepted"
                  ? "Accepted"
                  : "Declined"}
            </p>

            {invitation.status === "pending" && (
              <div className="job-actions">
                <button
                  type="button"
                  disabled={busyInvitationId === invitation.id}
                  onClick={() =>
                    handleResponse(invitation.id, "accepted")
                  }
                >
                  Accept
                </button>

                <button
                  type="button"
                  className="delete-button"
                  disabled={busyInvitationId === invitation.id}
                  onClick={() =>
                    handleResponse(invitation.id, "declined")
                  }
                >
                  Decline
                </button>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  );
}

export default MyInvitations;