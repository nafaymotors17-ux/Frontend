// src/hooks/useShipments.js
import { useState, useEffect, useCallback } from "react";
import { shipmentAPI } from "../../services/shipmentApiService";

export const useShipments = (filters, page, sortBy, sortOrder) => {
  const [data, setData] = useState({
    shipments: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 50,
      hasNext: false,
      hasPrev: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Direct API call - NO REDUX!
      const result = await shipmentAPI.getShipments(
        filters,
        page,
        50,
        sortBy,
        sortOrder
      );

      // Update local state only
      setData({
        shipments: result.data || [],
        pagination: result.pagination || {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
          pageSize: 50,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to fetch shipments");
      console.error("Fetch shipments error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, sortBy, sortOrder]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  return {
    shipments: data.shipments,
    pagination: data.pagination,
    loading,
    error,
    refresh: fetchShipments,
  };
};
