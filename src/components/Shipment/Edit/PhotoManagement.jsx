import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { shipmentAPI } from "../../../services/shipmentApiService";
import PhotoModal from "./PhotoModal";
import { FaFileArchive } from "react-icons/fa";

const PhotoManagement = ({
  shipmentId,
  currentShipment,
  isEditing,
  onSave,
  onCancel,
  operationLoading,
}) => {
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const [zipUploadProgress, setZipUploadProgress] = useState(null);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    currentIndex: 0,
  });
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Toast configuration
  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  // Initialize photos
  useEffect(() => {
    console.log("Current shipment updated:", currentShipment);
    setPhotos(
      currentShipment?.carId?.images?.length > 0
        ? currentShipment.carId.images
        : []
    );
  }, [currentShipment]);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check if adding new files would exceed 25 limit
    const existingCount = currentShipment?.carId?.images?.length || 0;
    const newCount = files.length;
    const totalAfterUpload = existingCount + newCount;

    console.log(
      `Frontend validation: ${existingCount} existing + ${newCount} new = ${totalAfterUpload} total`
    );

    if (totalAfterUpload > 25) {
      toast.error(
        `Cannot add ${newCount} photos. Maximum 25 photos allowed. You already have ${existingCount} photos.`,
        toastConfig
      );
      return;
    }

    // Check individual file sizes (4MB limit)
    const oversizedFiles = files.filter((file) => file.size > 4 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(
        `Some files exceed 4MB limit: ${oversizedFiles
          .map((f) => f.name)
          .join(", ")}`,
        toastConfig
      );
      return;
    }

    const newPhotoFiles = files.map((file) => ({
      file,
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      isNew: true,
      name: file.name,
      size: file.size,
    }));

    setNewPhotos((prev) => [...prev, ...newPhotoFiles]);

    // Show success toast for upload
    toast.success(`Added ${files.length} photo(s) for upload`, {
      ...toastConfig,
      autoClose: 3000,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleZipUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".zip") && file.type !== "application/zip") {
      toast.error("Please select a ZIP file", toastConfig);
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("ZIP file size exceeds 2MB limit", toastConfig);
      return;
    }

    setZipFile(file);
    toast.success("ZIP file selected. Click Save to upload.", toastConfig);
    
    if (zipInputRef.current) zipInputRef.current.value = "";
  };

  const handleDeletePhoto = (photoId, isNew) => {
    if (isNew) {
      setNewPhotos((prev) => {
        const photoToRemove = prev.find((p) => p.id === photoId);
        if (photoToRemove) {
          URL.revokeObjectURL(photoToRemove.url);
          toast.info("New photo removed from upload queue", {
            ...toastConfig,
            autoClose: 2000,
          });
        }
        return prev.filter((p) => p.id !== photoId);
      });
    } else {
      // Find the photo to get its _id
      const photo = photos.find(
        (p) =>
          (p._id?.toString() || p._id || p.key) === photoId || p.id === photoId
      );
      const deleteId = photo?._id?.toString() || photo?._id || photoId;
      setPhotosToDelete((prev) => {
        if (!prev.includes(deleteId)) {
          return [...prev, deleteId];
        }
        return prev;
      });
      toast.info("Photo marked for deletion", {
        ...toastConfig,
        autoClose: 2000,
      });
    }
  };

  const handleRestorePhoto = (photoId) => {
    setPhotosToDelete((prev) => prev.filter((id) => id !== photoId));
    toast.info("Photo restoration cancelled", {
      ...toastConfig,
      autoClose: 2000,
    });
  };

  const getAllPhotos = () => [
    ...photos
      .filter((photo) => {
        const photoId = photo._id?.toString() || photo._id || photo.key;
        return !photosToDelete.includes(photoId);
      })
      .map((photo) => ({
        id: photo._id?.toString() || photo._id || photo.key || photo,
        _id: photo._id, // Keep original _id for deletion
        key: photo.key, // Keep key
        url: photo.url || (typeof photo === "string" ? photo : null), // Backend provides URL
        isNew: false,
        name:
          typeof photo === "string"
            ? "Existing photo"
            : photo.fileName || photo.name,
      })),
    ...newPhotos,
  ];

  const allPhotos = getAllPhotos();
  const hasChanges = newPhotos.length > 0 || photosToDelete.length > 0 || zipFile !== null;

  // Progress callback for uploads
  const handleUploadProgress = (progress) => {
    console.log("Progress update:", progress);
    setUploadProgress(progress);

    if (progress.status === "error") {
      setUploadError(progress.error);
    }
  };

  const savePhotoChanges = async () => {
    if (!hasChanges) {
      toast.info("No changes to save", toastConfig);
      return true;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({
      current: 0,
      total: newPhotos.length,
      percentage: 0,
      status: "starting",
      stage: "starting",
    });

    let uploadSucceeded = false;
    let deleteSucceeded = false;
    let toastId = null;

    try {
      // Show loading toast
      toastId = toast.loading("Starting photo upload...", toastConfig);

      // 1️⃣ Upload new photos
      if (newPhotos.length > 0) {
        // Validate carId exists
        if (!currentShipment?.carId) {
          throw new Error(
            "Car information not found. Please refresh the page and try again."
          );
        }

        toast.update(toastId, {
          render: `Uploading ${newPhotos.length} new photo(s)...`,
          type: "info",
          isLoading: true,
        });
        console.log("Current shipment : ", currentShipment);
        console.log("CarId for upload:", currentShipment.carId);

        // Direct API call
        await shipmentAPI.uploadShipmentPhotos(
          shipmentId,
          currentShipment.carId,
          newPhotos.map((p) => p.file),
          handleUploadProgress
        );

        setNewPhotos((prev) => {
          prev.forEach((photo) => URL.revokeObjectURL(photo.url));
          return [];
        });

        uploadSucceeded = true;
      }

      // 1.5️⃣ Upload ZIP file if selected
      if (zipFile) {
        toast.update(toastId, {
          render: "Uploading ZIP file...",
          type: "info",
          isLoading: true,
        });

        setZipUploadProgress({ current: 0, total: 1, percentage: 0, status: "uploading" });

        try {
          await shipmentAPI.uploadZipFile(shipmentId, zipFile, (progress) => {
            setZipUploadProgress(progress);
          });

          setZipFile(null);
          setZipUploadProgress(null);
          toast.update(toastId, {
            render: "ZIP file uploaded successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        } catch (error) {
          setZipUploadProgress(null);
          toast.update(toastId, {
            render: error.message || "Failed to upload ZIP file",
            type: "error",
            isLoading: false,
            autoClose: 5000,
          });
          throw error;
        }
      }

      // 2️⃣ Delete selected photos
      if (photosToDelete.length > 0) {
        toast.update(toastId, {
          render: `Deleting ${photosToDelete.length} photo(s)...`,
          type: "info",
          isLoading: true,
        });

        // Validate carId exists
        if (!currentShipment?.carId) {
          throw new Error(
            "Car information not found. Please refresh the page and try again."
          );
        }

        // Direct API call
        await shipmentAPI.deleteShipmentPhoto(
          shipmentId,
          photosToDelete,
          currentShipment.carId
        );

        setPhotosToDelete([]);
        deleteSucceeded = true;
      }

      // ✅ Show proper toast depending on which operations succeeded
      if (uploadSucceeded && deleteSucceeded) {
        toast.update(toastId, {
          render: `Successfully uploaded ${newPhotos.length} photo(s) and deleted ${photosToDelete.length} photo(s)`,
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      } else if (uploadSucceeded) {
        toast.update(toastId, {
          render: `Successfully uploaded ${newPhotos.length} photo(s)`,
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
      } else if (deleteSucceeded) {
        toast.update(toastId, {
          render: `Successfully deleted ${photosToDelete.length} photo(s)`,
          type: "success",
          isLoading: false,
          autoClose: 4000,
        });
      } else {
        toast.dismiss(toastId);
      }

      setUploadProgress(null);
      return true;
    } catch (error) {
      console.error("Save photo changes error:", error);

      let errorMessage = "Failed to save photo changes";

      if (error.message?.includes("network")) {
        errorMessage =
          "Network error: Please check your connection and try again";
      } else if (error.message?.includes("storage")) {
        errorMessage = "Storage error: Could not save photos to cloud storage";
      } else if (error.message?.includes("size")) {
        errorMessage = "File size error: Some photos exceed the size limit";
      } else if (error.message?.includes("format")) {
        errorMessage = "Format error: Some photos are in unsupported formats";
      }

      if (toastId) {
        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 6000,
        });
      } else {
        toast.error(errorMessage, toastConfig);
      }

      setUploadError(error.message || errorMessage);

      // Keep changes in UI so user can retry
      setUploadProgress(null);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const resetPhotoChanges = () => {
    setNewPhotos((prev) => {
      prev.forEach((photo) => URL.revokeObjectURL(photo.url));
      return [];
    });
    setPhotosToDelete([]);
    setZipFile(null);
    setZipUploadProgress(null);
    setUploadProgress(null);
    setUploadError(null);
    setIsUploading(false);
  };

  const handleSave = async () => {
    try {
      const success = await savePhotoChanges();
      if (success) {
        // Fetch updated shipment to get latest photos
        try {
          const updatedShipment = await shipmentAPI.getShipmentById(shipmentId);
          const updatedPhotos = updatedShipment?.carId?.images || [];
          
          // Update local photos state
          setPhotos(updatedPhotos);
          
          // Notify parent with updated photos
          if (onSave) {
            onSave(updatedPhotos);
          }
        } catch (fetchError) {
          console.error("Failed to fetch updated photos:", fetchError);
          // Still notify parent with current photos
          if (onSave) {
            onSave(photos.filter(p => !photosToDelete.includes(p._id)));
          }
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      // Error is already handled in savePhotoChanges with toast
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      // Confirm cancellation if there are unsaved changes
      if (
        window.confirm(
          "You have unsaved photo changes. Are you sure you want to cancel?"
        )
      ) {
        resetPhotoChanges();
        onCancel();
        toast.info("Photo changes cancelled", toastConfig);
      }
    } else {
      resetPhotoChanges();
      onCancel();
    }
  };

  // Photo modal functions
  const openPhotoModal = (index) =>
    setPhotoModal({ isOpen: true, currentIndex: index });
  const closePhotoModal = () =>
    setPhotoModal({ isOpen: false, currentIndex: 0 });

  const navigatePhoto = (direction) => {
    let newIndex;
    if (direction === "prev") {
      newIndex =
        photoModal.currentIndex > 0
          ? photoModal.currentIndex - 1
          : allPhotos.length - 1;
    } else if (direction === "next") {
      newIndex =
        photoModal.currentIndex < allPhotos.length - 1
          ? photoModal.currentIndex + 1
          : 0;
    } else {
      newIndex = direction;
    }
    setPhotoModal((prev) => ({ ...prev, currentIndex: newIndex }));
  };

  // Calculate total file size for new photos
  const totalNewSize = newPhotos.reduce((acc, photo) => acc + photo.size, 0);
  const totalSizeMB = (totalNewSize / (1024 * 1024)).toFixed(2);

  // Get progress status message
  const getProgressMessage = () => {
    if (!uploadProgress) return "";

    switch (uploadProgress.stage) {
      case "starting":
        return "Preparing upload...";
      case "uploading":
        return `Uploading to cloud... ${uploadProgress.current}/${uploadProgress.total}`;
      case "confirming":
        return "Saving photo information...";
      case "completed":
        return "Upload completed!";
      case "error":
        return "Upload failed";
      default:
        return "Processing...";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Photos ({allPhotos.length})
              {newPhotos.length > 0 && ` (+${newPhotos.length} new)`}
              {photosToDelete.length > 0 &&
                ` (-${photosToDelete.length} deleting)`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage shipment photos • Max 25 photos • 4MB per photo
              {newPhotos.length > 0 && ` • ${totalSizeMB}MB to upload`}
            </p>
          </div>
          {isEditing && !isUploading && (
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Photos
              </button>
              <button
                onClick={() => zipInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                title="Upload ZIP file (max 2MB) - Cost-effective option"
              >
                <FaFileArchive className="w-4 h-4" />
                Upload ZIP
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={isUploading}
        />
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip,application/zip"
          onChange={handleZipUpload}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <div className="p-6">
        {/* ZIP Upload Status */}
        {zipFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaFileArchive className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  ZIP file selected: {zipFile.name}
                </span>
                <span className="text-xs text-blue-600">
                  ({(zipFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={() => setZipFile(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                disabled={isUploading}
              >
                Remove
              </button>
            </div>
            {zipUploadProgress && (
              <div className="mt-2">
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${zipUploadProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  {zipUploadProgress.status === "uploading" && "Uploading ZIP..."}
                  {zipUploadProgress.status === "confirming" && "Saving..."}
                  {zipUploadProgress.status === "completed" && "Upload complete!"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && uploadProgress && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              uploadProgress.status === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span
                className={`text-sm font-medium ${
                  uploadProgress.status === "error"
                    ? "text-red-900"
                    : "text-blue-900"
                }`}
              >
                {getProgressMessage()}
              </span>
              <span
                className={`text-sm ${
                  uploadProgress.status === "error"
                    ? "text-red-700"
                    : "text-blue-700"
                }`}
              >
                {uploadProgress.percentage}%
              </span>
            </div>
            <div
              className={`w-full rounded-full h-2 ${
                uploadProgress.status === "error" ? "bg-red-200" : "bg-blue-200"
              }`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadProgress.status === "error"
                    ? "bg-red-600"
                    : "bg-blue-600"
                }`}
                style={{ width: `${uploadProgress.percentage}%` }}
              ></div>
            </div>
            {uploadError && (
              <p className="text-xs text-red-600 mt-2">Error: {uploadError}</p>
            )}
          </div>
        )}

        {/* Photo grid */}
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {allPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative group border border-gray-200 rounded-lg overflow-hidden aspect-square cursor-pointer"
                onClick={() => !isUploading && openPhotoModal(index)}
              >
                <img
                  src={photo.url}
                  alt={`Shipment photo: ${photo.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/300x300?text=Photo+Not+Found";
                  }}
                />

                {/* Photo badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {photo.isNew && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      New
                    </div>
                  )}
                  {photosToDelete.includes(photo.id) && (
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Deleting
                    </div>
                  )}
                </div>

                {/* Photo info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <p className="text-xs truncate">{photo.name}</p>
                  {photo.size && (
                    <p className="text-xs text-gray-300">
                      {(photo.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPhotoModal(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white p-2 rounded-full transition-opacity duration-200"
                    title="View photo"
                    disabled={isUploading}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>

                  {isEditing &&
                    !photosToDelete.includes(photo.id) &&
                    !isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id, photo.isNew);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full transition-opacity duration-200"
                        title="Delete photo"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  {photosToDelete.includes(photo.id) && !isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestorePhoto(photo.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-green-600 text-white p-2 rounded-full transition-opacity duration-200"
                      title="Restore photo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500 mb-4">No photos uploaded yet</p>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add First Photos
              </button>
            )}
          </div>
        )}

        {/* Change Summary */}
        {hasChanges && !isUploading && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Photo Changes Summary
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              {newPhotos.length > 0 && (
                <p className="text-green-600">
                  + {newPhotos.length} new photo(s) to upload ({totalSizeMB}MB)
                </p>
              )}
              {photosToDelete.length > 0 && (
                <p className="text-red-600">
                  - {photosToDelete.length} photo(s) to delete
                </p>
              )}
              <p className="text-blue-600">
                Final count:{" "}
                {photos.length - photosToDelete.length + newPhotos.length}/25
                photos
              </p>
            </div>
          </div>
        )}

        {/* Save button when editing */}
        {isEditing && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={operationLoading || isUploading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={operationLoading || !hasChanges || isUploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading... ({uploadProgress?.percentage}%)
                </>
              ) : operationLoading ? (
                "Saving..."
              ) : (
                "Save Photos"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {photoModal.isOpen && (
        <PhotoModal
          photos={allPhotos}
          currentIndex={photoModal.currentIndex}
          onClose={closePhotoModal}
          onNavigate={navigatePhoto}
        />
      )}
    </div>
  );
};

export default PhotoManagement;
