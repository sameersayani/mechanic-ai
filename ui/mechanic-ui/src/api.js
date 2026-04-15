const BASE_URL = "http://localhost:8000";

export const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export const createCustomer = async (data) => {
  const res = await fetch(`${BASE_URL}/customers/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const createJob = async (data) => {
  const res = await fetch(`${BASE_URL}/jobs/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};


export const getJobs = async () => {
  const res = await fetch("http://localhost:8000/jobs/", {
    headers: getHeaders(),
  });

  const data = await res.json();

  return data;
};

export const diagnoseIssue = async (issue) => {
  const res = await fetch(`${BASE_URL}/ai/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue }),
  });
  return res.json();
};

export const getCustomers = async () => {
  const res = await fetch(`${BASE_URL}/customers/`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const getVehicles = async () => {
  const res = await fetch(`${BASE_URL}/vehicles/`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const createVehicle = async (data) => {
  const res = await fetch(`${BASE_URL}/vehicles/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};