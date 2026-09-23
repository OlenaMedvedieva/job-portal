import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://localhost:3000";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  
  const handleApply = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/jobs/${id}/apply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to apply for this job");
      return;
    }

    setMessage(data.message);
  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to the server");
  }
};

  useEffect(() => {
    const loadJob = async () => {
      try {
        const response = await fetch(`${API_URL}/jobs/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Job not found");
          return;
        }

        setJob(data.job);
      } catch (error) {
        console.error(error);
        setMessage("Cannot connect to the server");
      }
    };

    loadJob();
  }, [id]);

  if (message) {
    return (
      <section className="job-details">
        <p>{message}</p>
        <Link to="/">Back to jobs</Link>
      </section>
    );
  }

  if (!job) {
    return <p>Loading job...</p>;
  }

  return (
    <section className="job-details">
      <h2>{job.title}</h2>

      <p>
        <strong>Company:</strong> {job.company}
      </p>

      <p>
        <strong>Location:</strong> {job.location}
      </p>

      <p>
        <strong>Salary:</strong> {job.salary}
      </p>

      <p><strong>Views:</strong> {job.views || 0}</p>
       <p><strong>Applications:</strong> {job.applications_count || 0}</p>
      
      <p>{job.description}</p>

      <small>Posted by: {job.author}</small>

      <br />

      <button onClick={handleApply}>Apply for this job</button>
      <Link to="/">Back to jobs</Link>
    </section>
  );
}

export default JobDetails;