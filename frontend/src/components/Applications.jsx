import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

function Applications({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

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
        </div>
      ))}
    </div>
  );
}

export default Applications;