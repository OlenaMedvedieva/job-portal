import {  useState } from "react";
import useAuth from "../hooks/useAuth.js";
import useJobs from "../hooks/useJobs.js";
import { useNavigate , Link } from "react-router-dom";
import Login from "../components/Login.jsx";
import Register from "../components/Register.jsx";
import JobList from "../components/JobList.jsx";
import JobForm from "../components/JobForm.jsx";
import Profile from "../components/Profile.jsx";
import { API_URL, getJobs, getProfile,deleteJob as deleteJobApi, saveJob } from "../api/jobsApi";
import "../App.css";


function Home() {
  const navigate = useNavigate();
const [message, setMessage] = useState("");
const {
  jobs,
  showJobForm,
  setShowJobForm,
  editingJobId,
  setEditingJobId,
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
  loadJobs,
  deleteJob,
  startEditJob,
  createJob,
} = useJobs();

const {
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  user,
  handleSubmit,
  loadProfile,
  logout,
} = useAuth();

 

  return (
    <main className="app">
      <div className="card">
        <h1>Job Portal</h1>
        <p className="subtitle">Find your next opportunity</p>

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
    setName={setName}
    setEmail={setEmail}
    setPassword={setPassword}
    handleSubmit={handleSubmit}
  />
)}
          </>
        ) : (
          <>
          <Profile
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

         {showJobForm && (
  <JobForm
    editingJobId={editingJobId}
    jobTitle={jobTitle}
    jobCompany={jobCompany}
    jobLocation={jobLocation}
    jobSalary={jobSalary}
    jobDescription={jobDescription}
    setJobTitle={setJobTitle}
    setJobCompany={setJobCompany}
    setJobLocation={setJobLocation}
    setJobSalary={setJobSalary}
    setJobDescription={setJobDescription}
    createJob={(event) => createJob(event, setMessage)}
  />
)}
          <JobList
  jobs={jobs}
  user={user}
  onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
  onEditJob={startEditJob}
  onDeleteJob={(jobId) => deleteJob(jobId, setMessage)}
/>
          </>
        )}
        
        {message && <p className="message">{message}</p>}
      </div>
    </main>
  );
}


export default Home;