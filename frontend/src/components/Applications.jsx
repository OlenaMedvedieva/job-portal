import { useEffect, useState } from "react";
import { updateApplicationStatus } from "../api/jobsApi";
const API_URL = "http://172.23.47.70:3000";
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
        ? {
    ...application,
    ...result.application,
  }
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
        console.log("APPLICATIONS DATA:", data.applications);
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
  {application.profile_image && (
    <img
      src={application.profile_image}
      alt={`${application.name}'s profile`}
      className="application-profile-image"
    />
  )}

  <p>
    <strong>Name:</strong> {application.name}
  </p>
  <button
  type="button"
  onClick={() =>
    setApplications((prev) =>
      prev.map((item) =>
        item.id === application.id
          ? { ...item, showProfile: !item.showProfile }
          : item
      )
    )
  }
>
  {application.showProfile ? "Hide Profile" : "View Profile"}
</button>

{application.showProfile && (
  <div className="candidate-details">
    <p><strong>Job title:</strong> {application.job_title || "Not specified"}</p>
    <p><strong>City:</strong> {application.city || "Not specified"}</p>
    <p><strong>Skills:</strong> {application.skills || "Not specified"}</p>
    <p><strong>Experience:</strong> {application.experience || "Not specified"}</p>
    <p><strong>Education:</strong> {application.education || "Not specified"}</p>
  </div>
)}

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