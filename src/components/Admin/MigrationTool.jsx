import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
  FaTrash,
  FaBroom,
} from "react-icons/fa";

const MigrationTool = () => {
  const [analysis, setAnalysis] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/migration/analyze`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setAnalysis(result.data);
      } else {
        toast.error(result.message || "Failed to analyze migration");
      }
    } catch (error) {
      toast.error(error.message || "Failed to analyze migration");
    } finally {
      setLoading(false);
    }
  };

  const executeMigration = async (dryRun = false) => {
    // try {
    //   setLoading(true);
    //   const accessToken = localStorage.getItem("accessToken");
    //   const response = await fetch(
    //     `${
    //       import.meta.env.VITE_API_URL
    //     }/admin/migration/execute?dryRun=${dryRun}`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   );

    //   const result = await response.json();
    //   if (result.success) {
    //     if (dryRun) {
    //       toast.info("Dry run completed - check results");
    //     } else {
    //       toast.success("Migration executed successfully!");
    //     }
    //     setAnalysis(result.data);
    //     if (!dryRun) {
    //       await fetchAnalysis();
    //       await verifyMigration();
    //     }
    //   } else {
    //     toast.error(result.message || "Migration failed");
    //   }
    // } catch (error) {
    //   toast.error(error.message || "Migration failed");
    // } finally {
    //   setLoading(false);
    // }
    window.alert("You are not authorized to perform this action");
  };

  const verifyMigration = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/migration/verify`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setVerification(result.data);
        if (result.data.status === "PASSED") {
          toast.success("Migration verification passed!");
        } else {
          toast.warning("Migration verification found issues");
        }
      } else {
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const rollbackMigration = async () => {
    // if (!window.confirm("Are you sure you want to rollback the migration? This will remove vesselId references from shipments.")) {
    //   return;
    // }

    // try {
    //   setLoading(true);
    //   const accessToken = localStorage.getItem("accessToken");
    //   const response = await fetch(
    //     `${import.meta.env.VITE_API_URL}/admin/migration/rollback?confirm=true`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   );

    //   const result = await response.json();
    //   if (result.success) {
    //     toast.success("Rollback completed successfully");
    //     await fetchAnalysis();
    //     setVerification(null);
    //   } else {
    //     toast.error(result.message || "Rollback failed");
    //   }
    // } catch (error) {
    //   toast.error(error.message || "Rollback failed");
    // } finally {
    //   setLoading(false);
    // }
    window.alert("You are not authorized to perform rollback");
  };

  const cleanupOldFields = async () => {
    if (
      !window.confirm(
        "WARNING: This will permanently remove vesselName, pod, and jobNumber fields from shipments. This is IRREVERSIBLE! Are you absolutely sure?"
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        "This action cannot be undone. Type 'CONFIRM' to proceed."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/admin/migration/cleanup?confirm=true&verifyFirst=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Cleanup completed successfully");
        await fetchAnalysis();
      } else {
        toast.error(result.message || "Cleanup failed");
      }
    } catch (error) {
      toast.error(error.message || "Cleanup failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Vessel Migration Tool
        </h2>
        <p className="text-gray-600 mb-6">
          This tool helps migrate existing vessel data from shipments to the new
          Vessel entity.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-4 py-2 font-medium ${
              activeTab === "analyze"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Analyze
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`px-4 py-2 font-medium ${
              activeTab === "verify"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Verify
          </button>
        </div>

        {/* Analyze Tab */}
        {activeTab === "analyze" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={fetchAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FaSync className="inline mr-2" />
                Refresh Analysis
              </button>
              <button
                onClick={() => executeMigration(true)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Dry Run
              </button>
              <button
                onClick={() => executeMigration(false)}
                disabled={
                  loading || (analysis && analysis.unmigratedShipments === 0)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Execute Migration
              </button>
            </div>

            {analysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Unmigrated Shipments
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analysis.unmigratedShipments}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Migrated Shipments
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.migratedShipments}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Unique Vessels</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.uniqueVesselCombinations}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Existing Vessels</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysis.existingVessels}
                  </div>
                </div>
              </div>
            )}

            {analysis &&
              analysis.vesselCombinations &&
              analysis.vesselCombinations.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Vessel Combinations to Create
                  </h3>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Vessel Name</th>
                          <th className="px-4 py-2 text-left">Job Number</th>
                          <th className="px-4 py-2 text-left">POD</th>
                          <th className="px-4 py-2 text-right">Shipments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.vesselCombinations.map((vessel, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-4 py-2">
                              {vessel.vesselName || "-"}
                            </td>
                            <td className="px-4 py-2">
                              {vessel.jobNumber || "-"}
                            </td>
                            <td className="px-4 py-2">{vessel.pod || "-"}</td>
                            <td className="px-4 py-2 text-right">
                              {vessel.shipmentCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === "verify" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={verifyMigration}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FaCheckCircle className="inline mr-2" />
                Verify Migration
              </button>
            </div>

            {verification && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg ${
                    verification.status === "PASSED"
                      ? "bg-green-50 border border-green-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {verification.status === "PASSED" ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-600" />
                    )}
                    <span className="font-semibold">
                      Status: {verification.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Unmigrated</div>
                    <div className="text-2xl font-bold">
                      {verification.unmigratedShipments}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Migrated</div>
                    <div className="text-2xl font-bold text-green-600">
                      {verification.migratedShipments}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Orphaned IDs</div>
                    <div className="text-2xl font-bold text-red-600">
                      {verification.orphanedVesselIds}
                    </div>
                  </div>
                </div>

                {verification.sampleCheck && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Sample Check</h4>
                    <p className="text-sm text-gray-600">
                      Checked {verification.sampleCheck.samplesChecked} samples,{" "}
                      {verification.sampleCheck.mismatches} mismatches found
                    </p>
                  </div>
                )}

                {verification.status === "PASSED" && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Migration Successful!
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      All shipments have been migrated. You can now safely
                      remove old fields after thorough testing.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={rollbackMigration}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        <FaTrash className="inline mr-2" />
                        Rollback Migration
                      </button>
                      <button
                        onClick={cleanupOldFields}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        <FaBroom className="inline mr-2" />
                        Cleanup Old Fields (IRREVERSIBLE)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationTool;
