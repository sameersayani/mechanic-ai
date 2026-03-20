const BASE_URL = "http://localhost:8000";

export const createCustomer = async (data) => {
  const res = await fetch(`${BASE_URL}/customers/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createJob = async (data) => {
  const res = await fetch(`${BASE_URL}/jobs/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getJobs = async () => {
  const res = await fetch(`${BASE_URL}/jobs/`);
  return res.json();
};

export const diagnoseIssue = async (issue) => {
  const res = await fetch(`${BASE_URL}/ai/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  return res.json();
};