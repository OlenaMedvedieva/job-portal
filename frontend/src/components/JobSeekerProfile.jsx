import {  useEffect, useState } from "react";

function JobSeekerProfile({
jobTitle,
setJobTitle,
city,
setCity,
profileImage,
setProfileImage,
skills, 
setSkills,
experience,
setExperience,
education,
setEducation,
applications,
loadApplications,
withdrawApplication,
saveProfile,

}) {
  console.log("PROFILE IMAGE:", profileImage);

const [isEditing, setIsEditing] = useState(false);
const [message, setMessage] = useState("");
const [citySuggestions, setCitySuggestions] = useState([]);
const [cityLoading, setCityLoading] = useState(false);
const [citySelected, setCitySelected] = useState(Boolean(city));
 
const handleCityChange = (event) => {
  setCity(event.target.value);
  setCitySelected(false);
};

const handleCitySelect = (selectedCity) => {
  setCity(selectedCity.formatted);
  setCitySelected(true);
  setCitySuggestions([]);
};

useEffect(() => {
  if (citySelected || city.trim().length < 2) {
    setCitySuggestions([]);
    return;
  }
 
  const timer = setTimeout(async () => {
    try {
      setCityLoading(true);

      console.log("CITY SEARCH:", city);

const response = await fetch(
  `http://172.23.47.70:3000/locations/search?text=${encodeURIComponent(city)}`

);

console.log("CITY RESPONSE:", response.status);
      const data = await response.json();

      if (response.ok) {
        setCitySuggestions(data.cities || []);
      } else {
        setCitySuggestions([]);
      }
    } catch (error) {
      console.error("City search error:", error);
      setCitySuggestions([]);
    } finally {
      setCityLoading(false);
    }
  }, 400);

  return () => clearTimeout(timer);
}, [city, citySelected]);

const handleSave = async () => {
const result = await saveProfile();


setMessage(result);
setIsEditing(false);


};

const handleWithdraw = async (applicationId) => {
  try {
    const result = await withdrawApplication(applicationId);

    setMessage(result.message);

    await loadApplications();
  } catch (error) {
    setMessage(error.message);
  }
};

return ( <div className="job-seeker-profile"> <h2>My Job Seeker Profile</h2>
<div className="profile-photo-field">
  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      className="profile-photo-preview"
      onLoad={() => console.log("PHOTO LOADED")}
      onError={() => console.log("PHOTO ERROR")}
    />
  ) : (
    <label>
      Profile photo
      <input
        type="file"
        accept="image/*"
        id="profile-image-input"
        onChange={(event) => {
          const file = event.target.files[0];

          if (!file) {
            return;
          }

          const reader = new FileReader();

          reader.onloadend = () => {
            setProfileImage(reader.result);
          };

          reader.readAsDataURL(file);
        }}
      />
    </label>
  )}
</div>

  <label>
    What job are you looking for?
  </label>

  {!isEditing ? (
    <>
      <p>{jobTitle || "Not specified"}</p>
      <p>{city || "City not specified"}</p>
      <p>{skills || "Skills not specified"}</p>
       <p>{experience || "Experience not specified"}</p>
      <p>{education || "Education not specified"}</p>
     
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
   <label className="location-field">
  City
  <input
    type="text"
    value={city}
    onChange={handleCityChange}
    placeholder="Start typing a city..."
    autoComplete="off"
  />

  {cityLoading && (
    <small>Searching cities...</small>
  )}

  {citySuggestions.length > 0 && (
    <div className="location-suggestions">
      {citySuggestions.map((cityItem, index) => (
        <button
          type="button"
          key={`${cityItem.formatted}-${index}`}
          className="location-suggestion"
          onClick={() => handleCitySelect(cityItem)}
        >
          {cityItem.formatted}
        </button>
      ))}
    </div>
  )}

  {!cityLoading &&
    city.trim().length >= 2 &&
    !citySelected &&
    citySuggestions.length === 0 && (
      <small>No cities found</small>
    )}
</label>

<label>
  Skills
  <input
    type="text"
    value={skills}
    onChange={(event) => setSkills(event.target.value)}
    placeholder="e.g. React, JavaScript, HTML, CSS"
  />
</label>

<label>
  Experience
  <textarea
    value={experience}
    onChange={(event) => setExperience(event.target.value)}
    placeholder="Describe your work experience..."
    rows="4"
  />
</label>

<label>
  Education
  <textarea
    value={education}
    onChange={(event) => setEducation(event.target.value)}
    placeholder="e.g. Computer Science, University of Krakow"
    rows="3"
  />
</label>

      <button
        className="submit-button"
        type="button"
        onClick={handleSave}
      >
        Save Profile
      </button>
    </>
  )}

<div className="my-applications">
  <h3>My Applications</h3>

  <button
    type="button"
    className="submit-button"
    onClick={loadApplications}
  >
    Load my applications
  </button>

  {applications.length === 0 ? (
    <p>No applications yet.</p>
  ) : (
    applications.map((application) => (
      <div key={application.id} className="application-item">
        <h4>{application.title}</h4>
        <p><strong>Company:</strong> {application.company}</p>
        <p><strong>Location:</strong> {application.location || "Not specified"}</p>
        <p><strong>Salary:</strong> {application.salary || "Not specified"}</p>
        <p><strong>Status:</strong> {application.status}</p>
      {(application.status === "pending" ||
  application.status === "accepted") && (
  <button
    type="button"
    className="submit-button"
    onClick={() => handleWithdraw(application.id)}
  >
    Withdraw application
  </button>
)}
      </div>

    ))
  )}
</div>

  {message && <p>{message}</p>}
</div>


);
}

export default JobSeekerProfile;
