import { useEffect, useState } from "react";
import { API_URL, getProfile } from "../api/jobsApi";

function useAuth() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

        if (!response.ok) {
          localStorage.removeItem("token");
          return;
        }

        setUser(data.user);
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
        : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

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
  
 const logout = () => {
  localStorage.removeItem("token");
  setUser(null);
  setName("");
  setEmail("");
  setPassword("");
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
    user,
    message,
    handleSubmit,
     loadProfile,
    logout,
  };
}

export default useAuth;