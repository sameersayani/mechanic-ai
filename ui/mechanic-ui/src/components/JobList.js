import { useEffect, useState } from "react";
import { getJobs, updateJob, deleteJob, getInvoiceByJobId, updateInvoiceStatus, getHeaders } from "../api";
import { Wrench, Car, FileText, X, Building2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function JobList({ refreshTrigger, onEditJob, onJobDeleted }) {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // ── Delete confirm modal ─────────────────────────────────────────────────
  const [jobToDelete, setJobToDelete] = useState(null); // job object pending deletion
  const [deleteLoading, setDeleteLoading] = useState(false);
  // ────────────────────────────────────────────────────────────────────────
   const BASE_URL = "https://mechanic-ai-brme.onrender.com";

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

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (job) => {
    onEditJob?.(job);
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteJob(jobToDelete.id);
      toast.success("Job deleted successfully");
      setJobToDelete(null);
      onJobDeleted?.();
    } catch (err) {
      console.error("Failed to delete job:", err);
      toast.error("Failed to delete job");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Invoice ──────────────────────────────────────────────────────────────
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

  const handleCloseModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const handleDownloadPdf = () => {
    if (!selectedInvoice) return;

    // const url = `${process.env.REACT_APP_API_BASE || "http://localhost:8000"}/invoices/${selectedInvoice.id}/pdf`;
    const url = `${BASE_URL}/invoices/${selectedInvoice.id}/pdf`;
    const headers = getHeaders();

    fetch(url, { method: 'GET', headers })
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to download PDF');
        const blob = await r.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `invoice_${selectedInvoice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to download PDF. Check console for details.');
      });
  };

  const togglePaymentStatus = async () => {
    if (!selectedInvoice) return;
    const newStatus = selectedInvoice.payment_status === "paid" ? "unpaid" : "paid";
    setSelectedInvoice((prev) => ({ ...prev, payment_status: newStatus }));
    try {
      await updateInvoiceStatus(selectedInvoice.id, newStatus);
    } catch (err) {
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

              {/* Bottom row: Status toggle | Edit | Delete | Invoice */}
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">

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

                {/* Right-side action buttons */}
                <div className="flex items-center gap-2">

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(job)}
                    title="Edit job"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 shadow transition-all hover:scale-105"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(job)}
                    title="Delete job"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow transition-all hover:scale-105"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>

                  {/* Invoice */}
                  <button
                    onClick={() => handleOpenInvoice(job)}
                    title="View invoice"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow transition-all hover:scale-105"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Invoice
                  </button>

                </div>
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

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────── */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm">

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-2xl">
              <Trash2 className="w-5 h-5 text-white shrink-0" />
              <h2 className="text-lg font-bold text-white">Delete Job</h2>
            </div>

            <div className="px-6 py-5 space-y-3">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                Are you sure you want to delete this job?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  🔧 {jobToDelete.issue || "No issue"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {jobToDelete.vehicle_name || "Unknown Vehicle"} · {jobToDelete.mechanic_name || "Unassigned"}
                </p>
              </div>
              <p className="text-xs text-red-500 font-medium">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setJobToDelete(null)}
                disabled={deleteLoading}
                className="flex-1 btn bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white
                  bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow transition-all
                  ${deleteLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Yes, Delete</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ──────────────────────────────────────────────────────────────────── */}

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
              <button onClick={handleCloseModal} className="text-white hover:text-gray-200">
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

                  {/* Business Name (read-only — stored at invoice creation time) */}
                  {selectedInvoice.business_name && (
                    <div className="flex items-center gap-2.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3">
                      <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-xs text-indigo-400 font-medium uppercase tracking-wide leading-none mb-0.5">Business</p>
                        <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                          {selectedInvoice.business_name}
                        </p>
                      </div>
                    </div>
                  )}

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
              <div className="flex gap-2">
                <button onClick={handleDownloadPdf} className="btn flex-1 bg-indigo-500 text-white hover:bg-indigo-600">
                  Download PDF
                </button>
                <button onClick={handleCloseModal} className="btn flex-1">
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
