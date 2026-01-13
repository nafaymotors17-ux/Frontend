// src/pages/ShipmentsPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { fetchUsers } from "../../redux/features/userSlice";
// Redux imports - only for filters and pagination
import {
  setFilter,
  clearFilters,
  setPagination,
  setCurrentPage,
  setPageSize,
  setSortConfig,
  toggleRowSelection,
  toggleAllSelection,
} from "../../redux/features/shipmentSlice";
// Direct API imports
import { shipmentAPI } from "../../services/shipmentApiService";

// Component imports
import ShipmentFilters from "../Shipment/ShipmentFilters";
import ShipmentTable from "../Shipment/ShipmentTable";
import ShipmentPagination from "../Shipment/ShipmentPagination";
import AddShipmentModal from "../Layout/ShipmentModal";
import CSVModal from "../Layout/CSVModal";
import BulkAssignVesselModal from "../Layout/BulkAssignVesselModal";
import BulkAssignGateOutModal from "../Layout/BulkAssignGateOutModal";

const ShipmentsPage = () => {
  const dispatch = useDispatch();
  // Only get filters and pagination from Redux
  const {
    pagination,
    filters,
    selectedRows,
    hasFiltersApplied,
    sortConfig: reduxSortConfig,
  } = useSelector((state) => state.shipments);

  // Local state for shipments data (not in Redux for performance)
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);

  // Ref to track if we should scroll to top
  const tableRef = useRef(null);
  const shouldScrollRef = useRef(false);

  // Local state for modals
  const [showModal, setShowModal] = useState(false);
  const [csvModal, setCSVModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [saveMode, setSaveMode] = useState("save");
  const [showVesselModal, setShowVesselModal] = useState(false);
  const [showGateOutModal, setShowGateOutModal] = useState(false);

  const customerList = useSelector((state) => state.users.dropdownUsers);
  const customers = customerList.length ? customerList : [];

  const DEFAULT_SORT = { field: "createdAt", order: "desc" };

  // Direct API call function
  const fetchShipmentsData = useCallback(
    async (
      pageOverride = null,
      sortByOverride = null,
      sortOrderOverride = null,
      pageSizeOverride = null
    ) => {
      try {
        setLoading(true);
        shouldScrollRef.current = true; // Mark that we should scroll after fetch

        const page = pageOverride ?? pagination.currentPage;
        const sortBy = sortByOverride ?? reduxSortConfig.field;
        const sortOrder = sortOrderOverride ?? reduxSortConfig.order;
        const pageSize = pageSizeOverride ?? pagination.pageSize;

        const result = await shipmentAPI.getShipments(
          filters,
          page,
          pageSize,
          sortBy,
          sortOrder
        );

        // Update shipments in local state (keep old data visible until new data arrives)
        setShipments(result.data || []);

        // Update pagination in Redux - preserve the pageSize we're using
        dispatch(
          setPagination({
            ...result.pagination,
            pageSize: pageSize, // Use the pageSize we actually requested, not what backend might return
          })
        );

        // Scroll to top after data is loaded
        if (shouldScrollRef.current && tableRef.current) {
          setTimeout(() => {
            tableRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            shouldScrollRef.current = false;
          }, 100);
        }
      } catch (error) {
        const errorMsg = error?.message || "Failed to fetch shipments";
        toast.error(errorMsg);
        console.error("Fetch shipments error:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      dispatch,
      filters,
      pagination.currentPage,
      pagination.pageSize,
      reduxSortConfig.field,
      reduxSortConfig.order,
    ]
  );

  // Sort change handler
  const onSortChange = useCallback(
    (field) => {
      let newSortOrder = "asc";

      // If clicking the same field, cycle through: asc → desc → default
      if (reduxSortConfig.field === field) {
        if (reduxSortConfig.order === "asc") {
          newSortOrder = "desc";
        } else if (reduxSortConfig.order === "desc") {
          // Reset to default sort
          const defaultSort = DEFAULT_SORT;
          dispatch(setSortConfig(defaultSort));
          fetchShipmentsData(1, defaultSort.field, defaultSort.order);
          return;
        }
      }

      const newSortConfig = {
        field,
        order: newSortOrder,
      };

      dispatch(setSortConfig(newSortConfig));
      fetchShipmentsData(1, field, newSortOrder);
    },
    [dispatch, reduxSortConfig, fetchShipmentsData]
  );

  // Initial data fetch
  useEffect(() => {
    if (customerList.length === 0) {
      dispatch(fetchUsers({ page: 1, pageSize: 1000 }));
    }
  }, [dispatch, customerList.length]);

  // Fetch shipments when component mounts
  useEffect(() => {
    fetchShipmentsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - other changes handled by specific handlers

  const handleFilterChange = useCallback(
    (key, value) => {
      dispatch(setFilter({ key, value }));
    },
    [dispatch]
  );

  const handleApplyFilters = useCallback(() => {
    dispatch(setCurrentPage(1));
    fetchShipmentsData(1, reduxSortConfig.field, reduxSortConfig.order);
  }, [dispatch, reduxSortConfig, fetchShipmentsData]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    dispatch(setCurrentPage(1));
    fetchShipmentsData(1, reduxSortConfig.field, reduxSortConfig.order);
  }, [dispatch, reduxSortConfig, fetchShipmentsData]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        dispatch(setCurrentPage(newPage));
        fetchShipmentsData(
          newPage,
          reduxSortConfig.field,
          reduxSortConfig.order
        );
      }
    },
    [dispatch, pagination.totalPages, reduxSortConfig, fetchShipmentsData]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      // Ensure pageSize is valid (20, 50, or 100)
      const validSizes = [20, 50, 100];
      const pageSize = validSizes.includes(newPageSize) ? newPageSize : 50;
      // Update Redux state first
      dispatch(setPageSize(pageSize));
      dispatch(setCurrentPage(1));
      // Refetch with new page size - pass it explicitly to ensure it's used immediately
      fetchShipmentsData(
        1,
        reduxSortConfig.field,
        reduxSortConfig.order,
        pageSize
      );
    },
    [dispatch, reduxSortConfig, fetchShipmentsData]
  );

  const handleRowSelect = useCallback(
    (id) => {
      dispatch(toggleRowSelection(id));
    },
    [dispatch]
  );

  const handleSelectAll = useCallback(() => {
    const shipmentIds = shipments.map((s) => s._id || s.id);
    dispatch(toggleAllSelection({ shipmentIds }));
  }, [dispatch, shipments]);

  const handleDelete = async (shipmentId) => {
    if (!window.confirm("Are you sure you want to delete this shipment?"))
      return;

    try {
      setOperationLoading(true);
      // Direct API call
      const res = await shipmentAPI.deleteShipment(shipmentId);
      toast.success(res.message || "Shipment deleted successfully");

      // Optimistically update local state
      setShipments((prev) =>
        prev.filter((s) => (s._id || s.id) !== shipmentId)
      );

      // Update pagination
      const totalItemsAfterDeletion = pagination.totalItems - 1;
      const totalPagesAfterDeletion = Math.ceil(
        totalItemsAfterDeletion / pagination.pageSize
      );
      const newPage = Math.min(
        pagination.currentPage,
        totalPagesAfterDeletion || 1
      );

      dispatch(
        setPagination({
          totalItems: totalItemsAfterDeletion,
          totalPages: totalPagesAfterDeletion,
          currentPage: newPage,
        })
      );

      // Refetch to ensure consistency
      await fetchShipmentsData(
        newPage,
        reduxSortConfig.field,
        reduxSortConfig.order
      );
    } catch (error) {
      const errorMessage = error?.message || "Failed to delete shipment";
      toast.error(errorMessage);
      console.error("Delete error:", error);
      // Refetch to restore correct state
      fetchShipmentsData();
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedRows.length} shipment(s)?`
      )
    )
      return;

    try {
      setOperationLoading(true);
      // Direct API call
      const res = await shipmentAPI.deleteShipments(selectedRows);
      toast.success(
        res.message || `${selectedRows.length} shipment(s) deleted`
      );

      // Optimistically update local state
      setShipments((prev) =>
        prev.filter((s) => !res.deletedIds.includes(s._id || s.id))
      );

      // Clear selection
      dispatch(toggleAllSelection({ shipmentIds: [] }));

      // Update pagination
      const totalItemsAfterDeletion =
        pagination.totalItems - res.deletedIds.length;
      const totalPagesAfterDeletion = Math.ceil(
        totalItemsAfterDeletion / pagination.pageSize
      );
      const newPage = Math.min(
        pagination.currentPage,
        totalPagesAfterDeletion || 1
      );

      dispatch(
        setPagination({
          totalItems: totalItemsAfterDeletion,
          totalPages: totalPagesAfterDeletion,
          currentPage: newPage,
        })
      );

      // Refetch to ensure consistency
      await fetchShipmentsData(
        newPage,
        reduxSortConfig.field,
        reduxSortConfig.order
      );
    } catch (error) {
      toast.error(error?.message || "Failed to delete shipments");
      // Refetch to restore correct state
      fetchShipmentsData();
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSaveShipment = useCallback(
    async (shipmentData, mode = "save", shipmentId = null) => {
      try {
        setOperationLoading(true);
        let result;

        if (mode === "detailsOnly") {
          // Direct API call
          result = await shipmentAPI.createShipment(shipmentData);

          if (result?.success === false) {
            if (result.type === "CONFLICT") {
              const conflictMessage =
                result.message ||
                "A shipment already exists for this car in the specified timeframe";
              const existingDates = result.details?.conflictingDates;

              let detailedMessage = conflictMessage;
              if (existingDates) {
                detailedMessage += `\nExisting shipment: ${new Date(
                  existingDates.existingGateIn
                ).toLocaleDateString()} - ${new Date(
                  existingDates.existingGateOut
                ).toLocaleDateString()}`;
              }

              toast.error(detailedMessage, { duration: 5000 });
              throw new Error("SHIPMENT_CONFLICT");
            } else {
              toast.error(result.message || "Failed to create shipment");
              throw new Error(result.message || "CREATE_FAILED");
            }
          }

          if (result?._id) {
            toast.success("Shipment created successfully!");
            // Refetch current page
            fetchShipmentsData(
              pagination.currentPage,
              reduxSortConfig.field,
              reduxSortConfig.order
            );

            return {
              id: result._id,
              shipment: result,
              success: true,
            };
          } else {
            throw new Error("No shipment ID found in response");
          }
        } else if (mode === "photosOnly" && shipmentId) {
          // Find the shipment to get carId
          const shipment = shipments.find(
            (s) => (s._id || s.id) === shipmentId
          );
          if (!shipment || !shipment.carId) {
            throw new Error("Shipment or car not found");
          }

          // Direct API call
          result = await shipmentAPI.uploadShipmentPhotos(
            shipmentId,
            shipment.carId,
            shipmentData.photos
          );

          if (result?.success === false) {
            toast.error(result.message || "Failed to upload photos");
            throw new Error(result.message || "UPLOAD_FAILED");
          }

          toast.success("Photos uploaded successfully!");

          // Update local state optimistically
          setShipments((prev) =>
            prev.map((s) => {
              if ((s._id || s.id) === shipmentId) {
                return {
                  ...s,
                  photos: result.photos,
                  carId: {
                    ...s.carId,
                    images: result.photos,
                  },
                };
              }
              return s;
            })
          );

          setShowModal(false);
          return { success: true };
        } else {
          throw new Error("Invalid mode or missing shipment ID");
        }
      } catch (error) {
        console.error("Save shipment error:", error);
        if (error.message !== "SHIPMENT_CONFLICT") {
          const errorMessage = error?.message || "An unexpected error occurred";
          toast.error(errorMessage);
        }
        throw error;
      } finally {
        setOperationLoading(false);
      }
    },
    [
      filters,
      pagination.currentPage,
      reduxSortConfig,
      shipments,
      fetchShipmentsData,
    ]
  );

  const handleAddShipment = useCallback(() => {
    setSelectedShipment(null);
    setSaveMode("detailsOnly");
    setShowModal(true);
  }, []);

  const handleEditShipment = useCallback((shipment) => {
    setSelectedShipment(shipment);
    setSaveMode("photosOnly");
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedShipment(null);
    setSaveMode("save");
  }, []);

  // Handle remarks update
  const handleUpdateRemarks = useCallback(async (updatedShipment) => {
    // Update local state optimistically
    setShipments((prev) =>
      prev.map((s) =>
        (s._id || s.id) === (updatedShipment._id || updatedShipment.id)
          ? { ...s, remarks: updatedShipment.remarks }
          : s
      )
    );
  }, []);

  // Handle vessel update
  const handleVesselUpdate = useCallback(() => {
    // Refresh shipments data after vessel update
    fetchShipmentsData();
  }, [fetchShipmentsData]);

  // Handle inline shipment update (optimized - no refetch)
  const handleShipmentUpdate = useCallback((updatedShipment) => {
    // Update the specific shipment in the local state
    // Handle partial updates (e.g., only imageCount from photo modal)
    setShipments((prev) =>
      prev.map((s) => {
        if ((s._id || s.id) === (updatedShipment._id || updatedShipment.id)) {
          // Deep merge for nested objects like carId
          if (updatedShipment.carId?.imageCount !== undefined) {
            return {
              ...s,
              carId: {
                ...s.carId,
                imageCount: updatedShipment.carId.imageCount,
              },
            };
          }
          return { ...s, ...updatedShipment };
        }
        return s;
      })
    );
  }, []);

  return (
    <div className="space-y-2 px-4">
      <ShipmentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        filterOptions={customers}
        hasFiltersApplied={hasFiltersApplied}
        selectedRowsCount={selectedRows.length}
        onAddShipment={handleAddShipment}
        onExportCSV={() => setCSVModal(true)}
        onDeleteSelected={handleDeleteSelected}
        onAssignVessel={() => setShowVesselModal(true)}
        onAssignGateOut={() => setShowGateOutModal(true)}
      />

      <div ref={tableRef}>
        <ShipmentTable
          shipments={shipments}
          selectedRows={selectedRows}
          loading={loading}
          operationLoading={operationLoading}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
          onDelete={handleDelete}
          onSortChange={onSortChange}
          sortConfig={reduxSortConfig}
          onUpdateRemarks={handleUpdateRemarks}
          onVesselUpdate={handleVesselUpdate}
          onShipmentUpdate={handleShipmentUpdate}
        />
      </div>

      <ShipmentPagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        loading={loading || operationLoading}
      />

      {csvModal && (
        <CSVModal
          open={csvModal}
          onClose={() => setCSVModal(false)}
          shipments={shipments}
        />
      )}

      {showModal && (
        <AddShipmentModal
          onClose={handleCloseModal}
          onSave={handleSaveShipment}
          customerList={customers}
          shipment={selectedShipment}
          mode={saveMode}
        />
      )}

      {showVesselModal && (
        <BulkAssignVesselModal
          isOpen={showVesselModal}
          onClose={() => setShowVesselModal(false)}
          selectedShipmentIds={selectedRows}
          onSuccess={() => {
            fetchShipmentsData();
            dispatch(toggleAllSelection({ shipmentIds: [] }));
          }}
        />
      )}

      {showGateOutModal && (
        <BulkAssignGateOutModal
          isOpen={showGateOutModal}
          onClose={() => setShowGateOutModal(false)}
          selectedShipmentIds={selectedRows}
          onSuccess={() => {
            fetchShipmentsData();
            dispatch(toggleAllSelection({ shipmentIds: [] }));
          }}
        />
      )}
    </div>
  );
};

export default ShipmentsPage;
