import { useEffect, useState } from "react";
import { createJob, getCustomers, getVehicles, getMechanics, diagnoseIssue } from "../api";
import { toast } from "react-toastify";

export default function JobForm({ onJobAdded }) {
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    vehicle_id: "",
    mechanic_id: "",
    issue: "",
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const c = await getCustomers();
    const v = await getVehicles();
    const m = await getMechanics();
    setCustomers(Array.isArray(c) ? c : c?.data || []);
    setVehicles(Array.isArray(v) ? v : v?.data || []);
    setMechanics(Array.isArray(m) ? m : m?.data || []);
  };

  const isFormValid = form.vehicle_id && form.issue.trim();

  const handleSubmit = async () => {
    if (!form.vehicle_id) { toast.error("Select vehicle"); return; }

    const res = await createJob({
      vehicle_id: form.vehicle_id,
      issue_description: form.issue,
      mechanic_id: form.mechanic_id,
    });

    if (res.id) {
      onJobAdded?.();
      toast.success("Job created");
      setForm({ customer_id: "", vehicle_id: "", mechanic_id: "", issue: "" });
    }
  };

  const handleAskAI = async () => {
    if (!form.issue.trim()) { toast.warning("Enter an issue first"); return; }

    // Find selected vehicle details
    const vehicle = vehicles.find((v) => String(v.id) === String(form.vehicle_id));
    const car = vehicle?.make || "Unknown";
    const model = vehicle?.model || "Unknown";

    setAiLoading(true);
    try {
      const res = await diagnoseIssue({
        issue: form.issue,
        car,
        model,
        currency: "AUD",
        country: "Australia",
        vat: 10.0,
      });

      if (res?.error) {
        toast.error("AI diagnosis failed");
      } else {
        setAiResult(res);
        setShowModal(true);
      }
    } catch (err) {
      toast.error("AI diagnosis failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="card p-4 space-y-3">
        <h2 className="text-xl font-bold mb-2">Add Job</h2>

        {/* Customer */}
        <select
          className="input"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value, vehicle_id: "" })}
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Vehicle */}
        <select
          className="input"
          value={form.vehicle_id}
          disabled={!form.customer_id}
          onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
        >
          <option value="">Select Vehicle</option>
          {vehicles
            .filter((v) => Number(v.customer_id) === Number(form.customer_id))
            .map((v) => (
              <option key={v.id} value={v.id}>{v.make} {v.model}</option>
            ))}
        </select>

        {/* Mechanic */}
        <select
          className="input"
          value={form.mechanic_id}
          onChange={(e) => setForm({ ...form, mechanic_id: e.target.value })}
        >
          <option value="">Select Mechanic</option>
          {mechanics.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Issue */}
        <textarea
          className="input"
          placeholder="Describe the issue..."
          value={form.issue}
          rows={3}
          onChange={(e) => setForm({ ...form, issue: e.target.value })}
        />

        {/* Buttons Row */}
        <div className="flex items-center gap-3">

          {/* Create Job - disabled until form valid */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`btn ${!isFormValid ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            Create Job
          </button>

          {/* Ask AI */}
          <button
            onClick={handleAskAI}
            disabled={aiLoading || !form.issue.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all duration-200
              bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg
              ${(aiLoading || !form.issue.trim()) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Diagnosing...
              </>
            ) : (
              <>
                <span>🤖</span> Ask AI
              </>
            )}
          </button>

        </div>
      </div>

      {/* AI Result Modal */}
      {showModal && aiResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">🤖</span>
                <h2 className="text-lg font-bold">AI Diagnostic Report</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Car | Model | Issue */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                  🚗 {aiResult.car}
                </span>
                <span className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                  📋 {aiResult.model}
                </span>
                <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                  🔧 {aiResult.issue}
                </span>
              </div>

              {/* Solution */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>🛠️</span> Solution
                </h3>

                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Repair / Replacement: </span>
                  {aiResult.solution.repair_or_replacement}
                </p>

                <div>
                  <p className="font-semibold text-sm mb-1">Parts Replaced:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {aiResult.solution.parts_replaced.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Services Done:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {aiResult.solution.services_done.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bill */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                <h3 className="font-bold text-base flex items-center gap-2 mb-3">
                  <span>💰</span> Bill Charges
                </h3>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Parts Replaced</span>
                  <span className="font-medium">{aiResult.bill.currency} {aiResult.bill.parts_cost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Repair &amp; Service</span>
                  <span className="font-medium">{aiResult.bill.currency} {aiResult.bill.repair_and_service_cost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Overall Amount</span>
                  <span className="font-medium">{aiResult.bill.currency} {aiResult.bill.overall_amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    VAT ({aiResult.bill.vat_rate}% — {aiResult.bill.country})
                  </span>
                  <span className="font-medium text-orange-500">{aiResult.bill.currency} {aiResult.bill.vat_amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-base font-bold border-t border-gray-300 dark:border-gray-600 pt-2 mt-1">
                  <span>Final Bill Amount</span>
                  <span className="text-green-600 dark:text-green-400">
                    {aiResult.bill.currency} {aiResult.bill.final_bill_amount.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="w-full btn"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}