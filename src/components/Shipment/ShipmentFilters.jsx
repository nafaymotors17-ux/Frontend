import React from "react";
import Select from "react-select";
import { memo } from "react";
import {
  FaFilter,
  FaTimes,
  FaPlus,
  FaFileExport,
  FaTrash,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
const ShipmentFilters = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  filterOptions,
  hasFiltersApplied,
  selectedRowsCount,
  onAddShipment,
  onExportCSV,
  onDeleteSelected,
}) => {
  const handleInputChange = (field) => (e) =>
    onFilterChange(field, e.target.value);
  const handleSelectChange = (field) => (option) =>
    onFilterChange(field, option?.value || "");
  let user = null;

  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      user = JSON.parse(storedUser); // parse JSON to object
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const companyOptions = [
    { value: "", label: "Customer" },
    ...(filterOptions || []).map((c) => ({
      value: c._id,
      label: (
        <div
          className="flex justify-between items-center"
          title={`${c.name} (${c.userId})`}
        >
          <span className="truncate font-medium">{c.name}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded ml-2">
            {c.userId}
          </span>
        </div>
      ),
      labelText: `${c.name} ${c.userId}`,
    })),
  ];

  const yardOptions = ["", "60", "81"].map((y) => ({
    value: y,
    label: y || "Yard",
  }));
  const statusOptions = [
    "",
    "pending",
    "shipped",
    "unshipped",
    "cancelled",
  ].map((s) => ({ value: s, label: s || "Status" }));
  const dateTypeOptions = [
    { value: "", label: "Select Date Type" },
    { value: "gateOut", label: "Gate Out Date" },
    { value: "gateIn", label: "Gate In Date" },
  ];

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: 22,
      height: 22,
      padding: 0,
      fontSize: 12,
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#3b82f6" },
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 4px",
      minHeight: 22,
    }),

    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),

    singleValue: (base) => ({
      ...base,
      lineHeight: "20px",
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: 22,
    }),

    dropdownIndicator: (base) => ({
      ...base,
      padding: 2,
    }),

    clearIndicator: (base) => ({
      ...base,
      padding: 2,
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    option: (base, state) => ({
      ...base,
      fontSize: 12,
      padding: "4px 8px",
      backgroundColor: state.isFocused
        ? "#f3f4f6"
        : state.isSelected
        ? "#3b82f6"
        : "white",
      color: state.isSelected ? "white" : "#374151",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
  };

  // const textFields = ["jobNumber", "chassisNumber", "vesselName", "glNumber"];
  const textFields = ["jobNumber", "chassisNumber", "vesselName"];
  const dropdowns = [
    {
      field: "clientId",
      options: companyOptions,
      label: "Customer",
      searchable: true,
    },
    { field: "yard", options: yardOptions, label: "Yard" },
    { field: "exportStatus", options: statusOptions, label: "Status" },
  ];

  return (
    <div className="bg-white border rounded-lg px-4 py-2 space-y-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-sm">
        <h3 className="flex items-center gap-1 text-gray-800 font-semibold">
          <FaFilter className="text-gray-500" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
              {activeFilters} active
            </span>
          )}
        </h3>

        <div className="flex gap-2 flex-wrap">
          {hasFiltersApplied && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-gray-600 border px-2 py-0.5 text-xs rounded hover:bg-gray-50 transition-colors"
            >
              <FaTimes className="text-xs" /> Clear
            </button>
          )}
          <button
            onClick={onApplyFilters}
            className="bg-blue-600 text-white px-3 py-0.5 text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Date Filter */}
        <div className="bg-gray-50 p-2 rounded border flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <FaCalendarAlt className="text-gray-500 text-xs" />
            <span className="text-xs font-medium text-gray-700">
              Date Filter
            </span>
          </div>

          <Select
            options={dateTypeOptions}
            value={
              dateTypeOptions.find((opt) => opt.value === filters.dateType) ||
              dateTypeOptions[0]
            }
            onChange={handleSelectChange("dateType")}
            styles={selectStyles}
            isSearchable={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={handleInputChange("dateFrom")}
              className="w-full px-2 py-1 border rounded text-xs"
            />
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={handleInputChange("dateTo")}
              className="w-full px-2 py-1 border rounded text-xs"
            />
          </div>
        </div>

        {/* Text Inputs */}
        <div className="space-y-1">
          {textFields.map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.replace(/([A-Z])/g, " $1")}
              value={filters[field] || ""}
              onChange={handleInputChange(field)}
              onKeyPress={(e) => e.key === "Enter" && onApplyFilters()}
              className="w-full px-2 py-1 border rounded text-xs"
            />
          ))}
        </div>

        {/* Dropdowns */}
        <div className="space-y-1">
          {dropdowns.map(({ field, options, searchable }) => (
            <Select
              key={field}
              options={options}
              value={
                options.find((o) => o.value === filters[field]) || options[0]
              }
              onChange={handleSelectChange(field)}
              styles={selectStyles}
              isSearchable={searchable || false}
              formatOptionLabel={(option) => option.label}
              getOptionLabel={(option) => option.labelText || option.label}
              getOptionValue={(option) => option.value}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className=" flex flex-col sm:flex-row justify-between items-center gap-3 pt-1 border-t">
        <div className="flex flex-wrap gap-2">
          {user?.role === "admin" && (
            <button
              onClick={onAddShipment}
              className="flex items-center gap-1 bg-blue-600 text-white px-1 rounded text-xs"
            >
              <FaPlus title="Add Shipment" className="text-xs" />
              Add new
            </button>
          )}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            <FaFileExport title="Export excel" className="text-xs" />
            Export
          </button>
        </div>
        {selectedRowsCount > 0 && user?.role === "admin" && (
          <button
            onClick={onDeleteSelected}
            className="flex items-center gap-1 bg-red-600 text-white px-2 py-1.5 rounded text-xs"
          >
            <FaTrash className="text-xs" /> Delete ({selectedRowsCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ShipmentFilters);
