import React from "react";
import { FaUpload } from "react-icons/fa";

export default function FileUploadInput({ file, onChange }) {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith(".zip")) {
      alert("Please upload a ZIP file only.");
      return;
    }
    onChange(selectedFile || null);
  };

  return (
    <div className="col-span-2">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Upload Photos Folder (ZIP only)
      </label>
      <div className="flex items-center gap-2">
        <label className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <FaUpload />
          <span>Choose ZIP file</span>
          <input
            type="file"
            accept=".zip"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        <span className="text-sm text-gray-600">
          {file ? file.name : "No ZIP file chosen"}
        </span>
      </div>
    </div>
  );
}
