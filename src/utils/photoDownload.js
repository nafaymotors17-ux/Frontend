// Shared utility for downloading photos (used by both customer and admin)
import { toast } from "react-toastify";

/**
 * Download photos for a shipment
 * Checks for ZIP file first, then falls back to individual photos
 * @param {string} shipmentId - The shipment ID
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<void>}
 */
export const downloadShipmentPhotos = async (shipmentId, fileName = null) => {
  if (!shipmentId) {
    toast.error("Shipment ID not found");
    return;
  }

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast.error("Authentication required. Please login again.");
    return;
  }

  const preparingToast = toast.loading("Preparing download...", {
    position: "bottom-right",
  });

  try {
    const downloadUrl = `${
      import.meta.env.VITE_API_URL
    }/photos/download?shipmentId=${shipmentId}`;

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Download failed");
    }

    // Check content-type BEFORE reading response body
    const contentType = response.headers.get("content-type") || "";

    // If JSON response (ZIP file from CloudFront)
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (data.downloadUrl && data.type === "zip") {
        // Direct download from CloudFront URL
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = fileName || data.fileName || `photos_${shipmentId}.zip`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss(preparingToast);
        toast.success(
          "Download started! Check your browser's download manager.",
          {
            position: "bottom-right",
            autoClose: 4000,
          }
        );
        return;
      } else {
        throw new Error(data.message || "Invalid download response");
      }
    }

    // Otherwise, it's a blob (ZIP created from individual photos)
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Downloaded file is empty");
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `photos_${shipmentId}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.dismiss(preparingToast);
    toast.success("Download started! Check your browser's download manager.", {
      position: "bottom-right",
      autoClose: 4000,
    });
  } catch (error) {
    console.error("Download error:", error);
    toast.dismiss(preparingToast);
    toast.error(
      error.message || "Failed to download photos. Please try again."
    );
    throw error;
  }
};

/**
 * Download ZIP file directly (if available)
 * This only works if a ZIP file was uploaded, not for individual photos
 * @param {string} shipmentId - The shipment ID
 * @param {string} zipFileKey - The ZIP file key from shipment.carId.zipFileKey
 * @param {string} fileName - Optional custom file name
 * @returns {Promise<void>}
 */
export const downloadZipFile = async (
  shipmentId,
  zipFileKey,
  fileName = null
) => {
  if (!shipmentId || !zipFileKey) {
    toast.error("ZIP file not available");
    return;
  }

  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    toast.error("Authentication required. Please login again.");
    return;
  }

  const preparingToast = toast.loading("Preparing ZIP download...", {
    position: "bottom-right",
  });

  try {
    // Use the same download endpoint - it will return ZIP if available
    const downloadUrl = `${
      import.meta.env.VITE_API_URL
    }/photos/download?shipmentId=${shipmentId}`;

    const response = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "ZIP download failed");
    }

    const contentType = response.headers.get("content-type") || "";

    // If JSON response (ZIP file from CloudFront)
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (data.downloadUrl && data.type === "zip") {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = fileName || data.fileName || `photos_${shipmentId}.zip`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss(preparingToast);
        toast.success("ZIP download started!", {
          position: "bottom-right",
          autoClose: 4000,
        });
        return;
      } else {
        throw new Error(data.message || "ZIP file not available");
      }
    }

    // If blob response, it means backend created ZIP from individual photos
    // For "ZIP only" download, we should only proceed if we got JSON (CloudFront URL)
    // Otherwise, it means no ZIP file exists, only individual photos
    throw new Error("ZIP file not available. Only individual photos exist.");
  } catch (error) {
    console.error("ZIP download error:", error);
    toast.dismiss(preparingToast);
    toast.error(
      error.message || "Failed to download ZIP file. Please try again."
    );
    throw error;
  }
};
