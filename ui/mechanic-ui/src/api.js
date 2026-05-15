// const BASE_URL = "http://localhost:8000";
const BASE_URL = "https://mechanic-ai-brme.onrender.com";

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

export const deleteJob = async (id) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export const getPendingJobs = async () => {
  const res = await fetch(`${BASE_URL}/jobs/pending/`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export const getJobById = async (id) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}/`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export const diagnoseIssue = async ({ issue, car, model, currency = "AUD", country = "Australia", vat = 10.0 }) => {
  const res = await fetch(`${BASE_URL}/ai/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ issue, car, model, currency, country, vat }),
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

export const updateMechanic = async (id, data) => {
  const res = await fetch(`${BASE_URL}/mechanics/${id}/`, {
    method: "PUT",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
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

export const createInvoice = async (data) => {
  const res = await fetch(`${BASE_URL}/invoices/`, {
    method: "POST",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getInvoiceByJobId = async (jobId) => {
  const res = await fetch(`${BASE_URL}/invoices/job/${jobId}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const updateInvoiceStatus = async (invoiceId, status) => {
  const res = await fetch(`${BASE_URL}/invoices/${invoiceId}/status`, {
    method: "PATCH",
    headers: { ...getHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ payment_status: status }),
  });
  return handleResponse(res);
};

export const createBusiness = async (data) => {
  const res = await fetch(`${BASE_URL}/business/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getBusiness = async (business_id) => {
  const res = await fetch(`${BASE_URL}/business/${business_id}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const getBusinesses = async () => {
  const res = await fetch(`${BASE_URL}/business/`, {
    headers: getHeaders(),
  });
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