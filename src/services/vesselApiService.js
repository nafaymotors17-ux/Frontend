// Vessel API Service
export const vesselAPI = {
  async getVessels(filters = {}, page = 1, pageSize = 50, sortBy = "createdAt", sortOrder = "desc") {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/list?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch vessels: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch vessels");
    }

    return {
      data: result.data || [],
      pagination: {
        currentPage: result.meta?.pagination?.currentPage || 1,
        totalPages: result.meta?.pagination?.totalPages || 1,
        totalItems: result.meta?.pagination?.totalItems || 0,
        pageSize: pageSize,
        hasNext: result.meta?.pagination?.hasNextPage || false,
        hasPrev: result.meta?.pagination?.hasPrevPage || false,
      },
    };
  },

  async searchVessels(query, limit = 20) {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
    });

    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/search?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search vessels: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to search vessels");
    }

    return result.data || [];
  },

  async createVessel(vesselData) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(vesselData),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to create vessel");
    }

    return result.data;
  },

  async updateVessel(id, vesselData) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/update/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify(vesselData),
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to update vessel");
    }

    return result.data;
  },

  async deleteVessel(id) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to delete vessel");
    }

    return result.data;
  },

  async getVesselById(id) {
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/vessels/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch vessel: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to fetch vessel");
    }

    return result.data;
  },

  // Assign vessel to shipments (convenience method - calls shipment API)
  async assignVesselToShipments(shipmentIds, vesselId) {
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to assign vessel: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to assign vessel");
    }

    return result.data;
  },
};

