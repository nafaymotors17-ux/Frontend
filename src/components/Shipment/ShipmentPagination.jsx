import { memo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ShipmentPagination = memo(({ pagination, onPageChange, onPageSizeChange, loading }) => {
  // Helper function to get page numbers
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination?.totalPages || 1;
    const current = pagination?.currentPage || 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (current >= totalPages - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const safePagination = pagination || {
    currentPage: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  };

  const pageSizeOptions = [10, 20, 50];

  return (
    <div className="px-4 py-3 border-t border-gray-300 bg-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="text-xs text-gray-700">
          Showing{" "}
          <span className="font-bold">
            {(safePagination.currentPage - 1) * safePagination.pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold">
            {Math.min(
              safePagination.currentPage * safePagination.pageSize,
              safePagination.totalItems
            )}
          </span>{" "}
          of <span className="font-bold">{safePagination.totalItems}</span>
        </div>

        {/* Page Size Selector - DISABLED: Backend cache doesn't support dynamic limits */}
        {/* Uncomment below and fix backend cache key to include limit if you want this feature */}
        {/* {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-700">Show:</label>
            <select
              value={safePagination.pageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                onPageSizeChange(newSize);
              }}
              disabled={loading}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )} */}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() =>
            onPageChange && onPageChange(safePagination.currentPage - 1)
          }
          disabled={!safePagination.hasPrev || loading}
          className={`flex items-center gap-1 px-3 py-2 rounded text-xs border transition-colors ${
            safePagination.hasPrev && !loading
              ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <FaChevronLeft size={10} />
          Prev
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === "number" && onPageChange && onPageChange(page)
            }
            disabled={typeof page !== "number" || loading}
            className={`min-w-[32px] px-2 py-2 rounded text-xs font-medium border transition-colors ${
              page === safePagination.currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : typeof page === "number" && !loading
                ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                : "border-transparent text-gray-500 cursor-default"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            onPageChange && onPageChange(safePagination.currentPage + 1)
          }
          disabled={!safePagination.hasNext || loading}
          className={`flex items-center gap-1 px-3 py-2 rounded text-xs border transition-colors ${
            safePagination.hasNext && !loading
              ? "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          Next
          <FaChevronRight size={10} />
        </button>
      </div>
    </div>
  );
});

ShipmentPagination.displayName = "ShipmentPagination";

export default ShipmentPagination;

