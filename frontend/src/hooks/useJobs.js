import { useState } from "react";
import {
  deleteJob as deleteJobApi,
  getJobs,
  saveJob,
  getJobApplications,
} from "../api/jobsApi";


function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [jobCurrency, setJobCurrency] = useState("PLN");
  const [jobDescription, setJobDescription] = useState("");

  const loadJobs = async (setMessage) => {
    try {
      const jobs = await getJobs();

      setJobs(jobs);
      setMessage("Jobs loaded successfully");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Cannot connect to the server");
    }
  };
    const loadJobApplications = async (jobId, setMessage) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in");
      return;
    }

    try {
      const applications = await getJobApplications(jobId, token);

      setJobApplications(applications);
      setMessage("Applications loaded successfully");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Cannot connect to the server");
    }
  };

  const deleteJob = async (jobId, setMessage) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteJobApi(jobId, token);

      setMessage("Job deleted successfully");

      await loadJobs(setMessage);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Cannot connect to the server");
    }
  };

  const startEditJob = (job) => {
    setEditingJobId(job.id);

    setJobTitle(job.title);
    setJobCompany(job.company);
    setJobLocation(job.location || "");
   const salary = (job.salary || "").trim();

const salaryMatch = salary.match(/^(\d+)\s*(PLN|EUR|USD)?$/);

if (salaryMatch) {
  setJobSalary(salaryMatch[1] || "");
  setJobCurrency(salaryMatch[2] || "PLN");
} else {
  setJobSalary("");
  setJobCurrency("PLN");
}
    setJobDescription(job.description || "");

    setShowJobForm(true);
  };

  const createJob = async (event, setMessage) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("You are not logged in");
      return;
    }

    const isEditing = editingJobId !== null;

    try {
      await saveJob(
        editingJobId,
        {
          title: jobTitle,
          company: jobCompany,
          location: jobLocation,
          salary: jobSalary ? `${jobSalary} ${jobCurrency}` : "",
          description: jobDescription,
        },
        token
      );

      setMessage(
        isEditing
          ? "Job updated successfully"
          : "Job created successfully"
      );

      setJobTitle("");
      setJobCompany("");
      setJobLocation("");
      setJobSalary("");
      setJobCurrency("PLN");
      setJobDescription("");

      setEditingJobId(null);
      setShowJobForm(false);

      await loadJobs(setMessage);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Cannot connect to the server");
    }
  };

  return {
    jobs,
    jobApplications,
    loadJobApplications,
    showJobForm,
    setShowJobForm,
    editingJobId,
    setEditingJobId,

    jobTitle,
    jobCompany,
    jobLocation,
    jobSalary,
    jobDescription,

    setJobTitle,
    setJobCompany,
    setJobLocation,
    setJobSalary,
    setJobDescription,
    setJobCurrency,
    jobCurrency,

    loadJobs,
    deleteJob,
    startEditJob,
    createJob,
  };
}

export default useJobs;