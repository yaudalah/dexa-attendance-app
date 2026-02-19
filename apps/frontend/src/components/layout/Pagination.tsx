interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  limit,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  return (
    <div className="flex justify-between items-center mt-4 px-4 py-3 border-t border-slate-700">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm">
          Showing {startItem} - {endItem} of {totalItems}
        </span>

        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="bg-slate-700 text-white rounded px-2 py-1 text-sm outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side */}
      <div className="flex gap-1">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
        >
          First
        </button>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-3 py-1 text-sm text-slate-400">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
        >
          Next
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded bg-slate-700 disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  );
}
