export default function RecentJobs({ jobs }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>

      {!Array.isArray(jobs) || jobs.length === 0 ? (
        <p>No jobs found</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-left border-b border-gray-300 dark:border-gray-700">
            <tr>
              <th className="py-2">Issue</th>
              <th>Vehicle</th>
              <th>Mechanic</th>
            </tr>
          </thead>

          <tbody>
            {jobs.slice(0, 5).map((j) => (
              <tr key={j.id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2">{j.issue || "-"}</td>
                <td>{j.vehicle_name || "-"}</td>
                <td>{j.mechanic_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}