// src/components/User/CustomerHeader.jsx
import React from "react";
import { FaShip, FaSignOutAlt, FaUser, FaFilter, FaMobile, FaDesktop, FaSync } from "react-icons/fa";

const CustomerHeader = ({ user, onLogout, onMobileFilterToggle, viewMode = "auto", onViewModeChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="md:hidden py-3">
          {/* Top Row: Logo and Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm flex-shrink-0">
                <FaShip className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  Dashboard
                </h1>
                <p className="text-xs text-gray-600 truncate">
                  {user?.name || "User"}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onMobileFilterToggle}
                className="p-2 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Open filters"
              >
                <FaFilter className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                aria-label="Logout"
              >
                <FaSignOutAlt className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between py-4">
          {/* Logo and Welcome */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-lg shadow-sm">
              <FaShip className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold text-blue-600">
                  {user?.name}
                </span>
              </p>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange?.("auto")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === "auto"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Auto (responsive)"
              >
                <FaSync className="inline mr-1" />
                Auto
              </button>
              <button
                onClick={() => onViewModeChange?.("mobile")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === "mobile"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Mobile view"
              >
                <FaMobile className="inline mr-1" />
                Mobile
              </button>
              <button
                onClick={() => onViewModeChange?.("desktop")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  viewMode === "desktop"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Desktop view"
              >
                <FaDesktop className="inline mr-1" />
                Desktop
              </button>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-blue-50 rounded-full px-3 py-1.5">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <FaUser className="text-white text-sm" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                aria-label="Logout"
              >
                <FaSignOutAlt className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
