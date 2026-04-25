import { useState } from "react";
import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";

export default function Customers() {
 const [refreshCustomers, setRefreshCustomers] = useState(0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Customers</h1>
      <CustomerForm onCustomerAdded={() => setRefreshCustomers((n) => n + 1)} />
      <CustomerList refreshTrigger={refreshCustomers} />
    </div>
  );
}