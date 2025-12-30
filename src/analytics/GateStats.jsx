// components/Admin/GateStats.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaSignInAlt,
  FaSignOutAlt,
  FaWarehouse,
  FaChartBar,
  FaCalendarAlt,
  FaExchangeAlt,
  FaSync,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { setFilter } from "../redux/features/shipmentSlice";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- Gate Stat Card ---
const GateStatCard = ({
  title,
  value,
  icon,
  color,
  description,
  onClick,
  clickable = true,
}) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    green: "bg-green-100 text-green-600 border-green-200",
    orange: "bg-orange-100 text-orange-600 border-orange-200",
    purple: "bg-purple-100 text-purple-600 border-purple-200",
    red: "bg-red-100 text-red-600 border-red-200",
  };

  const [bg, text, border] =
    colorClasses[color]?.split(" ") || colorClasses.blue.split(" ");

  return (
    <div
      className={`bg-white rounded-xl shadow-md border-l-4 ${border} p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        clickable ? "hover:border-blue-400" : ""
      }`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
          {clickable && (
            <p className="text-xs text-blue-500 mt-1">
              Click to view shipments
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${bg} ${text}`}>{icon}</div>
      </div>
    </div>
  );
};

// --- Main GateStats Component ---
export default function GateStats() {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Generate year options (last 5 years + current)
  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => new Date().getFullYear() - i
  );

  useEffect(() => {
    fetchGateStats();
  }, [period, year]);

  const fetchGateStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/admin/stats/gates?period=${period}&year=${year}`
      );
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching gate stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchGateStats();
  };

  // Function to get date range based on period
  const getDateRange = () => {
    const today = new Date();
    let dateFrom, dateTo;

    switch (period) {
      case "today":
        dateFrom = new Date(today);
        dateTo = new Date(today);
        break;
      case "month":
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "year":
        dateFrom = new Date(year, 0, 1);
        dateTo = new Date(year, 11, 31);
        break;
      default:
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split("T")[0];

    return {
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo),
    };
  };

  // Function to handle navigation with filters
  const handleCardClick = (filterType) => {
    const { dateFrom, dateTo } = getDateRange();

    // Clear existing filters first
    const filters = [
      "jobNumber",
      "chassisNumber",
      "vesselName",
      "clientId",
      "yard",
      "dateFrom",
      "dateTo",
      "dateType",
      "inYard",
      "exportStatus",
    ];

    filters.forEach((filterKey) => {
      dispatch(
        setFilter({
          key: filterKey,
          value: filterKey === "inYard" ? false : "",
        })
      );
    });

    // Apply specific filters based on the card clicked
    switch (filterType) {
      case "gateIn":
        dispatch(setFilter({ key: "dateType", value: "gateIn" }));
        dispatch(setFilter({ key: "dateFrom", value: dateFrom }));
        dispatch(setFilter({ key: "dateTo", value: dateTo }));
        break;
      case "gateOut":
        dispatch(setFilter({ key: "dateType", value: "gateOut" }));
        dispatch(setFilter({ key: "dateFrom", value: dateFrom }));
        dispatch(setFilter({ key: "dateTo", value: dateTo }));
        break;
      case "inYard":
        dispatch(setFilter({ key: "inYard", value: true }));
        // Also apply date range for in-yard shipments
        dispatch(setFilter({ key: "dateType", value: "gateIn" }));
        dispatch(setFilter({ key: "dateFrom", value: dateFrom }));
        dispatch(setFilter({ key: "dateTo", value: dateTo }));
        break;
      default:
        break;
    }

    // Navigate to shipments page
    navigate("/admin/shipments");
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading gate analytics...</span>
        </div>
      </div>
    );

  if (!stats)
    return (
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No gate statistics available.</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <FaSync className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaExchangeAlt className="text-blue-600" />
              Gate Movement Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Track incoming and outgoing shipments - Click on cards to view
              filtered shipments for{" "}
              {period === "today"
                ? "today"
                : period === "month"
                ? "this month"
                : year}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                refreshing ? "opacity-75 cursor-not-allowed" : ""
              }`}
              disabled={refreshing}
              title="Refresh data"
            >
              <FaSync
                className={`text-sm ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="today">Today</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {period === "year" && (
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GateStatCard
          title="Gate In"
          value={stats.summary.gateIn}
          icon={<FaSignInAlt className="text-xl" />}
          color="blue"
          description={`${stats.period} total`}
          onClick={() => handleCardClick("gateIn")}
          clickable={true}
        />
        <GateStatCard
          title="Gate Out"
          value={stats.summary.gateOut}
          icon={<FaSignOutAlt className="text-xl" />}
          color="green"
          description={`${stats.period} total`}
          onClick={() => handleCardClick("gateOut")}
          clickable={true}
        />
        <GateStatCard
          title="In Yard"
          value={stats.summary.inYard}
          icon={<FaWarehouse className="text-xl" />}
          color="orange"
          description="Currently in yard"
          onClick={() => handleCardClick("inYard")}
          clickable={true}
        />
        <GateStatCard
          title="Net Flow"
          value={stats.summary.netFlow}
          icon={<FaExchangeAlt className="text-xl" />}
          color={stats.summary.netFlow >= 0 ? "purple" : "red"}
          description="In - Out"
          onClick={() => {}}
          clickable={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Monthly Gate Movement - {stats.year}
          </h3>
          <Bar data={stats.chartData} options={chartOptions} height={250} />
        </div>

        {/* Status Distribution Doughnut */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Gate In Status Distribution
          </h3>
          <Doughnut
            data={{
              labels: ["Shipped", "Unshipped", "Pending", "Cancelled"],
              datasets: [
                {
                  data: [
                    stats.statusBreakdown.gateIn.shipped,
                    stats.statusBreakdown.gateIn.unshipped,
                    stats.statusBreakdown.gateIn.pending,
                    stats.statusBreakdown.gateIn.cancelled,
                  ],
                  backgroundColor: [
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(59, 130, 246, 0.8)",
                    "rgba(234, 179, 8, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                  ],
                  borderColor: [
                    "rgb(34, 197, 94)",
                    "rgb(59, 130, 246)",
                    "rgb(234, 179, 8)",
                    "rgb(239, 68, 68)",
                  ],
                  borderWidth: 2,
                },
              ],
            }}
            options={doughnutOptions}
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
