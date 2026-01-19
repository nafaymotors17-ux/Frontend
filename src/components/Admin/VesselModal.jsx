// Vessel Modal Component for Create/Edit
import React, { useEffect, useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

const VesselModal = ({ isOpen, onClose, onSubmit, vessel, isEdit, loading }) => {
  const [formData, setFormData] = useState({
    vesselName: "",
    jobNumber: "",
    etd: "",
    shippingLine: "",
    pod: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (vessel) {
        setFormData({
          vesselName: vessel.vesselName || "",
          jobNumber: vessel.jobNumber || "",
          etd: vessel.etd
            ? new Date(vessel.etd).toISOString().split("T")[0]
            : "",
          shippingLine: vessel.shippingLine || "",
          pod: vessel.pod || "",
        });
      } else {
        setFormData({
          vesselName: "",
          jobNumber: "",
          etd: "",
          shippingLine: "",
          pod: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, vessel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.vesselName.trim()) {
      newErrors.vesselName = "Vessel name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Prepare data - only send fields that have values
    const vesselData = {
      vesselName: formData.vesselName.trim(),
    };

    if (formData.jobNumber.trim()) {
      vesselData.jobNumber = formData.jobNumber.trim();
    }
    if (formData.etd) {
      vesselData.etd = formData.etd;
    }
    if (formData.shippingLine.trim()) {
      vesselData.shippingLine = formData.shippingLine.trim();
    }
    if (formData.pod.trim()) {
      vesselData.pod = formData.pod.trim();
    }

    onSubmit(vesselData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-800">
            {isEdit ? "Edit Vessel" : "Add New Vessel"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Vessel Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vessel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vesselName"
                value={formData.vesselName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vesselName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter vessel name"
                required
                disabled={loading}
              />
              {errors.vesselName && (
                <p className="mt-1 text-sm text-red-500">{errors.vesselName}</p>
              )}
            </div>

            {/* Job Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Number
              </label>
              <input
                type="text"
                name="jobNumber"
                value={formData.jobNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job number"
                disabled={loading}
              />
            </div>

            {/* Shipping Line */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shipping Line
              </label>
              <input
                type="text"
                name="shippingLine"
                value={formData.shippingLine}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter shipping line"
                disabled={loading}
              />
            </div>

            {/* ETD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ETD (Estimated Time of Departure)
              </label>
              <input
                type="date"
                name="etd"
                value={formData.etd}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* POD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                POD (Port of Discharge)
              </label>
              <input
                type="text"
                name="pod"
                value={formData.pod}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter port of discharge"
                disabled={loading}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.vesselName.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaSave />
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VesselModal;
