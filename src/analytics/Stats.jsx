// analytics/DashboardStats.jsx
import React, { useState } from "react";
import Stats from "./DashboardStats";
import GateStats from "./GateStats";
import { Dashboard, Analytics } from "@mui/icons-material";

// Tab Navigation Component
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all duration-200 ${
      active
        ? "border-blue-600 text-blue-600 bg-blue-50"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="text-lg" />
    <span>{label}</span>
  </button>
);

export default function DashboardStats() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
              icon={Dashboard}
              label="Overview"
            />
            <TabButton
              active={activeTab === "gate"}
              onClick={() => setActiveTab("gate")}
              icon={Analytics}
              label="Gate Analytics"
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Stats />
          </div>
        )}

        {activeTab === "gate" && (
          <div className="space-y-6">
            <GateStats />
          </div>
        )}
      </div>
    </div>
  );
}
