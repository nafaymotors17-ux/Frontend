// components/Admin/Stats.jsx
import React, { useState, useEffect } from "react";
import {
  People,
  Today,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ArrowForward,
} from "@mui/icons-material";
import { FaShip } from "react-icons/fa";
// --- Color Mapping ---
const COLORS = {
  blue: "text-blue-600 bg-blue-50 border-blue-200",
  green: "text-green-600 bg-green-50 border-green-200",
  orange: "text-orange-600 bg-orange-50 border-orange-200",
  yellow: "text-amber-600 bg-amber-50 border-amber-200",
  red: "text-red-600 bg-red-50 border-red-200",
};

// --- Helper to extract classes ---
const getColorClasses = (color) =>
  COLORS[color]?.split(" ") || COLORS.blue.split(" ");

// --- Top KPI Card ---
const StatCard = ({ title, value, icon: Icon, color }) => {
  const [text, bg, border] = getColorClasses(color);
  return (
    <div
      className={`p-5 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
        </div>
        <div className={`p-2 rounded-full ${bg} ${text}`}>
          <Icon className="text-3xl" />
        </div>
      </div>
    </div>
  );
};

// --- Status Row ---
const StatusRow = ({ label, value, icon: Icon, color }) => {
  const [text] = getColorClasses(color);
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50 transition-all duration-150">
      <td className="px-4 py-3 flex items-center gap-2 text-gray-700 text-sm">
        <Icon className={`${text} text-lg`} />
        <span>{label}</span>
      </td>
      <td className="px-4 py-3 text-right font-semibold text-gray-900">
        {value ?? 0}
      </td>
    </tr>
  );
};

// --- Main Stats Component ---
export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/stats/dashboard`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => data.success && setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );

  if (!stats)
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow border border-gray-200">
        No data available.
      </div>
    );

  // --- Table Rows ---
  const overallRows = [
    {
      label: " Shipped",
      value: stats.shipped,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Unshipped",
      value: stats.unshipped,
      icon: ArrowForward,
      color: "blue",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: HourglassEmpty,
      color: "yellow",
    },
    {
      label: "Cancelled ",
      value: stats.cancelled,
      icon: Cancel,
      color: "red",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-200 pb-3">
        <h1 className="text-2xl font-bold text-gray-800">Quick Overview</h1>
        <div className="text-sm font-medium text-blue-600 bg-blue-50 py-1 px-3 rounded-full flex items-center gap-1">
          <Today className="text-sm" /> {today}
        </div>
      </header>

      {/* KPI Cards */}
      <div className="bg-white rounded-xl shadow-xl p-5 border-t-4 border-blue-600">
        <h2 className="text-lg font-semibold text-gray-700 mb-4"></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Shipments"
            value={stats.totalShipments}
            icon={FaShip}
            color="blue"
          />
          <StatCard
            title="Total Customer"
            value={stats.totalUsers}
            icon={People}
            color="green"
          />
          <StatCard
            title="Shipments Added Today"
            value={stats.todayShipments}
            icon={Today}
            color="orange"
          />
          <StatCard
            title="Users Added Today"
            value={stats.todayUsers}
            icon={People}
            color="purple"
          />
        </div>
      </div>

      {/* Overall Shipment Table */}
      <section>
        <h2 className="text-xl font-bold text-gray-700 mb-3">
          Overall Shipment Status
        </h2>
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {overallRows.map((r, i) => (
                <StatusRow key={i} {...r} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
