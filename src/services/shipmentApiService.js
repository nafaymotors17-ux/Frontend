// Simulated API Service with proper filtering
export const shipmentAPI = {
  // src/store/slices/shipmentsSlice.js - Update the getShipments method

  async getShipments(
    filters = {},
    page = 1,
    pageSize = 50,
    sortBy = "createdAt",
    sortOrder = "desc"
  ) {
    if (page < 1) throw new Error("Page must be greater than 0");
    if (pageSize < 1) throw new Error("Page size must be greater than 0");

    // Construct query params
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      sortBy: sortBy, // Use the passed sortBy parameterS
      sortOrder: sortOrder, // Use the passed sortOrder parameter
    });

    // IMPORTANT: Backend cache key must include limit!
    // Current backend cache key: shipments_${filterSignature}_${sortSignature}_${pageNum}
    // Should be: shipments_${filterSignature}_${sortSignature}_limit${limitNum}_${pageNum}
    // This is a frontend workaround - backend needs to be fixed

    // ✅ Apply backend-supported filters
    if (filters.clientId && filters.clientId.trim()) {
      params.append("clientId", filters.clientId.trim());
    }

    if (filters.yard && filters.yard.trim()) {
      params.append("yard", filters.yard.trim());
    }

    if (filters.vesselName && filters.vesselName.trim()) {
      params.append("vesselName", filters.vesselName.trim());
    }

    if (filters.exportStatus && filters.exportStatus.trim()) {
      params.append("exportStatus", filters.exportStatus.trim());
    }
    if (filters.dateType) {
      params.append("dateType", filters.dateType);
    }
    if (filters.dateTo) {
      params.append("dateTo", filters.dateTo);
    }
    if (filters.chassisNumber) {
      params.append("chassisNumber", filters.chassisNumber);
    }
    if (filters.dateFrom) {
      params.append("dateFrom", filters.dateFrom);
    }
    if (filters.jobNumber) {
      params.append("jobNumber", filters.jobNumber);
    }
    if (filters.pod && filters.pod.trim()) {
      params.append("pod", filters.pod.trim());
    }
    if (filters.inYard) {
      params.append("inYard", filters.inYard);
    }
    if (filters.glNumber) {
      params.append("glNumber", filters.glNumber);
    }

    // Fetch data
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/admin/shipments/list?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch shipments: ${response.status}`);
    }

    const result = await response.json();
    // console.log("Current shipment : ", result);

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch shipments");
    }

    // Normalize backend structure for frontend use
    // Always use the pageSize we requested, not what backend returns
    return {
      data: result.data || [],
      pagination: {
        currentPage: result.meta?.pagination?.currentPage || 1,
        totalPages: result.meta?.pagination?.totalPages || 1,
        totalItems: result.meta?.pagination?.totalItems || 0,
        pageSize: pageSize, // Always use the pageSize we requested
        hasNext: result.meta?.pagination?.hasNextPage || false,
        hasPrev: result.meta?.pagination?.hasPrevPage || false,
      },
    };
  },
  // ... rest of your API methods

  async deleteShipments(ids) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/delete`,
      {
        method: "POST", // ✅ must be POST since we're sending an array in body
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ ids }),
      }
    );

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete shipments");
    }

    const result = await response.json();

    return {
      success: result.success ?? true,
      deletedCount: result.data?.count || ids.length,
      deletedIds: result.data?.deletedShipmentIds || ids,
      message: result.message,
    };
  },
  async createShipment(shipmentData) {
    const accessToken = localStorage.getItem("accessToken");
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(shipmentData),
      }
    );
    const res = await result.json();
    if (!res.success)
      throw new Error(res.message || "Faild to create shipment");
    return res.data;
  },

  updateShipment: async (id, shipmentData) => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(shipmentData),
      }
    );
    const jsonResponse = await response.json();

    if (!jsonResponse.success) {
      // console.log("Throwing error");

      throw new Error(`${jsonResponse.message}` || "Failed to update shipment");
    }

    return jsonResponse.data;
  },

  // shipmentAPI.js
  async uploadShipmentPhotos(shipmentId, carId, photos, onProgress) {
    // Validate carId
    if (!carId) {
      throw new Error("Car information is required for photo upload");
    }

    // 1️⃣ Validate before upload
    const existingCount = carId.images ? carId.images.length : 0;
    const newCount = photos.length;
    const totalAfterUpload = existingCount + newCount;

    if (totalAfterUpload > 25) {
      throw new Error(
        `Cannot upload ${newCount} photos. Car already has ${existingCount} photos. Maximum 25 allowed.`
      );
    }

    if (photos.length > 25) {
      throw new Error("You can upload a maximum of 25 photos per car.");
    }

    for (const photo of photos) {
      if (photo.size > 4 * 1024 * 1024) {
        throw new Error(`File ${photo.name} exceeds 4MB limit.`);
      }
    }

    const accessToken = localStorage.getItem("accessToken");
    // 2️⃣ Get signed URLs from backend
    const signedRes = await fetch(
      `${import.meta.env.VITE_API_URL}/photos/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify({
          shipmentId: shipmentId,
          fileNames: photos.map((photo) => photo.name),
        }),
      }
    );

    if (!signedRes.ok) {
      const error = await signedRes.json();
      throw new Error(error.message || "Failed to get upload URLs from server");
    }

    const { signedUrls } = await signedRes.json();
    // console.log("Signed URLs received:", signedUrls);

    // 3️⃣ Initialize progress tracking
    let uploadedCount = 0;
    const totalFiles = photos.length;

    const updateProgress = (stage, current, total, customPercentage = null) => {
      const percentage =
        customPercentage !== null
          ? customPercentage
          : Math.round((current / total) * 100);
      if (onProgress) {
        onProgress({
          current,
          total,
          percentage,
          status: stage,
          stage: stage, // Add stage info for better UI feedback
        });
      }
    };

    try {
      // 4️⃣ Upload phase (0-80% progress)
      updateProgress("uploading", 0, totalFiles, 0);

      const uploadResults = await Promise.all(
        photos.map((file, idx) =>
          fetch(signedUrls[idx].uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type || "image/jpeg",
            },
            body: file,
          })
            .then((res) => {
              if (!res.ok) throw new Error(`Upload failed for ${file.name}`);
              uploadedCount++;
              // Upload phase: 0-80% of progress
              updateProgress(
                "uploading",
                uploadedCount,
                totalFiles,
                Math.round((uploadedCount / totalFiles) * 80)
              );
              return { success: true, fileName: file.name };
            })
            .catch((err) => {
              uploadedCount++;
              updateProgress(
                "uploading",
                uploadedCount,
                totalFiles,
                Math.round((uploadedCount / totalFiles) * 80)
              );
              return {
                success: false,
                fileName: file.name,
                error: err.message,
              };
            })
        )
      );

      // 5️⃣ Check for upload failures
      const failedUploads = uploadResults.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        throw new Error(
          `Failed to upload: ${failedUploads.map((f) => f.fileName).join(", ")}`
        );
      }

      // 6️⃣ Confirmation phase (80-100% progress)
      updateProgress("confirming", totalFiles, totalFiles, 90);

      const confirmRes = await fetch(
        `${import.meta.env.VITE_API_URL}/photos/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            shipmentId,
            photos: signedUrls.map((url) => ({
              key: url.key,
              publicUrl: url.publicUrl,
              fileName: url.fileName,
            })),
          }),
        }
      );

      if (!confirmRes.ok) {
        const error = await confirmRes.json();
        throw new Error(error.message || "Failed to confirm uploaded photos");
      }

      // 7️⃣ Complete phase
      updateProgress("completed", totalFiles, totalFiles, 100);

      const response = await confirmRes.json();

      // Return the proper structure that Redux expects
      return {
        photos: response.photos || response.car?.images || [],
        totalCount:
          response.totalCount || (response.photos ? response.photos.length : 0),
        carId: carId,
        shipmentId: shipmentId,
      };
    } catch (error) {
      // Update progress to show error state
      if (onProgress) {
        onProgress({
          current: uploadedCount,
          total: totalFiles,
          percentage: Math.round((uploadedCount / totalFiles) * 80),
          status: "error",
          stage: "error",
          error: error.message,
        });
      }
      throw error;
    }
  },
  async getShipmentById(shipmentId) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/${shipmentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch shipment: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch shipment");
    }

    // Ensure carId has images array initialized if not present
    if (result.data?.carId && !result.data.carId.images) {
      result.data.carId.images = [];
    }

    return result.data;
  },

  // services/shipmentApiService.js
  async deleteShipmentPhoto(shipmentId, photosToDelete, carId) {
    // console.log("API photos to delete : ", photosToDelete);
    const accessToken = localStorage.getItem("accessToken");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/photos/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },

      body: JSON.stringify({
        shipmentId: shipmentId,
        photos: photosToDelete,
        carId,
      }), // keep your naming
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete photos");
    }

    const data = await res.json();
    return data.photos; // matches your existing thunk
  },
  async deleteShipment(shipmentId) {
    const accessToken = localStorage.getItem("accessToken");
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/delete/${shipmentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const res = await result.json();

    if (!res.success)
      throw new Error(res.message || "Failed to delete shipment");

    return {
      success: true,
      deletedId: res.shipmentId,
      message: res.message,
    };
  },

  async bulkAssignVessel(shipmentIds, vesselId) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/bulk/assign-vessel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ shipmentIds, vesselId }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to assign vessel");
    }

    return result.data;
  },

  async bulkAssignGateOutDate(shipmentIds, gateOutDate) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/shipments/bulk/assign-gateout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ shipmentIds, gateOutDate }),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to assign gate out date");
    }

    return result.data;
  },
};
