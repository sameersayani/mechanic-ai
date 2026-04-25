import { useEffect, useState } from "react";
import { getCustomers, getVehicles, getJobs } from "../api";
import JobsChart from "../components/JobsChart";
import RecentJobs from "../components/RecentJobs";

// Helper: extract array + total from either response shape
// Shape 1: plain array  → [...]
// Shape 2: paginated    → { data: [...], total: N }
const extractData = (res) => {
  if (Array.isArray(res)) return { items: res, total: res.length };
  if (Array.isArray(res?.data)) return { items: res.data, total: res.total ?? res.data.length };
  return { items: [], total: 0 };
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    jobs: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [c, v, j] = await Promise.all([
        getCustomers(),
        getVehicles(),
        getJobs(),
      ]);

      const { items: customers, total: customerTotal } = extractData(c);
      const { items: vehicles, total: vehicleTotal } = extractData(v);
      const { items: jobsArray, total: jobTotal } = extractData(j);

      setStats({
        customers: customerTotal,
        vehicles: vehicleTotal,
        jobs: jobTotal,
      });

      setJobs(jobsArray);

      // Group jobs by their created date (or fall back to index)
      const grouped = jobsArray.reduce((acc, job, index) => {
        const key = job.created_at
          ? new Date(job.created_at).toLocaleDateString()
          : "Day " + (index + 1);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const chart = Object.keys(grouped).map((k) => ({
        date: k,
        count: grouped[k],
      }));

      setChartData(chart);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Overview of your workshop activity
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Customers */}
        <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex justify-between items-center">
            <h2 className="text-sm">Customers</h2>
            <span className="text-xl">👤</span>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.customers}</p>
        </div>

        {/* Vehicles */}
        <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex justify-between items-center">
            <h2 className="text-sm">Vehicles</h2>
            <span className="text-xl">🚗</span>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.vehicles}</p>
        </div>

        {/* Jobs */}
        <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex justify-between items-center">
            <h2 className="text-sm">Jobs</h2>
            <span className="text-xl">🔧</span>
          </div>
          <p className="text-3xl font-bold mt-2">{stats.jobs}</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <JobsChart data={chartData} />
        <RecentJobs jobs={jobs} />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>New job created</span>
            <span className="text-gray-400">2 mins ago</span>
          </div>
          <div className="flex justify-between">
            <span>Vehicle added</span>
            <span className="text-gray-400">10 mins ago</span>
          </div>
          <div className="flex justify-between">
            <span>Customer registered</span>
            <span className="text-gray-400">1 hour ago</span>
          </div>
        </div>
      </div>

    </div>
  );
}