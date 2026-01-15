// Enhanced API Service with proper error handling
export const userAPI = {
  async getUsers(filters = {}, page = 1, pageSize = 25) {
    console.log("done");
    if (page < 1) throw new Error("Page must be greater than 0");
    if (pageSize < 1) throw new Error("Page size must be greater than 0");

    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    // ✅ Fix: check for filters.search instead of filters.searchTerm
    if (filters.search && filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters.role && filters.role.trim()) {
      params.append("role", filters.role.trim());
    }

    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/list/users?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();

    if (!result.success)
      throw new Error(result.message || "Failed to fetch users");

    return {
      data: result.data,
      pagination: {
        currentPage: result.meta.pagination.currentPage,
        totalPages: result.meta.pagination.totalPages,
        totalUsers: result.meta.pagination.totalUsers,
        pageSize: result.meta.pagination.usersPerPage,
        hasNext: result.meta.pagination.hasNextPage,
        hasPrev: result.meta.pagination.hasPrevPage,
        totalUserCount: result.meta.pagination.totalUserCount,
      },
    };
  },
  async deleteUser(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const accessToken = localStorage.getItem("accessToken");
    const result = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/delete/user/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      }
    );
    const res = await result.json();
    if (!res.success) throw new Error(res.message, "Failed to delete user");
    return res.data;
  },

  async createUser(userData) {
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    // username is inside Layout/UserModal but we are  at backend we are using userId

    if (userData.username.length < 6) {
      throw new Error("userID must be at least 6 characters long");
    }
    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/create/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(userData),
      }
    );
    const result = await response.json();

    if (!result.success) {
      throw new Error(
        result.message + " " + result?.details || "Failed to create user"
      );
    }
    return result.data;
  },

  // In userApiService.js - update the updateUser method
  async updateUser(id, userData) {
    if (!id) {
      throw new Error("User ID is required");
    }

    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/update/user/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
      }
    );
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || "Failed to update user");
    }

    return result.data;
  },

  async toggleMassDownloadPermission(userId, canMassDownloadPhotos) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const accessToken = localStorage.getItem("accessToken");
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/admin/toggle-mass-download/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ canMassDownloadPhotos }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(
        result.message || "Failed to update mass download permission"
      );
    }

    return result.data;
  },
};
