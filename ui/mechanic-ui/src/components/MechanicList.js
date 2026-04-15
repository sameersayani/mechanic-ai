import { useEffect, useState } from "react";
import { getMechanics } from "../api";

export default function MechanicList() {
  const [mechanics, setMechanics] = useState([]);

  const loadMechanics = async () => {
    const data = await getMechanics();
    setMechanics(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    loadMechanics();
  }, []);

  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-2">Mechanic List</h2>

      {mechanics.length === 0 ? (
        <p>No mechanics found</p>
      ) : (
        mechanics.map((m) => (
          <div key={m.id} className="border-b py-2">
            {m.name}
          </div>
        ))
      )}
    </div>
  );
}