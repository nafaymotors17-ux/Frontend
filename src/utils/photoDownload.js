// Shared utility for downloading photos (used by both customer and admin)
import { toast } from "react-toastify";

/**
 * Download photos for a shipment
 * Downloads photos using signed URLs and creates ZIP in browser
 * @param {string} shipmentId - The shipment ID
 * @param {string} fileName - Optional custom file name
 * @param {Function} onProgress - Optional progress callback (current, total)
 * @returns {Promise<void>}
 */
export const downloadShipmentPhotos = async (
  shipmentId,
  fileName = null,
  onProgress = null
) => {
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
    // Get signed URLs from backend
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
      const contentType = response.headers.get("content-type") || "";
      let errorData = {};
      
      if (contentType.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch (e) {
          console.error("Failed to parse error response:", e);
        }
      } else {
        const errorText = await response.text().catch(() => "");
        errorData = { message: errorText || `Download failed: ${response.status} ${response.statusText}` };
      }
      
      throw new Error(errorData.message || "Download failed");
    }

    // Check content type before parsing
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("Unexpected response type:", contentType, responseText);
      throw new Error(`Invalid response format. Expected JSON, got ${contentType}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      const responseText = await response.text().catch(() => "Unable to read response");
      console.error("Response text:", responseText);
      throw new Error("Invalid JSON response from server");
    }

    if (!data) {
      console.error("Empty response data");
      throw new Error("Empty response from server");
    }

    if (!data.photos || !Array.isArray(data.photos)) {
      console.error("Invalid photos data:", data);
      throw new Error("Invalid response format: photos array not found");
    }

    if (data.photos.length === 0) {
      throw new Error("No photos available for download");
    }

    // Import JSZip dynamically
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    const photos = data.photos;
    const totalPhotos = photos.length;

    // Update progress - starting download
    if (onProgress) {
      onProgress(0, totalPhotos);
    } else {
      toast.update(preparingToast, {
        render: `Downloading ${totalPhotos} photo(s) in parallel...`,
        type: "info",
      });
    }

    // Download all photos in parallel using Promise.all for efficiency
    const downloadPromises = photos.map(async (photo, index) => {
      try {
        // Download photo from S3 signed URL (temporary access for secure downloads)
        const photoResponse = await fetch(photo.url);
        if (!photoResponse.ok) {
          console.warn(`Failed to download ${photo.fileName}, skipping...`);
          return null;
        }

        const photoBlob = await photoResponse.blob();
        return {
          fileName: photo.fileName,
          blob: photoBlob,
          index: index,
        };
      } catch (error) {
        console.error(`Error downloading ${photo.fileName}:`, error);
        return null;
      }
    });

    // Wait for all downloads to complete in parallel
    const downloadResults = await Promise.all(downloadPromises);

    // Filter out failed downloads and add to ZIP
    const successfulDownloads = downloadResults.filter((result) => result !== null);

    if (successfulDownloads.length === 0) {
      throw new Error("Failed to download any photos");
    }

    // Add all downloaded photos to ZIP
    successfulDownloads.forEach((result) => {
      zip.file(result.fileName, result.blob);
    });

    // Update progress - all downloaded
    if (onProgress) {
      onProgress(totalPhotos, totalPhotos);
    }

    // Generate ZIP file
    toast.update(preparingToast, {
      render: "Creating ZIP file...",
      type: "info",
    });

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Download the ZIP
    const finalFileName =
      fileName ||
      `${data.chassisNumber || shipmentId}_photos.zip`;
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.dismiss(preparingToast);
    toast.success(
      `Downloaded ${successfulDownloads.length} photo(s) as ZIP file!`,
      {
        position: "bottom-right",
        autoClose: 4000,
      }
    );
  } catch (error) {
    console.error("Download error:", error);
    toast.dismiss(preparingToast);
    toast.error(
      error.message || "Failed to download photos. Please try again."
    );
    throw error;
  }
};

// ZIP file download removed - all downloads now use downloadShipmentPhotos which creates ZIP in browser
