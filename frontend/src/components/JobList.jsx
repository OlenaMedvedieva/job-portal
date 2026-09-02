import JobCard from "./JobCard.jsx";

function JobList({
  jobs,
  user,
  onSelectJob,
  onEditJob,
  onDeleteJob,
}) {
  return (
    <>
      {jobs.length > 0 && (
        <section className="jobs">
          <h2>Available Jobs</h2>

          {jobs.map((job) => (
           <JobCard
  key={job.id}
  job={job}
  user={user}
  onSelectJob={onSelectJob}
  onEditJob={onEditJob}
  onDeleteJob={onDeleteJob}
/> 
          ))}
        </section>
      )}
    </>
  );
}

export default JobList;