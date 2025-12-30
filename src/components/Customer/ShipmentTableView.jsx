// src/components/Customer/ShipmentTableView.jsx
import React, { useState, useMemo, memo } from "react";
import {
  FaEye,
  FaImage,
  FaCalendarAlt,
  FaShip,
  FaMapMarkerAlt,
  FaTag,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";

// Lazy Image Component with Thumbnail
const LazyImage = memo(({ src, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <FaImage className="text-gray-300 text-xs" />
        </div>
      )}
      {error ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <FaImage className="text-gray-300 text-xs" />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

// Get thumbnail - supports both new structure (thumbnail) and old structure (images array)
const getThumbnail = (carId) => {
  if (!carId) return null;
  if (carId.thumbnail?.url) return carId.thumbnail.url;
  if (carId.images && carId.images.length > 0)
    return carId.images[0]?.url || null;
  return null;
};

// Get image count
const getImageCount = (carId) => {
  if (!carId) return 0;
  if (carId.imageCount !== undefined) return carId.imageCount;
  if (carId.images) return carId.images.length;
  return 0;
};

// Status badge component - more compact
const StatusBadge = memo(({ status }) => {
  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes("shipped")) return "bg-green-100 text-green-800";
    if (statusLower?.includes("pending"))
      return "bg-yellow-100 text-yellow-800";
    if (statusLower?.includes("cancel")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status || "Unknown"}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Combined Dates Column Component - Updated to show numeric date

const DateCell = memo(({ gateInDate, gateOutDate }) => {
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    // Format as month/day/year (11/25/2025)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <FaSignInAlt className="text-blue-500 text-xs" />
        <span className="text-sm font-medium text-gray-900">
          {formatDate(gateInDate) || "-"}
        </span>
      </div>
      {gateOutDate && (
        <div className="flex items-center gap-1.5">
          <FaSignOutAlt className="text-red-500 text-xs" />
          <span className="text-sm text-gray-700">
            {formatDate(gateOutDate)}
          </span>
        </div>
      )}
    </div>
  );
});

DateCell.displayName = "DateCell";

// Vehicle & Chassis Combined Component
const VehicleCell = memo(({ vehicle }) => {
  const makeModel = vehicle?.makeModel || "N/A";
  const chassis = vehicle?.chassisNumber || "N/A";

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900 truncate">
        {makeModel}
      </span>
      <span className="text-xs text-gray-600 font-mono truncate">
        {chassis}
      </span>
    </div>
  );
});

VehicleCell.displayName = "VehicleCell";

// Vessel & POD Combined Component
const VesselPodCell = memo(({ vesselName, pod }) => {
  if (!vesselName && !pod)
    return <span className="text-gray-400 text-sm">-</span>;

  return (
    <div className="flex flex-col">
      {vesselName && (
        <div className="flex items-center gap-1.5">
          <FaShip className="text-gray-400 text-xs flex-shrink-0" />
          <span className="text-sm text-gray-900 truncate">{vesselName}</span>
        </div>
      )}
      {pod && (
        <div className="flex items-center gap-1.5 mt-1">
          <FaTag className="text-gray-400 text-xs flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{pod}</span>
        </div>
      )}
    </div>
  );
});

VesselPodCell.displayName = "VesselPodCell";

// Compact Mobile Card

const MobileCard = memo(({ shipment, onSelect }) => {
  const thumbnail = getThumbnail(shipment?.carId);
  const imageCount = getImageCount(shipment?.carId);

  // Helper function for US date format
  const formatDateUS = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-150 p-3 cursor-pointer"
      onClick={() => onSelect(shipment)}
    >
      <div className="flex gap-3">
        {/* Thumbnail - smaller */}
        <div className="flex-shrink-0">
          {thumbnail ? (
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
              <LazyImage
                src={thumbnail}
                alt="Vehicle"
                className="w-full h-full"
              />
              {imageCount > 1 && (
                <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                  +{imageCount - 1}
                </div>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 rounded-md bg-gray-100 flex items-center justify-center">
              <FaImage className="text-gray-300 text-xl" />
            </div>
          )}
        </div>

        {/* Content - more compact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <VehicleCell vehicle={shipment?.carId} />
            <StatusBadge status={shipment.exportStatus} />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            {/* Dates - UPDATED FORMAT */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <FaSignInAlt className="text-blue-500 text-xs" />
                <span className="text-xs text-gray-700">
                  {formatDateUS(shipment.gateInDate) || "-"}
                </span>
              </div>
              {shipment.gateOutDate && (
                <div className="flex items-center gap-1.5">
                  <FaSignOutAlt className="text-red-500 text-xs" />
                  <span className="text-xs text-gray-700">
                    {formatDateUS(shipment.gateOutDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Vessel & POD */}
            <VesselPodCell
              vesselName={shipment.vesselName}
              pod={shipment.pod}
            />
          </div>

          {/* Bottom row - Yard & Storage */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-gray-400" />
              <span className="truncate">{shipment.yard || "N/A"}</span>
            </div>
            {shipment.storageDays !== undefined && (
              <span
                className={`${
                  shipment.storageDays === 0
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700 font-medium"
                }`}
              >
                {shipment.storageDays === 0
                  ? "In Yard"
                  : `${shipment.storageDays} ${
                      shipment.storageDays === 1 ? "day" : "days"
                    }`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
// Desktop Table View
const DesktopTable = memo(({ shipments, onSelect }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Photo
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Gate In/Out
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Vehicle/Chassis
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Vessel / POD
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Yard
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Status
            </th>
            <th className="px-2 py-1 text-left text-xs font-semibold text-gray-100 uppercase tracking-wider">
              Storage
            </th>
            <th className="px-2 py-1 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
              View
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {shipments.map((shipment, index) => {
            const thumbnail = getThumbnail(shipment?.carId);
            const imageCount = getImageCount(shipment?.carId);

            return (
              <tr
                key={shipment._id || shipment.id}
                className={`hover:bg-blue-50 transition-colors duration-150 cursor-pointer group ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
                onClick={() => onSelect(shipment)}
              >
                {/* Photo Thumbnail */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    {thumbnail ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                        <LazyImage
                          src={thumbnail}
                          alt="Vehicle"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                        <FaImage className="text-gray-300" />
                      </div>
                    )}
                    {imageCount > 1 && (
                      <div className="mt-1 text-xs text-gray-500">
                        +{imageCount - 1}
                      </div>
                    )}
                  </div>
                </td>

                {/* Combined Dates */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <DateCell
                    gateInDate={shipment.gateInDate}
                    gateOutDate={shipment.gateOutDate}
                  />
                </td>

                {/* Combined Vehicle & Chassis */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <VehicleCell vehicle={shipment?.carId} />
                </td>

                {/* Combined Vessel & POD */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <VesselPodCell
                    vesselName={shipment.vesselName}
                    pod={shipment.pod}
                  />
                </td>

                {/* Yard */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-sm text-gray-900 truncate max-w-[120px]">
                    {shipment.yard || "-"}
                  </div>
                </td>

                {/* Status */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <StatusBadge status={shipment.exportStatus} />
                </td>

                {/* Storage Days */}
                <td className="px-2 py-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {shipment.storageDays !== undefined
                      ? `${shipment.storageDays}${
                          shipment.storageDays === 1 ? " day" : " days"
                        }`
                      : "-"}
                  </div>
                </td>

                {/* Action */}
                <td className="px-2 py-2 whitespace-nowrap text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(shipment);
                    }}
                    className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-150"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

DesktopTable.displayName = "DesktopTable";

// Main Component
const ShipmentTable = ({
  shipments,
  onSelectShipment,
  isMobileView,
  loading,
}) => {
  const safeShipments = useMemo(() => shipments || [], [shipments]);

  if (safeShipments.length === 0 && !loading) {
    return (
      <div className="p-6 text-center">
        <FaShip className="mx-auto text-gray-300 text-3xl mb-3" />
        <h3 className="text-base font-medium text-gray-700 mb-1">
          No shipments found
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      {isMobileView ? (
        <div className="p-4 space-y-3">
          {safeShipments.map((shipment) => (
            <MobileCard
              key={shipment._id || shipment.id}
              shipment={shipment}
              onSelect={onSelectShipment}
            />
          ))}
        </div>
      ) : (
        <DesktopTable shipments={safeShipments} onSelect={onSelectShipment} />
      )}
    </div>
  );
};

export default memo(ShipmentTable);
