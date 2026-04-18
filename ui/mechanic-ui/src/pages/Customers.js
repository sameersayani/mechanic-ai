import { useEffect, useState } from "react";
import { getCustomers } from "../api";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";

export default function Customers() {
const [customers, setCustomers] = useState([]);

const loadCustomers = async () => {
  const data = await getCustomers();
  setCustomers(data);
};

useEffect(() => {
  loadCustomers();
}, []);
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Customers</h1>
      <CustomerForm onSuccess={loadCustomers} />
      <CustomerList />
    </div>
  );
}