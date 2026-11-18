
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [visibleJobsCount, setVisibleJobsCount] = useState(6);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);
 useEffect(() => {
  const query = locationFilter.trim();

  if (locationSelected || query.length < 2) {
    setLocationSuggestions([]);
    setLocationLoading(false);
    return;
  }

  let cancelled = false;

  const timer = setTimeout(async () => {
    try {
      setLocationLoading(true);

      const response = await fetch(
        `${API_URL}/locations/search?text=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!cancelled) {
        setLocationSuggestions(
          response.ok ? data.cities || [] : []
        );
      }
    } catch (error) {
      console.error("City search error:", error);

      if (!cancelled) {
        setLocationSuggestions([]);
      }
    } finally {
      if (!cancelled) {
        setLocationLoading(false);
      }
    }
  }, 400);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [locationFilter, locationSelected]);
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
  let cancelled = false;

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/job-categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
      }

      if (!cancelled) {
        setAvailableCategories(
          Array.isArray(data.categories) ? data.categories : []
        );
      }
    } catch (error) {
      console.error("Load categories error:", error);
    }
  };

  loadCategories();

  return () => {
    cancelled = true;
  };
}, []);

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
const filteredJobs = jobs
  .filter((job) => {
    const query = searchQuery.trim().toLowerCase();
    const city = locationFilter.trim().toLowerCase();

    const matchesQuery = selectedJobId
  ? String(job.id) === String(selectedJobId)
  : !query ||
    `${job.title || ""} ${job.company || ""}`
      .toLowerCase()
      .includes(query);

    const matchesLocation =
      !city ||
      String(job.location || "").toLowerCase().includes(city);

    const salary = Number(
      String(job.salary || "").replace(/[^\d]/g, "")
    );
const matchesSalary =
  !minSalary ||
  (salary > 0 && salary >= Number(minSalary));

const matchesCategory =
  !categoryFilter || job.category === categoryFilter;

return (
  matchesQuery &&
  matchesLocation &&
  matchesSalary &&
  matchesCategory
);
  })
  .sort((a, b) => {
    if (sortBy === "salaryHigh" || sortBy === "salaryLow") {
      const salaryA = Number(String(a.salary || "").replace(/[^\d]/g, ""));
      const salaryB = Number(String(b.salary || "").replace(/[^\d]/g, ""));

      return sortBy === "salaryHigh"
        ? salaryB - salaryA
        : salaryA - salaryB;
    }

    const dateA = new Date(a.created_at).getTime() || 0;
    const dateB = new Date(b.created_at).getTime() || 0;

    return dateB - dateA;
  });
  const jobSuggestions =
  searchQuery.trim().length >= 2 && !selectedJobId
    ? jobs
        .filter((job) => {
          const query = searchQuery.trim().toLowerCase();

          return `${job.title || ""} ${job.company || ""}`
            .toLowerCase()
            .includes(query);
        })
        .slice(0, 5)
    : [];

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
     <Link to="/dashboard?mode=login">Login</Link>
     <Link to="/dashboard?mode=register">Register</Link>
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
           <Link
            to="/dashboard?mode=register"
            className="landing-primary-button"
          >
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
  <div className="landing-job-filters">
 <div className="landing-title-search">
  <input
    type="search"
    placeholder="Search by job title or company..."
    value={searchQuery}
    onChange={(event) => {
      setSearchQuery(event.target.value);
      setSelectedJobId(null);
      setVisibleJobsCount(6);
    }}
    autoComplete="off"
  />

  {jobSuggestions.length > 0 && (
    <div className="landing-job-suggestions">
      {jobSuggestions.map((job) => (
        <button
          type="button"
          key={job.id}
          className="landing-job-suggestion"
          onClick={() => {
            setSelectedJobId(String(job.id));
            setSearchQuery(job.title || "");
            setVisibleJobsCount(6);
          }}
        >
          <span>{job.title}</span>
          <small>{job.company}</small>
        </button>
      ))}
    </div>
  )}
</div>
  <label className="location-field">
  <input
    type="text"
    placeholder="Start typing a city..."
    value={locationFilter}
    onChange={(event) => {
      setLocationFilter(event.target.value);
      setLocationSelected(false);
    }}
    autoComplete="off"
  />

  {locationLoading && (
    <small>Searching cities...</small>
  )}

  {locationSuggestions.length > 0 && (
    <div className="location-suggestions">
      {locationSuggestions.map((cityItem, index) => (
        <button
          type="button"
          key={`${cityItem.formatted}-${index}`}
          className="location-suggestion"
          onClick={() => {
            setLocationFilter(cityItem.formatted);
            setLocationSelected(true);
            setLocationSuggestions([]);
          }}
        >
          {cityItem.formatted}
        </button>
      ))}
    </div>
  )}

  {!locationLoading &&
    locationFilter.trim().length >= 2 &&
    !locationSelected &&
    locationSuggestions.length === 0 && (
      <small>No cities found</small>
    )}
</label>

  <input
    type="number"
    min="0"
    placeholder="Minimum salary (PLN)"
    value={minSalary}
    onChange={(event) => setMinSalary(event.target.value)}
  />
<select
  value={categoryFilter}
  onChange={(event) => setCategoryFilter(event.target.value)}
>
  <option value="">All categories</option>

  {availableCategories.map((category) => (
    <option key={category} value={category}>
      {category}
    </option>
  ))}
</select>
  <select
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
  >
    <option value="newest">Newest first</option>
    <option value="salaryHigh">Highest salary</option>
    <option value="salaryLow">Lowest salary</option>
  </select>
</div>
<button
  type="button"
  className="landing-clear-filters"
  onClick={() => {
    setSearchQuery("");
    setLocationFilter("");
    setMinSalary("");
    setCategoryFilter("");
    setSortBy("newest");
    setLocationSuggestions([]);
    setLocationSelected(false);
  }}
>
  Clear filters
</button>

  {jobsLoading ? (
    <p>Loading jobs...</p>
  ) : jobsError ? (
    <p className="message">{jobsError}</p>
  ) : jobs.length === 0 ? (
    <p>No jobs available right now.</p>

  ) : filteredJobs.length === 0 ? (
    <div className="landing-no-results">
      <p>No jobs found matching your criteria.</p>

      <button
        type="button"
        className="landing-clear-filters"
        onClick={() => {
          setSearchQuery("");
          setLocationFilter("");
          setMinSalary("");
          setCategoryFilter("");
          setSortBy("newest");
          setLocationSuggestions([]);
          setLocationSelected(false);
          setVisibleJobsCount(6);
        }}
      >
        Reset filters
      </button>
    </div>

  ) : (
    <>
  <p className="landing-results-count">
    Showing {Math.min(visibleJobsCount, filteredJobs.length)} of {filteredJobs.length} jobs
  </p>

  <div className="landing-job-grid">
      {filteredJobs.slice(0, visibleJobsCount).map((job) => (
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

      {filteredJobs.length > visibleJobsCount && (
        <button
          type="button"
          className="landing-show-more"
          onClick={() =>
            setVisibleJobsCount((previous) => previous + 6)
          }
        >
          Show More
        </button>
      )}
    </>
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

              <div className="landing-buttons">
    {localStorage.getItem("token") ? (
  <Link to="/dashboard" className="landing-primary-button">
    My Dashboard
  </Link>
) : (
  <>
    <Link to="/dashboard?mode=login">Login</Link>
    <Link to="/dashboard?mode=register">Register</Link>
  </>
)}
  </div>
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

       <Link
          to="/dashboard?mode=register"
         className="landing-primary-button"
      >
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
