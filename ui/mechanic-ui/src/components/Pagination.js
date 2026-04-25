export default function Pagination({
  page,
  total,
  pageSize,
  onPageChange,
}) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex justify-between items-center mt-4">

      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="btn"
      >
        Prev
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="btn"
      >
        Next
      </button>
    </div>
  );
}