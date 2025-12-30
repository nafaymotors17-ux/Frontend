import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const ShipmentDetailsForm = ({
  currentShipment,
  isEditing,
  onSave,
  onCancel,
  operationLoading,
}) => {
  const [formData, setFormData] = useState({
    jobNumber: "",
    gateInDate: "",
    gateOutDate: "",
    vesselName: "",
    carName: "",
    yard: "",
    chassisNumber: "",
    // glNumber: "",
    pod: "",
    exportStatus: "pending",
    remarks: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when currentShipment loads
  useEffect(() => {
    if (!currentShipment) return;

    const formatDate = (date) => {
      if (!date) return "";
      const d = new Date(date);
      return d.toISOString().split("T")[0];
    };

    const initialFormData = {
      jobNumber: currentShipment.jobNumber || "",
      gateInDate: formatDate(currentShipment.gateInDate),
      gateOutDate: formatDate(currentShipment.gateOutDate),
      vesselName: currentShipment.vesselName || "",
      carName:
        currentShipment.carId?.makeModel || currentShipment.carId?.name || "",
      yard: currentShipment.yard || "",
      chassisNumber:
        currentShipment.carId?.chassisNumber ||
        currentShipment.chassisNumber ||
        "",
      // glNumber: currentShipment.glNumber || "",
      pod: currentShipment.pod || "",
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

  const handleSave = async () => {
    // Validation
    const requiredFields = ["gateInDate", "chassisNumber", "exportStatus"];

    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field].trim() === ""
    );

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

    setFormData({
      jobNumber: currentShipment.jobNumber || "",
      gateInDate: formatDate(currentShipment.gateInDate),
      gateOutDate: formatDate(currentShipment.gateOutDate),
      vesselName: currentShipment.vesselName || "",
      carName:
        currentShipment.carId?.makeModel || currentShipment.carId?.name || "",
      yard: currentShipment.yard || "",
      chassisNumber:
        currentShipment.carId?.chassisNumber ||
        currentShipment.chassisNumber ||
        "",
      // glNumber: currentShipment.glNumber || "",
      pod: currentShipment.pod || "",
      exportStatus: currentShipment.exportStatus || "pending",
      remarks: currentShipment.remarks || "",
    });
    setHasChanges(false);
    onCancel();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Shipment Details
            </h2>
            <p className="text-sm text-gray-600">Update shipment information</p>
          </div>
          {isEditing && hasChanges && (
            <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form fields - same as before */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="jobNumber"
              value={formData.jobNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter job number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gate In Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="gateInDate"
              value={formData.gateInDate}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gate Out Date
            </label>
            <input
              type="date"
              name="gateOutDate"
              value={formData.gateOutDate}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vessel <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vesselName"
              value={formData.vesselName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Vessel name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Name / Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="carName"
              value={formData.carName}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Car model"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yard <span className="text-red-500">*</span>
            </label>
            <select
              name="yard"
              value={formData.yard}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Yard</option>
              <option value="60">60</option>
              <option value="81">81</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chassis No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Chassis number"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GL Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="glNumber"
              value={formData.glNumber}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="GL number"
            />
          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              POD <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pod"
              value={formData.pod}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Port of discharge"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Status <span className="text-red-500">*</span>
            </label>
            <select
              name="exportStatus"
              value={formData.exportStatus}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="unshipped">Unshipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              disabled={!isEditing}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              placeholder="Enter any additional remarks or notes"
            />
          </div>
        </div>
        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={operationLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={operationLoading || !hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {operationLoading ? "Saving..." : "Save Details"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ShipmentDetailsForm;
