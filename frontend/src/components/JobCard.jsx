import { useState } from "react";
import Applications from "./Applications.jsx";
import { Link } from "react-router-dom";
import { API_URL } from "../api/jobsApi.js";

function JobCard({
  job,
  user,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  isSaved = false,
  onToggleSaved,
}) {
  const [showApplications, setShowApplications] = useState(false);
  
  const [showDetails, setShowDetails] = useState(false);
const [applyMessage, setApplyMessage] = useState("");
const [isApplying, setIsApplying] = useState(false);

const handleApply = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setApplyMessage("Please log in to apply.");
    return;
  }

  setIsApplying(true);
  setApplyMessage("");

  try {
    const response = await fetch(
      `${API_URL}/jobs/${job.id}/apply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setApplyMessage(
        data.message || "Failed to apply for this job."
      );
      return;
    }

    setApplyMessage("Application submitted successfully!");
  } catch (error) {
    console.error("Apply for job error:", error);
    setApplyMessage("Cannot connect to the server.");
  } finally {
    setIsApplying(false);
  }
};
  return (
    <article className="job-card">
     <div className="job-card-heading">
  <h3>{job.title}</h3>

  {user && (
    <button
      type="button"
      className={`bookmark-button ${isSaved ? "saved" : ""}`}
      onClick={() => onToggleSaved?.(job.id)}
      aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
      aria-pressed={isSaved}
      title={isSaved ? "Remove from Saved" : "Save job"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.75h12v16.5l-6-4-6 4z" />
      </svg>
    </button>
  )}
</div>

   <p>
  <strong>Company:</strong> {job.company}
</p>

<p>
  <strong>Location:</strong> {job.location || "Not specified"}
</p>

<p>
  <strong>Salary:</strong> {job.salary || "Not specified"}
</p>

<button
  type="button"
  className="job-details-toggle"
  onClick={() => setShowDetails((previous) => !previous)}
  aria-expanded={showDetails}
>
  {showDetails ? "Hide Details ▲" : "View Details ▼"}
</button>

{showDetails && (
  <div className="job-expanded-details">
    <p>
      <strong>Views:</strong> {job.views || 0}
    </p>

    <p>
      <strong>Applications:</strong>{" "}
      {job.applications_count || 0}
    </p>

    <div className="job-description">
      <h4>Job Description</h4>
      <p>{job.description || "No description provided."}</p>
    </div>

    <small>Posted by: {job.author || "Not specified"}</small>

    {user && String(job.user_id) !== String(user.id) && (
      <div className="apply-section">
        <button
          type="button"
          onClick={handleApply}
          disabled={isApplying}
          className="apply-button"
        >
          {isApplying ? "Submitting..." : "Apply for this job"}
        </button>

        {applyMessage && (
          <p className="message">{applyMessage}</p>
        )}
      </div>
    )}
  </div>
)}

      {user && job.user_id === user.id && (
        <div className="job-actions">
          <button onClick={() => onEditJob(job)}>
            Edit
          </button>

          <button
            onClick={() => onDeleteJob(job.id)}
            className="delete-button"
          >
            Delete
          </button>
          <button onClick={() => setShowApplications(!showApplications)}>
  {showApplications ? "Hide Applications" : "View Applications"}
</button>

{showApplications && <Applications jobId={job.id} />}
        </div>
      )}
    </article>
  );
}

export default JobCard;