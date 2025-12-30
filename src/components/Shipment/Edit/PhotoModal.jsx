// src/pages/EditShipmentPage/PhotoModal.jsx
import { useEffect } from "react";

const PhotoModal = ({ photos, currentIndex, onClose, onNavigate }) => {
  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onNavigate("prev");
    if (e.key === "ArrowRight") onNavigate("next");
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // prevent scroll
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={() => onNavigate("prev")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={() => onNavigate("next")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white text-lg font-medium">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main image container */}
      <div className="relative flex items-center justify-center max-w-[90vw] max-h-[80vh]">
        <div className="w-[80vw] h-[70vh] flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
          <img
            src={currentPhoto.url}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/800x600?text=Photo+Not+Found";
            }}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id || index}
              onClick={() => onNavigate(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden transition-all ${
                index === currentIndex
                  ? "border-blue-500 scale-105"
                  : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img
                src={photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/100x100?text=Error";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoModal;
