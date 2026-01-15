// src/components/users/UserTable.jsx
import React, { useState } from "react";
import {
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";
import { toast } from "sonner";
import { userAPI } from "../../services/userApiService";

const UserTable = ({
  users = [],
  pagination = {},
  onEdit,
  onDelete,
  onPageChange,
  loading,
  onRefresh,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [togglingUsers, setTogglingUsers] = useState(new Set());
  let loggedInUser = null;
  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      loggedInUser = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }

  const isAdmin = loggedInUser?.role === "admin";

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleToggleMassDownload = async (user) => {
    if (user.role !== "customer") {
      toast.error("Mass download permission can only be set for customers");
      return;
    }

    const newValue = !user.canMassDownloadPhotos;
    setTogglingUsers((prev) => new Set(prev).add(user._id || user.id));

    try {
      await userAPI.toggleMassDownloadPermission(user._id || user.id, newValue);
      toast.success(
        `Mass download permission ${newValue ? "enabled" : "disabled"} for ${user.name}`
      );
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update mass download permission");
    } finally {
      setTogglingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user._id || user.id);
        return newSet;
      });
    }
  };

  // Calculate starting number based on current page and page size
  const getStartingNumber = () => {
    const pageSize = pagination.pageSize || 10;
    return (pagination.currentPage - 1) * pageSize + 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No users found
        </h3>
        <p className="text-gray-500">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-2 py-1 text-left text-xs font-semibold text-gray-800 w-12">
                #
              </th>
              <th className="border border-gray-400 px-2 py-1 text-left text-xs font-semibold text-gray-800 w-12">
                Created AT
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left text-xs font-semibold text-gray-800">
                Name
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left text-xs font-semibold text-gray-800">
                User ID
              </th>
              <th className="border border-gray-400 px-3 py-1 text-left text-xs font-semibold text-gray-800">
                Password
              </th>
              {isAdmin && (
                <>
                  <th className="border border-gray-400 px-3 py-1 text-left text-xs font-semibold text-gray-800">
                    Mass Download
                  </th>
                  <th className="border border-gray-400 px-3 py-1 text-left text-xs font-semibold text-gray-800">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const userNumber = getStartingNumber() + index;
              return (
                <tr key={user.id || user._id} className="hover:bg-gray-100">
                  {/* Serial Number */}
                  <td className="border border-gray-300 px-2  text-xs text-gray-600 text-center font-medium">
                    {userNumber}
                  </td>

                  <td className="border border-gray-300 px-2  text-xs text-gray-600 text-center font-medium">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  {/* Name */}
                  <td className="border border-gray-300 px-3  text-xs text-gray-900">
                    {user.name}
                  </td>

                  {/* User ID */}
                  <td className="border border-gray-300 px-3  text-xs text-gray-700 font-mono">
                    {user.userId}
                  </td>

                  {/* Password */}
                  <td className="border border-gray-300 px-3  text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {visiblePasswords[user.id || user._id]
                          ? user.password
                          : "•".repeat(8)}
                      </span>
                      <button
                        onClick={() =>
                          togglePasswordVisibility(user.id || user._id)
                        }
                        className="text-gray-600 hover:text-gray-800"
                        title={
                          visiblePasswords[user.id || user._id]
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {visiblePasswords[user.id || user._id] ? (
                          <FaEyeSlash size={14} />
                        ) : (
                          <FaEye size={14} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Mass Download Permission */}
                  {isAdmin && (
                    <td className="border border-gray-300 px-3 py-2">
                      {user.role === "customer" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleMassDownload(user)}
                            disabled={togglingUsers.has(user._id || user.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                              user.canMassDownloadPhotos
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={
                              user.canMassDownloadPhotos
                                ? "Click to disable mass download"
                                : "Click to enable mass download"
                            }
                          >
                            <FaDownload size={12} />
                            <span>
                              {togglingUsers.has(user._id || user.id)
                                ? "Updating..."
                                : user.canMassDownloadPhotos
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 text-center block">-</span>
                      )}
                    </td>
                  )}

                  {/* Actions */}
                  {isAdmin && (
                    <td className="border border-gray-300 px-3 py-2">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => onEdit(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit user"
                        >
                          <FaEdit size={16} />
                        </button>
                        {/* {user.role !== "admin" && (
                        <button
                          onClick={() => onDelete(user._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete user"
                        >
                          <FaTrash size={16} />
                        </button>
                      )} */}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <div className="border-t border-gray-300 bg-gray-100">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="text-sm text-gray-700 font-medium">
              Showing {getStartingNumber()} to{" "}
              {getStartingNumber() + users.length - 1} of{" "}
              {pagination.totalUserCount} users
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="p-1 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <FaChevronLeft size={16} />
                </button>

                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="p-1 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <FaChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
