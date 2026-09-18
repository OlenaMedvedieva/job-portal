import JobSeekerProfile from "./JobSeekerProfile.jsx";
function Profile({
  user,
  loadProfile,
  loadJobs,
  showJobForm,
  setShowJobForm,
  setEditingJobId,
  setJobTitle,
  setJobCompany,
  setJobLocation,
  setJobSalary,
  setJobDescription,
  logout,
  jobSeekerJobTitle,
  setJobSeekerJobTitle,
  city,
  setCity,
  saveProfile,
  skills,
  setSkills,
  experience,
  setExperience,
  education,
  setEducation,
}) {
  const handleJobFormToggle = () => {
    if (showJobForm) {
      setShowJobForm(false);
      return;
    }

    setEditingJobId(null);
    setJobTitle("");
    setJobCompany("");
    setJobLocation("");
    setJobSalary("");
    setJobDescription("");
    setShowJobForm(true);
  };

  const handleSaveProfile = async () => {
    const result = await saveProfile();
    return result;
  };

  return (
    <div className="profile">
      <h2>Welcome, {user.name}!</h2>

      <p>{user.email}</p>

      <p>
        Role: {user.role === "employer" ? "🏢 Employer" : "👤 Job Seeker"}
      </p>

      <button onClick={loadProfile}>
        Load profile
      </button>

      <button onClick={loadJobs}>
        Load jobs
      </button>

      {user.role === "employer" && (
        <button onClick={handleJobFormToggle}>
          {showJobForm ? "Cancel" : "Create job"}
        </button>
      )}

      <button onClick={logout} className="logout">
        Logout
      </button>
      
       {user.role === "job_seeker" && (
  <JobSeekerProfile
    jobTitle={jobSeekerJobTitle}
    setJobTitle={setJobSeekerJobTitle}
    city={city}
    setCity={setCity}
    saveProfile={handleSaveProfile}
    skills={skills}
    setSkills={setSkills}
    experience={experience}
    setExperience={setExperience}
    education={education}
    setEducation={setEducation}
  />
      )}
    </div>
  );
}

export default Profile;

