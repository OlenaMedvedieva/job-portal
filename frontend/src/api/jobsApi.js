const API_URL = "http://localhost:3000";

export const getJobs = async () => {
  const response = await fetch(`${API_URL}/jobs`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load jobs");
  }

  return data.jobs;
};
export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load profile");
  }

  return data.user;
};
export const deleteJob = async (jobId, token) => {
  const response = await fetch(`${API_URL}/jobs/${jobId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete job");
  }

  return data;
};
export const saveJob = async (jobId, jobData, token) => {
  const isEditing = jobId !== null;

  const response = await fetch(
    isEditing
      ? `${API_URL}/jobs/${jobId}`
      : `${API_URL}/jobs`,
    {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save job");
  }

  return data;
};