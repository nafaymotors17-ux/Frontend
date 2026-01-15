import { useState, useEffect } from "react";
import { shipmentAPI } from "../../services/shipmentApiService";
import PhotoManagement from "../Shipment/Edit/PhotoManagement";
import PhotosModal from "../Customer/PhotosModal";
import {
  downloadShipmentPhotos,
  downloadZipFile,
} from "../../utils/photoDownload";
import { FaTimes, FaEye, FaDownload, FaFileArchive } from "react-icons/fa";
import { toast } from "sonner";

const PhotoManagementModal = ({ isOpen, onClose, shipmentId, onUpdate }) => {
  const [currentShipment, setCurrentShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photosViewModalOpen, setPhotosViewModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!currentShipment?._id) return;

    setDownloading(true);
    try {
      const fileName = currentShipment?.carId?.chassisNumber
        ? `${currentShipment.carId.chassisNumber}_photos.zip`
        : `photos_${currentShipment._id}.zip`;

      await downloadShipmentPhotos(currentShipment._id, fileName);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!currentShipment?._id || !currentShipment?.carId?.zipFileKey) {
      toast.error("ZIP file not available");
      return;
    }

    setDownloading(true);
    try {
      const fileName = currentShipment?.carId?.chassisNumber
        ? `${currentShipment.carId.chassisNumber}_photos.zip`
        : `photos_${currentShipment._id}.zip`;

      await downloadZipFile(
        currentShipment._id,
        currentShipment.carId.zipFileKey,
        fileName
      );
    } catch (error) {
      console.error("ZIP download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden mx-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Manage Photos</h2>
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
                    <span className="font-mono">
                      {currentShipment.carId.chassisNumber}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentShipment && (
              <>
                {(currentShipment.carId?.images?.length > 0 ||
                  currentShipment.carId?.zipFileKey) && (
                  <>
                    <button
                      onClick={() => setPhotosViewModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      title="View and download photos"
                    >
                      <FaEye />
                      <span>View</span>
                    </button>
                    {currentShipment.carId?.zipFileKey && (
                      <button
                        onClick={handleDownloadZip}
                        disabled={downloading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm font-medium"
                        title="Download ZIP file"
                      >
                        <FaFileArchive />
                        <span>Download ZIP</span>
                      </button>
                    )}
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors text-sm font-medium"
                      title="Download all photos as ZIP"
                    >
                      <FaDownload />
                      <span>Download</span>
                    </button>
                  </>
                )}
                {currentShipment.carId?.zipFileKey && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 border border-green-300 rounded-lg">
                    <FaFileArchive className="text-green-700 text-xs" />
                    <span className="text-xs font-semibold text-green-700">
                      ZIP Available
                    </span>
                  </div>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
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

      {/* Photos View Modal (View/Download) */}
      <PhotosModal
        isOpen={photosViewModalOpen}
        onClose={() => setPhotosViewModalOpen(false)}
        shipmentId={currentShipment?._id}
        shipmentData={currentShipment}
        isAdmin={true}
      />
    </div>
  );
};

export default PhotoManagementModal;
