import React, { useState } from "react";
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
  applications,
  loadApplications,
  withdrawApplication,
  jobSeekers,
  loadJobSeekers,
  jobApplications,
  loadJobApplications,
  profileImage,
  setProfileImage

}) {
  const [showJobSeekers, setShowJobSeekers] = useState(false);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
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

{user.role === "employer" && (
  <button
    onClick={async () => {
      if (showJobSeekers) {
        setShowJobSeekers(false);
        return;
      }

      await loadJobSeekers();
      setShowJobSeekers(true);
    }}
  >
    {showJobSeekers ? "Hide Job Seekers" : "View Job Seekers"}
  </button>
)}
{user.role === "employer" && showJobSeekers && jobSeekers.length > 0 && (
   <div className="job-seekers">
    <h3>Job Seekers</h3>

{jobSeekers.map((jobSeeker) => (
  <div className="job-seeker-card" key={jobSeeker.id}>
  <h4 className="job-seeker-header">
  <button
    onClick={() =>
      setSelectedJobSeeker(
        selectedJobSeeker?.id === jobSeeker.id
          ? null
          : jobSeeker
      )
    }
  >

  {jobSeeker.profile_image && (
  <img
    src={jobSeeker.profile_image}
    alt={jobSeeker.name}
    className="job-seeker-photo"
  />
)}
    <span className="job-seeker-name">
      {jobSeeker.name}
    </span>
  </button>
</h4>
    {selectedJobSeeker?.id === jobSeeker.id && (
      <div>
        <p><strong>Email:</strong> {jobSeeker.email}</p>
        <p>
          <strong>Job title:</strong>{" "}
          {jobSeeker.job_title || "Not specified"}
        </p>
        <p>
          <strong>City:</strong>{" "}
          {jobSeeker.city || "Not specified"}
        </p>
        <p>
          <strong>Skills:</strong>{" "}
          {jobSeeker.skills || "Not specified"}
        </p>
        <p>
          <strong>Experience:</strong>{" "}
          {jobSeeker.experience || "Not specified"}
        </p>
        <p>
          <strong>Education:</strong>{" "}
          {jobSeeker.education || "Not specified"}
        </p>
      </div>
   )}
  </div>
))}
  </div>
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
    profileImage={profileImage}
    setProfileImage={setProfileImage}
    saveProfile={handleSaveProfile}
    skills={skills}
    setSkills={setSkills}
    experience={experience}
    setExperience={setExperience}
    education={education}
    setEducation={setEducation}
    applications={applications}
    loadApplications={loadApplications}
    withdrawApplication={withdrawApplication}
  />
      )}
    </div>
  );
}

export default Profile;

