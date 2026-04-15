import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function JobsChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Jobs Trend</h2>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}