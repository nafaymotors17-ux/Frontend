import { useState, useEffect } from "react";
import { shipmentAPI } from "../../services/shipmentApiService";
import PhotoManagement from "../Shipment/Edit/PhotoManagement";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";

const PhotoManagementModal = ({ isOpen, onClose, shipmentId, onUpdate }) => {
  const [currentShipment, setCurrentShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch shipment with photos on demand when modal opens
  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchShipmentWithPhotos();
    } else {
      // Reset when modal closes
      setCurrentShipment(null);
    }
  }, [isOpen, shipmentId]);

  const fetchShipmentWithPhotos = async () => {
    try {
      setLoading(true);
      // Fetch shipment with photos included
      const shipment = await shipmentAPI.getShipmentById(shipmentId);
      setCurrentShipment(shipment);
    } catch (error) {
      console.error("Failed to fetch shipment photos:", error);
      toast.error("Failed to load photos");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Handle save photos - update imageCount in parent
  const handleSavePhotos = async (updatedPhotos) => {
    try {
      const photos = Array.isArray(updatedPhotos) ? updatedPhotos : [];
      
      // Update local state
      const updatedShipment = {
        ...currentShipment,
        carId: {
          ...currentShipment.carId,
          images: photos,
          imageCount: photos.length,
        },
      };

      setCurrentShipment(updatedShipment);

      // Notify parent to update the specific row (only imageCount)
      if (onUpdate) {
        onUpdate({
          _id: currentShipment._id,
          carId: {
            imageCount: photos.length,
          },
        });
      }

      toast.success("Photos updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update photos");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              Manage Photos
            </h2>
            {currentShipment && (
              <div className="flex flex-wrap items-center gap-x-3 text-sm text-gray-600 mt-1">
                {currentShipment.vessel?.vesselName && (
                  <span className="font-medium text-gray-800">
                    {currentShipment.vessel.vesselName}
                  </span>
                )}
                {currentShipment.carId?.makeModel && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{currentShipment.carId.makeModel}</span>
                  </>
                )}
                {currentShipment.carId?.chassisNumber && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="font-mono">{currentShipment.carId.chassisNumber}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading photos...</p>
              </div>
            </div>
          ) : currentShipment?._id ? (
            <PhotoManagement
              shipmentId={currentShipment._id}
              currentShipment={currentShipment}
              isEditing={true}
              onSave={handleSavePhotos}
              onCancel={onClose}
              operationLoading={false}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No shipment data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoManagementModal;

