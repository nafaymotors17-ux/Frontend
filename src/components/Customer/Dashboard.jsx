// src/components/User/CustomerDashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaShip, FaDownload } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  setChassisFilter,
  setStatusFilter,
  setDateFilter,
  setCurrentPage,
  setPagination,
  clearFilters,
} from "../../redux/features/customerSlice";
import { customerShipmentAPI } from "../../services/customerApiService";
import { downloadShipmentPhotos } from "../../utils/photoDownload";
import ShipmentTable from "./ShipmentTableView";
import CustomerHeader from "./Header";
import CustomerFilters from "./Filters";
import CustomerPagination from "./TablePagination";
import ShipmentDetailModal from "./ShipmentDetailModal";
import PhotosModal from "./PhotosModal";

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pagination, filters } = useSelector(
    (state) => state.customerShipments
  );
  const { user } = useSelector((state) => state.auth);

  // Check if user can mass download photos
  useEffect(() => {
    if (user?.canMassDownloadPhotos) {
      setCanMassDownload(true);
    }
  }, [user]);

  // Local state for shipments data (not in Redux for performance)
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("auto"); // "auto", "mobile", "desktop"
  const [selectedShipments, setSelectedShipments] = useState([]);
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    shipmentId: null,
    shipmentData: null,
  });
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    shipmentId: null,
    shipmentData: null,
  });
  const [canMassDownload, setCanMassDownload] = useState(false);
  const tableRef = useRef(null);

  // Refs to avoid stale closures in callbacks
  const filtersRef = useRef(filters);
  const paginationRef = useRef(pagination);

  useEffect(() => {
    filtersRef.current = filters;
    paginationRef.current = pagination;
  }, [filters, pagination]);

  // Direct API call function - use refs to avoid stale closures
  const fetchShipmentsData = useCallback(
    async (pageOverride = null) => {
      try {
        setLoading(true);

        // Use refs to get current values (avoids stale closures)
        const currentFilters = filtersRef.current;
        const currentPagination = paginationRef.current;
        const page = pageOverride ?? currentPagination.currentPage;

        const result = await customerShipmentAPI.getShipments({
          page,
          limit: currentPagination.pageSize || 20,
          search: currentFilters.search || "",
          status: currentFilters.status || "",
          dateFrom: currentFilters.dateFrom || "",
          dateTo: currentFilters.dateTo || "",
          dateType: currentFilters.dateType || "",
        });

        // Clear selection when data changes
        setSelectedShipments([]);

        // Update shipments in local state
        setShipments(result.data || []);

        // Update pagination in Redux with the actual response
        dispatch(setPagination(result.pagination));

        // Scroll to top after data is loaded (only if not initial load)
        if (tableRef.current && pageOverride !== null) {
          requestAnimationFrame(() => {
            tableRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        }
      } catch (error) {
        const errorMsg = error?.message || "Failed to fetch shipments";
        toast.error(errorMsg);
        console.error("Fetch shipments error:", error);
      } finally {
        setLoading(false);
      }
    },
    [dispatch]
  );

  // Initial data fetch
  useEffect(() => {
    fetchShipmentsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Refetch when filters change (but not on initial mount)
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Filters changed - reset to page 1 and refetch
    dispatch(setCurrentPage(1));
    fetchShipmentsData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.status,
    filters.dateType,
    filters.dateFrom,
    filters.dateTo,
  ]);

  // Memoized search handler
  const handleSearch = useCallback(
    (searchFilters) => {
      // Update filters in Redux state
      if (searchFilters.search !== undefined) {
        dispatch(setChassisFilter(searchFilters.search));
      }
      if (searchFilters.status !== undefined) {
        dispatch(setStatusFilter(searchFilters.status));
      }
      if (searchFilters.dateType !== undefined) {
        dispatch(
          setDateFilter({
            dateType: searchFilters.dateType,
            dateFrom: searchFilters.dateFrom,
            dateTo: searchFilters.dateTo,
          })
        );
      }

      // Reset to page 1 and fetch - use setTimeout to ensure Redux state is updated
      dispatch(setCurrentPage(1));
      setShowMobileFilters(false);
      setTimeout(() => {
        fetchShipmentsData(1);
      }, 0);
    },
    [dispatch, fetchShipmentsData]
  );

  // Memoized clear filters handler
  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    setShowMobileFilters(false);
    setTimeout(() => {
      fetchShipmentsData(1);
    }, 0);
  }, [dispatch, fetchShipmentsData]);

  // Memoized page change handler
  const handlePageChange = useCallback(
    (newPage) => {
      dispatch(setCurrentPage(newPage));
      fetchShipmentsData(newPage);
    },
    [dispatch, fetchShipmentsData]
  );

  // Handle shipment selection - show modal with already loaded data
  const handleSelectShipment = useCallback((shipment) => {
    const shipmentId = shipment._id || shipment.id;
    if (shipmentId) {
      // Store the shipment data to avoid refetching
      setDetailModal({ isOpen: true, shipmentId, shipmentData: shipment });
    } else {
      toast.error("Shipment ID not found");
    }
  }, []);

  // Handle view details - same as handleSelectShipment but for table view button
  const handleViewDetails = useCallback(
    (shipment) => {
      handleSelectShipment(shipment);
    },
    [handleSelectShipment]
  );

  // Handle view photos - open photos modal directly
  const handleViewPhotos = useCallback((shipment) => {
    const shipmentId = shipment._id || shipment.id;
    if (shipmentId) {
      setPhotoModal({ isOpen: true, shipmentId, shipmentData: shipment });
    } else {
      toast.error("Shipment ID not found");
    }
  }, []);

  // Handle photo download - uses signed URLs and creates ZIP in browser
  const handleDownloadPhoto = useCallback(async (shipment) => {
    const shipmentId = shipment._id || shipment.id;
    if (!shipmentId) {
      toast.error("Shipment ID not found");
      return;
    }

    try {
      const fileName = shipment.carId?.chassisNumber
        ? `${shipment.carId.chassisNumber}_photos.zip`
        : `photos_${shipmentId}.zip`;

      await downloadShipmentPhotos(shipmentId, fileName);
    } catch (error) {
      console.error("Download error:", error);
      // Error already handled in downloadShipmentPhotos
    }
  }, []);

  // Ref to prevent multiple toast notifications
  const toastShownRef = useRef(false);

  // Handle toggle selection
  const handleToggleSelect = useCallback((shipmentId) => {
    setSelectedShipments((prev) => {
      if (prev.includes(shipmentId)) {
        // Reset toast flag when deselecting
        if (prev.length === 21) {
          toastShownRef.current = false;
        }
        return prev.filter((id) => id !== shipmentId);
      } else {
        if (prev.length >= 20) {
          // Only show toast once
          if (!toastShownRef.current) {
            toast.warning("Maximum 20 shipments can be selected for download");
            toastShownRef.current = true;
            // Reset flag after 2 seconds
            setTimeout(() => {
              toastShownRef.current = false;
            }, 2000);
          }
          return prev;
        }
        return [...prev, shipmentId];
      }
    });
  }, []);

  // Handle mass download - downloads photos using signed URLs and bundles into single ZIP
  const handleMassDownload = useCallback(async () => {
    if (selectedShipments.length === 0) {
      toast.warning("Please select at least one shipment to download");
      return;
    }

    if (selectedShipments.length > 20) {
      toast.error("Maximum 20 shipments can be selected");
      return;
    }

    if (!canMassDownload) {
      toast.error(
        "You don't have permission to mass download photos. Please contact admin."
      );
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("Authentication required. Please login again.");
      return;
    }

    // Show progress toast
    const progressToast = toast.loading(
      `Preparing download (0/${selectedShipments.length})...`,
      {
        position: "bottom-right",
        autoClose: false,
      }
    );

    // Download each shipment and bundle into single ZIP
    try {
      // Import JSZip dynamically
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      let successCount = 0;
      let failCount = 0;

      // Download each shipment's photos and add to master ZIP
      for (let i = 0; i < selectedShipments.length; i++) {
        const shipmentId = selectedShipments[i];
        const shipment = shipments.find((s) => (s._id || s.id) === shipmentId);

        try {
          // Update progress
          toast.update(progressToast, {
            render: `Downloading shipment ${i + 1}/${
              selectedShipments.length
            }...`,
            type: "info",
          });

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
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Download failed: ${response.status}`
            );
          }

          const data = await response.json();
          if (!data.photos || data.photos.length === 0) {
            throw new Error("No photos available");
          }

          const folderName = shipment?.carId?.chassisNumber || shipmentId;

          // Download all photos in parallel using Promise.all for efficiency
          const photoDownloadPromises = data.photos.map(async (photo) => {
            try {
              const photoResponse = await fetch(photo.url);
              if (!photoResponse.ok) return null;

              const photoBlob = await photoResponse.blob();
              return {
                fileName: photo.fileName,
                blob: photoBlob,
                folderName: folderName,
              };
            } catch (error) {
              console.error(`Error downloading ${photo.fileName}:`, error);
              return null;
            }
          });

          // Wait for all photos to download in parallel
          const photoResults = await Promise.all(photoDownloadPromises);

          // Add successful downloads to ZIP
          photoResults.forEach((result) => {
            if (result) {
              zip.file(`${result.folderName}/${result.fileName}`, result.blob);
            }
          });

          successCount++;
        } catch (error) {
          console.error(`Error downloading shipment ${shipmentId}:`, error);
          failCount++;
        }

        // Small delay between shipments
        if (i < selectedShipments.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Generate final ZIP
      if (successCount > 0) {
        toast.update(progressToast, {
          render: `Creating bundle (${successCount} shipment${
            successCount !== 1 ? "s" : ""
          })...`,
          type: "info",
        });

        // Generate ZIP as blob (browser-compatible)
        const finalZipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        // Download the bundled ZIP
        const url = window.URL.createObjectURL(finalZipBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shipments_photos_${
          new Date().toISOString().split("T")[0]
        }.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Clear selection and show result
        setSelectedShipments([]);
        toast.dismiss(progressToast);

        if (failCount > 0) {
          toast.warning(
            `Downloaded ${successCount} shipment(s), ${failCount} failed.`,
            { position: "bottom-right", autoClose: 5000 }
          );
        } else {
          toast.success(
            `Successfully downloaded ${successCount} shipment(s) as a single ZIP file!`,
            { position: "bottom-right", autoClose: 4000 }
          );
        }
      } else {
        toast.dismiss(progressToast);
        toast.error(`Failed to download any shipments. Please try again.`, {
          position: "bottom-right",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Mass download error:", error);
      toast.dismiss(progressToast);
      toast.error(
        `Failed to create bundle: ${error.message || "Unknown error"}`
      );
    }
  }, [selectedShipments, shipments, canMassDownload]);

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      const validSizes = [20, 50];
      const pageSize = validSizes.includes(newPageSize) ? newPageSize : 20;
      // Update Redux state first
      dispatch(setPagination({ ...pagination, pageSize, currentPage: 1 }));
      // Update ref immediately so fetchShipmentsData uses the new pageSize
      paginationRef.current = {
        ...paginationRef.current,
        pageSize,
        currentPage: 1,
      };
      // Fetch with new page size
      fetchShipmentsData(1);
    },
    [dispatch, pagination, fetchShipmentsData]
  );

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userData");
    window.location.href = "/login";
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    toast.info("Generating Excel export... please wait");

    const query = new URLSearchParams({
      search: filters.search || "", // Use search parameter
      status: filters.status,
      dateType: filters.dateType,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    }).toString();
    const customerId = JSON.parse(localStorage.getItem("userData"))._id;
    const url = `${
      import.meta.env.VITE_API_URL
    }/client/shipments/export/csv/${customerId}?${query}`;
    window.open(url, "_blank");
  };

  // Check if there are active filters
  const hasActiveFilters =
    filters.search || filters.status || filters.dateFrom || filters.dateTo;

  // Determine if mobile view should be shown
  const [isMobileView, setIsMobileViewState] = useState(() => {
    if (typeof window === "undefined") return false;
    if (viewMode === "mobile") return true;
    if (viewMode === "desktop") return false;
    return window.innerWidth < 768;
  });

  // Update mobile view when viewMode or window size changes
  useEffect(() => {
    if (viewMode === "mobile") {
      setIsMobileViewState(true);
    } else if (viewMode === "desktop") {
      setIsMobileViewState(false);
    } else {
      // Auto mode - detect from window size
      const checkMobile = () => {
        setIsMobileViewState(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <CustomerHeader
        user={user}
        onLogout={handleLogout}
        onMobileFilterToggle={() => setShowMobileFilters(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content - Improved Layout */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters Component */}
        <div className="mb-6">
          <CustomerFilters
            filters={{
              search: filters.search || "",
              status: filters.status || "",
              dateType: filters.dateType || "",
              dateFrom: filters.dateFrom || "",
              dateTo: filters.dateTo || "",
            }}
            stats={{
              totalItems: pagination.totalItems,
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
            }}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            onExportExcel={handleExportExcel}
            isMobile={isMobileView}
            showMobileFilters={showMobileFilters}
            onCloseMobileFilters={() => setShowMobileFilters(false)}
          />
        </div>

        {/* Shipments Table Container - Improved Design */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Selection Header - Like Admin Panel */}
          {canMassDownload && selectedShipments.length > 0 && (
            <div className="border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedShipments.length} shipment(s) selected (max 20)
                </span>
              </div>
              <button
                onClick={handleMassDownload}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaDownload />
                Download Selected
              </button>
            </div>
          )}

          {loading && shipments.length === 0 ? (
            <div className="p-16 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaShip className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Loading Shipments
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait while we fetch your data...
                  </p>
                </div>
              </div>
            </div>
          ) : shipments.length > 0 ? (
            <>
              <div ref={tableRef} className="relative min-h-[400px]">
                {/* Loading overlay - shows on top of existing data */}
                {loading && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                      <p className="mt-3 text-gray-700 text-sm font-medium">
                        Updating...
                      </p>
                    </div>
                  </div>
                )}
                <ShipmentTable
                  shipments={shipments}
                  onSelectShipment={handleSelectShipment}
                  onDownloadPhoto={handleDownloadPhoto}
                  onViewDetails={handleViewDetails}
                  onViewPhotos={handleViewPhotos}
                  isMobileView={isMobileView}
                  loading={loading}
                  selectedShipments={selectedShipments}
                  onToggleSelect={handleToggleSelect}
                  canSelect={canMassDownload}
                />
              </div>

              {/* Pagination Component */}
              <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                <CustomerPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  loading={loading}
                />
              </div>
            </>
          ) : (
            /* Empty State - Improved Design */
            <div className="p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <FaShip className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {hasActiveFilters
                    ? "No matching shipments"
                    : "No shipments found"}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your search criteria or clear filters to see all shipments."
                    : "There are currently no shipments assigned to your account."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ShipmentDetailModal
        isOpen={detailModal.isOpen}
        onClose={() =>
          setDetailModal({
            isOpen: false,
            shipmentId: null,
            shipmentData: null,
          })
        }
        shipmentId={detailModal.shipmentId}
        shipmentData={detailModal.shipmentData}
        onViewPhotos={(shipmentId) => {
          setDetailModal({
            isOpen: false,
            shipmentId: null,
            shipmentData: null,
          });
          setPhotoModal({
            isOpen: true,
            shipmentId,
            shipmentData: detailModal.shipmentData,
          });
        }}
      />

      <PhotosModal
        isOpen={photoModal.isOpen}
        onClose={() =>
          setPhotoModal({ isOpen: false, shipmentId: null, shipmentData: null })
        }
        shipmentId={photoModal.shipmentId}
        shipmentData={photoModal.shipmentData}
      />
    </div>
  );
};

export default CustomerDashboard;
