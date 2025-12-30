// src/components/User/CustomerDashboard.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaShip } from "react-icons/fa";
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
import ShipmentTable from "./ShipmentTableView";
import CustomerHeader from "./Header";
import CustomerFilters from "./Filters";
import CustomerPagination from "./TablePagination";

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pagination, filters } = useSelector(
    (state) => state.customerShipments
  );
  const { user } = useSelector((state) => state.auth);

  // Local state for shipments data (not in Redux for performance)
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState("auto"); // "auto", "mobile", "desktop"
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
          limit: currentPagination.pageSize || 10,
          search: currentFilters.search || "",
          status: currentFilters.status || "",
          dateFrom: currentFilters.dateFrom || "",
          dateTo: currentFilters.dateTo || "",
          dateType: currentFilters.dateType || "",
        });

        // Update shipments in local state
        setShipments(result.data || []);

        // Update pagination in Redux with the actual response
        dispatch(setPagination(result.pagination));

        // Scroll to top after data is loaded
        if (tableRef.current) {
          setTimeout(() => {
            tableRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
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

  // Handle shipment selection - navigate to URL instead of Redux state
  const handleSelectShipment = useCallback(
    (shipment) => {
      const shipmentId = shipment._id || shipment.id;
      if (shipmentId) {
        navigate(`/customer/shipment/${shipmentId}`);
      } else {
        toast.error("Shipment ID not found");
      }
    },
    [navigate]
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

        {/* Shipments Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading && shipments.length === 0 ? (
            <div className="p-12 sm:p-16 text-center">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent"></div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    Loading Shipments
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please wait while we fetch your data...
                  </p>
                </div>
              </div>
            </div>
          ) : shipments.length > 0 ? (
            <>
              <div ref={tableRef} className="relative">
                {/* Loading overlay - shows on top of existing data */}
                {loading && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                      <p className="mt-3 text-gray-700 text-sm font-medium">Updating...</p>
                    </div>
                  </div>
                )}
                <ShipmentTable
                  shipments={shipments}
                  onSelectShipment={handleSelectShipment}
                  isMobileView={isMobileView}
                  loading={loading}
                />
              </div>

              {/* Pagination Component */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <CustomerPagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="p-12 sm:p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShip className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
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
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
