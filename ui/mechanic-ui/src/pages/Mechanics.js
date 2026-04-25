import { useEffect, useState } from "react";
import { getMechanics } from "../api";
import MechanicForm from "../components/MechanicForm";
import MechanicList from "../components/MechanicList";

export default function Mechanics() {
    const [mechanics, setMechanics] = useState([]);
    const [refreshMechanics, setRefreshMechanics] = useState(0);
    const loadMechanics = async () => {
    const data = await getMechanics();
    setMechanics(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMechanics();
  }, [refreshMechanics]);
    
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mechanics</h1>
      <MechanicForm onSuccess={() => setRefreshMechanics((n) => n + 1)} />
      <MechanicList mechanics={mechanics} refreshTrigger={refreshMechanics} />
    </div>
  );
}