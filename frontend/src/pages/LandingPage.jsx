
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL, getJobs, getProfile } from "../api/jobsApi.js";

function LandingPage() {
   const navigate = useNavigate(); 
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  
  const [currentUserId, setCurrentUserId] = useState(null);

const [savedJobsByUser, setSavedJobsByUser] = useState(() => {
  try {
    const saved = localStorage.getItem("savedJobsByUser");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});

useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  let cancelled = false;

  const loadCurrentUser = async () => {
    try {
      const profileData = await getProfile(token);
      const profile = profileData.user || profileData;

      if (!cancelled) {
        setCurrentUserId(
          profile?.id ? String(profile.id) : null
        );
      }
    } catch (error) {
      console.error("Load current user error:", error);
    }
  };

  loadCurrentUser();

  return () => {
    cancelled = true;
  };
}, []);

useEffect(() => {
  try {
    localStorage.setItem(
      "savedJobsByUser",
      JSON.stringify(savedJobsByUser)
    );
  } catch (error) {
    console.error("Could not save favorite jobs:", error);
  }
}, [savedJobsByUser]);

  useEffect(() => {
    let cancelled = false;

    const loadLatestJobs = async () => {
      try {
        const result = await getJobs();

        if (!cancelled) {
          setJobs(Array.isArray(result) ? result : []);
        }
      } catch (error) {
        if (!cancelled) {
          setJobsError(error.message || "Failed to load jobs.");
        }
      } finally {
        if (!cancelled) {
          setJobsLoading(false);
        }
      }
    };

    loadLatestJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentUserKey = currentUserId
  ? String(currentUserId)
  : null;

const savedJobIds = currentUserKey
  ? savedJobsByUser[currentUserKey] || []
  : [];

const isJobSaved = (jobId) =>
  savedJobIds.includes(String(jobId));

const toggleSavedJob = (jobId) => {
  if (!currentUserKey) {
    navigate("/dashboard");
    return;
  }

  setSavedJobsByUser((previous) => {
    const currentIds = previous[currentUserKey] || [];
    const id = String(jobId);

    const nextIds = currentIds.includes(id)
      ? currentIds.filter((savedId) => savedId !== id)
      : [...currentIds, id];

    return {
      ...previous,
      [currentUserKey]: nextIds,
    };
  });
};

  const handleApply = async (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setApplyMessage("Please log in to apply.");
      return;
    }

    setIsApplying(true);
    setApplyMessage("");

    try {
      const response = await fetch(
        `${API_URL}/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setApplyMessage(data.message || "Failed to apply.");
        return;
      }

      setApplyMessage(
        data.message || "Application submitted successfully!"
      );
    } catch (error) {
      console.error("Apply error:", error);
      setApplyMessage("Cannot connect to the server.");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <main className="landing-page">

      <header className="landing-header">
        <Link to="/" className="landing-logo">
          Job Portal
        </Link>

        <nav>
          <a href="#latest-jobs">Latest Jobs</a>
          <a href="#how-it-works">How it works</a>
          <a href="#employers">For Employers</a>
          <Link to="/dashboard">Login / Register</Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-label">
            FIND YOUR NEXT OPPORTUNITY
          </span>

          <h1>
            Find a job that moves you forward.
          </h1>

          <p>
            Discover new opportunities, connect with employers
            and take the next step in your career.
          </p>

          <div className="landing-buttons">
            <Link to="/dashboard" className="landing-primary-button">
              Get Started
            </Link>

            <a href="#how-it-works" className="landing-secondary-button">
              Learn More
            </a>
          </div>
        </div>

        <div className="landing-hero-card">
          <h3>Your next opportunity starts here</h3>
          <p>Find opportunities in different fields:</p>

          <div className="landing-opportunity">
            <span>IT & Development</span>
            <span>01</span>
          </div>

          <div className="landing-opportunity">
            <span>Production</span>
            <span>02</span>
          </div>

          <div className="landing-opportunity">
            <span>Logistics</span>
            <span>03</span>
          </div>

          <div className="landing-opportunity">
            <span>Customer Support</span>
            <span>04</span>
          </div>
        </div>
      </section>

<section id="latest-jobs" className="landing-jobs">
  <h2>Available Jobs</h2>
  <p>Explore job opportunities from our employers.</p>

  {jobsLoading ? (
    <p>Loading jobs...</p>
  ) : jobsError ? (
    <p className="message">{jobsError}</p>
  ) : jobs.length === 0 ? (
    <p>No jobs available right now.</p>
  ) : (
    <div className="landing-job-grid">
      {jobs.slice(0, 6).map((job) => (
        <article
  className="landing-job-card"
  key={job.id}
  onClick={() => {
    setSelectedJob(job);
    setApplyMessage("");
  }}
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSelectedJob(job);
      setApplyMessage("");
    }
  }}
>
          <div className="landing-job-card-header">
            <h3>{job.title}</h3>

            <button
              type="button"
              className={`landing-bookmark-button ${
                isJobSaved(job.id) ? "saved" : ""
              }`}
              onClick={() => toggleSavedJob(job.id)}
              aria-label={
                isJobSaved(job.id)
                  ? "Remove from saved jobs"
                  : "Save job"
              }
              aria-pressed={isJobSaved(job.id)}
              title={isJobSaved(job.id) ? "Remove from Saved" : "Save job"}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 3.75h12v16.5l-6-4-6 4z" />
              </svg>
            </button>
          </div>

          <p>
            <strong>Company:</strong> {job.company}
          </p>

          <p>
            <strong>Category:</strong> {job.category || "Not specified"}
          </p>

          <p>
            <strong>Location:</strong>{" "}
            {job.location || "Not specified"}
          </p>

          <p>
            <strong>Salary:</strong>{" "}
            {job.salary || "Not specified"}
          </p>

        </article>
      ))}
    </div>
  )}
</section>

    
            {selectedJob && (
        <div
          className="job-modal-overlay"
          onClick={() => setSelectedJob(null)}
        >
          <section
            className="job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            
        <div className="landing-job-card-header">
  <h2 id="job-modal-title">{selectedJob.title}</h2>

  <div className="job-modal-header-actions">
    <button
      type="button"
      className={`landing-bookmark-button ${
        isJobSaved(selectedJob.id) ? "saved" : ""
      }`}
      onClick={() => toggleSavedJob(selectedJob.id)}
      aria-label="Save job"
      aria-pressed={isJobSaved(selectedJob.id)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.75h12v16.5l-6-4-6 4z" />
      </svg>
    </button>

    <button
      type="button"
      className="job-modal-close"
      onClick={() => setSelectedJob(null)}
      aria-label="Close"
    >
      ×
    </button>
  </div>
</div>

            <p><strong>Company:</strong> {selectedJob.company}</p>
            <p><strong>Category:</strong> {selectedJob.category || "Not specified"}</p>
            <p><strong>Location:</strong> {selectedJob.location || "Not specified"}</p>
            <p><strong>Salary:</strong> {selectedJob.salary || "Not specified"}</p>

            <div className="job-modal-description">
              <h3>About this position</h3>
              <p>
                {selectedJob.description || "No description provided."}
              </p>
            </div>

            <p>
              <strong>Posted by:</strong>{" "}
              {selectedJob.author || "Not specified"}
            </p>

            {String(selectedJob.user_id) === String(currentUserId) ? (
              <p>This is your vacancy.</p>
            ) : !localStorage.getItem("token") ? (
              <div className="guest-apply-prompt">
                <h3>Interested in this job?</h3>
                <p>Log in or create an account to apply.</p>

                <Link
                  to="/dashboard"
                  className="landing-primary-button"
                >
                  Login / Register
                </Link>
              </div>
            ) : (
              <div className="apply-section">
                <button
                  type="button"
                  className="apply-button"
                  onClick={() => handleApply(selectedJob.id)}
                  disabled={isApplying}
                >
                  {isApplying
                    ? "Submitting..."
                    : "Apply for this job"}
                </button>

                {applyMessage && (
                  <p className="message">{applyMessage}</p>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <section id="how-it-works" className="landing-info">
        <h2>Everything you need to find work</h2>
        <p>
          Create your profile, explore job opportunities
          and apply for positions that match your skills.
        </p>
      </section>

      <section id="employers" className="landing-employers">
        <h2>Looking for talented employees?</h2>

        <p>
          Publish your vacancies, explore candidate profiles
          and find the right people for your company.
        </p>

        <Link to="/dashboard" className="landing-primary-button">
          Start Hiring
        </Link>
      </section>

      <footer className="landing-footer">
        <strong>Job Portal</strong>
        <p>Find opportunities. Build your future.</p>
        <span>© 2026 Job Portal</span>
      </footer>

    </main>
  );
}

export default LandingPage;
