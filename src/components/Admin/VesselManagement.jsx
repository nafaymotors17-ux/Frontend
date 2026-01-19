// Vessel Management Component
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { FaPlus, FaSearch, FaEdit } from "react-icons/fa";
import { vesselAPI } from "../../services/vesselApiService";
import VesselTable from "./VesselTable";
import VesselModal from "./VesselModal";

const VesselManagement = () => {
  // Get user role
  let user = null;
  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }

  const isAdmin = user?.role === "admin";
  const isSubAdmin = user?.role === "subadmin";

  // State
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVessel, setCurrentVessel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 50,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch vessels
  const fetchVessels = async (page = 1, pageSize = pagination.pageSize, search = "") => {
    try {
      setLoading(true);
      const filters = search ? { search } : {};
      const result = await vesselAPI.getVessels(filters, page, pageSize, "createdAt", "desc");
      setVessels(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (error) {
      console.error("Error fetching vessels:", error);
      toast.error(error.message || "Failed to fetch vessels");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchVessels(1, 50);
  }, []);

  // Search handler
  const handleSearch = () => {
    fetchVessels(1, pagination.pageSize, searchTerm);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    fetchVessels(1, pagination.pageSize);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Page change handler
  const handlePageChange = async (page) => {
    await fetchVessels(page, pagination.pageSize, searchTerm);
  };

  // Page size change handler
  const handlePageSizeChange = async (newPageSize) => {
    await fetchVessels(1, newPageSize, searchTerm);
  };

  // Modal handlers
  const openAddModal = () => {
    if (!isAdmin) {
      toast.error("You don't have permission to create vessels");
      return;
    }
    setCurrentVessel(null);
    setIsModalOpen(true);
  };

  const openEditModal = (vessel) => {
    if (!isAdmin) {
      toast.error("You don't have permission to edit vessels");
      return;
    }
    setCurrentVessel(vessel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVessel(null);
  };

  // CRUD operations
  const handleSubmit = async (vesselData) => {
    try {
      setOperationLoading(true);
      if (currentVessel) {
        // Update vessel
        await vesselAPI.updateVessel(currentVessel._id, vesselData);
        toast.success("Vessel updated successfully");
      } else {
        // Create vessel
        await vesselAPI.createVessel(vesselData);
        toast.success("Vessel created successfully");
      }
      handleCloseModal();
      fetchVessels(pagination.currentPage, pagination.pageSize, searchTerm);
    } catch (error) {
      console.error("Error saving vessel:", error);
      toast.error(error.message || "Failed to save vessel");
    } finally {
      setOperationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Total Vessels + Add */}
            <div className="flex items-center justify-between lg:justify-start gap-3">
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                Total Vessels: {pagination?.totalItems || 0}
              </p>
              {isAdmin && (
                <button
                  onClick={openAddModal}
                  disabled={operationLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Add Vessel</span>
                </button>
              )}
            </div>

            {/* Search Bar and Button */}
            <div className="flex w-full lg:w-auto items-center gap-2 lg:justify-end">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search vessels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-8 flex items-center text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={operationLoading || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center text-sm disabled:opacity-50"
                title="Search"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <VesselTable
            vessels={vessels}
            pagination={pagination}
            onEdit={openEditModal}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            isAdmin={isAdmin}
            onRefresh={() => fetchVessels(pagination.currentPage, pagination.pageSize, searchTerm)}
          />
        </div>

        {/* Modal */}
        {isAdmin && (
          <VesselModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            vessel={currentVessel}
            isEdit={!!currentVessel}
            loading={operationLoading}
          />
        )}
      </div>
    </div>
  );
};

export default VesselManagement;
