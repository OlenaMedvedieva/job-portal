import { useState } from "react";

function JobSeekerProfile({
jobTitle,
setJobTitle,
saveProfile,
}) {
const [isEditing, setIsEditing] = useState(false);
const [message, setMessage] = useState("");

const handleSave = async () => {
const result = await saveProfile();


setMessage(result);
setIsEditing(false);


};

return ( <div className="job-seeker-profile"> <h2>My Job Seeker Profile</h2>


  <label>
    What job are you looking for?
  </label>

  {!isEditing ? (
    <>
      <p>{jobTitle || "Not specified"}</p>

      <button
        className="submit-button"
        type="button"
        onClick={() => {
          setMessage("");
          setIsEditing(true);
        }}
      >
        Edit
      </button>
    </>
  ) : (
    <>
      <input
        type="text"
        value={jobTitle}
        onChange={(event) => setJobTitle(event.target.value)}
        placeholder="e.g. Frontend Developer"
      />

      <button
        className="submit-button"
        type="button"
        onClick={handleSave}
      >
        Save Profile
      </button>
    </>
  )}

  {message && <p>{message}</p>}
</div>


);
}

export default JobSeekerProfile;
