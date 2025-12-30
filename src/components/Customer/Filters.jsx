// src/components/User/CustomerFilters.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FaSearch,
  FaTimes,
  FaFilter,
  FaFileExcel,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaSearchDollar,
} from "react-icons/fa";

const CustomerFilters = ({
  filters,
  stats,
  onSearch,
  onClearFilters,
  onExportExcel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || "",
    status: filters.status || "",
    dateType: filters.dateType || "",
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
  });

  // Track if it's the initial render
  const isInitialMount = useRef(true);
  // Debounce timer reference
  const debounceTimer = useRef(null);

  // Handle search with debouncing
  const performSearch = useCallback(() => {
    const searchFilters = {
      search: localFilters.search.trim(),
      status: localFilters.status,
      ...(localFilters.dateType && {
        dateType: localFilters.dateType,
        dateFrom: localFilters.dateFrom || "",
        dateTo: localFilters.dateTo || "",
      }),
    };
    onSearch(searchFilters);
  }, [localFilters, onSearch]);

  // Auto-search effect with debouncing
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a new timer for debouncing
    const delay = localFilters.search ? 500 : 300; // Shorter delay when clearing
    debounceTimer.current = setTimeout(() => {
      performSearch();
    }, delay);

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localFilters.search, performSearch]);

  // Handle manual search button click (immediate)
  const handleManualSearch = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    performSearch();
  };

  // Handle status, date type, and date changes (auto-search)
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }

    // Don't auto-search on status change if there's no search term
    // unless explicitly needed
    if (
      localFilters.status ||
      localFilters.dateType ||
      localFilters.dateFrom ||
      localFilters.dateTo
    ) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Quicker search for non-text filters
      debounceTimer.current = setTimeout(() => {
        performSearch();
      }, 300);
    }
  }, [
    localFilters.status,
    localFilters.dateType,
    localFilters.dateFrom,
    localFilters.dateTo,
    performSearch,
  ]);

  const handleInputChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = () => {
    setLocalFilters({
      search: "",
      status: "",
      dateType: "",
      dateFrom: "",
      dateTo: "",
    });
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    onClearFilters();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      performSearch();
    }
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.dateFrom || filters.dateTo;

  const dateTypeOptions = [
    { value: "", label: "Filter by Date..." },
    { value: "gateInDate", label: "Gate In Date" },
    { value: "gateOutDate", label: "Gate Out Date" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Shipped", label: "Shipped" },
    { value: "Unshipped", label: "Unshipped" },
    { value: "Pending", label: "Pending" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* --- HEADER: Stats & Main Actions --- */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-sm">
            <FaFilter className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-gray-900 font-bold text-lg leading-tight">
              Shipments
            </h2>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">
                {stats.totalItems}
              </span>{" "}
              total records
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Filters
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>

          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <FaFileExcel className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* --- FILTER BODY --- */}
      <div
        className={`bg-white px-6 py-5 transition-all duration-300 ease-in-out ${
          isExpanded ? "block" : "hidden md:block"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* 1. Search Bar (Span 4) */}
          <div className="md:col-span-4 lg:col-span-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleInputChange("search", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chassis, Vessel, Make, Model..."
                className="w-full pl-5 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-white"
              />
              {/* Search indicator */}
              {localFilters.search && (
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-xs text-gray-400 animate-pulse">
                    Searching...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Status Dropdown (Span 3) */}
          <div className="md:col-span-4 lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Status
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Date Type (Span 3) */}
          <div className="md:col-span-4 lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Date Filter
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaCalendarAlt className="text-gray-400" />
              </div>
              <select
                value={localFilters.dateType}
                onChange={(e) => handleInputChange("dateType", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white cursor-pointer"
              >
                {dateTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Date Range Inputs (Conditional) (Span 5) */}
          {localFilters.dateType && (
            <div className="md:col-span-8 lg:col-span-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={(e) =>
                    handleInputChange("dateFrom", e.target.value)
                  }
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={(e) => handleInputChange("dateTo", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                />
              </div>
            </div>
          )}

          {/* 5. Action Buttons (Search/Clear) (Auto Fill) */}
          <div className="md:col-span-4 lg:col-span-2 flex gap-2">
            {/* <button
              onClick={handleManualSearch}
              className="flex-1 bg-blue-500 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              Search
            </button> */}
            {hasActiveFilters && (
              <button
                onClick={handleClear}
                className="px-4 py-3 rounded-lg self-baseline border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                title="Clear Filters"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
