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
  return handleResponse(res);
};

export const createJob = async (data) => {
  const res = await fetch(`${BASE_URL}/jobs/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};


export const getJobs = async (page = 1, pageSize = 10) => {
  const res = await fetch(
    `${BASE_URL}/jobs/?page=${page}&page_size=${pageSize}`,
    {
      headers: getHeaders(),
    }
  );

  return handleResponse(res);
};

export const updateJob = async (id, data) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}/`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const diagnoseIssue = async (issue, currency = "AUD") => {
  const res = await fetch(`${BASE_URL}/ai/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue, currency }),
  });
  return handleResponse(res);
};

export const getCustomers = async (page = 1, pageSize = 10) => {
  try{
  const res = await fetch(
    `${BASE_URL}/customers/?page=${page}&page_size=${pageSize}`,
    {
      headers: getHeaders(),
    }
  );

    return handleResponse(res);
  }
  catch (err) {
      console.error("getJobs failed:", err);
      return null;
  }

};

export const getVehicles = async (page = 1, pageSize = 10) => {
  const res = await fetch(
    `${BASE_URL}/vehicles/?page=${page}&page_size=${pageSize}`,
    {
      headers: getHeaders(),
    }
  );

  return handleResponse(res);
};

export const createVehicle = async (data) => {
  const res = await fetch(`${BASE_URL}/vehicles/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const createMechanic = async (data) => {
  const res = await fetch(`${BASE_URL}/mechanics/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getMechanics = async (page = 1, pageSize = 10) => {
  const res = await fetch(
    `${BASE_URL}/mechanics/?page=${page}&page_size=${pageSize}`,
    {
      headers: getHeaders(),
    }
  );
  return handleResponse(res);
};

const handleResponse = async (res) => {
  if (res.status === 401 || res.status === 403) {
   
    localStorage.removeItem("token");

    window.location.href = "/login"; // 🔥 redirect globally

    return null;
  }

  const data = await res.json();
  return res.ok ? data : Promise.reject(data);
};