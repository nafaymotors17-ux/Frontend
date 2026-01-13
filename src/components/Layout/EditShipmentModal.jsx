import { useState, useEffect } from "react";
import { toast } from "sonner";
import { shipmentAPI } from "../../services/shipmentApiService";
import ShipmentDetailsForm from "../Shipment/Edit/ShipmentDetailsForm";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

const EditShipmentModal = ({ isOpen, onClose, shipment, onUpdate }) => {
  const customerList = useSelector((state) => state.users.dropdownUsers || []);
  const [currentShipment, setCurrentShipment] = useState(shipment);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (shipment) setCurrentShipment(shipment);
  }, [shipment]);

  const handleSave = async (formData) => {
    try {
      setLoading(true);

      // Simplify data: extract ID if clientId is an object
      const clientId =
        currentShipment.clientId?._id || currentShipment.clientId;

      const payload = {
        ...formData,
        gateInDate: new Date(formData.gateInDate).toISOString(),
        gateOutDate: formData.gateOutDate
          ? new Date(formData.gateOutDate).toISOString()
          : null,
        clientId: formData.clientId || clientId,
      };

      const updatedData = await shipmentAPI.updateShipment(
        currentShipment._id,
        payload
      );

      // Merge and notify parent
      const merged = { ...currentShipment, ...updatedData };
      setCurrentShipment(merged);
      if (onUpdate) onUpdate(merged);

      toast.success("Shipment updated");
      onClose();
    } catch (error) {
      toast.error(error.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Edit Shipment</h2>
            <p className="text-xs text-gray-500 font-mono">
              {currentShipment?.carId?.chassisNumber || "Update details below"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Compact Body */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {currentShipment ? (
            <ShipmentDetailsForm
              currentShipment={currentShipment}
              isEditing={true}
              onSave={handleSave}
              onCancel={onClose}
              operationLoading={loading}
              customerList={customerList}
            />
          ) : (
            <div className="py-10 text-center animate-pulse text-gray-400">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditShipmentModal;
