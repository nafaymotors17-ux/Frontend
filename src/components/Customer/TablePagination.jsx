// src/components/User/CustomerPagination.jsx
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CustomerPagination = ({ pagination, onPageChange, loading }) => {
  if (pagination.totalPages <= 1) return null;

  const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endItem = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems
  );

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing <span className="font-semibold">{startItem}</span> to{" "}
          <span className="font-semibold">{endItem}</span> of{" "}
          <span className="font-semibold">{pagination.totalItems}</span>{" "}
          shipments
        </div>

        <div className="flex flex-col xs:flex-row items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev || loading}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Previous</span>
            </button>

            <div className="flex items-center gap-0.5 sm:gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.currentPage) <= 1
                )
                .map((page, index, array) => {
                  const showEllipsis =
                    index < array.length - 1 && array[index + 1] - page > 1;
                  return (
                    <React.Fragment key={page}>
                      <button
                        onClick={() => onPageChange(page)}
                        disabled={loading}
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          pagination.currentPage === page
                            ? "bg-blue-600 text-white shadow"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                      {showEllipsis && (
                        <span className="px-1 sm:px-2 text-gray-500 text-xs sm:text-sm">
                          ...
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext || loading}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden xs:inline">Next</span>
              <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPagination;
