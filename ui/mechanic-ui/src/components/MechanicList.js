import { Wrench, Phone } from "lucide-react";

export default function MechanicList({ mechanics }) {
  return (
    <div className="card mt-4">
      <h2 className="font-semibold mb-3">Mechanic List</h2>

      {mechanics.length === 0 ? (
        <p>No mechanics found</p>
      ) : (
        mechanics.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between border-b py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            {/* Left: Mechanic */}
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{m.name}</span>
            </div>

            {/* Right: Phone */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4" />
              <span>{m.phone}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}