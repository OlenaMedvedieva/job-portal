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
import {searchCities} from "../api/jobsApi.js";
import "../App.css";


function Home() {
  const navigate = useNavigate();
const [message, setMessage] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [locationFilter, setLocationFilter] = useState("");
const [citySuggestions, setCitySuggestions] = useState([]);
const [citiesLoading, setCitiesLoading] = useState(false);
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
    return;
  }

  let cancelled = false;

  const timer = setTimeout(async () => {
    setCitiesLoading(true);

    try {
      const cities = await searchCities(query);

      if (!cancelled) {
        setCitySuggestions(Array.isArray(cities) ? cities : []);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("CITY SEARCH ERROR:", error);
        setCitySuggestions([]);
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

 

  return (
    <main className="app">
      <div className="card">
      <h1>Find Your Dream Job</h1>
    
     <p className="subtitle">
  Discover opportunities that match your skills and ambitions.
     </p>
    

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
    (citiesLoading || citySuggestions.length > 0) && (
      <div className="city-suggestions" role="listbox">
        {citiesLoading ? (
          <div className="city-suggestion-status">
            Searching cities...
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
  jobs={sortedJobs}
  user={user}
  onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
  onEditJob={startEditJob}
  onDeleteJob={(jobId) => deleteJob(jobId, setMessage)}
/>
          </>
        )}
        {message && <p className="message">{message}</p>}
{authMessage && <p className="message">{authMessage}</p>}
      
      </div>
   
   </main>
  );
}


export default Home;