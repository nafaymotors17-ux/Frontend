// src/components/shipments/ShipmentStats.jsx
import React from "react";
import {
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaTimesCircle,
} from "react-icons/fa";

// Alternative: Separate cards for Pending and Cancelled
const ShipmentStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {/* Total Shipments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Shipments</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaShippingFast className="text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Shipped */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Shipped</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.shipped}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {stats.total > 0
                  ? Math.round((stats.shipped / stats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Unshipped */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unshipped</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.unshipped}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Ready to ship</span>
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FaBoxOpen className="text-blue-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Pending */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.pending}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">In process</span>
            </div>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FaClock className="text-yellow-600 text-xl" />
          </div>
        </div>
      </div>

      {/* Cancelled */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Cancelled</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.cancelled}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">
                {stats.total > 0
                  ? Math.round((stats.cancelled / stats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
          <div className="bg-red-100 p-3 rounded-lg">
            <FaTimesCircle className="text-red-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShipmentStats;
