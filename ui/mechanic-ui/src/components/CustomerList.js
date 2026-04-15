import { useEffect, useState } from "react";
import { getCustomers } from "../api";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-2">Customer List</h2>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        customers.map((c) => (
          <div key={c.id} className="border-b py-2">
            <b>{c.name}</b>
          </div>
        ))
      )}
    </div>
  );
}