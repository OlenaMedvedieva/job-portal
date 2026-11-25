import React, { useState } from "react";
import JobSeekerProfile from "./JobSeekerProfile.jsx";

function Profile({
  user,
  showJobForm,
  setShowJobForm,
  setActiveSection,
  setEditingJobId,
  setJobTitle,
  setJobCompany,
  setJobCategory,
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
  profileImage,
  setProfileImage,
}) {
  const [showJobSeekers, setShowJobSeekers] = useState(false);
  const [selectedJobSeeker, setSelectedJobSeeker] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleJobFormToggle = () => {
    if (showJobForm) {
      setShowJobForm(false);
      return;
    }

    setEditingJobId(null);
    setJobTitle("");
    setJobCompany("");
    setJobCategory("");
    setJobLocation("");
    setJobSalary("");
    setJobDescription("");

    setActiveSection("jobs");
    setShowJobForm(true);
  };

  const handleSaveProfile = async (overrides = {}) => {
    const result = await saveProfile(overrides);
    setIsEditingProfile(false);
    return result;
  };

  const initialLetter = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="profile">
      <div className="profile-banner-card">
        <div className="profile-user-block">
          <div className="profile-avatar-column">
            {user.role === "job_seeker" && profileImage ? (
              <img
                src={profileImage}
                alt={user.name || "Profile"}
                className="welcome-photo"
              />
            ) : (
              <div className="profile-initial-avatar">{initialLetter}</div>
            )}

            {user.role === "job_seeker" && (
              <button
                type="button"
                className="avatar-change-link"
                onClick={() =>
                  document.getElementById("profile-image-input")?.click()
                }
              >
                {profileImage ? "Change photo" : "Add photo"}
              </button>
            )}
          </div>

          <div>
            <div className="profile-title-line">
              <h2>{user.name || "User"}</h2>
              <span className="profile-role-pill">
                {user.role === "employer" ? "Employer" : "Job Seeker"}
              </span>
            </div>
            <p className="profile-email-text">{user.email}</p>
          </div>
        </div>

        <div className="profile-actions-bar">
          {user.role === "job_seeker" && (
            <button
              type="button"
              className={
                isEditingProfile ? "profile-btn-secondary" : "profile-btn-primary"
              }
              onClick={() => setIsEditingProfile((prev) => !prev)}
            >
              {isEditingProfile ? "Close Edit" : "Edit Profile"}
            </button>
          )}

          {user.role === "employer" && (
            <>
              <button
                type="button"
                className="profile-btn-primary"
                onClick={handleJobFormToggle}
              >
                {showJobForm ? "Cancel" : "Create Job"}
              </button>

              <button
                type="button"
                className="profile-btn-secondary"
                onClick={async () => {
                  if (showJobSeekers) {
                    setShowJobSeekers(false);
                    return;
                  }
                  await loadJobSeekers();
                  setShowJobSeekers(true);
                }}
              >
                {showJobSeekers ? "Hide Candidates" : "View Candidates"}
              </button>
            </>
          )}

          <button type="button" onClick={logout} className="logout">
            Logout
          </button>
        </div>
      </div>

      {user.role === "employer" && showJobSeekers && jobSeekers.length > 0 && (
        <div className="job-seekers">
          <h3>Job Seekers</h3>

          {jobSeekers.map((jobSeeker) => (
            <div className="job-seeker-card" key={jobSeeker.id}>
              <h4 className="job-seeker-header">
                <button
                  type="button"
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
                  <span className="job-seeker-name">{jobSeeker.name}</span>
                </button>
              </h4>
              {selectedJobSeeker?.id === jobSeeker.id && (
                <div>
                  <p>
                    <strong>Email:</strong> {jobSeeker.email}
                  </p>
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

      {user.role === "job_seeker" && (
        <JobSeekerProfile
          isEditing={isEditingProfile}
          setIsEditing={setIsEditingProfile}
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