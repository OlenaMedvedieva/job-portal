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
}) {
  const handleJobFormToggle = () => {
    setShowJobForm(!showJobForm);

    if (showJobForm) {
      setEditingJobId(null);
      setJobTitle("");
      setJobCompany("");
      setJobLocation("");
      setJobSalary("");
      setJobDescription("");
    }
  };

  return (
    <div className="profile">
      <h2>Welcome, {user.name}!</h2>
      <p>{user.email}</p>

      <button onClick={loadProfile}>
        Load profile
      </button>

      <button onClick={loadJobs}>
        Load jobs
      </button>

      <button onClick={handleJobFormToggle}>
        {showJobForm ? "Cancel" : "Create job"}
      </button>

      <button onClick={logout} className="logout">
        Logout
      </button>
    </div>
  );
}

export default Profile;