// src/services/customerApiService.js
export const customerShipmentAPI = {
  async getShipments(params = {}) {
    const {
      page = 1,
      limit = 10,
      chassisNo = "",
      status = "",
      dateFrom = "",
      dateTo = "",
      dateType = "",
      search = "",
    } = params;

    const query = new URLSearchParams({
      page,
      limit,
      ...(chassisNo && { chassisNo }),
      ...(status && { status }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(dateType && { dateType }),
      search,
    }).toString();
    const accessToken = localStorage.getItem("accessToken");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/client/get/shipments?${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shipments");
      }

      // Backend response format: { status: 'success', data: [], pagination: {...} }
      // Handle both possible response formats
      const shipments = data.data || data.shipments || [];
      const backendPagination = data.pagination || {};
      
      // Normalize pagination to match frontend format
      const pagination = {
        currentPage: backendPagination.currentPage || page,
        totalPages: backendPagination.totalPages || 1,
        totalItems: backendPagination.totalItems || shipments.length,
        pageSize: backendPagination.limit || backendPagination.pageSize || limit,
        hasNext: backendPagination.hasNext || backendPagination.hasNextPage || false,
        hasPrev: backendPagination.hasPrev || backendPagination.hasPrevPage || false,
      };

      return { data: shipments, pagination };
    } catch (error) {
      console.error("Error fetching shipments:", error);
      throw error;
    }
  },

  async getShipmentById(shipmentId) {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const startTime = performance.now(); // Performance tracking
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/client/get/shipment/${shipmentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || data.error || "Failed to fetch shipment";
        throw new Error(errorMessage);
      }

      // Backend response format: { success: true, data: {...}, statusCode: 200 }
      const shipment = data.data || data;
      
      if (!shipment) {
        throw new Error("Shipment data not found in response");
      }

      // Ensure carId has images array initialized if not present
      if (shipment.carId && !shipment.carId.images) {
        shipment.carId.images = [];
      }

      // Only log performance in development
      if (import.meta.env.DEV) {
        const duration = performance.now() - startTime;
        console.log(`✅ Shipment loaded in ${duration.toFixed(2)}ms: ${shipment._id || shipment.id}`);
      }

      return shipment;
    } catch (error) {
      console.error("Error fetching shipment:", error);
      throw error;
    }
  },
};
