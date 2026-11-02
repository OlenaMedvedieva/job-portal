import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";
import JobDetails from "./pages/JobDetails.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
    </Routes>
  );
}

export default App;
