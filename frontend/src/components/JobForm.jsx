function JobForm({
  editingJobId,
  jobTitle,
  jobCompany,
  jobLocation,
  jobSalary,
  jobDescription,
  setJobTitle,
  setJobCompany,
  setJobLocation,
  setJobSalary,
  setJobDescription,
  createJob,
}) {
  return (
    <form className="job-form" onSubmit={createJob}>
      <h2>{editingJobId ? "Edit Job" : "Create New Job"}</h2>

      <label>
        Job title
        <input
          type="text"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          placeholder="Frontend Developer"
          required
        />
      </label>

      <label>
        Company
        <input
          type="text"
          value={jobCompany}
          onChange={(event) => setJobCompany(event.target.value)}
          placeholder="Tech Company"
          required
        />
      </label>

      <label>
        Location
        <input
          type="text"
          value={jobLocation}
          onChange={(event) => setJobLocation(event.target.value)}
          placeholder="Warsaw, Poland"
        />
      </label>

      <label>
        Salary
        <input
          type="text"
          value={jobSalary}
          onChange={(event) => setJobSalary(event.target.value)}
          placeholder="12000 PLN"
        />
      </label>

      <label>
        Description
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Job description"
          rows="5"
        />
      </label>

      <button type="submit" className="submit-button">
        {editingJobId ? "Update Job" : "Create Job"}
      </button>
    </form>
  );
}

export default JobForm;