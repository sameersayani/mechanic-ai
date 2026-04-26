import { useEffect, useState } from "react";
import { getJobs, updateJob, getInvoiceByJobId, updateInvoiceStatus } from "../api";
import { Wrench, Car, FileText, X } from "lucide-react";

export default function JobList({ refreshTrigger }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [page, pageSize, refreshTrigger]);

  const loadJobs = async () => {
    try {
      const res = await getJobs(page, pageSize);
      if (!res) { setJobs([]); return; }
      if (Array.isArray(res)) {
        setJobs(res);
      } else if (Array.isArray(res.data)) {
        setJobs(res.data);
        setTotal(res.total || 0);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setJobs([]);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === "Done" ? "Pending" : "Done";
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
    );
    try {
      await updateJob(job.id, { ...job, status: newStatus });
    } catch (err) {
      console.error("Failed to update job status:", err);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: job.status } : j))
      );
    }
  };

  const handleOpenInvoice = async (job) => {
    setInvoiceLoading(true);
    setShowInvoiceModal(true);
    setSelectedInvoice(null);
    try {
      const res = await getInvoiceByJobId(job.id);
      setSelectedInvoice(res || null);
    } catch (err) {
      setSelectedInvoice(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const togglePaymentStatus = async () => {
    if (!selectedInvoice) return;
    const newStatus = selectedInvoice.payment_status === "paid" ? "unpaid" : "paid";

    // Optimistic update
    setSelectedInvoice((prev) => ({ ...prev, payment_status: newStatus }));

    try {
      await updateInvoiceStatus(selectedInvoice.id, newStatus);
    } catch (err) {
      // Revert
      setSelectedInvoice((prev) => ({ ...prev, payment_status: selectedInvoice.payment_status }));
      console.error("Failed to update payment status:", err);
    }
  };

  const totalPages = total ? Math.ceil(total / pageSize) : 0;
  const isLastPage = totalPages ? page >= totalPages : jobs.length < pageSize;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-3">Jobs</h2>

      {/* Page Size Selector */}
      <div className="mb-3 flex items-center gap-2">
        <label>Page Size:</label>
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="input w-28"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* LIST */}
      <div className="grid gap-3">
        {jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md transition">

              {/* Issue */}
              <p className="font-semibold text-lg">
                🔧 {job.issue || "No issue"}
              </p>

              {/* Vehicle */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Car className="w-4 h-4" />
                {job.vehicle_name || "Unknown Vehicle"}
              </div>

              {/* Mechanic */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Wrench className="w-4 h-4" />
                {job.mechanic_name || "Unassigned"}
              </div>

              {/* Status Toggle + Invoice Button */}
              <div className="flex items-center justify-between mt-3">

                {/* Pending / Done toggle */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStatus(job)}
                    className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                      job.status === "Done" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${
                        job.status === "Done" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      job.status === "Done"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {job.status === "Done" ? "Done" : "Pending"}
                  </span>
                </div>

                {/* Invoice Button */}
                <button
                  onClick={() => handleOpenInvoice(job)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow transition-all hover:scale-105"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Invoice
                </button>

              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <button className="btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span>Page {page} {totalPages ? `of ${totalPages}` : ""}</span>
        <button className="btn" disabled={isLastPage} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>

      {/* INVOICE MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl">
              <div className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5" />
                <h2 className="text-lg font-bold">Invoice</h2>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {invoiceLoading ? (
                <div className="flex justify-center items-center py-10">
                  <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                </div>
              ) : !selectedInvoice ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No invoice found for this job</p>
                  <p className="text-gray-400 text-sm mt-1">Generate one using the Ask AI button</p>
                </div>
              ) : (
                <div className="space-y-4">

                  {/* Invoice ID */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Invoice #</span>
                    <span className="font-semibold">{selectedInvoice.id}</span>
                  </div>

                  {/* Summary */}
                  {selectedInvoice.summary && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Summary</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInvoice.summary}</p>
                    </div>
                  )}

                  {/* Bill breakdown */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Parts Cost</span>
                      <span className="font-medium">{parseFloat(selectedInvoice.parts_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Labour Cost</span>
                      <span className="font-medium">{parseFloat(selectedInvoice.labor_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-1">
                      <span>Total Amount</span>
                      <span className="text-green-600 dark:text-green-400">
                        {parseFloat(selectedInvoice.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Status Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-sm">Payment Status</p>
                      <p className={`text-xs font-bold mt-0.5 ${
                        selectedInvoice.payment_status === "paid"
                          ? "text-green-500"
                          : "text-orange-500"
                      }`}>
                        {selectedInvoice.payment_status === "paid" ? "✅ Paid" : "⏳ Unpaid"}
                      </p>
                    </div>
                    <button
                      onClick={togglePaymentStatus}
                      className={`relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
                        selectedInvoice.payment_status === "paid" ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
                          selectedInvoice.payment_status === "paid" ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="w-full btn"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
