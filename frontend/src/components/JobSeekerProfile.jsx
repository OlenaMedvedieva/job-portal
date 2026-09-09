
import { useState } from "react";

function JobSeekerProfile({
  jobTitle,
  setJobTitle,
  saveProfile,
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="job-seeker-profile">
      <h2>My Job Seeker Profile</h2>

      <label>
        What job are you looking for?
        <input
          type="text"
          value={jobTitle}
          onChange={(event) => setJobTitle(event.target.value)}
          placeholder="e.g. Frontend Developer"
        />
      </label>

      <button
        className="submit-button"
        type="button"
        onClick={async () => {
          console.log("SAVE PROFILE CLICKED");

          const result = await saveProfile();

          setMessage(result);
        }}
      >
        Save Profile
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default JobSeekerProfile;

