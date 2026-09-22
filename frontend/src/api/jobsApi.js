export const API_URL = "http://localhost:3000";

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

export const updateProfile = async (
  jobTitle,
  city,
  skills,
  experience,
  education,
  token
) => {

  const response = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      jobTitle,
      city,
      skills,
      experience,
      education,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
};

export const getMyApplications = async (token) => {
  const response = await fetch(`${API_URL}/applications/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load applications");
  }

  return data.applications;
};

export const updateApplicationStatus = async (
  applicationId,
  status,
  token
) => {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update application status"
    );
  }

  return data;
};

export const getJobApplications = async (jobId, token) => {
  const response = await fetch(`${API_URL}/jobs/${jobId}/applications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load job applications");
  }

  return data.applications;
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
    isEditing ? `${API_URL}/jobs/${jobId}` : `${API_URL}/jobs`,
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

export const resendVerificationEmail = async (email) => {
  const response = await fetch(`${API_URL}/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to resend verification email"
    );
  }

  return data;
};