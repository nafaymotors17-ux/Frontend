import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userAPI } from "../../services/userApiService";

// ✅ Utility to filter out admin users everywhere
const filterNonAdminUsers = (users = []) =>
  users.filter((user) => user.role?.toLowerCase() !== "admin");

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ searchTerm = "", page = 1, pageSize = 25 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUsers(
        { search: searchTerm },
        page,
        pageSize
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await userAPI.deleteUser(userId);
      return res;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userAPI.createUser(userData);
      return { user: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData);

      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  users: [],
  dropdownUsers: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 25,
    hasNext: false,
    hasPrev: false,
    totalUserCount: 0,
  },
  filters: {
    searchTerm: "",
    status: "",
  },
  appliedFilters: {
    searchTerm: "",
    status: "",
  },
  loading: false,
  error: null,
  operationLoading: false,
  totalUsers: 0,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.appliedFilters = initialState.appliedFilters;
    },
    applyFilters: (state) => {
      state.appliedFilters = { ...state.filters };
      state.pagination.currentPage = 1;
    },
    resetUsersState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // FETCH USERS
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const { data, pagination } = action.payload || {};

        // ✅ Filter out admin users
        const filteredUsers = filterNonAdminUsers(data);

        if (pagination?.pageSize === 1000) {
          state.dropdownUsers = filteredUsers;
          console.log("pagination 1 : ", pagination);
        } else {
          state.users = filteredUsers;
          state.totalUsers = filteredUsers.length;
          console.log("pagination 2 : ", pagination);
          state.pagination = pagination || initialState.pagination;
        }

        state.appliedFilters = state.filters;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // DELETE USER
      .addCase(deleteUser.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        const deletedUser = action.payload;

        // ✅ Make sure admins are never shown
        state.users = filterNonAdminUsers(
          state.users.filter((u) => u._id !== deletedUser._id)
        );
        state.dropdownUsers = filterNonAdminUsers(
          state.dropdownUsers.filter((u) => u._id !== deletedUser._id)
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      // CREATE USER
      .addCase(createUser.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        const newUser = action.payload.user;

        // ✅ Only add if not an admin
        if (newUser.role?.toLowerCase() !== "admin") {
          state.users.unshift(newUser);
          state.totalUsers += 1;
          state.pagination.totalItems += 1;
          if (state.dropdownUsers.length > 0)
            state.dropdownUsers.unshift(newUser);
        }
      })
      .addCase(createUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })

      // UPDATE USER
      .addCase(updateUser.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedUser = action.payload;

        // ✅ If user was changed to admin, remove from lists
        if (updatedUser.role?.toLowerCase() === "admin") {
          state.users = state.users.filter(
            (user) => user._id !== updatedUser._id
          );
          state.dropdownUsers = state.dropdownUsers.filter(
            (user) => user._id !== updatedUser._id
          );
          return;
        }

        // Otherwise, merge updates
        const updateList = (list) => {
          const idx = list.findIndex(
            (u) => u._id === updatedUser._id || u.id === updatedUser._id
          );
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...updatedUser };
          }
        };

        updateList(state.users);
        updateList(state.dropdownUsers);
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, applyFilters, resetUsersState } =
  usersSlice.actions;

export default usersSlice.reducer;
