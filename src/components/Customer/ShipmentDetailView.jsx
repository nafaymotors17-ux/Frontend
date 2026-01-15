// ShipmentDetailView.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaArrowLeft,
  FaDownload,
  FaCheck,
  FaExclamationTriangle,
  FaImages,
  FaShip,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaBuilding,
} from "react-icons/fa";
import PhotoModal from "./PhotosModal";
import { toast } from "react-toastify";
import { customerShipmentAPI } from "../../services/customerApiService";

const ShipmentDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    currentIndex: 0,
  });
  const [downloadState, setDownloadState] = useState({
    loading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const { user } = useSelector((state) => state.auth);

  // Fetch shipment data from API using URL parameter
  useEffect(() => {
    const fetchShipmentDetails = async () => {
      if (!id) {
        setError("Shipment ID not found in URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const freshShipment = await customerShipmentAPI.getShipmentById(id);
        setShipment(freshShipment);
      } catch (error) {
        console.error("Error fetching shipment details:", error);
        setError(error.message || "Failed to load shipment details");
        toast.error(error.message || "Failed to load shipment details");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [id]); // Fetch whenever ID changes

  // Backend now provides URLs directly
  const photos = Array.isArray(shipment?.carId?.images)
    ? shipment.carId.images
    : [];

  const openPhotoModal = (index) => {
    setPhotoModal({
      isOpen: true,
      currentIndex: index,
    });
  };

  const closePhotoModal = () => {
    setPhotoModal({
      isOpen: false,
      currentIndex: 0,
    });
  };

  const navigatePhoto = (direction) => {
    let newIndex;
    const numPhotos = photos.length;
    if (numPhotos === 0) return;

    if (direction === "prev") {
      newIndex = (photoModal.currentIndex - 1 + numPhotos) % numPhotos;
    } else if (direction === "next") {
      newIndex = (photoModal.currentIndex + 1) % numPhotos;
    } else {
      newIndex = direction;
    }
    setPhotoModal((prev) => ({ ...prev, currentIndex: newIndex }));
  };

  const handleDownloadAll = () => {
    if (!shipment?.carId?.images) {
      toast.error("🚗 Car information missing");
      return;
    }

    if (!photos.length) {
      toast.info("📷 No photos available for download");
      return;
    }

    // Show preparing toast
    const preparingToast = toast.loading("🔄 Preparing your download...", {
      position: "bottom-right",
    });

    setDownloadState((prev) => ({
      ...prev,
      loading: true,
    }));

    // Open new tab for download
    const shipmentId = shipment?._id || shipment?.id;
    const downloadUrl = `${
      import.meta.env.VITE_API_URL
    }/photos/download?shipmentId=${shipmentId}`;

    const win = window.open(downloadUrl, "_blank");

    if (!win) {
      toast.dismiss(preparingToast);
      toast.error(
        "🚫 Pop-up blocked! Please allow pop-ups for this site to download files.",
        {
          position: "bottom-right",
          autoClose: 5000,
        }
      );
      setDownloadState((prev) => ({
        ...prev,
        loading: false,
        error: "Pop-up blocked",
      }));
      return;
    }

    // Success feedback
    setTimeout(() => {
      toast.dismiss(preparingToast);
      toast.success(
        `✅ Download started! Check your browser's download manager.`,
        {
          position: "bottom-right",
          autoClose: 4000,
        }
      );

      setDownloadState({
        loading: false,
        progress: 0,
        error: null,
        success: true,
      });

      // Reset success state after 3 seconds
      setTimeout(() => {
        setDownloadState({
          loading: false,
          progress: 0,
          error: null,
          success: false,
        });
      }, 3000);
    }, 1500);
  };

  const getDownloadButtonContent = () => {
    if (downloadState.loading) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Preparing...</span>
        </div>
      );
    }

    if (downloadState.success) {
      return (
        <div className="flex items-center gap-2">
          <FaCheck className="text-white" />
          <span>Downloaded!</span>
        </div>
      );
    }

    if (downloadState.error) {
      return (
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-white" />
          <span>Try Again</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <FaDownload />
        <span>Download All ({photos.length})</span>
      </div>
    );
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

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  // Show error if no shipment data
  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Failed to load shipment details"}
          </p>
          <button
            onClick={() => navigate("/customer")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to shipments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customer")}
            className="flex items-center gap-3 text-blue-600 hover:text-blue-800 mb-6 group transition-colors duration-200"
          >
            <div className="p-2 rounded-lg bg-white border border-gray-200 group-hover:border-blue-300 transition-colors">
              <FaArrowLeft className="text-lg" />
            </div>
            <span className="font-medium">Back to shipments</span>
          </button>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                    <FaIdCard className="text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {shipment?.carId?.makeModel || "Vehicle Details"}
                    </h1>
                    <p className="text-lg text-gray-600 font-mono font-medium">
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

              {/* Download Section */}
              {photos.length > 0 && (
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={handleDownloadAll}
                    disabled={downloadState.loading}
                    className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                      downloadState.loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : downloadState.success
                        ? "bg-green-500 hover:bg-green-600"
                        : downloadState.error
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                    }`}
                  >
                    {getDownloadButtonContent()}
                  </button>

                  {/* Photo Count */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaImages className="text-blue-500" />
                    <span>
                      {photos.length} photo{photos.length !== 1 ? "s" : ""}{" "}
                      available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Shipment Information */}
          <div className="xl:col-span-2 space-y-6">
            {/* Shipment Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                  <FaShip className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Shipment Information
                </h2>
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
                        {shipment.pod || "Not specified"}
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

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                  <FaCalendarAlt className="text-xl" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
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

          {/* Right Column - Photos Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                    <FaImages className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Vehicle Photos
                    </h2>
                    <p className="text-sm text-gray-600">
                      {photos.length} images
                    </p>
                  </div>
                </div>
              </div>

              {photos.length > 0 ? (
                <div className="space-y-4">
                  {/* Photo Grid */}
                  <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo, index) => (
                        <div
                          key={photo._id || index}
                          className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105"
                          onClick={() => openPhotoModal(index)}
                        >
                          <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors shadow-sm">
                            <img
                              src={photo.url}
                              alt={`Vehicle photo ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x300?text=Photo+Not+Found";
                              }}
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                              View
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Hint */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <FaDownload className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">
                          Download all photos as ZIP
                        </p>
                        <p className="text-xs text-blue-600">
                          Includes {photos.length} high-quality images
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 rounded-full bg-gray-100 inline-flex mb-4">
                    <FaImages className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Photos Available
                  </h3>
                  <p className="text-gray-600 text-sm">
                    There are no photos associated with this shipment yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {photoModal.isOpen && (
        <PhotoModal
          photos={photos}
          currentIndex={photoModal.currentIndex}
          onClose={closePhotoModal}
          onNavigate={navigatePhoto}
        />
      )}
    </div>
  );
};

export default ShipmentDetailView;
