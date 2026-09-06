import { useEffect, useState } from "react";

const API_URL = "http://localhost:3000";

function JobForm({
  editingJobId,
  jobTitle,
  jobCompany,
  jobLocation,
  jobSalary,
   jobCurrency,
  jobDescription,
  setJobTitle,
  setJobCompany,
  setJobLocation,
  setJobSalary,
   setJobCurrency,
  setJobDescription,
  createJob,
}) {
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSelected, setLocationSelected] = useState(
    Boolean(jobLocation)
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (locationSelected || jobLocation.trim().length < 2) {
      setLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLocationLoading(true);

        const response = await fetch(
          `${API_URL}/locations/search?text=${encodeURIComponent(
            jobLocation
          )}`
        );

        const data = await response.json();

        if (response.ok) {
          setLocationSuggestions(data.cities || []);
        } else {
          setLocationSuggestions([]);
        }
      } catch (error) {
        console.error("Location search error:", error);
        setLocationSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [jobLocation, locationSelected]);
const handleLocationChange = (event) => {
  setJobLocation(event.target.value);
  setLocationSelected(false);

  if (event.target.value.trim().length >= 2) {
    setErrors((prev) => ({
      ...prev,
      location: "",
    }));
  }
};
  const handleLocationSelect = (city) => {
    setJobLocation(city.formatted);
    setLocationSelected(true);
    setLocationSuggestions([]);
  };

const handleSalaryChange = (event) => {
  const value = event.target.value;

  if (/^\d*$/.test(value)) {
    setJobSalary(value);

    if (value !== "") {
      setErrors((prev) => ({
        ...prev,
        salary: "",
      }));
    }
  }
};

const handleSubmit = (event) => {
  event.preventDefault();

  const title = jobTitle.trim();
  const company = jobCompany.trim();
  const location = jobLocation.trim();
  const salary = jobSalary.trim();
  const description = jobDescription.trim();

  const newErrors = {};

  if (title.length < 3) {
    newErrors.title = "Job title must contain at least 3 characters.";
  }

  if (company.length < 2) {
    newErrors.company = "Company name must contain at least 2 characters.";
  }

  if (location.length < 2) {
    newErrors.location = "Please enter a valid location.";
  }

  if (salary && !/^\d+$/.test(salary)) {
    newErrors.salary = "Salary must contain numbers only.";
  }

  if (description.length < 20) {
    newErrors.description =
      "Description must contain at least 20 characters.";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  createJob(event);
};

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      <h2>{editingJobId ? "Edit Job" : "Create New Job"}</h2>

      <label>
        Job title
        <input
          type="text"
          value={jobTitle}
           onChange={(event) => {
    setJobTitle(event.target.value);

    if (event.target.value.trim().length >= 3) {
      setErrors((prev) => ({
        ...prev,
        title: "",
      }));
    }
  }}
          placeholder="Frontend Developer"
         
        />
        {errors.title && (
  <small className="field-error">{errors.title}</small>
)}
      </label>

      <label>
        Company
        <input
          type="text"
          value={jobCompany}
          onChange={(event) => {
  setJobCompany(event.target.value);

  if (event.target.value.trim().length >= 2) {
    setErrors((prev) => ({
      ...prev,
      company: "",
    }));
  }
}}
          placeholder="Tech Company"
         
        />
        {errors.company && (
  <small className="field-error">{errors.company}</small>
)}
      </label>

      <label className="location-field">
        Location
        <input
          type="text"
          value={jobLocation}
          onChange={handleLocationChange}
          placeholder="Start typing a city..."
           autoComplete="off"
        />
       
         {errors.location && (
    <small className="field-error">{errors.location}</small>
  )}


        {locationLoading && (
          <small>Searching cities...</small>
        )}

        {locationSuggestions.length > 0 && (
          <div className="location-suggestions">
            {locationSuggestions.map((city, index) => (
              <button
                type="button"
                key={`${city.formatted}-${index}`}
                className="location-suggestion"
                onClick={() => handleLocationSelect(city)}
              >
                {city.formatted}
              </button>
            ))}
          </div>
        )}

        {!locationLoading &&
          jobLocation.trim().length >= 2 &&
          !locationSelected &&
          locationSuggestions.length === 0 && (
            <small>No cities found</small>
          )}
      </label>
<label>
  Salary

  <div className="salary-input">
    <input
      type="text"
      inputMode="numeric"
      value={jobSalary}
      onChange={handleSalaryChange}
      placeholder="12000"
    />

    <select
      value={jobCurrency}
      onChange={(event) => setJobCurrency(event.target.value)}
    >
      <option value="PLN">PLN</option>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>
  </div>
  {errors.salary && (
  <small className="field-error">{errors.salary}</small>
)}

  <small>Enter numbers only</small>
</label>
      <label>
        Description
        <textarea
          value={jobDescription}
          onChange={(event) => {
  setJobDescription(event.target.value);

  if (event.target.value.trim().length >= 20) {
    setErrors((prev) => ({
      ...prev,
      description: "",
    }));
  }
}}
          placeholder="Describe the job, requirements and responsibilities..."
          rows="5"
         
        />
        {errors.description && (
  <small className="field-error">{errors.description}</small>
)}
        <small>Minimum 20 characters</small>
      </label>

      <button type="submit" className="submit-button">
        {editingJobId ? "Update Job" : "Create Job"}
      </button>
    </form>
  );
}


export default JobForm;