import { memo, useState, useEffect, useRef } from "react";
import { FaTimes, FaSave, FaGripHorizontal } from "react-icons/fa";

const RemarksModal = ({ shipment, onClose, isOpen, onSave }) => {
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // Position and Size State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 500, height: 400 });

  // Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const modalRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // 1. Initialize data and responsiveness
  useEffect(() => {
    if (shipment && isOpen) {
      setRemarks(shipment.remarks || "");

      const isMobile = window.innerWidth < 768;
      const initialWidth = isMobile ? window.innerWidth * 0.95 : 500;
      const initialHeight = isMobile ? 450 : 380;

      const x = (window.innerWidth - initialWidth) / 2;
      const y = isMobile ? (window.innerHeight - initialHeight) / 2 : 100;

      setPosition({ x, y });
      setSize({ width: initialWidth, height: initialHeight });
    }
  }, [shipment, isOpen]);

  // 2. RESTORED: Ctrl + Enter Shortcut Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Enter or Cmd+Enter (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isComposing) {
        // Prevent default to avoid adding a newline
        e.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, remarks, isComposing, shipment]); // Dependencies ensure latest state is used

  // 3. Save Functionality
  const handleSave = async () => {
    // Only save if changed and not already saving
    if (isSaving || remarks === shipment?.remarks) return;

    setIsSaving(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/shipments/updateRemarks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            remarks: remarks?.trim() || "",
            id: shipment._id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to save");

      if (onSave) onSave({ ...shipment, remarks: remarks?.trim() || "" });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Drag & Resize Logic (Window events for smooth movement)
  const handleMouseDown = (e) => {
    if (window.innerWidth < 768 || e.target.closest("button")) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleResizeMouseDown = (e) => {
    if (window.innerWidth < 768) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = Math.max(
          0,
          Math.min(
            e.clientX - dragStartRef.current.x,
            window.innerWidth - size.width
          )
        );
        const newY = Math.max(
          0,
          Math.min(
            e.clientY - dragStartRef.current.y,
            window.innerHeight - size.height
          )
        );
        setPosition({ x: newX, y: newY });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStartRef.current.x;
        const deltaY = e.clientY - resizeStartRef.current.y;
        setSize({
          width: Math.max(
            350,
            Math.min(
              resizeStartRef.current.w + deltaX,
              window.innerWidth - position.x - 20
            )
          ),
          height: Math.max(
            250,
            Math.min(
              resizeStartRef.current.h + deltaY,
              window.innerHeight - position.y - 20
            )
          ),
        });
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, size, position]);

  if (!isOpen || !shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:block pointer-events-none">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        style={{
          left: window.innerWidth >= 768 ? `${position.x}px` : "auto",
          top: window.innerWidth >= 768 ? `${position.y}px` : "auto",
          width: window.innerWidth >= 768 ? `${size.width}px` : "95%",
          height: window.innerWidth >= 768 ? `${size.height}px` : "auto",
          maxHeight: "90vh",
        }}
        className={`fixed bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col pointer-events-auto overflow-hidden transition-[box-shadow] duration-200 ${
          isDragging ? "shadow-blue-500/30 ring-2 ring-blue-500/20" : ""
        }`}
      >
        <div
          onMouseDown={handleMouseDown}
          className={`px-5 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 select-none ${
            window.innerWidth >= 768
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-slate-300">
              <FaGripHorizontal size={14} />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-tight">
                {shipment?.carId?.chassisNumber || "Shipment"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                {shipment.clientId?.name} • Job #{shipment.jobNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div className="p-4 flex-grow flex flex-col min-h-0 bg-white">
          <textarea
            autoFocus
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            className="w-full flex-grow p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none"
            placeholder="備考を入力してください..."
          />

          <div className="flex justify-between items-center mt-3 px-1">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                remarks?.length > 600
                  ? "bg-red-50 text-red-500"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {remarks?.length || 0} / 700
            </span>
            <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
              <span className="bg-white border shadow-sm px-1.5 py-0.5 rounded">
                Ctrl
              </span>
              <span>+</span>
              <span className="bg-white border shadow-sm px-1.5 py-0.5 rounded">
                Enter
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 shrink-0 relative">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-700"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || remarks === shipment.remarks}
            className="px-6 py-2 text-[12px] font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-40 transition-all shadow-lg shadow-blue-600/20"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          {/* Resize Handle SVG */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="hidden md:flex absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize items-end justify-end p-1 group"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              className="text-slate-300 group-hover:text-blue-500 transition-colors"
            >
              <line
                x1="10"
                y1="0"
                x2="0"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="10"
                y1="5"
                x2="5"
                y2="10"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(RemarksModal);
