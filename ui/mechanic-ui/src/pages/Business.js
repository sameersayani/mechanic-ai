import { useState } from "react";
import BusinessForm from "../components/BusinessForm";
import BusinessList from "../components/BusinessList";

export default function Business() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Businesses</h1>
      <BusinessForm onSuccess={() => setRefresh((n) => n + 1)} />
      <BusinessList refreshTrigger={refresh} />
    </div>
  );
}