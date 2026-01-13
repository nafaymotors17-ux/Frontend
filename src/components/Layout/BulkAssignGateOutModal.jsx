import { useState } from "react";
import { shipmentAPI } from "../../services/shipmentApiService";
import { toast } from "react-toastify";

const BulkAssignGateOutModal = ({ isOpen, onClose, selectedShipmentIds, onSuccess }) => {
  const [gateOutDate, setGateOutDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!gateOutDate) {
      toast.error("Please select a gate out date");
      return;
    }

    try {
      setLoading(true);
      await shipmentAPI.bulkAssignGateOutDate(selectedShipmentIds, gateOutDate);
      toast.success(`Gate out date assigned to ${selectedShipmentIds.length} shipment(s)`);
      onSuccess?.();
      onClose();
      setGateOutDate("");
    } catch (error) {
      toast.error(error.message || "Failed to assign gate out date");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Assign Gate Out Date to {selectedShipmentIds.length} Shipment(s)
          </h2>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gate Out Date *
            </label>
            <input
              type="date"
              value={gateOutDate}
              onChange={(e) => setGateOutDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <p className="text-sm text-gray-600 mb-4">
            This will update the gate out date and recalculate storage days for all selected shipments.
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!gateOutDate || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Assigning..." : "Assign Date"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkAssignGateOutModal;

