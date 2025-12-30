import { memo } from "react";
import { useState } from "react";
import Select from "react-select";

function ShipmentModal({ onClose, onSave, customerList }) {
  const customers = customerList.length ? customerList : [];
  const [shipment, setShipment] = useState({
    gateInDate: "",
    gateOutDate: "",
    vessel: "",
    userId: "",
    customerId: {},
    name: "",
    yard: "",
    chassisNo: "",
    // glNumber: "",
    pod: "",
    carName: "",
    jobNumber: "",
    remarks: "",
    exportStatus: "pending",
  });

  const [isSaving, setIsSaving] = useState(false);

  // --- Select Configuration ---
  const customerOptions = [
    ...(customers || []).map((c) => ({
      value: c.userId, // ✅ KEEP THIS
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
    })),
  ];

  // Enhanced responsive select styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.375rem",
      borderColor: "#d1d5db",
      boxShadow: "none",
      "&:hover": { borderColor: "#9ca3af" },
      "@media (max-width: 640px)": {
        minHeight: "44px",
        fontSize: "16px",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "2px 8px",
      "@media (max-width: 640px)": {
        padding: "4px 12px",
      },
    }),
    menu: (base) => ({ ...base, zIndex: 50 }),
  };

  // --- Input Sanitization Functions ---
  const sanitizeInput = (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    // If after trimming we get empty string, return empty string (not spaces)
    return trimmed === "" ? "" : value; // Return original value if not empty after trim
  };

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "yard" && !["60", "81", ""].includes(value)) return;

    // For all text inputs, check if value is only spaces
    if (typeof value === "string" && value.trim() === "" && value !== "") {
      // If value contains only spaces, don't update the state
      return;
    }

    setShipment((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (opt) => {
    const selected = customers.find(
      (c) => c.userId.toString() === opt?.value?.toString()
    );
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
      // Check if value is empty, null, undefined, or contains only spaces
      if (!value || value.toString().trim() === "") {
        alert(`Please fill in ${fieldName}.`);
        return false;
      }
    }

    return true;
  };

  const prepareDataForBackend = () => {
    // Create a clean copy of the shipment data
    const cleanData = { ...shipment };

    // List of all text fields that should not contain only spaces
    const textFields = [
      "vessel",
      "name",
      "chassisNo",
      // "glNumber",
      "pod",
      "carName",
      "jobNumber",
      "remarks",
    ];

    // Clean all text fields - convert "space-only" values to empty strings
    textFields.forEach((field) => {
      if (cleanData[field] && typeof cleanData[field] === "string") {
        if (cleanData[field].trim() === "") {
          cleanData[field] = ""; // Convert space-only values to empty string
        }
      }
    });

    // For optional fields, convert empty strings to null
    const optionalFields = [
      "vessel",
      // "glNumber",
      "pod",
      "carName",
      "jobNumber",
      "remarks",
    ];
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
    // Validate required fields
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

  // Responsive CSS classes
  const labelClass =
    "block text-sm font-medium text-gray-700 mb-0.5 sm:text-sm";
  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm";
  const textareaClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm min-h-[100px] resize-y";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header - Responsive padding */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-lg">
            Add New Shipment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        {/* Form Body - Responsive Grid */}
        <div
          className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3
        "
        >
          {/* Row 1: Customer (Full Width) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>
              Customer <span className="text-red-500">*</span>
            </label>
            <Select
              options={customerOptions}
              onChange={handleCustomerChange}
              styles={selectStyles}
              placeholder="Select Customer..."
              isClearable
            />
          </div>

          {/* Row 2: Dates & Yard */}
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
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Yard</label>
            <select
              name="yard"
              value={shipment.yard}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select...</option>
              <option value="60">60</option>
              <option value="81">81</option>
            </select>
          </div>

          {/* Row 3: Vessel Info */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Vessel Name</label>
            <input
              type="text"
              name="vessel"
              placeholder="e.g. MAERSK KINLOSS"
              value={shipment.vessel}
              onChange={handleChange}
              className={inputClass}
              onBlur={(e) => {
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    vessel: e.target.value.toUpperCase(),
                  }));
                }
              }}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
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

          {/* Row 4: Cargo Details */}
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
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    chassisNo: e.target.value.toUpperCase(),
                  }));
                }
              }}
            />
          </div>
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
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    carName: e.target.value,
                  }));
                }
              }}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Job Number</label>
            <input
              type="text"
              name="jobNumber"
              placeholder="Job #"
              value={shipment.jobNumber}
              onChange={handleChange}
              className={inputClass}
              onBlur={(e) => {
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    jobNumber: e.target.value,
                  }));
                }
              }}
            />
          </div>

          {/* Row 5: GL & POD */}
          {/* <div className="sm:col-span-2 lg:col-span-1">
            <label className={labelClass}>Job Number</label>
            <input
              type="text"
              name="glNumber"
              placeholder="GL #"
              value={shipment.glNumber}
              onChange={handleChange}
              className={inputClass}
              onBlur={(e) => {
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    glNumber: e.target.value,
                  }));
                }
              }}
            />
          </div> */}
          <div className="sm:col-span-2">
            <label className={labelClass}>Port of Discharge (POD)</label>
            <input
              type="text"
              name="pod"
              placeholder="Destination Port"
              value={shipment.pod}
              onChange={handleChange}
              className={inputClass}
              onBlur={(e) => {
                // Only update if value is not just spaces
                if (e.target.value.trim() !== "") {
                  setShipment((prev) => ({
                    ...prev,
                    pod: e.target.value.toUpperCase(),
                  }));
                }
              }}
            />
          </div>

          {/* Row 6: Remarks (Textarea - Full Width with Japanese Support) */}

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Remarks</label>
            <textarea
              name="remarks"
              placeholder="備考を入力してください..."
              value={shipment.remarks}
              onChange={handleChange}
              className={textareaClass}
              rows="4"
              lang="ja"
              dir="auto"
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              <p
                className={`text-xs ${
                  shipment.remarks?.length > 450
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {shipment.remarks?.length || 0}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Responsive Actions */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="order-2 sm:order-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="order-1 sm:order-2 px-2 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {isSaving ? "Saving..." : "Create Shipment"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default memo(ShipmentModal);
