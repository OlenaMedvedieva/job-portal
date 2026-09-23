import { useEffect, useState } from "react";
import {
  API_URL,
  getProfile,
  updateProfile,
  resendVerificationEmail,
  getMyApplications,
  withdrawApplication,
  getJobSeekers
} from "../api/jobsApi";

function useAuth() {
const [mode, setMode] = useState("login");
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [jobTitle, setJobTitle] = useState("");
const [profileImage, setProfileImage] = useState("");
const [city, setCity] = useState("");
const [skills, setSkills] = useState("");
const [experience, setExperience] = useState("");
const [education, setEducation] = useState("");
const [applications, setApplications] = useState([]);
const [jobSeekers, setJobSeekers] = useState([]);
const [role, setRole] = useState("job_seeker");
const [user, setUser] = useState(null);
const [message, setMessage] = useState("");

useEffect(() => {
const token = localStorage.getItem("token");


if (!token) {
  return;
}

const restoreUser = async () => {
  try {
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("PROFILE DATA:", data);

    if (!response.ok) {
      localStorage.removeItem("token");
      return;
    }

    setUser(data.user);
    setJobTitle(data.user.job_title || "");
    setProfileImage(data.user.profile_image || "");
    setCity(data.user.city || "");
    setSkills(data.user.skills || "");
    setExperience(data.user.experience || "");
    setEducation(data.user.education || "");
  } catch (error) {
    console.error("Restore user error:", error);
  }
};

restoreUser();


}, []);

const handleSubmit = async (event) => {
event.preventDefault();
setMessage("");


const endpoint = mode === "login" ? "/login" : "/register";

const body =
  mode === "login"
    ? { email, password }
    : { name, email, password, role };

try {
  console.log("LOGIN FETCH:", API_URL, endpoint, body);

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  console.log("REGISTER RESPONSE MESSAGE:", data.message);
  if (!response.ok) {
    setMessage(data.message || "Something went wrong");
    return;
  }

  if (mode === "login") {
    localStorage.setItem("token", data.token);
    setUser(data.user);
    setMessage("Login successful!");
  } else {
    setMessage("Registration successful! You can now log in.");
    setMode("login");
    setPassword("");
  }
} catch (error) {
  console.error(error);
  setMessage("Cannot connect to the server");
}


};

const loadProfile = async () => {
console.log("LOAD PROFILE CLICKED");

const token = localStorage.getItem("token");

if (!token) {
  return "You are not logged in";
}

try {
  const profile = await getProfile(token);
  console.log("PROFILE RESULT:", profile);
  return "Profile loaded successfully";
} catch (error) {
  console.error(error);
  return error.message || "Cannot connect to the server";
}
};
const loadJobSeekers = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    const data = await getJobSeekers(token);

    setJobSeekers(data);
  } catch (error) {
    console.error("Load job seekers error:", error);
  }
};

const loadApplications = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return "You are not logged in";
  }

  try {
    const result = await getMyApplications(token);
    setApplications(result);
    return "Applications loaded successfully";
  } catch (error) {
    console.error("Load applications error:", error);
    return error.message || "Failed to load applications";
  }
};
const withdrawApplicationForUser = async (applicationId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return "You are not logged in";
  }

  try {
    const result = await withdrawApplication(applicationId, token);

    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === applicationId
          ? result.application
          : application
      )
    );

    return result.message;
  } catch (error) {
    console.error("Withdraw application error:", error);
    return error.message || "Failed to withdraw application";
  }
};
const saveProfile = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return "You are not logged in";
  }

  try {
    console.log("SAVING JOB TITLE:", jobTitle);

   const result = await updateProfile(
  jobTitle,
  city,
  skills,
  experience,
  education,
  profileImage,
  token
);
    console.log("UPDATE PROFILE RESULT:", result);

    setUser(result.user);

    return "Profile saved successfully!";
  } catch (error) {
    console.error("Save profile error:", error);
    return error.message || "Failed to save profile";
  }
};
const resendVerification = async () => {
  if (!email) {
    return "Please enter your email";
  }

  try {
    const result = await resendVerificationEmail(email);

    return result.message;
  } catch (error) {
    console.error("Resend verification error:", error);

    return error.message || "Failed to resend verification email";
  }
};
const logout = () => {
localStorage.removeItem("token");
setUser(null);
setName("");
setEmail("");
setPassword("");
setRole("job_seeker");
};
return {
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  jobTitle,
  setJobTitle,
  city,
  setCity,
  skills,
  setSkills,
  experience,
  setExperience,
  education,
  setEducation,
  role,
  setRole,
  user,
  message,
  handleSubmit,
  loadProfile,
  loadApplications,
  withdrawApplication: withdrawApplicationForUser,
  applications,
  profileImage,
  setProfileImage,
  jobSeekers,
  loadJobSeekers,
  saveProfile,
   resendVerification,
  logout,
};
}

export default useAuth;
