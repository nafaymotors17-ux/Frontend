// src/components/shipments/ShipmentTable.jsx
import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShippingFast,
  FaEdit,
  FaTrash,
  FaColumns,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaComment,
  FaCommentAlt,
  FaFileArchive,
} from "react-icons/fa";
import { getStoragePeriodColor } from "../../utils/utils";
import RemarksModal from "../Layout/RemarksModal";
import VesselInfoModal from "../Layout/VesselInfoModal";
import EditShipmentModal from "../Layout/EditShipmentModal";
import PhotoManagementModal from "../Layout/PhotoManagementModal";
import PhotosModal from "../Customer/PhotosModal";

// Memoized table row component to prevent unnecessary re-renders
const ShipmentTableRow = memo(
  ({
    shipment,
    index,
    selectedRows,
    hiddenColumns,
    onRowSelect,
    onEdit,
    onDelete,
    onRemarksClick,
    onVesselClick,
    onPhotoClick,
    user,
    getStatusColor,
    getStoragePeriodColor,
    getCompanyName,
    isVisible,
    cellClass,
  }) => {
    const isSelected = selectedRows.includes(shipment._id);

    return (
      <tr
        className={`hover:bg-blue-50 transition-colors ${
          isSelected
            ? "bg-yellow-50"
            : index % 2 === 0
            ? "bg-gray-50"
            : "bg-white"
        }`}
      >
        <td className={`${cellClass} text-center text-gray-500 font-medium`}>
          {index + 1}
        </td>

        <td
          className={`${cellClass} text-center`}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onRowSelect && onRowSelect(shipment._id)}
            className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 h-3 w-3"
          />
        </td>

        {isVisible("gateIn") && (
          <td className={cellClass}>
            {shipment.gateInDate
              ? new Date(shipment.gateInDate).toLocaleDateString()
              : "-"}
          </td>
        )}

        {isVisible("gateOut") && (
          <td className={cellClass}>
            {shipment.gateOutDate
              ? new Date(shipment.gateOutDate).toLocaleDateString()
              : "-"}
          </td>
        )}

        {isVisible("vessel") && (
          <td className={cellClass}>
            {shipment.vessel?.vesselName ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVesselClick?.(shipment);
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                title="Click to view/edit vessel details"
              >
                {shipment.vessel.vesselName}
              </button>
            ) : (
              "-"
            )}
          </td>
        )}

        {isVisible("customer") && (
          <td className={cellClass}>
            <div className="flex flex-col">
              <span className="text-blue-700 font-medium">
                {getCompanyName(shipment?.clientId?.name)}
              </span>
              {shipment.clientId?.userId && (
                <span className="text-xs text-gray-500 font-mono mt-0.5">
                  {shipment.clientId.userId}
                </span>
              )}
            </div>
          </td>
        )}

        {isVisible("makeModel") && (
          <td className={cellClass}>{shipment?.carId?.makeModel || "-"}</td>
        )}

        {isVisible("yard") && (
          <td className={cellClass}>{shipment.yard || "-"}</td>
        )}

        {isVisible("job") && (
          <td className={`${cellClass} font-mono`}>
            {shipment.vessel?.jobNumber || "-"}
          </td>
        )}

        {isVisible("chassis") && (
          <td className={`${cellClass} font-mono`}>
            {shipment?.carId?.chassisNumber || "-"}
          </td>
        )}

        {isVisible("pod") && (
          <td className={cellClass}>{shipment?.vessel?.pod || "-"}</td>
        )}

        {isVisible("status") && (
          <td className={cellClass}>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(
                shipment?.exportStatus
              )}`}
            >
              {shipment.exportStatus || "Unknown"}
            </span>
          </td>
        )}

        {isVisible("storage") && (
          <td className={cellClass}>
            <span
              className={`font-medium ${
                shipment.gateInDate && shipment.gateOutDate
                  ? getStoragePeriodColor(
                      shipment.gateInDate,
                      shipment.gateOutDate
                    )
                  : "text-yellow-600"
              }`}
            >
              {shipment.storageDays
                ? `${shipment?.storageDays} day${
                    shipment?.storageDays !== 1 ? "s" : ""
                  }`
                : shipment.gateInDate && !shipment.gateOutDate
                ? "In Yard"
                : "-"}
            </span>
          </td>
        )}

        {isVisible("photos") && (
          <td className={`${cellClass} text-center`}>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPhotoClick && onPhotoClick(shipment, e);
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                title="Click to manage photos"
              >
                {shipment?.carId?.imageCount ?? 0}
              </button>
              {shipment?.carId?.zipFileKey && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 bg-green-100 border border-green-300 rounded text-xs"
                  title="ZIP file available"
                >
                  <FaFileArchive className="text-green-700" />
                  <span className="text-green-700 font-semibold">ZIP</span>
                </div>
              )}
            </div>
          </td>
        )}

        {isVisible("created") && (
          <td className={cellClass}>
            {shipment.createdAt
              ? new Date(shipment.createdAt).toLocaleString("en-GB")
              : "-"}
          </td>
        )}

        {isVisible("actions") && (
          <td className={`${cellClass} text-center`}>
            <div className="flex items-center justify-center gap-0.5">
              <button
                onClick={(e) => onRemarksClick(shipment, e)}
                className={`p-0.5 rounded-md transition-colors ${
                  shipment.remarks
                    ? "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                }`}
                title={
                  shipment.remarks
                    ? `View/Edit Remarks: ${
                        shipment.remarks.length > 30
                          ? shipment.remarks.substring(0, 30) + "..."
                          : shipment.remarks
                      }`
                    : "Add Remarks"
                }
              >
                {shipment.remarks ? (
                  <FaComment size={14} />
                ) : (
                  <FaCommentAlt size={14} className="opacity-60" />
                )}
              </button>

              <span className="text-gray-300">|</span>
              <button
                onClick={(e) => onEdit(shipment._id, e)}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Edit"
              >
                <FaEdit size={14} />
              </button>
              <span className="text-gray-300">|</span>
              {user?.role === "admin" && (
                <button
                  onClick={(e) => onDelete(shipment._id, e)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Delete"
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    );
  }
);

ShipmentTableRow.displayName = "ShipmentTableRow";

const ShipmentTable = ({
  shipments,
  selectedRows,
  onRowClick,
  onRowSelect,
  onSelectAll,
  onEdit,
  onDelete,
  loading,
  operationLoading,
  onSortChange,
  sortConfig,
  onUpdateRemarks,
  onVesselUpdate,
  onShipmentUpdate, // Callback to update shipment in parent state
}) => {
  const navigate = useNavigate();
  let user = null;

  try {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      user = JSON.parse(storedUser); // parse JSON to object
    }
  } catch (err) {
    console.warn("Failed to parse userData from localStorage", err);
  }
  // State for remarks modal
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [selectedShipmentForRemarks, setSelectedShipmentForRemarks] =
    useState(null);

  // State for vessel info modal
  const [vesselModalOpen, setVesselModalOpen] = useState(false);
  const [selectedVesselInfo, setSelectedVesselInfo] = useState(null);

  // State for edit shipment modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedShipmentForEdit, setSelectedShipmentForEdit] = useState(null);

  // State for photo management modal (separate from edit modal)
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedShipmentForPhotos, setSelectedShipmentForPhotos] =
    useState(null);
  // State for photos view modal (view/download only)
  const [photosViewModalOpen, setPhotosViewModalOpen] = useState(false);
  const [selectedShipmentForView, setSelectedShipmentForView] = useState(null);
  // Column Visibility State with sessionStorage persistence
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const columnMenuRef = useRef(null);

  // Define all available columns
  const allColumns = [
    { key: "gateIn", label: "Gate In" },
    { key: "gateOut", label: "Gate Out" },
    { key: "vessel", label: "Vessel" },
    { key: "customer", label: "Customers" },
    { key: "id", label: "ID" },
    { key: "makeModel", label: "Make/Model" },
    { key: "yard", label: "Yard" },
    { key: "chassis", label: "Chassis" },
    { key: "job", label: "Job #" },
    // { key: "gl", label: "GL Number" },
    { key: "pod", label: "POD" },
    { key: "status", label: "Status" },
    { key: "storage", label: "Storage" },
    { key: "photos", label: "Photos" },
    { key: "created", label: "Created At" },
    { key: "actions", label: "Actions" },
  ];

  // Initialize hidden columns from sessionStorage or default
  const [hiddenColumns, setHiddenColumns] = useState([]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("shipmentTableHiddenColumns");
      if (saved) {
        setHiddenColumns(JSON.parse(saved));
      } else {
        // Default: Created At hidden
        setHiddenColumns(["created"]);
      }
    } catch (error) {
      console.warn("Failed to load column preferences:", error);
      setHiddenColumns(["created"]);
    }
  }, []);

  // Save to sessionStorage whenever hiddenColumns changes
  useEffect(() => {
    if (hiddenColumns.length > 0) {
      try {
        sessionStorage.setItem(
          "shipmentTableHiddenColumns",
          JSON.stringify(hiddenColumns)
        );
      } catch (error) {
        console.warn("Failed to save column preferences:", error);
      }
    }
  }, [hiddenColumns]);

  // Close column menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        columnMenuRef.current &&
        !columnMenuRef.current.contains(event.target)
      ) {
        setShowColumnMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnMenuRef]);

  const toggleColumn = (key) => {
    setHiddenColumns((prev) => {
      if (prev.includes(key)) {
        return prev.filter((c) => c !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const isVisible = useCallback(
    (key) => !hiddenColumns.includes(key),
    [hiddenColumns]
  );

  // Memoized status color function
  const getStatusColor = useCallback((status) => {
    if (!status) {
      return "text-gray-600 bg-gray-100 border-gray-300";
    }

    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case "shipped":
      case "completed":
      case "sold":
      case "delivered":
        return "text-green-700 bg-green-100 border-green-300";
      case "pending":
      case "processing":
      case "available":
      case "avi":
        return "text-yellow-700 bg-yellow-100 border-yellow-300";
      case "unshipped":
      case "awaiting":
      case "ready":
        return "text-blue-800 bg-blue-100 border-blue-300";
      case "cancelled":
      case "rejected":
      case "failed":
        return "text-red-700 bg-red-100 border-red-300";
      case "in transit":
      case "shipping":
      case "on route":
        return "text-purple-700 bg-purple-100 border-purple-300";
      default:
        return "text-gray-700 bg-gray-100 border-gray-300";
    }
  }, []);

  // Memoized sort indicator
  const getSortIndicator = useCallback(
    (field) => {
      if (!sortConfig) return <FaSort className="inline text-gray-400" />;

      if (sortConfig.field === field) {
        if (sortConfig.order === "asc") {
          return <FaSortUp className="inline text-blue-600" />;
        } else if (sortConfig.order === "desc") {
          return <FaSortDown className="inline text-blue-600" />;
        }
      }
      return <FaSort className="inline text-gray-400" />;
    },
    [sortConfig]
  );

  // Memoized sort handler
  const handleSortChange = useCallback(
    (field) => {
      onSortChange && onSortChange(field);
    },
    [onSortChange]
  );

  // Memoized helper functions
  const getCompanyName = useCallback((company) => {
    if (typeof company === "object" && company !== null) {
      return company.name || "-";
    }
    return company || "-";
  }, []);

  const handleEdit = useCallback(
    (shipmentId, e) => {
      e.stopPropagation();
      const shipment = shipments?.find((s) => s._id === shipmentId);
      if (shipment) {
        setSelectedShipmentForEdit(shipment);
        setEditModalOpen(true);
      }
    },
    [shipments]
  );

  const handleShipmentUpdate = useCallback(
    (updatedShipment) => {
      // Update the specific shipment in the shipments array
      if (onShipmentUpdate) {
        onShipmentUpdate(updatedShipment);
      }
      // Also update local state if needed
      setSelectedShipmentForEdit(updatedShipment);
    },
    [onShipmentUpdate]
  );

  const handlePhotoClick = useCallback((shipment, e) => {
    e.stopPropagation();
    // Open photo management modal (for editing)
    setSelectedShipmentForPhotos(shipment);
    setPhotoModalOpen(true);
  }, []);

  const handleViewPhotos = useCallback((shipment, e) => {
    if (e) e.stopPropagation();
    // Open photos view modal (for viewing/downloading)
    setSelectedShipmentForView(shipment);
    setPhotosViewModalOpen(true);
  }, []);

  const handlePhotoUpdate = useCallback(
    (updatedData) => {
      // Update only imageCount in the shipments array
      if (onShipmentUpdate) {
        onShipmentUpdate(updatedData);
      }
    },
    [onShipmentUpdate]
  );

  const handleDelete = useCallback(
    (shipmentId, e) => {
      e.stopPropagation();
      onDelete && onDelete(shipmentId);
    },
    [onDelete]
  );

  const handleRemarksClick = useCallback((shipment, e) => {
    e.stopPropagation();
    setSelectedShipmentForRemarks(shipment);
    setRemarksModalOpen(true);
  }, []);

  const handleSaveRemarks = useCallback(
    async (updatedShipment) => {
      if (onUpdateRemarks) {
        onUpdateRemarks(updatedShipment);
      }
    },
    [onUpdateRemarks]
  );

  const handleVesselClick = useCallback((shipment) => {
    // Pass the entire vessel object from shipment to avoid server fetch
    setSelectedVesselInfo({
      vessel: shipment.vessel, // Full vessel object already fetched
      vesselId: shipment.vessel?._id || shipment.vesselId,
      vesselName: shipment.vessel?.vesselName,
    });
    setVesselModalOpen(true);
  }, []);

  const handleVesselUpdateCallback = useCallback(
    (updatedVessel) => {
      // Notify parent component to refresh
      if (onVesselUpdate) {
        onVesselUpdate();
      }
    },
    [onVesselUpdate]
  );

  // Memoized styling classes
  const headerClass = useMemo(
    () =>
      "px-2 py-1 text-left text-xs font-bold text-gray-800 border border-gray-400 bg-gray-200 whitespace-nowrap select-none",
    []
  );
  const cellClass = useMemo(
    () =>
      "px-2 py-1 text-xs text-black border border-gray-200 whitespace-nowrap",
    []
  );

  // Memoized safe selected rows
  const safeSelectedRows = useMemo(() => selectedRows || [], [selectedRows]);

  // Memoized loading state
  const showLoadingOverlay = useMemo(
    () => loading && shipments.length === 0,
    [loading, shipments.length]
  );

  // Show empty state only when not loading and no shipments
  if (
    !loading &&
    (!shipments || !Array.isArray(shipments) || shipments.length === 0)
  ) {
    return (
      <div className="p-8 text-center border border-gray-300 bg-white rounded-lg">
        <FaShippingFast className="text-gray-300 text-4xl mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No shipments found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or add a new shipment.
        </p>
      </div>
    );
  }

  // If loading and no shipments, show loading state
  if (showLoadingOverlay) {
    return (
      <div className="p-8 text-center border border-gray-300 bg-white rounded-lg">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading shipments...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-400 shadow-sm rounded-lg overflow-hidden relative">
      {/* Loading overlay - shows on top of existing data */}
      {loading && shipments.length > 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      )}

      {/* Operation loading overlay */}
      {operationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {/* Table Toolbar */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-300 px-4 py-1 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {safeSelectedRows.length > 0 && (
            <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {safeSelectedRows.length} selected
            </div>
          )}
        </div>

        {/* Column Hider Button */}
        <div className="relative" ref={columnMenuRef}>
          <button
            onClick={() => setShowColumnMenu(!showColumnMenu)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-700 shadow-sm transition-colors"
          >
            <FaColumns className="text-gray-600" />
            Columns
          </button>

          {showColumnMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg z-50 max-h-60 overflow-y-auto">
              <div className="p-3">
                <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider px-1">
                  Show Columns
                </div>
                {allColumns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center px-2 py-2 hover:bg-gray-50 cursor-pointer rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible(col.key)}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3 mr-2"
                    />
                    <span className="text-xs text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={`${headerClass} w-8 text-center`}>#</th>
              <th className={`${headerClass} w-8 text-center`}>
                <input
                  type="checkbox"
                  checked={
                    safeSelectedRows.length === shipments.length &&
                    shipments.length > 0
                  }
                  onChange={onSelectAll}
                  className="rounded border-gray-400 text-blue-600 focus:ring-blue-500 h-3 w-3"
                />
              </th>

              {isVisible("gateIn") && <th className={headerClass}>Gate In</th>}
              {isVisible("gateOut") && (
                <th className={headerClass}>Gate Out</th>
              )}

              {isVisible("vessel") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("vessel.vesselName")}
                >
                  <div className="flex items-center justify-between">
                    Vessel
                    {getSortIndicator("vessel.vesselName")}
                  </div>
                </th>
              )}

              {/* {isVisible("customer") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("clientId")}
                >
                  <div className="flex items-center justify-between">
                    Customers
                    {getSortIndicator("clientId")}
                  </div>
                </th>
              )} */}
              {isVisible("customer") && (
                <th className={headerClass}>Customer / ID</th>
              )}
              {isVisible("makeModel") && (
                <th className={headerClass}>Make/Model</th>
              )}
              {isVisible("yard") && <th className={headerClass}>Yard</th>}
              {isVisible("job") && <th className={headerClass}>Job #</th>}
              {isVisible("chassis") && <th className={headerClass}>Chassis</th>}
              {/* {isVisible("gl") && <th className={headerClass}>GL Number</th>} */}

              {isVisible("pod") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("vessel.pod")}
                >
                  <div className="flex items-center justify-between">
                    POD
                    {getSortIndicator("vessel.pod")}
                  </div>
                </th>
              )}

              {isVisible("status") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("exportStatus")}
                >
                  <div className="flex items-center justify-between">
                    Status
                    {getSortIndicator("exportStatus")}
                  </div>
                </th>
              )}

              {isVisible("storage") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("storageDays")}
                >
                  <div className="flex items-center justify-between">
                    Storage
                    {getSortIndicator("storageDays")}
                  </div>
                </th>
              )}

              {isVisible("photos") && <th className={headerClass}>Photos</th>}

              {isVisible("created") && (
                <th
                  className={`${headerClass} cursor-pointer hover:bg-gray-300 transition-colors`}
                  onClick={() => handleSortChange("createdAt")}
                >
                  <div className="flex items-center justify-between">
                    Created At
                    {getSortIndicator("createdAt")}
                  </div>
                </th>
              )}

              {isVisible("actions") && (
                <th className={`${headerClass} text-center`}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white">
            {shipments.map((shipment, index) => (
              <ShipmentTableRow
                key={shipment._id}
                shipment={shipment}
                index={index}
                selectedRows={safeSelectedRows}
                hiddenColumns={hiddenColumns}
                onRowSelect={onRowSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRemarksClick={handleRemarksClick}
                onVesselClick={handleVesselClick}
                onPhotoClick={handlePhotoClick}
                user={user}
                getStatusColor={getStatusColor}
                getStoragePeriodColor={getStoragePeriodColor}
                getCompanyName={getCompanyName}
                isVisible={isVisible}
                cellClass={cellClass}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Remarks Modal */}
      <RemarksModal
        isOpen={remarksModalOpen}
        onClose={() => setRemarksModalOpen(false)}
        shipment={selectedShipmentForRemarks}
        onSave={handleSaveRemarks}
      />

      {/* Vessel Info Modal */}
      <VesselInfoModal
        isOpen={vesselModalOpen}
        onClose={() => {
          setVesselModalOpen(false);
          setSelectedVesselInfo(null);
        }}
        vessel={selectedVesselInfo?.vessel} // Pass full vessel object
        vesselId={selectedVesselInfo?.vesselId}
        vesselName={selectedVesselInfo?.vesselName}
        onUpdate={handleVesselUpdateCallback}
      />

      {/* Edit Shipment Modal */}
      <EditShipmentModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedShipmentForEdit(null);
        }}
        shipment={selectedShipmentForEdit}
        onUpdate={handleShipmentUpdate}
      />

      {/* Photo Management Modal (Separate) */}
      <PhotoManagementModal
        isOpen={photoModalOpen}
        onClose={() => {
          setPhotoModalOpen(false);
          setSelectedShipmentForPhotos(null);
        }}
        shipmentId={selectedShipmentForPhotos?._id}
        onUpdate={handlePhotoUpdate}
      />

      {/* Photos View Modal (View/Download) */}
      <PhotosModal
        isOpen={photosViewModalOpen}
        onClose={() => {
          setPhotosViewModalOpen(false);
          setSelectedShipmentForView(null);
        }}
        shipmentId={selectedShipmentForView?._id}
        shipmentData={selectedShipmentForView}
        isAdmin={true}
      />
    </div>
  );
};

// Memoize the entire table component
export default memo(ShipmentTable);
