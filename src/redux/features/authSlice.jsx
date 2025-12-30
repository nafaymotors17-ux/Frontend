import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApiService } from "../../services/authApiService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Login credentials:", credentials);

      const response = await authApiService.login(credentials);
      console.log("Login Response: ", response);

      if (!response.success) {
        return rejectWithValue(response.message);
      }

      // Store in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userData", JSON.stringify(response.data.user));

      return response.data; // ✅ accessToken + user
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await authApiService.logout();
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getInitialState = () => {
  // Get initial state from localStorage
  const token = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("userData");

  return {
    user: !userData || userData == "undefined" ? null : JSON.parse(userData),
    accessToken: token || null,
    error: null,
    loading: false,
  };
};

const initialState = getInitialState();

// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.accessToken = localStorage.getItem("accessToken");
    },
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add this to sync with localStorage on app start
    initializeAuth: (state) => {
      const token = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("userData");

      if (token && userData) {
        state.accessToken = token;
        state.user = JSON.parse(userData);
      } else {
        state.accessToken = null;
        state.user = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.accessToken = null;
        // Clear localStorage on login failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      });
  },
});

export const { setUser, clearUser, setError, clearError, initializeAuth } =
  authSlice.actions;

export default authSlice.reducer;
