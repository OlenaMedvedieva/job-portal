import { useEffect, useState } from "react";
import { useNavigate , Link } from "react-router-dom";
import AuthForm from "../components/AuthForm.jsx";
import JobList from "../components/JobList.jsx";
import JobForm from "../components/JobForm.jsx";
import Profile from "../components/Profile.jsx";
import { getJobs, getProfile,deleteJob as deleteJobApi } from "../api/jobsApi";
import "../App.css";

const API_URL = "http://localhost:3000";

function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const restoreUser = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Restore user error:", error);
      }
    };

    restoreUser();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const endpoint = mode === "login" ? "/login" : "/register";

    const body =
      mode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Something went wrong");
        return;
      }

      if (mode === "login") {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setMessage("Login successful!");
      } else {
        setMessage("Registration successful! You can now log in.");
        setMode("login");
        setPassword("");
      }
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server");
    }
  };

const loadProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in");
    return;
  }

  try {
    const user = await getProfile(token);

    setUser(user);
    setMessage("Profile loaded successfully");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Cannot connect to the server");
  }
};

const loadJobs = async () => {
  try {
    const jobs = await getJobs();

    setJobs(jobs);
    setMessage("Jobs loaded successfully");
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Cannot connect to the server");
  }
};
const deleteJob = async (jobId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this job?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteJobApi(jobId, token);

    setMessage("Job deleted successfully");

    await loadJobs();
  } catch (error) {
    console.error(error);
    setMessage(error.message || "Cannot connect to the server");
  }
};

  const startEditJob = (job) => {
    setEditingJobId(job.id);

    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location || "");
    setJobSalary(job.salary || "");
    setJobDescription(job.description || "");

    setShowJobForm(true);
  };
  const createJob = async (event) => {
  event.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in");
    return;
  }

  const isEditing = editingJobId !== null;

  try {
    const response = await fetch(
      isEditing
        ? `${API_URL}/jobs/${editingJobId}`
        : `${API_URL}/jobs`,
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          location: jobLocation,
          salary: jobSalary,
          description: jobDescription,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to save job");
      return;
    }

    setMessage(
      isEditing
        ? "Job updated successfully"
        : "Job created successfully"
    );

    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobSalary("");
    setJobDescription("");

    setEditingJobId(null);
    setShowJobForm(false);

    await loadJobs();
  } catch (error) {
    console.error(error);
    setMessage("Cannot connect to the server");
  }
};
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setJobs([]);
    setMessage("You have been logged out");
  };

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

            <AuthForm
  mode={mode}
  name={name}
  email={email}
  password={password}
  setName={setName}
  setEmail={setEmail}
  setPassword={setPassword}
  handleSubmit={handleSubmit}
/>
          </>
        ) : (
          <>
          <Profile
  user={user}
  loadProfile={loadProfile}
  loadJobs={loadJobs}
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
    createJob={createJob}
  />
)}
          <JobList
  jobs={jobs}
  user={user}
  onSelectJob={(jobId) => navigate(`/jobs/${jobId}`)}
  onEditJob={startEditJob}
  onDeleteJob={deleteJob}
/>
          </>
        )}
        
        {message && <p className="message">{message}</p>}
      </div>
    </main>
  );
}

export default Home;