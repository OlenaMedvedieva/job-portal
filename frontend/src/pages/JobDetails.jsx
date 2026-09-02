import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://localhost:3000";

function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");

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

      <p>{job.description}</p>

      <small>Posted by: {job.author}</small>

      <br />

      <Link to="/">Back to jobs</Link>
    </section>
  );
}

export default JobDetails;