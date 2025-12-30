import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { memo } from "react";
function CSVModal({ open, onClose }) {
  const filters = useSelector((state) => state.shipments.filters);
  const handleExport = () => {
    toast.info("Generating CSV export... please wait");
    console.log("filters : ", filters);

    const query = new URLSearchParams(filters).toString();
    window.open(
      `${import.meta.env.VITE_API_URL}/admin/shipments/export/csv?${query}`,
      "_blank"
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" textAlign="center" fontWeight={600}>
          Export Shipments to CSV
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={handleExport}
          >
            Download CSV
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
export default memo(CSVModal);
