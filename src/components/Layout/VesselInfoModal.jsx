import { useState, useEffect } from "react";
import { vesselAPI } from "../../services/vesselApiService";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const VesselInfoModal = ({ isOpen, onClose, vessel: vesselProp, vesselId, vesselName, onUpdate }) => {
  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vesselName: "",
    jobNumber: "",
    etd: "",
    shippingLine: "",
    pod: "",
  });

  useEffect(() => {
    if (isOpen) {
      // If vessel object is provided directly, use it (no server fetch needed)
      if (vesselProp) {
        setVessel(vesselProp);
        setFormData({
          vesselName: vesselProp.vesselName || "",
          jobNumber: vesselProp.jobNumber || "",
          etd: vesselProp.etd
            ? new Date(vesselProp.etd).toISOString().split("T")[0]
            : "",
          shippingLine: vesselProp.shippingLine || "",
          pod: vesselProp.pod || "",
        });
        setLoading(false);
      } else if (vesselId || vesselName) {
        // Only fetch from server if vessel object not provided (fallback)
        fetchVesselInfo();
      }
    }
  }, [isOpen, vesselProp, vesselId, vesselName]);

  const fetchVesselInfo = async () => {
    try {
      setLoading(true);
      let vesselData = null;

      // If we have vesselId, fetch by ID
      if (vesselId) {
        try {
          vesselData = await vesselAPI.getVesselById(vesselId);
        } catch (error) {
          console.error("Failed to fetch vessel by ID:", error);
        }
      }

      // If not found by ID and we have vesselName, search for it
      if (!vesselData && vesselName) {
        try {
          const results = await vesselAPI.searchVessels(vesselName, 1);
          if (results && results.length > 0) {
            const exactMatch = results.find(
              (v) => v.vesselName?.toUpperCase() === vesselName.toUpperCase()
            );
            vesselData = exactMatch || results[0];
          }
        } catch (error) {
          console.error("Failed to search vessel:", error);
        }
      }

      if (vesselData) {
        setVessel(vesselData);
        setFormData({
          vesselName: vesselData.vesselName || "",
          jobNumber: vesselData.jobNumber || "",
          etd: vesselData.etd
            ? new Date(vesselData.etd).toISOString().split("T")[0]
            : "",
          shippingLine: vesselData.shippingLine || "",
          pod: vesselData.pod || "",
        });
      } else {
        // If no vessel found but we have vesselName, create form data from it
        if (vesselName) {
          setFormData({
            vesselName: vesselName,
            jobNumber: "",
            etd: "",
            shippingLine: "",
            pod: "",
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load vessel information");
      console.error("Fetch vessel error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!formData.vesselName.trim()) {
      toast.error("Vessel name is required");
      return;
    }

    try {
      setSaving(true);
      let updatedVessel;

      if (vessel?._id) {
        // Update existing vessel
        updatedVessel = await vesselAPI.updateVessel(vessel._id, formData);
        toast.success("Vessel updated successfully");
      } else {
        // Create new vessel
        updatedVessel = await vesselAPI.createVessel(formData);
        toast.success("Vessel created successfully");
      }

      setVessel(updatedVessel);
      setIsEditing(false);
      onUpdate?.(updatedVessel);
    } catch (error) {
      toast.error(error.message || "Failed to save vessel");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
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
    }
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Vessel Information</h2>
          <div className="flex items-center gap-2">
            {!isEditing && vessel?._id && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Edit"
              >
                <FaEdit />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Vessel Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vessel Name *
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.vesselName}
                    onChange={handleInputChange("vesselName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">
                    {formData.vesselName || vesselName || "N/A"}
                  </p>
                )}
              </div>

              {/* Job Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.jobNumber}
                    onChange={handleInputChange("jobNumber")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">
                    {formData.jobNumber || "N/A"}
                  </p>
                )}
              </div>

              {/* Shipping Line */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Line
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.shippingLine}
                    onChange={handleInputChange("shippingLine")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">
                    {formData.shippingLine || "N/A"}
                  </p>
                )}
              </div>

              {/* ETD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ETD (Estimated Time of Departure)
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.etd}
                    onChange={handleInputChange("etd")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">
                    {formData.etd
                      ? new Date(formData.etd).toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
              </div>

              {/* POD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POD (Port of Discharge)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.pod}
                    onChange={handleInputChange("pod")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-3 py-2 bg-gray-50 rounded-md text-gray-800">
                    {formData.pod || "N/A"}
                  </p>
                )}
              </div>

              {/* Legacy vesselName warning */}
              {vesselName && vessel && vessel.vesselName?.toUpperCase() !== vesselName.toUpperCase() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Legacy vessel name from shipment:{" "}
                    <span className="font-mono">{vesselName}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.vesselName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave />
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselInfoModal;
