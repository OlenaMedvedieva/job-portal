import { useEffect, useState } from "react";

function JobSeekers({
  jobSeekers = [],
  loadJobSeekers,
  jobs = [],
  onInviteCandidate,
}) {
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [selectedJobIds, setSelectedJobIds] = useState({});
  useEffect(() => {
    loadJobSeekers();
  }, []);

  return (
    <section className="job-seekers">
      <h2>Find Candidates</h2>
      <p>Explore profiles of people looking for work.</p>

      {jobSeekers.length === 0 ? (
        <p className="no-jobs">
          No candidates found.
        </p>
      ) : (
        jobSeekers.map((jobSeeker) => (
          <article className="job-seeker-card" key={jobSeeker.id}>
            <h4 className="job-seeker-header">
              <button
                type="button"
                onClick={() =>
                  setSelectedJobSeeker(
                    selectedJobSeeker?.id === jobSeeker.id
                      ? null
                      : jobSeeker
                  )
                }
                aria-expanded={selectedJobSeeker?.id === jobSeeker.id}
              >
                {jobSeeker.profile_image && (
                  <img
                    src={jobSeeker.profile_image}
                    alt=""
                    className="job-seeker-photo"
                  />
                )}

                <span className="job-seeker-name">
                  {jobSeeker.name}
                </span>
              </button>
            </h4>

            {selectedJobSeeker?.id === jobSeeker.id && (
              <div>
                <p>
                  <strong>Job title:</strong>{" "}
                  {jobSeeker.job_title || "Not specified"}
                </p>
                <p>
                  <strong>City:</strong>{" "}
                  {jobSeeker.city || "Not specified"}
                </p>
                <p>
                  <strong>Skills:</strong>{" "}
                  {jobSeeker.skills || "Not specified"}
                </p>
                <p>
                  <strong>Experience:</strong>{" "}
                  {jobSeeker.experience || "Not specified"}
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {jobSeeker.education || "Not specified"}
                </p>
                <div className="invite-candidate">
  {jobs.length === 0 ? (
    <p>Create a job before inviting candidates.</p>
  ) : (
    <>
      <label>
        Choose a job:
        <select
          value={selectedJobIds[jobSeeker.id] || ""}
          onChange={(event) =>
            setSelectedJobIds((previous) => ({
              ...previous,
              [jobSeeker.id]: event.target.value,
            }))
          }
        >
          <option value="">Select a vacancy</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </label>

     <button
  type="button"
  className="invite-button"
  onClick={() => {
    const selectedJobId = selectedJobIds[jobSeeker.id];

    if (!selectedJobId) {
      window.alert("Please select a vacancy first.");
      return;
    }

    if (typeof onInviteCandidate !== "function") {
      window.alert("Invitation function is not connected.");
      return;
    }

    onInviteCandidate(
      Number(selectedJobId),
      Number(jobSeeker.id)
    );
  }}
>
  Invite to Apply
</button>
    </>
  )}
</div>
              </div>
            )}
          </article>
        ))
      )}
    </section>
  );
}

export default JobSeekers;