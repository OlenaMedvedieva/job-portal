import { useState } from "react";
import Applications from "./Applications.jsx";


function JobCard({
  job,
  user,
  onSelectJob,
  onEditJob,
  onDeleteJob,
}) {
  const [showApplications, setShowApplications] = useState(false);
  
  return (
    <article className="job-card">
      <h3>{job.title}</h3>

      <p>
        <strong>Company:</strong> {job.company}
      </p>

      <p>
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Salary:</strong> {job.salary}
      </p>

      <p>{job.description}</p>

      <small>
        Posted by: {job.author}
      </small>

      <button onClick={() => onSelectJob(job.id)}>
        View Details
      </button>

      {user && job.author === user.name && (
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