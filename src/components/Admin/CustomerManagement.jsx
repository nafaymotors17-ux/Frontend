// src/pages/UserManagement.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { FaChartBar, FaPlus, FaSearch } from "react-icons/fa"; // Redux imports
import {
  fetchUsers,
  deleteUser,
  createUser,
  updateUser,
} from "../../redux/features/userSlice";

// Component imports
import UserTable from "../User/UserTable";
import UserModal from "../Layout/UserModel";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading, operationLoading, totalUsers } =
    useSelector((state) => state.users);
  let user = null;

  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      user = JSON.parse(storedUser); // parse JSON to object
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users function
  const fetchUsersWithFilters = (page = 1, search = "") => {
    dispatch(
      fetchUsers({
        page,
        pageSize: 25,
        searchTerm: search.trim(), // Send search term to backend
      })
    );
  };

  // Initial load
  useEffect(() => {
    console.log("Users lenght : ", users.length);

    if (users.length === 0) fetchUsersWithFilters(1);
  }, []);

  // Search handler - only when search button is clicked
  const handleSearch = () => {
    fetchUsersWithFilters(1, searchTerm);
  };

  // Clear search and reload all users
  const handleClearSearch = () => {
    setSearchTerm("");
    fetchUsersWithFilters(1);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = async (page) => {
    const start = performance.now(); // ⏱ Start timer

    try {
      await dispatch(fetchUsers({ page, pageSize: 25, searchTerm })).unwrap();
    } finally {
      const end = performance.now();
      console.log(`⏱ Fetch took ${(end - start).toFixed(2)} ms`);
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  // CRUD operations
  const handleSubmit = (userData) => {
    if (currentUser) {
      // Update user - use the userData directly as it's already formatted
      console.log(userData);

      dispatch(
        updateUser({
          id: currentUser._id, // Use _id from backend response
          userData: userData, // Pass the formatted userData directly
        })
      )
        .unwrap()
        .then(() => {
          toast.success("User updated successfully");
          handleCloseModal();
          fetchUsersWithFilters(pagination.currentPage, searchTerm);
        })
        .catch((error) => {
          console.error("Update error:", error);
          toast.error(error || "Failed to update user");
        });
    } else {
      // Create user
      dispatch(createUser(userData))
        .unwrap()
        .then((user) => {
          toast.success("User added successfully");

          if (user.user.duplicateWarnning) {
            setTimeout(() => {
              toast.warning("Duplicate user name detected");
            }, 1000);
          }
          handleCloseModal();
          fetchUsersWithFilters(1, searchTerm);
        })
        .catch((error) => {
          toast.error(error || "Failed to create user");
        });
    }
  };

  const handleDelete = (userId) => {
    const confirmed = window.confirm(
      "⚠️ Warning: Deleting this user will also delete ALL shipments related to this customer. Are you sure you want to proceed?"
    );

    if (confirmed) {
      dispatch(deleteUser(userId))
        .unwrap()
        .then((res) => {
          toast.success("User deleted successfully");
          setTimeout(() => {
            toast.message(
              res?.totalShipmentsDeleted > 0
                ? `Total shipments deleted ${res?.totalShipmentsDeleted}`
                : "No shipments to delete"
            );
          }, 700);
          fetchUsersWithFilters(pagination.currentPage, searchTerm);
        })
        .catch((error) => {
          toast.error(error);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Total Users + Add */}
            <div className="flex items-center justify-between lg:justify-start gap-3">
              <p className="text-gray-700 font-medium text-sm sm:text-base">
                Total Users: {pagination?.totalUserCount}
              </p>
              {user.role === "admin" && (
                <button
                  onClick={openAddModal}
                  disabled={operationLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded 
                   flex items-center gap-2 text-sm"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              )}
            </div>

            {/* Search Bar and Button */}
            <div className="flex w-full lg:w-auto items-center gap-2 lg:justify-end">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     w-full text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-8 flex items-center 
                       text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>

              <button
                onClick={handleSearch}
                disabled={operationLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded 
                   flex items-center justify-center text-sm"
                title="Search"
              >
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <UserTable
            users={users}
            pagination={pagination}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>

        {/* Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          user={currentUser}
          isEdit={!!currentUser}
          loading={operationLoading}
        />
      </div>
    </div>
  );
};

export default UserManagement;
