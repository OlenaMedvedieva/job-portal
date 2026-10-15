
import JobCard from "./JobCard.jsx";

function JobList({
  jobs,
  user,
  onSelectJob,
  onEditJob,
  onDeleteJob,
}) {
  return (
    <section className="jobs">
      
<div className="jobs-heading">
  <h2>Available Jobs</h2>
  <span className="jobs-count">
    {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
  </span>
</div>


      {jobs.length === 0 ? (
        <p className="no-jobs">
          No jobs match your search. Try changing your filters.
        </p>
      ) : (
        jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            user={user}
            onSelectJob={onSelectJob}
            onEditJob={onEditJob}
            onDeleteJob={onDeleteJob}
          />
        ))
      )}
    </section>
  );
}

export default JobList;
