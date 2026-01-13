import { useState, useEffect } from "react";
import { vesselAPI } from "../../services/vesselApiService";
import { shipmentAPI } from "../../services/shipmentApiService";
import { toast } from "react-toastify";

const BulkAssignVesselModal = ({
  isOpen,
  onClose,
  selectedShipmentIds,
  onSuccess,
}) => {
  const [vessels, setVessels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newVessel, setNewVessel] = useState({
    vesselName: "",
    jobNumber: "",
    etd: "",
    shippingLine: "",
    pod: "",
  });
  const [creatingVessel, setCreatingVessel] = useState(false);

  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        searchVessels();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (isOpen && !searchQuery.trim()) {
      setVessels([]);
    }
  }, [searchQuery, isOpen]);

  const searchVessels = async () => {
    if (!searchQuery.trim()) {
      setVessels([]);
      return;
    }

    try {
      setSearching(true);
      const results = await vesselAPI.searchVessels(searchQuery, 20);
      setVessels(results);
    } catch (error) {
      toast.error(error.message || "Failed to search vessels");
      setVessels([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateVessel = async () => {
    if (!newVessel.vesselName.trim()) {
      toast.error("Vessel name is required");
      return;
    }

    try {
      setCreatingVessel(true);
      // Only send fields that have values
      const vesselData = {
        vesselName: newVessel.vesselName.trim(),
        ...(newVessel.jobNumber.trim() && {
          jobNumber: newVessel.jobNumber.trim(),
        }),
        ...(newVessel.etd && { etd: newVessel.etd }),
        ...(newVessel.shippingLine.trim() && {
          shippingLine: newVessel.shippingLine.trim(),
        }),
        ...(newVessel.pod.trim() && { pod: newVessel.pod.trim() }),
      };
      const created = await vesselAPI.createVessel(vesselData);
      toast.success("Vessel created successfully");
      setSelectedVessel(created);
      setShowCreateForm(false);
      setNewVessel({
        vesselName: "",
        jobNumber: "",
        etd: "",
        shippingLine: "",
        pod: "",
      });
      // Add to vessels list
      setVessels([created, ...vessels]);
    } catch (error) {
      toast.error(error.message || "Failed to create vessel");
    } finally {
      setCreatingVessel(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVessel) {
      toast.error("Please select a vessel");
      return;
    }

    if (!selectedShipmentIds || selectedShipmentIds.length === 0) {
      toast.error("Please select at least one shipment");
      return;
    }

    try {
      setLoading(true);
      // Ensure vesselId is a string
      const vesselId = selectedVessel._id?.toString() || selectedVessel._id;
      // Use vesselAPI for consistency (it calls the shipment API internally)
      await vesselAPI.assignVesselToShipments(selectedShipmentIds, vesselId);
      toast.success(
        `Vessel assigned to ${selectedShipmentIds.length} shipment(s)`
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Assign vessel error:", error);
      toast.error(error.message || "Failed to assign vessel");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Assign Vessel to {selectedShipmentIds.length} Shipment(s)
          </h2>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {!showCreateForm ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Vessel
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type vessel name, job number, or shipping line..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searching && (
                  <p className="text-xs text-gray-500 mt-1">Searching...</p>
                )}
              </div>

              {vessels.length > 0 && (
                <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                  {vessels.map((vessel) => (
                    <div
                      key={vessel._id}
                      onClick={() => setSelectedVessel(vessel)}
                      className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 ${
                        selectedVessel?._id === vessel._id ? "bg-blue-100" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {vessel.vesselName}
                      </div>
                      {vessel.jobNumber && (
                        <div className="text-sm text-gray-600">
                          Job: {vessel.jobNumber}
                        </div>
                      )}
                      {vessel.shippingLine && (
                        <div className="text-sm text-gray-600">
                          Line: {vessel.shippingLine}
                        </div>
                      )}
                      {vessel.etd && (
                        <div className="text-sm text-gray-600">
                          ETD: {new Date(vessel.etd).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedVessel && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="font-medium text-blue-800">
                    Selected: {selectedVessel.vesselName}
                  </div>
                  {selectedVessel.jobNumber && (
                    <div className="text-sm text-blue-600">
                      Job: {selectedVessel.jobNumber}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowCreateForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                + Create New Vessel
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-800">Create New Vessel</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vessel Name *
                </label>
                <input
                  type="text"
                  value={newVessel.vesselName}
                  onChange={(e) =>
                    setNewVessel({ ...newVessel, vesselName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Number
                </label>
                <input
                  type="text"
                  value={newVessel.jobNumber}
                  onChange={(e) =>
                    setNewVessel({ ...newVessel, jobNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ETD (Estimated Time of Departure)
                </label>
                <input
                  type="date"
                  value={newVessel.etd}
                  onChange={(e) =>
                    setNewVessel({ ...newVessel, etd: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Line
                </label>
                <input
                  type="text"
                  value={newVessel.shippingLine}
                  onChange={(e) =>
                    setNewVessel({ ...newVessel, shippingLine: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POD (Port of Discharge)
                </label>
                <input
                  type="text"
                  value={newVessel.pod}
                  onChange={(e) =>
                    setNewVessel({ ...newVessel, pod: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleCreateVessel}
                disabled={creatingVessel || !newVessel.vesselName.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingVessel ? "Creating..." : "Create Vessel"}
              </button>

              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewVessel({
                    vesselName: "",
                    jobNumber: "",
                    etd: "",
                    shippingLine: "",
                    pod: "",
                  });
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          {!showCreateForm && (
            <button
              onClick={handleAssign}
              disabled={!selectedVessel || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Assigning..." : "Assign Vessel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkAssignVesselModal;
