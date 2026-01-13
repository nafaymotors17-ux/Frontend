import { memo } from "react";
import { useState } from "react";
import Select from "react-select";

function ShipmentModal({ onClose, onSave, customerList }) {
  const customers = customerList.length ? customerList : [];
  const [shipment, setShipment] = useState({
    gateInDate: "",
    gateOutDate: "",
    userId: "",
    customerId: {},
    name: "",
    yard: "",
    chassisNo: "",
    carName: "",
    remarks: "",
    exportStatus: "pending",
  });

  const [isSaving, setIsSaving] = useState(false);

  // --- Select Configuration ---
  const customerOptions = [
    ...(customers || []).map((c) => ({
      value: c.userId,
      label: (
        <div
          className="flex justify-between items-center"
          title={`${c.name} (${c.userId})`}
        >
          <span className="truncate font-medium">{c.name}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-2">
            {c.userId}
          </span>
        </div>
      ),
      labelText: `${c.name} ${c.userId}`,
      original: c,
    })),
  ];

  // Simple select styles
  const selectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "38px",
      borderRadius: "0.375rem",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#9ca3af" },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
    }),
    menu: (base) => ({ ...base, zIndex: 50 }),
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "yard" && !["60", "81", ""].includes(value)) return;

    // For all text inputs, check if value is only spaces
    if (typeof value === "string" && value.trim() === "" && value !== "") {
      return;
    }

    setShipment((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (opt) => {
    const selected = opt?.original;
    setShipment((prev) => ({
      ...prev,
      userId: opt?.value || "",
      name: selected?.name || "",
      customerId: selected ?? {},
    }));
  };

  // --- Validation and Data Preparation ---
  const validateForm = () => {
    const requiredFields = {
      gateInDate: "Gate In Date",
      userId: "Customer",
      chassisNo: "Chassis No",
    };

    for (const [field, fieldName] of Object.entries(requiredFields)) {
      const value = shipment[field];
      if (!value || value.toString().trim() === "") {
        alert(`Please fill in ${fieldName}.`);
        return false;
      }
    }

    return true;
  };

  const prepareDataForBackend = () => {
    const cleanData = { ...shipment };

    // List of all text fields that should not contain only spaces
    const textFields = ["name", "chassisNo", "carName", "remarks"];

    // Clean all text fields - convert "space-only" values to empty strings
    textFields.forEach((field) => {
      if (cleanData[field] && typeof cleanData[field] === "string") {
        if (cleanData[field].trim() === "") {
          cleanData[field] = "";
        }
      }
    });

    // For optional fields, convert empty strings to null
    const optionalFields = ["carName", "remarks"];
    optionalFields.forEach((field) => {
      if (cleanData[field] === "") {
        cleanData[field] = null;
      }
    });

    // Handle date fields - convert empty strings to null
    if (cleanData.gateInDate === "") cleanData.gateInDate = null;
    if (cleanData.gateOutDate === "") cleanData.gateOutDate = null;

    // Remove customerId if no customer selected
    if (!cleanData.userId) {
      cleanData.customerId = {};
    }

    return cleanData;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const cleanData = prepareDataForBackend();
      console.log("Sending data to backend:", cleanData);
      await onSave(cleanData, "detailsOnly");
      onClose();
    } catch (err) {
      console.error("Error saving shipment:", err);
      alert("Error saving shipment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Simple CSS classes
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const textareaClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-y";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Add New Shipment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Form Body - Simple 2-column layout */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer - Full Width */}
            <div className="md:col-span-2">
              <label className={labelClass}>
                Customer <span className="text-red-500">*</span>
              </label>
              <Select
                options={customerOptions}
                onChange={handleCustomerChange}
                styles={selectStyles}
                placeholder="Select Customer..."
                isClearable
                isSearchable
                formatOptionLabel={(option) => option.label}
                getOptionLabel={(option) => option.labelText || option.label}
                getOptionValue={(option) => option.value}
              />
            </div>

            {/* Gate In Date */}
            <div>
              <label className={labelClass}>
                Gate In Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="gateInDate"
                value={shipment.gateInDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Gate Out Date */}
            <div>
              <label className={labelClass}>Gate Out Date</label>
              <input
                type="date"
                name="gateOutDate"
                value={shipment.gateOutDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Yard */}
            <div>
              <label className={labelClass}>Yard</label>
              <select
                name="yard"
                value={shipment.yard}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Yard</option>
                <option value="60">60</option>
                <option value="81">81</option>
              </select>
            </div>

            {/* Export Status */}
            <div>
              <label className={labelClass}>Export Status</label>
              <select
                name="exportStatus"
                value={shipment.exportStatus}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="unshipped">Unshipped</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Chassis No */}
            <div>
              <label className={labelClass}>
                Chassis No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="chassisNo"
                placeholder="ABCD-123456"
                value={shipment.chassisNo}
                onChange={handleChange}
                className={inputClass}
                required
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    setShipment((prev) => ({
                      ...prev,
                      chassisNo: e.target.value.toUpperCase(),
                    }));
                  }
                }}
              />
            </div>

            {/* Make / Model */}
            <div>
              <label className={labelClass}>Make / Model</label>
              <input
                type="text"
                name="carName"
                placeholder="Toyota Camry"
                value={shipment.carName}
                onChange={handleChange}
                className={inputClass}
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    setShipment((prev) => ({
                      ...prev,
                      carName: e.target.value,
                    }));
                  }
                }}
              />
            </div>

            {/* Remarks - Full Width */}
            <div className="md:col-span-2">
              <label className={labelClass}>Remarks</label>
              <textarea
                name="remarks"
                placeholder="Enter remarks..."
                value={shipment.remarks}
                onChange={handleChange}
                className={textareaClass}
                rows="3"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {shipment.remarks?.length || 0}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? "Saving..." : "Create Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ShipmentModal);
