import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth.js";
import useJobs from "../hooks/useJobs.js";
import { useNavigate , Link } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";
import JobList from "../components/JobList.jsx";
import JobForm from "../components/JobForm.jsx";
import Profile from "../components/Profile.jsx";
import JobSeekerProfile from "../components/JobSeekerProfile.jsx";
import JobSeekers from "../components/JobSeekers.jsx";
import MyInvitations from "../components/MyInvitations.jsx";
import EmployerInvitations from "../components/EmployerInvitations.jsx";
import {searchCities , sendJobInvitation } from "../api/jobsApi.js";
import "../App.css";


function Home() {
  const navigate = useNavigate();
const [message, setMessage] = useState("");
const [activeSection, setActiveSection] = useState("jobs");
const [savedJobsByUser, setSavedJobsByUser] = useState(() => {
  try {
    const saved = localStorage.getItem("savedJobsByUser");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});
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

const [searchQuery, setSearchQuery] = useState("");
const [locationFilter, setLocationFilter] = useState("");
const [citySuggestions, setCitySuggestions] = useState([]);
const [citiesLoading, setCitiesLoading] = useState(false);
const [citySearchDone, setCitySearchDone] = useState(false);
const [minSalary, setMinSalary] = useState("");
const [appliedSearch, setAppliedSearch] = useState("");
const [appliedLocation, setAppliedLocation] = useState("");
const [appliedMinSalary, setAppliedMinSalary] = useState("");
const [sortBy, setSortBy] = useState("newest");
const {
  jobs,
  showJobForm,
  jobApplications,
  loadJobApplications,
  setShowJobForm,
  editingJobId,
  setEditingJobId,
  jobTitle,
  jobCompany,
  jobLocation,
  jobSalary,
  jobCurrency,
  jobDescription,
  setJobTitle,
  setJobCompany,
  setJobLocation,
  setJobSalary,
  setJobCurrency,
  setJobDescription,
  loadJobs,
  deleteJob,
  startEditJob,
  createJob,
} = useJobs();
useEffect(() => {
  loadJobs(setMessage);
}, []);
useEffect(() => {
  const query = locationFilter.trim();

  if (query.length < 2) {
    setCitySuggestions([]);
    setCitiesLoading(false);
    setCitySearchDone(false);
    return;
  }

  let cancelled = false;

  const timer = setTimeout(async () => {
    setCitiesLoading(true);
    setCitySearchDone(false);

    try {
      const cities = await searchCities(query);

      if (!cancelled) {
        const results = Array.isArray(cities) ? cities : [];
        setCitySuggestions(results);
        setCitySearchDone(true);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("CITY SEARCH ERROR:", error);
        setCitySuggestions([]);
        setCitySearchDone(false);
      }
    } finally {
      if (!cancelled) {
        setCitiesLoading(false);
      }
    }
  }, 300);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [locationFilter]);

console.log("ALL JOBS:", jobs);
  console.log("TOTAL JOBS:", jobs.length);
console.log("APPLIED SEARCH:", appliedSearch);
const filteredJobs = jobs.filter((job) => {
 const query = appliedSearch.trim().toLowerCase();
const location = appliedLocation
  .trim()
  .split(",")[0]
  .trim()
  .toLowerCase();
 const salaryMinimum = Number(appliedMinSalary) || 0;
  const matchesSearch =
    (job.title || "").toLowerCase().includes(query) ||
    (job.company || "").toLowerCase().includes(query);

  const matchesLocation = (job.location || "")
    .toLowerCase()
    .includes(location);

  const salaryMatch = (job.salary || "").match(/[\d,]+/);
  const salary = salaryMatch
    ? Number(salaryMatch[0].replace(/,/g, ""))
    : 0;

  const matchesSalary =
    salaryMinimum === 0 || salary >= salaryMinimum;

  return matchesSearch && matchesLocation && matchesSalary;
});
console.log("FILTERED JOBS:", filteredJobs);
const sortedJobs = [...filteredJobs].sort((a, b) => {
  const getSalary = (job) => {
    const match = (job.salary || "").match(/[\d,]+/);
    return match ? Number(match[0].replace(/,/g, "")) : 0;
  };

  if (sortBy === "salaryHigh") {
    return getSalary(b) - getSalary(a);
  }

  if (sortBy === "salaryLow") {
    return getSalary(a) - getSalary(b);
  }

  return new Date(b.created_at || 0) - new Date(a.created_at || 0);
});

const {
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  jobTitle: jobSeekerJobTitle,
  setJobTitle: setJobSeekerJobTitle,
  city,
  setCity,
  skills,
  setSkills,
  experience,
  setExperience,
  education,
  setEducation,
  applications,
  loadApplications,
  withdrawApplication,
  jobSeekers,
  loadJobSeekers,
  saveProfile, 
  role,
  setRole,
  user,
  message: authMessage,
  handleSubmit,
  loadProfile,
  profileImage,
  setProfileImage,
  resendVerification,
  logout,
} = useAuth();

 const currentUserKey = user?.id ? String(user.id) : null;

const savedJobIds = currentUserKey
  ? savedJobsByUser[currentUserKey] || []
  : [];

const isJobSaved = (jobId) =>
  savedJobIds.includes(String(jobId));

const toggleSavedJob = (jobId) => {
  if (!currentUserKey) return;

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
const handleInviteCandidate = async (jobId, candidateId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("Please log in again.");
    return;
  }

  try {
    const result = await sendJobInvitation(
      jobId,
      candidateId,
      token
    );

    setMessage(result.message || "Invitation sent successfully.");
  } catch (error) {
    setMessage(error.message || "Failed to send invitation.");
  }
};

  return (
   <main className="app">
  
  <div className={user ? "dashboard-layout" : "auth-layout"}>
    {user && (
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">J</span>
          <span>Job Portal</span>
        </div>

       <nav className="sidebar-nav" aria-label="Main navigation">
  <button
    type="button"
    className={`sidebar-link ${
      activeSection === "profile" ? "active" : ""
    }`}
    onClick={() => setActiveSection("profile")}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
    <span>My Page</span>
  </button>

  {user.role === "employer" ? (
    <>
      <button
        type="button"
        className={`sidebar-link ${
          activeSection === "jobs" ? "active" : ""
        }`}
        onClick={() => setActiveSection("jobs")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="7" width="18" height="14" rx="2" />
          <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
        </svg>
        <span>My Jobs</span>
      </button>

      <button
        type="button"
        className={`sidebar-link ${
          activeSection === "candidates" ? "active" : ""
        }`}
        onClick={() => setActiveSection("candidates")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" />
        </svg>
        <span>Find Candidates</span>
      </button>

      <button
        type="button"
        className={`sidebar-link ${
          activeSection === "applications" ? "active" : ""
        }`}
        onClick={() => setActiveSection("applications")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h10l3 3v15H4V3zM8 11h8M8 15h8M8 7h4" />
        </svg>
        <span>Applications</span>
      </button>
    </>
  ) : (
    <>
      <button
        type="button"
        className={`sidebar-link ${
          activeSection === "jobs" ? "active" : ""
        }`}
        onClick={() => setActiveSection("jobs")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 5 5" />
        </svg>
        <span>Find Jobs</span>
      </button>

      <button
        type="button"
        className={`sidebar-link ${
          activeSection === "saved" ? "active" : ""
        }`}
        onClick={() => setActiveSection("saved")}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3h12v18l-6-4-6 4z" />
        </svg>
        <span>Saved</span>
      </button>
      <button
  type="button"
  className={`sidebar-link ${
    activeSection === "invitations" ? "active" : ""
  }`}
  onClick={() => setActiveSection("invitations")}
>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5h16v14H4z" />
    <path d="m4 7 8 6 8-6" />
  </svg>
  <span>My Invitations</span>
</button>
    </>
  )}
</nav>
      </aside>
    )}

    <div className="card">
 <h1>
  {activeSection === "profile"
    ? "My Page"
    : activeSection === "saved"
      ? "Saved Jobs"
      : activeSection === "candidates"
        ? "Find Candidates"
        : activeSection === "applications"
          ? "Applications"
          : activeSection === "invitations"
            ? "My Invitations"
            : user?.role === "employer"
              ? "My Jobs"
              : "Find Your Dream Job"}
  </h1>
      <p className="subtitle">
  {activeSection === "profile"
    ? "Your professional profile and applications."
    : activeSection === "saved"
      ? "Your saved job opportunities."
      : activeSection === "candidates"
        ? "Discover candidates for your company."
        : activeSection === "applications"
          ? "Manage applications for your vacancies."
          : activeSection === "invitations"
            ? "Review and respond to invitations from employers."
            : user?.role === "employer"
              ? "Manage your posted vacancies."
              : "Discover opportunities that match your skills and ambitions."}
       </p>

      {user && user.role !== "employer" && activeSection === "jobs" && (
  < >  

<div className="search-bar">
  <input
    type="text"
    value={searchQuery}
    onChange={(event) => setSearchQuery(event.target.value)}
    placeholder="Search by job title or company..."
    aria-label="Search jobs by title or company"
  />

  <div className="city-filter-wrapper">
  <input
    type="text"
    value={locationFilter}
    onChange={(event) => setLocationFilter(event.target.value)}
    placeholder="Filter by city..."
    aria-label="Filter jobs by city"
    autoComplete="off"
    aria-autocomplete="list"
  />

  {locationFilter.trim().length >= 2 &&
    (citiesLoading ||
  citySuggestions.length > 0 ||
  citySearchDone) && (
      <div className="city-suggestions" role="listbox">
        {citiesLoading ? (
          <div className="city-suggestion-status">
            Searching cities...
          </div>
        ) : citySuggestions.length === 0 ? (
  <div className="city-suggestion-status">
    No cities found
  </div>
               ) : (
            citySuggestions.map((city) => {
            const countryName = city.countryCode
              ? new Intl.DisplayNames(["en"], {
                  type: "region",
                }).of(city.countryCode)
              : "";

            return (
              <button
                type="button"
                role="option"
                key={`${city.name}-${city.countryCode}-${city.latitude}`}
                className="city-suggestion"
                onClick={() => {
                  const selectedCity = countryName
                    ? `${city.name}, ${countryName}`
                    : city.name;

                  setLocationFilter(selectedCity);
                  setCitySuggestions([]);
                }}
              >
                <span>{city.name}</span>
                {countryName && (
                  <span className="city-suggestion-country">
                    {countryName}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    )}
</div>

<input
  type="number"
  min="0"
  value={minSalary}
  onChange={(event) => setMinSalary(event.target.value)}
  placeholder="Minimum salary (PLN)"
  aria-label="Minimum salary in PLN"
/>

  <button
    type="button"
    className="search-button"
    onClick={() => {
       console.log("SEARCH BUTTON CLICKED");
  console.log("Search:", searchQuery);
  console.log("Location:", locationFilter);
  console.log("Salary:", minSalary);
      setAppliedSearch(searchQuery);
      setAppliedLocation(locationFilter);
      setAppliedMinSalary(minSalary);
    }}
  >
    <span aria-hidden="true">⌕</span>
    Search Jobs
  </button>

</div>

<div className="sort-control">
  <label htmlFor="job-sort">Sort by:</label>
  <select
    id="job-sort"
    value={sortBy}
    onChange={(event) => setSortBy(event.target.value)}
  >
    <option value="newest">Newest first</option>
    <option value="salaryHigh">Highest salary</option>
    <option value="salaryLow">Lowest salary</option>
  </select>

<button
  type="button"
  onClick={() => {
    setSearchQuery("");
    setLocationFilter("");
    setMinSalary("");
    setAppliedSearch("");
    setAppliedLocation("");
    setAppliedMinSalary("");
    setSortBy("newest");
  }}
>
  Clear filters
</button>


</div>
  </>
)}
      {!user ? (
          <>
            <div className="tabs">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
              >
                Login
              </button>

              <button
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setMessage("");
                }}
              >
                Register
              </button>
            </div>

           {mode === "login" ? (
  <Login
    email={email}
    password={password}
    setEmail={setEmail}
    setPassword={setPassword}
    handleSubmit={handleSubmit}
  />
) : (
 <Register
  name={name}
  email={email}
  password={password}
  role={role}
  setName={setName}
  setEmail={setEmail}
  setPassword={setPassword}
  setRole={setRole}
  handleSubmit={handleSubmit}
  message={authMessage}
  resendVerification={resendVerification}

/>
)}
      </>
        ) : (
          <>


{activeSection === "profile" && (

<Profile
  jobSeekerJobTitle={jobSeekerJobTitle}
  setJobSeekerJobTitle={setJobSeekerJobTitle}
  city={city}
  setCity={setCity}
  skills={skills}
  setSkills={setSkills}
  experience={experience}
  setExperience={setExperience}
  education={education}
  setEducation={setEducation}
  applications={applications}
  jobSeekers={jobSeekers}
  loadJobSeekers={loadJobSeekers}
  profileImage={profileImage}
  setProfileImage={setProfileImage}
  loadApplications={loadApplications}
  withdrawApplication={withdrawApplication}
  jobApplications={jobApplications}
  loadJobApplications={loadJobApplications}
  
saveProfile={async (overrides) => {
  const result = await saveProfile(overrides);
  setMessage(result);
  return result;
}}

  user={user}
  loadProfile={async () => {
    const result = await loadProfile();
    setMessage(result);
  }}
  loadJobs={() => loadJobs(setMessage)}
  showJobForm={showJobForm}
  setShowJobForm={setShowJobForm}
  setEditingJobId={setEditingJobId}
  setJobTitle={setJobTitle}
  setJobCompany={setJobCompany}
  setJobLocation={setJobLocation}
  setJobSalary={setJobSalary}
  setJobDescription={setJobDescription}
  logout={logout}
/>
)}
{activeSection === "jobs" && (
  <>
{showJobForm && user.role === "employer" && (
  <JobForm
    editingJobId={editingJobId}
    jobTitle={jobTitle}
    jobCompany={jobCompany}
    jobLocation={jobLocation}
    jobSalary={jobSalary}
    jobCurrency={jobCurrency}
    jobDescription={jobDescription}
    setJobTitle={setJobTitle}
    setJobCompany={setJobCompany}
    setJobLocation={setJobLocation}
    setJobSalary={setJobSalary}
    setJobCurrency={setJobCurrency}
    setJobDescription={setJobDescription}
    createJob={(event) => createJob(event, setMessage)}
  />
)}

          <JobList
  jobs={
  user?.role === "employer"
    ? jobs.filter(
        (job) => String(job.user_id) === String(user.id)
      )
    : sortedJobs
}
  user={user}
  onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
  onEditJob={startEditJob}
  onDeleteJob={(jobId) => deleteJob(jobId, setMessage)}
  isJobSaved={isJobSaved}
  onToggleSaved={toggleSavedJob}
  emptyMessage="You haven’t saved any jobs yet."
/>
  </>
)}
{activeSection === "saved" && (
  <JobList
    jobs={jobs.filter((job) =>
      savedJobIds.includes(String(job.id))
    )}
    user={user}
    onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
    onEditJob={startEditJob}
    onDeleteJob={(jobId) => deleteJob(jobId, setMessage)}
    isJobSaved={isJobSaved}
    onToggleSaved={toggleSavedJob}
    emptyMessage="You haven’t saved any jobs yet."
  />
)}
{activeSection === "candidates" && user?.role === "employer" && (
  <JobSeekers
    jobSeekers={jobSeekers}
    loadJobSeekers={loadJobSeekers}
    jobs={jobs.filter(
      (job) => String(job.user_id) === String(user.id)
    )}
    onInviteCandidate={handleInviteCandidate}
  />
)}
{activeSection === "invitations" && user?.role === "job_seeker" && (
  <MyInvitations />
)}
{activeSection === "applications" && user?.role === "employer" && (
  <EmployerInvitations />
)}
          </>
        )}
        {message && <p className="message">{message}</p>}
{authMessage && <p className="message">{authMessage}</p>}
      
      </div>
   </div>
   </main>
  );
}


export default Home;