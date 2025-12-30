// src/components/Common/PhotoModal.jsx
import { useEffect } from "react";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PhotoModal = ({ photos, currentIndex, onClose, onNavigate }) => {
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <FaTimes className="w-8 h-8" />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={() => onNavigate("prev")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <FaChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={() => onNavigate("next")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <FaChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      <div className="absolute top-4 left-4 text-white text-lg font-medium">
        {currentIndex + 1} / {photos.length}
      </div>

      <div className="relative flex items-center justify-center max-w-[90vw] max-h-[80vh]">
        <div className="w-[80vw] h-[70vh] flex items-center justify-center bg-black/50 rounded-lg overflow-hidden">
          <img
            src={currentPhoto.url}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/800x600?text=Photo+Not+Found";
            }}
          />
        </div>
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2">
          {photos.map((photo, index) => (
            <button
              key={photo._id || index}
              onClick={() => onNavigate(index)}
              className={`flex-shrink-0 w-20 h-20 border-2 rounded-md overflow-hidden ${
                index === currentIndex
                  ? "border-blue-500"
                  : "border-transparent"
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
