// src/components/users/UserFilters.jsx
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const UserFilters = ({
  filters,
  onFilterChange,
  onApplyFilters,
  loading = false,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.searchTerm || "");

  const handleSearch = () => {
    onFilterChange({ ...filters, searchTerm: localSearch });
    onApplyFilters();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-auto">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Users
          </label>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !localSearch.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
