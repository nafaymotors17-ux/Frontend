// src/components/shipments/ShipmentHeader.jsx
import React from "react";
import { memo } from "react";
import { FaPlus, FaFileExport, FaTrash } from "react-icons/fa";

const ShipmentHeader = ({
  selectedRowsCount,
  onAddShipment,
  onExportCSV,
  onDeleteSelected,
}) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">
          Shipment Management
        </h1>
        <p className="text-gray-600 text-sm">
          Manage and track all shipments in the system
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
          onClick={onAddShipment}
        >
          <FaPlus className="text-xs" />
          Add Shipment
        </button>
        <button
          className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
          onClick={onExportCSV}
        >
          <FaFileExport className="text-xs" />
          Export CSV
        </button>
        {selectedRowsCount > 0 && (
          <button
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors text-sm"
            onClick={onDeleteSelected}
          >
            <FaTrash className="text-xs" />
            Delete Selected ({selectedRowsCount})
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(ShipmentHeader);
