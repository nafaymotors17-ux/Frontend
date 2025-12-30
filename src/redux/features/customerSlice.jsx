// src/store/slices/customerSlice.js
// Simplified slice - only stores filters and pagination state
// Shipments data is managed in component local state for better performance
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Pagination - stored in Redux to persist across route changes
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
    hasNext: false,
    hasPrev: false,
  },

  // Filters - stored in Redux to persist across route changes
  filters: {
    search: "",
    status: "",
    dateType: "",
    dateFrom: "",
    dateTo: "",
  },

  // UI State
  selectedShipment: null,
};

const customerSlice = createSlice({
  name: "customerShipments",
  initialState,
  reducers: {
    setSelectedShipment: (state, action) => {
      state.selectedShipment = action.payload;
    },
    clearSelectedShipment: (state) => {
      state.selectedShipment = null;
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setChassisFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    setDateFilter: (state, action) => {
      state.filters.dateType = action.payload.dateType || "";
      state.filters.dateFrom = action.payload.dateFrom || "";
      state.filters.dateTo = action.payload.dateTo || "";
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    clearUserData: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSelectedShipment,
  clearSelectedShipment,
  setFilter,
  setFilters,
  setChassisFilter,
  setStatusFilter,
  setDateFilter,
  setPagination,
  setCurrentPage,
  clearFilters,
  clearUserData,
} = customerSlice.actions;

export default customerSlice.reducer;
