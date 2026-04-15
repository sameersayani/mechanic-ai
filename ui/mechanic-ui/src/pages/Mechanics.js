import MechanicForm from "../components/MechanicForm";
import MechanicList from "../components/MechanicList";

export default function Mechanics() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Mechanics</h1>
      <MechanicForm />
      <MechanicList />
    </div>
  );
}