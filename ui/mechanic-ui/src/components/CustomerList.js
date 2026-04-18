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
    console.log("Customers:", customers);
  }, []);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-2">Customer List</h2>

      {customers.length === 0 ? (
        <p>No customers found</p>
      ) : (
        customers.map((c) => (
          <div key={c.id} className="border-b py-2 flex flex-col">
            <b>{c.name}</b>
            <p>{c.phone}</p>
            <p>{c.email}</p>
          </div>
        ))
      )}
    </div>
  );
}