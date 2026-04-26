import { useEffect, useState } from "react";
import { createJob, getCustomers, getVehicles, getMechanics, diagnoseIssue, createInvoice } from "../api";
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
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceDone, setInvoiceDone] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [editableBill, setEditableBill] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Decode user_id directly from JWT — no separate localStorage key needed
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.user_id || payload?.id || payload?.sub || null;
    } catch {
      return null;
    }
  };

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
        setEditableBill({
          summary: [
            res.solution.repair_or_replacement,
            "Parts: " + res.solution.parts_replaced.join(", "),
            "Services: " + res.solution.services_done.join(", "),
          ].join(" | "),
          parts_cost: res.bill.parts_cost,
          labor_cost: res.bill.repair_and_service_cost,
          total_amount: res.bill.overall_amount,
          vat_amount: res.bill.vat_amount,
          final_bill_amount: res.bill.final_bill_amount,
        });
        setShowModal(true);
      }
    } catch (err) {
      toast.error("AI diagnosis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptAndInvoice = async () => {
    if (!aiResult || invoiceLoading) return; // prevent duplicate clicks
    setInvoiceDone(true);

    const user_id = getUserIdFromToken();
    if (!user_id) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    setInvoiceLoading(true);
    try {
      // Step 1: Create job
      const jobRes = await createJob({
        vehicle_id: form.vehicle_id,
        issue_description: form.issue,
        mechanic_id: form.mechanic_id,
        user_id,
      });

      if (!jobRes?.id) {
        toast.error("Failed to create job");
        return;
      }

      // Step 2: Create invoice linked to job
      const invoicePayload = {
        job_id: jobRes.id,
        parts_cost: editableBill.parts_cost,
        labor_cost: editableBill.labor_cost,
        total_amount: editableBill.final_bill_amount,
        payment_status: "unpaid",
        user_id,
        summary: editableBill.summary,
      };

      const invoiceRes = await createInvoice(invoicePayload);

      if (invoiceRes?.id) {
        toast.success("✅ Job created & Invoice generated!");
        setShowModal(false);
        setAiResult(null);
        setEditableBill(null);
        setInvoiceDone(false);
        setForm({ customer_id: "", vehicle_id: "", mechanic_id: "", issue: "" });
        onJobAdded?.(); // 👈 triggers JobList refresh
      } else {
        toast.error("Invoice generation failed");
      }

    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setInvoiceLoading(false);
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

          {/* Create Job */}
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
              <><span>🤖</span> Ask AI</>
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
                    {aiResult.solution.parts_replaced.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Services Done:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {aiResult.solution.services_done.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              {/* Editable Summary */}
              {editableBill && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-base flex items-center gap-2 mb-1">
                    <span>📝</span> Summary
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">Auto-filled by AI — you can edit before saving</p>
                  <textarea
                    className="input text-sm w-full"
                    rows={3}
                    value={editableBill.summary}
                    onChange={(e) => setEditableBill({ ...editableBill, summary: e.target.value })}
                  />
                </div>
              )}

              {/* Editable Bill */}
              {editableBill && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-base flex items-center gap-2 mb-1">
                    <span>💰</span> Bill Charges
                  </h3>
                  <p className="text-xs text-gray-400 mb-1">Auto-filled by AI — you can edit before saving</p>

                  <div className="flex items-center justify-between text-sm gap-3">
                    <label className="text-gray-600 dark:text-gray-400 w-36 shrink-0">Parts Replaced ({aiResult.bill.currency})</label>
                    <input
                      type="number"
                      className="input text-sm text-right"
                      value={editableBill.parts_cost}
                      onChange={(e) => {
                        const parts = parseFloat(e.target.value) || 0;
                        const total = parts + editableBill.labor_cost;
                        const vat = parseFloat((total * aiResult.bill.vat_rate / 100).toFixed(2));
                        setEditableBill({ ...editableBill, parts_cost: parts, total_amount: total, vat_amount: vat, final_bill_amount: parseFloat((total + vat).toFixed(2)) });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm gap-3">
                    <label className="text-gray-600 dark:text-gray-400 w-36 shrink-0">Repair &amp; Service ({aiResult.bill.currency})</label>
                    <input
                      type="number"
                      className="input text-sm text-right"
                      value={editableBill.labor_cost}
                      onChange={(e) => {
                        const labor = parseFloat(e.target.value) || 0;
                        const total = editableBill.parts_cost + labor;
                        const vat = parseFloat((total * aiResult.bill.vat_rate / 100).toFixed(2));
                        setEditableBill({ ...editableBill, labor_cost: labor, total_amount: total, vat_amount: vat, final_bill_amount: parseFloat((total + vat).toFixed(2)) });
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Overall Amount</span>
                    <span className="font-medium">{aiResult.bill.currency} {editableBill.total_amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">VAT ({aiResult.bill.vat_rate}% — {aiResult.bill.country})</span>
                    <span className="font-medium text-orange-500">{aiResult.bill.currency} {editableBill.vat_amount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold border-t border-gray-300 dark:border-gray-600 pt-2">
                    <span>Final Bill Amount</span>
                    <span className="text-green-600 dark:text-green-400">{aiResult.bill.currency} {editableBill.final_bill_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleAcceptAndInvoice}
                disabled={invoiceLoading || invoiceDone}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white
                  bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg transition-all
                  ${invoiceLoading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
              >
                {invoiceLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <><span>📄</span> Accept &amp; Generate Invoice</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
