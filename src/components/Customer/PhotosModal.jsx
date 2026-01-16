// PhotosModal.jsx - Updated to fetch photos on demand
import { useState, useEffect } from "react";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaFileArchive,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { customerShipmentAPI } from "../../services/customerApiService";
import {
  downloadShipmentPhotos,
  // downloadZipFile, // ZIP functionality commented out
} from "../../utils/photoDownload";

const PhotosModal = ({
  isOpen,
  onClose,
  shipmentId,
  shipmentData,
  isAdmin = false,
}) => {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shipment, setShipment] = useState(null);
  // const [hasZipFile, setHasZipFile] = useState(false); // ZIP functionality commented out
  const [downloadState, setDownloadState] = useState({
    loading: false,
    success: false,
    error: null,
  });

  useEffect(() => {
    if (isOpen && shipmentId) {
      // Always fetch photos on demand - shipmentData from list doesn't include images array
      fetchPhotos();
    } else {
      setPhotos([]);
      setCurrentIndex(0);
      setError(null);
      setLoading(false);
      // setHasZipFile(false); // ZIP functionality commented out
      setShipment(null);
    }
  }, [isOpen, shipmentId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Always fetch full shipment data to get images
      let fetchedShipment;
      if (isAdmin) {
        const { shipmentAPI } = await import(
          "../../services/shipmentApiService"
        );
        fetchedShipment = await shipmentAPI.getShipmentById(shipmentId);
      } else {
        fetchedShipment = await customerShipmentAPI.getShipmentById(shipmentId);
      }

      setShipment(fetchedShipment);

      // ZIP functionality commented out
      /* Check for ZIP file
      if (fetchedShipment?.carId?.zipFileKey) {
        setHasZipFile(true);
      }
      */

      // Backend provides images with CloudFront URLs
      if (
        Array.isArray(fetchedShipment?.carId?.images) &&
        fetchedShipment.carId.images.length > 0
      ) {
        setPhotos(fetchedShipment.carId.images);
        setCurrentIndex(0); // Reset to first photo
      } else {
        // ZIP functionality commented out - simplified logic
        /* else if (!fetchedShipment?.carId?.zipFileKey) {
          setPhotos([]);
          setCurrentIndex(0);
          setError("No photos available for this shipment");
        } else {
          // ZIP file exists but no individual photos
          setPhotos([]);
          setCurrentIndex(0);
        }
        */
        setPhotos([]);
        setCurrentIndex(0);
        setError("No photos available for this shipment");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError(error.message || "Failed to load photos");
      toast.error(error.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!shipmentId) {
      toast.error("Shipment ID not found");
      return;
    }

    setDownloadState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const fileName = shipment?.carId?.chassisNumber
        ? `${shipment.carId.chassisNumber}_photos.zip`
        : `photos_${shipmentId}.zip`;

      // Use progress callback to update UI without freezing
      await downloadShipmentPhotos(shipmentId, fileName, (current, total) => {
        // Update progress in UI (non-blocking)
        setTimeout(() => {
          // Progress updates happen asynchronously to prevent UI freeze
        }, 0);
      });

      setDownloadState({
        loading: false,
        success: true,
        error: null,
      });

      setTimeout(() => {
        setDownloadState({
          loading: false,
          success: false,
          error: null,
        });
      }, 3000);
    } catch (error) {
      setDownloadState((prev) => ({
        ...prev,
        loading: false,
        error: "Download failed",
      }));
    }
  };

  // ZIP download functionality commented out
  /*
  const handleDownloadZip = async () => {
    if (!shipmentId || !hasZipFile) {
      toast.error("ZIP file not available");
      return;
    }

    setDownloadState((prev) => ({
      ...prev,
      loading: true,
    }));

    try {
      const fileName = shipment?.carId?.chassisNumber
        ? `${shipment.carId.chassisNumber}_photos.zip`
        : `photos_${shipmentId}.zip`;

      await downloadZipFile(shipmentId, shipment?.carId?.zipFileKey, fileName);

      setDownloadState({
        loading: false,
        success: true,
        error: null,
      });

      setTimeout(() => {
        setDownloadState({
          loading: false,
          success: false,
          error: null,
        });
      }, 3000);
    } catch (error) {
      setDownloadState((prev) => ({
        ...prev,
        loading: false,
        error: "Download failed",
      }));
    }
  };
  */

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") navigatePhoto("prev");
    if (e.key === "ArrowRight") navigatePhoto("next");
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, photos.length]);

  const navigatePhoto = (direction) => {
    if (photos.length === 0) return;

    let newIndex;
    if (direction === "prev") {
      newIndex = (currentIndex - 1 + photos.length) % photos.length;
    } else if (direction === "next") {
      newIndex = (currentIndex + 1) % photos.length;
    } else {
      newIndex = direction;
    }
    setCurrentIndex(newIndex);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={handleBackgroundClick}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading photos...</p>
        </div>
      </div>
    );
  }

  // ZIP functionality commented out - simplified condition
  // if (error && !hasZipFile && photos.length === 0) {
  if (error && photos.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={handleBackgroundClick}
      >
        <div className="text-center">
          <p className="text-white mb-4">{error || "No photos available"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ZIP functionality commented out
  /*
  // If only ZIP file exists, show message
  if (hasZipFile && photos.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={handleBackgroundClick}
      >
        <div className="text-center bg-gray-800 rounded-lg p-8 max-w-md">
          <FaFileArchive className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">ZIP File Available</p>
          <p className="text-gray-400 mb-6">
            This shipment has a ZIP file containing all photos. No individual
            photos are available for preview.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownloadZip}
              disabled={downloadState.loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                downloadState.loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : downloadState.success
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaFileArchive />
              <span>Download ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't render photo viewer if no photos (only ZIP exists)
  if (photos.length === 0 && hasZipFile) {
    return null; // Already handled above
  }
  */

  // Safety check: ensure we have photos and valid index
  if (photos.length === 0 || !photos[currentIndex]) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={handleBackgroundClick}
      >
        <div className="text-center">
          <p className="text-white mb-4">No photos available to display</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <FaTimes className="w-8 h-8" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => navigatePhoto("prev")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <FaChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={() => navigatePhoto("next")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <FaChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      <div className="absolute top-4 left-4 flex items-center gap-4 z-10 flex-wrap">
        <div className="text-white text-lg font-medium">
          {currentIndex + 1} / {photos.length}
        </div>
        {/* ZIP functionality commented out
        {hasZipFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600/80 rounded-lg text-white text-sm">
            <FaFileArchive className="w-4 h-4" />
            <span>ZIP Available</span>
          </div>
        )}
        */}
        <div className="flex gap-2">
          {/* ZIP functionality commented out
          {hasZipFile && (
            <button
              onClick={handleDownloadZip}
              disabled={downloadState.loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all ${
                downloadState.loading
                  ? "bg-green-400 cursor-not-allowed"
                  : downloadState.success
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              title="Download ZIP file separately"
            >
              <FaFileArchive />
              <span>Download ZIP</span>
            </button>
          )}
          */}
          <button
            onClick={handleDownloadAll}
            disabled={downloadState.loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all ${
              downloadState.loading
                ? "bg-blue-400 cursor-not-allowed"
                : downloadState.success
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            title="Download all photos as ZIP"
          >
            <FaDownload />
            <span>Download All</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center max-w-[90vw] max-h-[80vh]">
        <div className="w-[80vw] h-[70vh] flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
          {currentPhoto?.url ? (
            <img
              src={currentPhoto.url}
              alt={`Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Photo+Not+Found";
              }}
            />
          ) : (
            <div className="text-white text-center">
              <p>Photo not available</p>
            </div>
          )}
        </div>
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
          {photos.map((photo, index) => (
            <button
              key={photo._id || index}
              onClick={() => navigatePhoto(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden ${
                index === currentIndex
                  ? "border-blue-500"
                  : "border-transparent"
              }`}
            >
              <img
                src={photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/100x100?text=Error";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosModal;
