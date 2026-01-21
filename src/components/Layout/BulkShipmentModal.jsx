import { memo, useState } from "react";
import Select from "react-select";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { shipmentAPI } from "../../services/shipmentApiService";

function BulkShipmentModal({ onClose, customerList }) {
  const customers = customerList.length ? customerList : [];
  
  // Initialize with one empty shipment row
  const [shipments, setShipments] = useState([
    {
      id: Date.now(),
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
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [creationErrors, setCreationErrors] = useState([]);

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
  const handleChange = (id, e) => {
    const { name, value } = e.target;

    if (name === "yard" && !["60", "81", ""].includes(value)) return;

    // For all text inputs, check if value is only spaces
    if (typeof value === "string" && value.trim() === "" && value !== "") {
      return;
    }

    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id ? { ...shipment, [name]: value } : shipment
      )
    );
    
    // Clear error for this field
    if (errors[id] && errors[id][name]) {
      setErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [name]: null },
      }));
    }
  };

  const handleCustomerChange = (id, opt) => {
    const selected = opt?.original;
    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === id
          ? {
              ...shipment,
              userId: opt?.value || "",
              name: selected?.name || "",
              customerId: selected ?? {},
            }
          : shipment
      )
    );
    
    // Clear error for this field
    if (errors[id] && errors[id].userId) {
      setErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], userId: null },
      }));
    }
  };

  const addRow = () => {
    setShipments((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
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
      },
    ]);
  };

  const removeRow = (id) => {
    if (shipments.length === 1) {
      toast.warning("You must have at least one row.");
      return;
    }
    setShipments((prev) => prev.filter((shipment) => shipment.id !== id));
    // Remove errors for this row
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  // --- Validation and Data Preparation ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    shipments.forEach((shipment, index) => {
      const rowErrors = {};
      const requiredFields = {
        gateInDate: "Gate In Date",
        userId: "Customer",
        chassisNo: "Chassis No",
      };

      for (const [field, fieldName] of Object.entries(requiredFields)) {
        const value = shipment[field];
        if (!value || value.toString().trim() === "") {
          rowErrors[field] = `${fieldName} is required`;
          isValid = false;
        }
      }

      // Validate gate out date is not before gate in date
      if (shipment.gateInDate && shipment.gateOutDate) {
        const gateIn = new Date(shipment.gateInDate);
        const gateOut = new Date(shipment.gateOutDate);
        if (gateOut < gateIn) {
          rowErrors.gateOutDate = "Gate out date cannot be earlier than gate in date";
          isValid = false;
        }
      }

      if (Object.keys(rowErrors).length > 0) {
        newErrors[shipment.id] = rowErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const prepareDataForBackend = (shipment) => {
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

    // Remove the id field before sending
    const { id, ...dataToSend } = cleanData;
    return dataToSend;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        const element = document.getElementById(`row-${firstErrorId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSaving(true);
    try {
      const shipmentsToSave = shipments.map(prepareDataForBackend);
      
      // Step 1: Validate chassis uniqueness
      const chassisNumbers = shipmentsToSave
        .map((s) => s.chassisNo)
        .filter(Boolean)
        .map((chassis) => chassis.trim().toUpperCase());

      const validationResult = await shipmentAPI.validateBulkShipments(chassisNumbers);

      if (!validationResult.data.isValid) {
        // Show validation errors inside modal
        const validationErrorsList = validationResult.data.errors || [];
        setValidationErrors(validationErrorsList);
        setCreationErrors([]); // Clear creation errors

        // Mark rows with errors
        const newErrors = {};
        validationErrorsList.forEach((error) => {
          const shipmentIndex = error.index - 1;
          if (shipments[shipmentIndex]) {
            newErrors[shipments[shipmentIndex].id] = {
              chassisNo: error.error,
            };
          }
        });
        setErrors(newErrors);

        // Scroll to first error
        if (validationErrorsList.length > 0) {
          const firstError = validationErrorsList[0];
          const shipmentIndex = firstError.index - 1;
          if (shipments[shipmentIndex]) {
            const element = document.getElementById(`row-${shipments[shipmentIndex].id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }

        setIsSaving(false);
        return; // Don't close modal, show errors inside
      }

      // Clear validation errors if validation passes
      setValidationErrors([]);

      // Step 2: Create shipments (validation passed)
      const result = await shipmentAPI.createBulkShipments(shipmentsToSave);

      const { successful, failed, successCount, failureCount } = result.data;

      if (failed.length > 0) {
        // Show creation errors inside modal
        setCreationErrors(failed);
        setValidationErrors([]); // Clear validation errors

        // Mark rows with errors
        const newErrors = {};
        failed.forEach((error) => {
          const shipmentIndex = error.index - 1;
          if (shipments[shipmentIndex]) {
            newErrors[shipments[shipmentIndex].id] = {
              general: error.error,
            };
          }
        });
        setErrors(newErrors);

        // Scroll to first error
        if (failed.length > 0) {
          const firstError = failed[0];
          const shipmentIndex = firstError.index - 1;
          if (shipments[shipmentIndex]) {
            const element = document.getElementById(`row-${shipments[shipmentIndex].id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }

        // Don't close modal, show errors inside
        setIsSaving(false);
        return;
      } else {
        // All succeeded - show success and close modal
        toast.success(`Successfully created ${successCount} shipment(s)!`);
        setValidationErrors([]);
        setCreationErrors([]);
        setErrors({});
        onClose(true); // Pass true to indicate success and trigger refresh
      }
    } catch (err) {
      console.error("Error saving shipments:", err);
      // Show error inside modal
      setCreationErrors([{
        index: 0,
        chassisNo: "N/A",
        error: err.message || "Error saving shipments. Please try again.",
      }]);
      setValidationErrors([]);
      setIsSaving(false);
      // Don't close modal on error
    }
  };


  // Compact CSS classes
  const compactLabelClass = "block text-xs font-medium text-gray-700 mb-0.5";
  const compactInputClass =
    "w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const compactErrorInputClass =
    "w-full rounded border border-red-300 px-2 py-1 text-xs focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";
  const compactSelectStyles = {
    ...selectStyles,
    control: (base) => ({
      ...base,
      minHeight: "28px",
      fontSize: "12px",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
    }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden mx-auto h-[98vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Add Multiple Shipments</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Add as many shipments as needed, then save all at once
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600">
              Total: <span className="font-semibold">{shipments.length}</span>
            </span>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none p-1"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Error Display Section */}
        {(validationErrors.length > 0 || creationErrors.length > 0) && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  {validationErrors.length > 0 ? "Validation Errors" : "Creation Errors"}
                </h3>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {(validationErrors.length > 0 ? validationErrors : creationErrors).map((error, idx) => (
                    <div key={idx} className="text-xs text-red-700">
                      <span className="font-medium">Row {error.index}</span>
                      {error.chassisNo && error.chassisNo !== "N/A" && (
                        <span className="ml-1">({error.chassisNo})</span>
                      )}
                      : <span className="ml-1">{error.error}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setValidationErrors([]);
                  setCreationErrors([]);
                  setErrors({});
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Form Body - Compact Table-like Layout */}
        <div className="flex-1 overflow-hidden p-3 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left w-8">
                    #
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[180px]">
                    Customer <span className="text-red-500">*</span>
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[120px]">
                    Gate In <span className="text-red-500">*</span>
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[120px]">
                    Gate Out
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[80px]">
                    Yard
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[100px]">
                    Status
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[140px]">
                    Chassis No <span className="text-red-500">*</span>
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[120px]">
                    Make/Model
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-left min-w-[150px]">
                    Remarks
                  </th>
                  <th className="border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-700 text-center w-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((shipment, index) => (
                  <tr
                    key={shipment.id}
                    id={`row-${shipment.id}`}
                    className="bg-white hover:bg-gray-50"
                  >
                    <td className="border border-gray-300 px-2 py-1 text-xs text-center font-medium text-gray-600">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <Select
                        options={customerOptions}
                        onChange={(opt) => handleCustomerChange(shipment.id, opt)}
                        styles={compactSelectStyles}
                        placeholder="Select..."
                        isClearable
                        isSearchable
                        formatOptionLabel={(option) => option.label}
                        getOptionLabel={(option) => option.labelText || option.label}
                        getOptionValue={(option) => option.value}
                        value={
                          shipment.userId
                            ? customerOptions.find((opt) => opt.value === shipment.userId)
                            : null
                        }
                      />
                      {errors[shipment.id]?.userId && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors[shipment.id].userId}
                        </p>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="date"
                        name="gateInDate"
                        value={shipment.gateInDate}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={
                          errors[shipment.id]?.gateInDate
                            ? compactErrorInputClass
                            : compactInputClass
                        }
                        required
                      />
                      {errors[shipment.id]?.gateInDate && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors[shipment.id].gateInDate}
                        </p>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="date"
                        name="gateOutDate"
                        value={shipment.gateOutDate}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={
                          errors[shipment.id]?.gateOutDate
                            ? compactErrorInputClass
                            : compactInputClass
                        }
                      />
                      {errors[shipment.id]?.gateOutDate && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors[shipment.id].gateOutDate}
                        </p>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="yard"
                        value={shipment.yard}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={compactInputClass}
                      >
                        <option value="">-</option>
                        <option value="60">60</option>
                        <option value="81">81</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="exportStatus"
                        value={shipment.exportStatus}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={compactInputClass}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="unshipped">Unshipped</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        name="chassisNo"
                        placeholder="ABCD-123456"
                        value={shipment.chassisNo}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={
                          errors[shipment.id]?.chassisNo
                            ? compactErrorInputClass
                            : compactInputClass
                        }
                        required
                        onBlur={(e) => {
                          if (e.target.value.trim() !== "") {
                            setShipments((prev) =>
                              prev.map((s) =>
                                s.id === shipment.id
                                  ? {
                                      ...s,
                                      chassisNo: e.target.value.toUpperCase(),
                                    }
                                  : s
                              )
                            );
                          }
                        }}
                      />
                      {errors[shipment.id]?.chassisNo && (
                        <p className="text-red-500 text-xs mt-0.5">
                          {errors[shipment.id].chassisNo}
                        </p>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        name="carName"
                        placeholder="Toyota Camry"
                        value={shipment.carName}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={compactInputClass}
                        onBlur={(e) => {
                          if (e.target.value.trim() !== "") {
                            setShipments((prev) =>
                              prev.map((s) =>
                                s.id === shipment.id
                                  ? { ...s, carName: e.target.value }
                                  : s
                              )
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        name="remarks"
                        placeholder="Remarks..."
                        value={shipment.remarks}
                        onChange={(e) => handleChange(shipment.id, e)}
                        className={compactInputClass}
                        maxLength={200}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      {shipments.length > 1 && (
                        <button
                          onClick={() => removeRow(shipment.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Remove this row"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={addRow}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
            >
              <FaPlus className="text-xs" />
              Add Row
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2.5 flex justify-between items-center border-t border-gray-200">
          <div className="text-xs text-gray-600">
            Total: <span className="font-semibold">{shipments.length}</span> shipment(s)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onClose(false)}
              className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSaving
                ? `Saving ${shipments.length}...`
                : `Save All (${shipments.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BulkShipmentModal);
