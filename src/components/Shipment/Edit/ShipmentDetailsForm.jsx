import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Select from "react-select";

const ShipmentDetailsForm = ({
  currentShipment,
  isEditing,
  onSave,
  onCancel,
  operationLoading,
  customerList = [],
}) => {
  const [formData, setFormData] = useState({
    gateInDate: "",
    gateOutDate: "",
    clientId: "",
    carName: "",
    yard: "",
    chassisNumber: "",
    exportStatus: "pending",
    remarks: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
const user=JSON.parse(localStorage.getItem("userData"));
  // Customer options
  const customerOptions = [
    ...(customerList || []).map((c) => ({
      value: c._id,
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

  // Initialize form data when currentShipment loads
  useEffect(() => {
    if (!currentShipment) return;

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    };

    const clientId =
      currentShipment.clientId?._id || currentShipment.clientId || "";

    const initialFormData = {
      gateInDate: formatDate(currentShipment.gateInDate),
      gateOutDate: formatDate(currentShipment.gateOutDate),
      clientId: clientId,
      carName:
        currentShipment.carId?.makeModel || currentShipment.carId?.name || "",
      yard: currentShipment.yard || "",
      chassisNumber:
        currentShipment.carId?.chassisNumber ||
        currentShipment.chassisNumber ||
        "",
      exportStatus: currentShipment.exportStatus || "pending",
      remarks: currentShipment.remarks || "",
    };

    setFormData(initialFormData);
    setHasChanges(false);
  }, [currentShipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || value.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setHasChanges(true);
    }
  };

  const handleCustomerChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        clientId: selectedOption.value,
      }));
      setHasChanges(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        clientId: "",
      }));
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    // Validation - Required fields: customer, gateInDate, chassisNumber
    const requiredFields = {
      clientId: "Customer",
      gateInDate: "Gate In Date",
      chassisNumber: "Chassis Number",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([field]) =>
          !formData[field] || formData[field].toString().trim() === ""
      )
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    if (formData.gateOutDate && formData.gateInDate) {
      const gateIn = new Date(formData.gateInDate);
      const gateOut = new Date(formData.gateOutDate);

      if (gateOut < gateIn) {
        toast.error("Gate Out Date cannot be earlier than Gate In Date.");
        return;
      }
    }

    await onSave(formData);
  };

  const handleCancel = () => {
    // Reset form data
    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    };

    const clientId =
      currentShipment.clientId?._id || currentShipment.clientId || "";

    setFormData({
      gateInDate: formatDate(currentShipment.gateInDate),
      gateOutDate: formatDate(currentShipment.gateOutDate),
      clientId: clientId,
      carName:
        currentShipment.carId?.makeModel || currentShipment.carId?.name || "",
      yard: currentShipment.yard || "",
      chassisNumber:
        currentShipment.carId?.chassisNumber ||
        currentShipment.chassisNumber ||
        "",
      exportStatus: currentShipment.exportStatus || "pending",
      remarks: currentShipment.remarks || "",
    });
    setHasChanges(false);
    onCancel();
  };

  return (
    <div className="space-y-6">
      {isEditing && hasChanges && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
          <span className="text-orange-600 text-sm font-medium">
            ⚠️ You have unsaved changes
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer - Full Width */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Customer <span className="text-red-500">*</span>
          </label>
          {isEditing ? (
            <Select
              options={customerOptions}
              value={
                customerOptions.find((c) => c.value === formData.clientId) ||
                null
              }
              onChange={handleCustomerChange}
              isClearable
              isSearchable
              placeholder="Select Customer..."
              formatOptionLabel={(option) => option.label}
              getOptionLabel={(option) => option.labelText || option.label}
              getOptionValue={(option) => option.value}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "38px",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                menu: (base) => ({ ...base, zIndex: 50 }),
              }}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {currentShipment?.clientId?.name || "-"}
              {currentShipment?.clientId?.userId && (
                <span className="ml-2 text-gray-500">
                  ({currentShipment.clientId.userId})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Gate In Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gate In Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="gateInDate"
            value={formData.gateInDate}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Gate Out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Gate Out Date
          </label>
          <input
            type="date"
            name="gateOutDate"
            value={formData.gateOutDate}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
          />
        </div>

        {/* Car Name / Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Make / Model
          </label>
          <input
            type="text"
            name="carName"
            value={formData.carName}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
            placeholder="Toyota Camry"
          />
        </div>

        {/* Yard */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Yard
          </label>
          <select
            name="yard"
            value={formData.yard}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="">Select Yard</option>
            <option value="60">60</option>
            <option value="81">81</option>
          </select>
        </div>

        {/* Chassis No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Chassis No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="chassisNumber"
            value={formData.chassisNumber}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm font-mono"
            placeholder="ABCD-123456"
          />
        </div>

        {/* Export Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Export Status
          </label>
          <select
            name="exportStatus"
            value={formData.exportStatus}
            onChange={handleChange}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="unshipped">Unshipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Remarks
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed resize-none text-sm"
            placeholder="Enter any additional remarks or notes"
          />
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={operationLoading}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        {isEditing && user.role === "admin" && (
          <button
            onClick={handleSave}
            disabled={operationLoading || !hasChanges}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {operationLoading ? "Saving..." : "Save Changes"}
          </button>
        )}
        </div>
      )}
    </div>
  );
};
export default ShipmentDetailsForm;
