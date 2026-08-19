import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

function App() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);

const [jobTitle, setJobTitle] = useState("");
const [jobCompany, setJobCompany] = useState("");
const [jobLocation, setJobLocation] = useState("");
const [jobSalary, setJobSalary] = useState("");
const [jobDescription, setJobDescription] = useState("");

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
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load profile");
        return;
      }

      setUser(data.user);
      setMessage("Profile loaded successfully");
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server");
    }
  };

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load jobs");
        return;
      }

      setJobs(data.jobs);
      setMessage("Jobs loaded successfully");
    } catch (error) {
      console.error(error);
      setMessage("Cannot connect to the server");
    }
  };

  const createJob = async (event) => {
  event.preventDefault();

  const token = localStorage.getItem("token");

  if (!token) {
    setMessage("You are not logged in");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/jobs`, {
      method: "POST",
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
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Failed to create job");
      return;
    }

    setMessage("Job created successfully");

    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobSalary("");
    setJobDescription("");

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

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <label>
                  Name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  required
                />
              </label>

              <button className="submit-button" type="submit">
                {mode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="profile">
              <h2>Welcome, {user.name}!</h2>
              <p>{user.email}</p>

              <button onClick={loadProfile}>
                Load profile
              </button>

              <button onClick={loadJobs}>
                Load jobs
              </button>

               <button onClick={() => setShowJobForm(!showJobForm)}>
               {showJobForm ? "Cancel" : "Create job"}
               </button>
              <button onClick={logout} className="logout">
                Logout
              </button>
            </div>

          {showJobForm && (
  <form className="job-form" onSubmit={createJob}>
    <h2>Create New Job</h2>

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
      Create Job
    </button>
  </form>
)}
            {jobs.length > 0 && (
              <section className="jobs">
                <h2>Available Jobs</h2>

                {jobs.map((job) => (
                  <article className="job-card" key={job.id}>
                    <h3>{job.title}</h3>

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

                    <small>
                      Posted by: {job.author}
                    </small>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

        {message && <p className="message">{message}</p>}
      </div>
    </main>
  );
}

export default App;