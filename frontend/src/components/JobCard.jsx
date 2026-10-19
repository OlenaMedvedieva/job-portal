import { useState } from "react";
import Applications from "./Applications.jsx";

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
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Salary:</strong> {job.salary}
      </p>
      <p>
        <strong>Views:</strong> {job.views || 0}
     </p>
      <p>
        <strong>Applications:</strong> {job.applications_count || 0}
     </p>

      <p>{job.description}</p>

      <small>
        Posted by: {job.author}
      </small>

      <button onClick={() => onSelectJob(job.id)}>
        View Details
      </button>

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