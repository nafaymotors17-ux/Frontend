// ShipmentDetailModal.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  FaTimes,
  FaDownload,
  FaImages,
  FaShip,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaBuilding,
  FaEye,
  FaFileArchive,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  downloadShipmentPhotos,
  // downloadZipFile, // ZIP functionality commented out
} from "../../utils/photoDownload";

const ShipmentDetailModal = ({
  isOpen,
  onClose,
  shipmentId,
  shipmentData,
  onViewPhotos,
}) => {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isOpen) {
      // Use provided shipmentData if available, otherwise fetch
      if (shipmentData) {
        setShipment(shipmentData);
        setLoading(false);
      } else if (shipmentId) {
        fetchShipmentDetails();
      }
    } else {
      setShipment(null);
      setError(null);
    }
  }, [isOpen, shipmentId, shipmentData]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const freshShipment = await customerShipmentAPI.getShipmentById(
        shipmentId
      );
      setShipment(freshShipment);
    } catch (error) {
      console.error("Error fetching shipment details:", error);
      setError(error.message || "Failed to load shipment details");
      toast.error(error.message || "Failed to load shipment details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
    };
    return statusColors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-900">Shipment Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading shipment details...
                </p>
              </div>
            </div>
          ) : error || !shipment ? (
            <div className="text-center py-12">
              <p className="text-red-600">
                {error || "Failed to load shipment details"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Vehicle Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <FaIdCard className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {shipment?.carId?.makeModel || "Vehicle Details"}
                    </h3>
                    <p className="text-sm text-gray-600 font-mono font-medium">
                      {shipment.carId?.chassisNumber}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-700 capitalize">
                    {shipment.exportStatus || "Active"}
                  </span>
                </div>
              </div>

              {/* Shipment Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                    <FaShip className="text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Shipment Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <FaShip className="text-blue-500 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Vessel Name
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {shipment.vessel?.vesselName || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {shipment.vessel?.etd && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <FaCalendarAlt className="text-purple-500 flex-shrink-0" />
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            ETD (Estimated Time of Departure)
                          </label>
                          <p className="mt-1 text-sm text-gray-900 font-medium">
                            {new Date(shipment.vessel.etd).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {shipment.vessel?.shippingLine && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <FaTag className="text-indigo-500 flex-shrink-0" />
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Shipping Line
                          </label>
                          <p className="mt-1 text-sm text-gray-900 font-medium">
                            {shipment.vessel.shippingLine}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <FaBuilding className="text-green-500 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Company
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {user?.name || "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <FaMapMarkerAlt className="text-orange-500 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Yard Location
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {shipment.yard || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Port of Discharge
                        </label>
                        <p className="mt-1 text-sm text-gray-900 font-medium">
                          {shipment.pod ||
                            shipment.vessel?.pod ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600">
                          Status
                        </label>
                        <p className="mt-1 text-sm font-medium capitalize">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                              shipment.exportStatus
                            )}`}
                          >
                            {shipment.exportStatus || "Unknown"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photos Section */}
              {/* ZIP functionality commented out - simplified condition */}
              {/* {(shipment?.carId?.images?.length > 0 ||
                shipment?.carId?.zipFileKey) && ( */}
              {shipment?.carId?.images?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                        <FaImages className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Vehicle Photos
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {/* ZIP functionality commented out
                          {shipment.carId?.zipFileKey && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 border border-green-300 rounded-lg">
                              <FaFileArchive className="text-green-700 text-xs" />
                              <span className="text-xs font-semibold text-green-700">
                                ZIP Available
                              </span>
                            </div>
                          )}
                          */}
                          <p className="text-sm text-gray-600">
                            {`${
                              shipment.carId?.images?.length || 0
                            } image(s) available`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {shipment.carId?.images?.length > 0 && (
                        <button
                          onClick={() =>
                            onViewPhotos && onViewPhotos(shipmentId)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FaEye />
                          View Photos
                        </button>
                      )}
                      {/* ZIP functionality commented out
                      {shipment.carId?.zipFileKey && (
                        <button
                          onClick={async () => {
                            try {
                              const fileName = shipment.carId?.chassisNumber
                                ? `${shipment.carId.chassisNumber}_photos.zip`
                                : `photos_${shipmentId}.zip`;
                              await downloadZipFile(
                                shipmentId,
                                shipment.carId.zipFileKey,
                                fileName
                              );
                            } catch (error) {
                              console.error("ZIP download error:", error);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          title="Download ZIP file"
                        >
                          <FaFileArchive />
                          <span>Download ZIP</span>
                        </button>
                      )}
                      */}
                      <button
                        onClick={async () => {
                          try {
                            const fileName = shipment.carId?.chassisNumber
                              ? `${shipment.carId.chassisNumber}_photos.zip`
                              : `photos_${shipmentId}.zip`;
                            await downloadShipmentPhotos(shipmentId, fileName);
                          } catch (error) {
                            console.error("Download error:", error);
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Download all photos as ZIP"
                      >
                        <FaDownload />
                        <span>Download All</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Timeline</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                    <FaCalendarAlt className="text-blue-500 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-blue-700">
                        Gate In Date
                      </label>
                      <p className="mt-1 text-sm text-blue-900 font-semibold">
                        {shipment.gateInDate
                          ? new Date(shipment.gateInDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                    <FaCalendarAlt className="text-green-500 flex-shrink-0" />
                    <div>
                      <label className="block text-sm font-medium text-green-700">
                        Gate Out Date
                      </label>
                      <p className="mt-1 text-sm text-green-900 font-semibold">
                        {shipment.gateOutDate
                          ? new Date(shipment.gateOutDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShipmentDetailModal;
