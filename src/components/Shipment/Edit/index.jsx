import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { shipmentAPI } from "../../../services/shipmentApiService";
import ShipmentDetailsForm from "./ShipmentDetailsForm";
import PhotoManagement from "./PhotoManagement";

const EditShipmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  let user = null;

  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      user = JSON.parse(storedUser); // parse JSON to object
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }

  // Local state for shipment data
  const [currentShipment, setCurrentShipment] = useState(null);
  const [currentShipmentLoading, setCurrentShipmentLoading] = useState(true);
  const [currentShipmentError, setCurrentShipmentError] = useState(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Separate edit modes
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isManagingPhotos, setIsManagingPhotos] = useState(false);

  // Fetch shipment by ID
  useEffect(() => {
    if (!id) return;

    const fetchShipment = async () => {
      try {
        setCurrentShipmentLoading(true);
        setCurrentShipmentError(null);
        const shipment = await shipmentAPI.getShipmentById(id);
        setCurrentShipment(shipment);
      } catch (error) {
        console.error("Failed to fetch shipment:", error);
        setCurrentShipmentError(error.message || "Failed to load shipment");
        toast.error(error.message || "Failed to load shipment");
      } finally {
        setCurrentShipmentLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  // Handle save details
  const handleSaveDetails = async (formData) => {
    if (!currentShipment) return;

    try {
      setOperationLoading(true);
      // Extract clientId - handle both ObjectId and object with _id property
      const clientIdValue = 
        typeof currentShipment.clientId === 'object' && currentShipment.clientId?._id
          ? currentShipment.clientId._id
          : currentShipment.clientId;

      const formattedData = {
        jobNumber: formData.jobNumber,
        gateInDate: new Date(formData.gateInDate).toISOString(),
        gateOutDate: formData.gateOutDate
          ? new Date(formData.gateOutDate).toISOString()
          : null,
        vesselName: formData.vesselName,
        carName: formData.carName,
        chassisNumber: formData.chassisNumber,
        yard: formData.yard,
        glNumber: formData.glNumber,
        pod: formData.pod,
        exportStatus: formData.exportStatus,
        remarks: formData.remarks || "",
        clientId: clientIdValue,
      };

      // Direct API call
      const updatedShipment = await shipmentAPI.updateShipment(
        id,
        formattedData
      );

      // Update local state
      setCurrentShipment(updatedShipment);

      toast.success("Shipment details updated successfully!");
      setIsEditingDetails(false);
    } catch (error) {
      toast.error(error.message || "Failed to update shipment details");
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle save photos - refresh shipment data after photo changes
  const handleSavePhotos = async () => {
    try {
      // Refetch shipment to get updated photos
      const updatedShipment = await shipmentAPI.getShipmentById(id);
      setCurrentShipment(updatedShipment);
      setIsManagingPhotos(false);
    } catch (error) {
      console.error("Failed to refresh shipment after photo update:", error);
      // Still close the editing mode even if refresh fails
      setIsManagingPhotos(false);
    }
  };

  if (currentShipmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (currentShipmentError || !currentShipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Shipment Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The shipment you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <button
                onClick={() => navigate("/admin/shipments")}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to shipments"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Edit Shipment #{currentShipment.jobNumber}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 text-gray-600">
                  {currentShipment.vesselName && (
                    <span className="font-medium text-gray-800">
                      {currentShipment.vesselName}
                    </span>
                  )}
                  {currentShipment.carId?.makeModel && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{currentShipment.carId.makeModel}</span>
                    </>
                  )}
                  {currentShipment.clientId?.name && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-600 font-medium">
                        {currentShipment.clientId.name}
                        {currentShipment.clientId.userId && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md ml-2">
                            ID: {currentShipment.clientId.userId}
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {(isEditingDetails || isManagingPhotos) && (
                <button
                  onClick={
                    isEditingDetails
                      ? () => setIsEditingDetails(false)
                      : () => setIsManagingPhotos(false)
                  }
                  disabled={operationLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}

              {!isEditingDetails &&
                !isManagingPhotos &&
                user?.role === "admin" && (
                  <>
                    <button
                      onClick={() => setIsEditingDetails(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => setIsManagingPhotos(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add Photos
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipment Details Form */}
          <ShipmentDetailsForm
            currentShipment={currentShipment}
            isEditing={isEditingDetails}
            onSave={handleSaveDetails}
            onCancel={() => setIsEditingDetails(false)}
            operationLoading={operationLoading}
          />

          {/* Photo Management */}
          <PhotoManagement
            shipmentId={id}
            currentShipment={currentShipment}
            isEditing={isManagingPhotos}
            onSave={handleSavePhotos}
            onCancel={() => setIsManagingPhotos(false)}
            operationLoading={operationLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditShipmentPage;
