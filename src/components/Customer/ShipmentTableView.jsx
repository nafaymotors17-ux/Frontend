// src/components/Customer/ShipmentTableView.jsx
import React, { useState, useMemo, memo } from "react";
import {
  FaDownload,
  FaImage,
  FaImages,
  FaCalendarAlt,
  FaShip,
  FaMapMarkerAlt,
  FaTag,
  FaSignInAlt,
  FaSignOutAlt,
  FaFileArchive,
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

// Get thumbnail - backend now provides URL directly
const getThumbnail = (carId) => {
  if (!carId) return null;
  if (carId.thumbnail?.url) {
    return carId.thumbnail.url;
  }
  if (carId.images && carId.images.length > 0) {
    return carId.images[0]?.url || null;
  }
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

// Vessel & POD Combined Component - Now includes ETD and Shipping Line
const VesselPodCell = memo(({ vessel }) => {
  const vesselName = vessel?.vesselName;
  const pod = vessel?.pod;
  const etd = vessel?.etd;
  const shippingLine = vessel?.shippingLine;

  if (!vesselName && !pod && !etd && !shippingLine)
    return <span className="text-gray-400 text-sm">-</span>;

  const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      {vesselName && (
        <div className="flex items-center gap-1.5">
          <FaShip className="text-gray-400 text-xs flex-shrink-0" />
          <span className="text-sm text-gray-900 truncate">{vesselName}</span>
        </div>
      )}
      {etd && (
        <div className="flex items-center gap-1.5">
          <FaCalendarAlt className="text-purple-400 text-xs flex-shrink-0" />
          <span className="text-xs text-gray-700 truncate">
            ETD: {formatDate(etd)}
          </span>
        </div>
      )}
      {shippingLine && (
        <div className="flex items-center gap-1.5">
          <FaTag className="text-indigo-400 text-xs flex-shrink-0" />
          <span className="text-xs text-gray-700 truncate">{shippingLine}</span>
        </div>
      )}
      {pod && (
        <div className="flex items-center gap-1.5">
          <FaMapMarkerAlt className="text-green-400 text-xs flex-shrink-0" />
          <span className="text-xs text-gray-700 truncate">POD: {pod}</span>
        </div>
      )}
    </div>
  );
});

VesselPodCell.displayName = "VesselPodCell";

// Compact Mobile Card

const MobileCard = memo(
  ({
    shipment,
    onSelect,
    onDownload,
    onViewPhotos,
    selectedShipments,
    onToggleSelect,
    canSelect,
  }) => {
    const thumbnail = getThumbnail(shipment?.carId);
    const imageCount = getImageCount(shipment?.carId);

    // Helper function for US date format
    const formatDateUS = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    };

    const isSelected = selectedShipments.includes(shipment._id || shipment.id);

    return (
      <div
        className={`bg-white border rounded-lg hover:shadow-sm transition-all duration-150 p-3 ${
          isSelected ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
        }`}
      >
        <div className="flex gap-3">
          {canSelect && (
            <div className="flex-shrink-0 flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  if (selectedShipments.length < 20 || isSelected) {
                    onToggleSelect(shipment._id || shipment.id);
                  } else {
                    alert("Maximum 20 shipments can be selected for download");
                  }
                }}
                disabled={selectedShipments.length >= 20 && !isSelected}
                className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          {/* Thumbnail - smaller, clickable for preview (like admin clicks photo number) */}
          <div className="flex-shrink-0">
            {thumbnail ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    onViewPhotos &&
                    (imageCount > 0 || shipment.carId?.zipFileKey)
                  ) {
                    onViewPhotos(shipment);
                  }
                }}
                className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all group"
                title={
                  imageCount > 0 || shipment.carId?.zipFileKey
                    ? "Click to view photos"
                    : "No photos available"
                }
                disabled={!(imageCount > 0 || shipment.carId?.zipFileKey)}
              >
                <LazyImage
                  src={thumbnail}
                  alt="Vehicle"
                  className="w-full h-full group-hover:scale-110 transition-transform"
                />
                {imageCount > 0 && (
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                      {imageCount}
                    </span>
                  </div>
                )}
                {imageCount > 1 && (
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                    +{imageCount - 1}
                  </div>
                )}
                {shipment.carId?.zipFileKey && (
                  <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-bl flex items-center gap-1">
                    <FaFileArchive className="w-2.5 h-2.5" />
                    <span>ZIP</span>
                  </div>
                )}
              </button>
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
              <VesselPodCell vessel={shipment.vessel} pod={shipment.pod} />
            </div>

            {/* Bottom row - Yard & Storage & Actions */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-gray-400" />
                <span className="truncate">{shipment.yard || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
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
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(shipment);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="View Details"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(shipment);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                    title="Download Photos"
                  >
                    <FaDownload className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
// Desktop Table View
const DesktopTable = memo(
  ({
    shipments,
    onSelect,
    onDownload,
    onViewPhotos,
    selectedShipments,
    onToggleSelect,
    canSelect,
  }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              {canSelect && (
                <th className="px-2 py-1 text-center text-xs font-semibold text-gray-100 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={
                      selectedShipments.length === shipments.length &&
                      shipments.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        shipments.forEach((s) => {
                          if (selectedShipments.length < 20) {
                            onToggleSelect(s._id || s.id);
                          }
                        });
                      } else {
                        shipments.forEach((s) => {
                          if (selectedShipments.includes(s._id || s.id)) {
                            onToggleSelect(s._id || s.id);
                          }
                        });
                      }
                    }}
                    disabled={
                      selectedShipments.length >= 20 &&
                      !selectedShipments.some((id) =>
                        shipments.some((s) => (s._id || s.id) === id)
                      )
                    }
                    className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
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
                Actions
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
                  className={`hover:bg-blue-50 transition-colors duration-150 group ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  } ${
                    selectedShipments.includes(shipment._id || shipment.id)
                      ? "bg-yellow-50"
                      : ""
                  }`}
                >
                  {canSelect && (
                    <td
                      className="px-2 py-2 whitespace-nowrap text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedShipments.includes(
                          shipment._id || shipment.id
                        )}
                        onChange={() => {
                          if (
                            selectedShipments.length < 20 ||
                            selectedShipments.includes(
                              shipment._id || shipment.id
                            )
                          ) {
                            onToggleSelect(shipment._id || shipment.id);
                          } else {
                            alert(
                              "Maximum 20 shipments can be selected for download"
                            );
                          }
                        }}
                        disabled={
                          selectedShipments.length >= 20 &&
                          !selectedShipments.includes(
                            shipment._id || shipment.id
                          )
                        }
                        className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {/* Photo Thumbnail - Clickable for preview (like admin clicks photo number) */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      {thumbnail ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              onViewPhotos &&
                              (imageCount > 0 || shipment.carId?.zipFileKey)
                            ) {
                              onViewPhotos(shipment);
                            }
                          }}
                          className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 ring-1 ring-gray-200 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer group relative"
                          title={
                            imageCount > 0 || shipment.carId?.zipFileKey
                              ? "Click to view photos"
                              : "No photos available"
                          }
                          disabled={
                            !(imageCount > 0 || shipment.carId?.zipFileKey)
                          }
                        >
                          <LazyImage
                            src={thumbnail}
                            alt="Vehicle"
                            className="w-full h-full group-hover:scale-110 transition-transform"
                          />
                          {imageCount > 0 && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                {imageCount}
                              </span>
                            </div>
                          )}
                          {shipment.carId?.zipFileKey && (
                            <div className="absolute top-0 right-0 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-bl flex items-center gap-1">
                              <FaFileArchive className="w-2.5 h-2.5" />
                              <span>ZIP</span>
                            </div>
                          )}
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                          <FaImage className="text-gray-300" />
                        </div>
                      )}
                      {imageCount > 1 && (
                        <div className="mt-1 text-xs text-gray-500 font-medium">
                          +{imageCount - 1} more
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
                    <VesselPodCell vessel={shipment.vessel} />
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

                  {/* Actions */}
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(shipment);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-150"
                        title="View Details"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownload(shipment);
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-150"
                        title="Download Photos"
                      >
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

DesktopTable.displayName = "DesktopTable";

// Main Component
const ShipmentTable = ({
  shipments,
  onSelectShipment,
  onDownloadPhoto,
  onViewPhotos,
  isMobileView,
  loading,
  selectedShipments = [],
  onToggleSelect,
  canSelect = false,
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
              onDownload={onDownloadPhoto}
              onViewPhotos={onViewPhotos}
              selectedShipments={selectedShipments}
              onToggleSelect={onToggleSelect}
              canSelect={canSelect}
            />
          ))}
        </div>
      ) : (
        <DesktopTable
          shipments={safeShipments}
          onSelect={onSelectShipment}
          onDownload={onDownloadPhoto}
          onViewPhotos={onViewPhotos}
          selectedShipments={selectedShipments}
          onToggleSelect={onToggleSelect}
          canSelect={canSelect}
        />
      )}
    </div>
  );
};

export default memo(ShipmentTable);
