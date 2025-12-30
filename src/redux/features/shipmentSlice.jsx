// src/store/slices/shipmentsSlice.js
// Simplified slice - only stores filters and pagination state
// Shipments data is managed in component local state for better performance
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Pagination - stored in Redux to persist across route changes
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 50,
    hasNext: false,
    hasPrev: false,
  },

  // Filters - stored in Redux to persist across route changes
  filters: {
    jobNumber: "",
    chassisNumber: "",
    vesselName: "",
    clientId: "",
    yard: "",
    exportStatus: "",
    dateFrom: "",
    dateTo: "",
    dateType: "",
    selectedDate: null,
    inYard: false,
    glNumber: "",
  },

  // Sort configuration
  sortConfig: {
    field: "createdAt",
    order: "desc",
  },

  // UI State
  selectedRows: [],
  hasFiltersApplied: false,
};

const shipmentsSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    // Set individual filter
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;

      // Update hasFiltersApplied
      const hasActiveFilters = Object.values(state.filters).some(
        (filterValue) => filterValue && filterValue !== ""
      );
      state.hasFiltersApplied = hasActiveFilters;
    },

    // Set multiple filters at once
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };

      // Update hasFiltersApplied
      const hasActiveFilters = Object.values(state.filters).some(
        (filterValue) => filterValue && filterValue !== ""
      );
      state.hasFiltersApplied = hasActiveFilters;
    },

    // Clear all filters
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.hasFiltersApplied = false;
      state.selectedRows = [];
    },

    // Update pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Set current page
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Set page size
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing page size
    },

    // Set sort configuration
    setSortConfig: (state, action) => {
      state.sortConfig = action.payload;
    },

    // Selection actions
    toggleRowSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedRows.indexOf(id);
      if (index > -1) {
        state.selectedRows.splice(index, 1);
      } else {
        state.selectedRows.push(id);
      }
    },

    toggleAllSelection: (state, action) => {
      const { shipmentIds } = action.payload;
      if (state.selectedRows.length === shipmentIds.length) {
        state.selectedRows = [];
      } else {
        state.selectedRows = [...shipmentIds];
      }
    },

    clearSelection: (state) => {
      state.selectedRows = [];
    },

    // Reset state
    resetShipmentsState: () => initialState,
  },
});

export const {
  setFilter,
  setFilters,
  clearFilters,
  setPagination,
  setCurrentPage,
  setPageSize,
  setSortConfig,
  toggleRowSelection,
  toggleAllSelection,
  clearSelection,
  resetShipmentsState,
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer;
