import { useState } from "react";
import { createJob, diagnoseIssue } from "../api";

export default function JobForm() {
  const [issue, setIssue] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [currency, setCurrency] = useState("AUD");

  const handleAI = async () => {
  const res = await diagnoseIssue(issue, currency);
  setAiResult(res.result);
};

  const handleSubmit = async () => {
    await createJob({
      vehicle_id: 1,
      issue_description: issue,
      assigned_mechanic: "Raju"
    });
    alert("Job Created");
  };

  return (
    <div className="p-4 border rounded-xl shadow mt-4">
      <h2 className="text-xl font-bold mb-2">Create Job</h2>
      <select
        className="border p-2 mt-2"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
      >
        <option value="AUD">AUD</option>
        <option value="INR">INR</option>
        <option value="USD">USD</option>
      </select>
      <textarea
        placeholder="Describe issue..."
        className="w-full border p-2"
        onChange={(e) => setIssue(e.target.value)}
      />

      <div className="flex gap-2 mt-2">
        <button onClick={handleAI} className="btn">AI Suggest</button>
        <button onClick={handleSubmit} className="btn">Save Job</button>
      </div>

      {aiResult && (
        <div className="mt-3 p-3 bg-gray-100 rounded">
          <b>AI Suggestion:</b>
          <p>{aiResult}</p>
        </div>
      )}
    </div>
  );
}