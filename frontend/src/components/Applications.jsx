import { useEffect, useState } from "react";
import { updateApplicationStatus } from "../api/jobsApi";
const API_URL = "http://localhost:3000";

function Applications({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

const handleStatusChange = async (applicationId, status) => {
  try {
    const token = localStorage.getItem("token");

    const result = await updateApplicationStatus(
      applicationId,
      status,
      token
    );

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? result.application
          : application
      )
    );

    setMessage("Application status updated successfully");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Failed to update application status");
  }
};

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_URL}/jobs/${jobId}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Failed to load applications");
          return;
        }

        setApplications(data.applications);
      } catch (error) {
        console.error(error);
        setMessage("Cannot connect to the server");
      }
    };

    loadApplications();
  }, [jobId]);

  return (
    <div className="applications">
      <h4>Applications</h4>

      {message && <p className="message">{message}</p>}

      {applications.length === 0 && !message && (
        <p>No applications yet.</p>
      )}

      {applications.map((application) => (
        <div key={application.id} className="application-card">
          <p>
            <strong>Name:</strong> {application.name}
          </p>

          <p>
            <strong>Email:</strong> {application.email}
          </p>

          <p>
            <strong>Job title:</strong>{" "}
            {application.job_title || "Not specified"}
          </p>

          <p>
            <strong>Status:</strong> {application.status}
          </p>
{application.status === "pending" && (
  <div className="application-actions">
    <button
      type="button"
      onClick={() => handleStatusChange(application.id, "accepted")}
    >
      Accept
    </button>

    <button
      type="button"
      onClick={() => handleStatusChange(application.id, "rejected")}
    >
      Reject
    </button>
  </div>
)}

        </div>
      ))}
    </div>
  );
}

export default Applications;