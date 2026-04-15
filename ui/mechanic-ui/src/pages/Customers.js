import CustomerForm from "../components/CustomerForm";
import CustomerList from "../components/CustomerList";

export default function Customers() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Customers</h1>
      <CustomerForm />
      <CustomerList />
    </div>
  );
}