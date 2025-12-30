import React, { useState, useEffect } from "react";
import { FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

function UserModal({ isOpen, onClose, onSubmit, user, isEdit, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [suggestedIds, setSuggestedIds] = useState([]);

  // Generate strong password
  const generateStrongPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  // Generate ID suggestions
  const generateSuggestedIds = (name) => {
    if (!name) return [];
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return [
      `${clean.slice(0, 4)}${Math.floor(100 + Math.random() * 900)}`,
      `${clean}_${Math.floor(1000 + Math.random() * 9000)}`,
    ];
  };

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      if (isEdit && user) {
        setFormData({
          name: user.name || "",
          username: user.username || user.userId || "",
          password: "",
        });
      } else {
        setFormData({
          name: "",
          username: "",
          password: generateStrongPassword(),
        });
      }
    }
  }, [isOpen, isEdit, user]);

  // Suggestions on name change
  useEffect(() => {
    if (formData.name && !isEdit) {
      setSuggestedIds(generateSuggestedIds(formData.name));
    }
  }, [formData.name, isEdit]);

  // Password strength check
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      alert("Name and User ID are required");
      return;
    }
    if (!isEdit && !formData.password) {
      alert("Password is required");
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header - Matching Shipment Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter customer name"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter unique user ID"
              required
            />
            {!isEdit && suggestedIds.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Suggested IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedIds.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, username: s }))
                      }
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        formData.username === s
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors pr-20"
                placeholder={
                  isEdit
                    ? "Leave blank to keep current password"
                    : "Enter password"
                }
                required={!isEdit}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FaEyeSlash size={16} />
                  ) : (
                    <FaEye size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      password: generateStrongPassword(),
                    }))
                  }
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                  title="Generate strong password"
                >
                  <FaSync size={16} />
                </button>
              </div>
            </div>

            {formData.password && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Password strength:
                </span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength === "Strong"
                      ? "text-green-600"
                      : passwordStrength === "Good"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordStrength}
                </span>
              </div>
            )}
          </div>

          {/* Buttons - Matching Shipment Modal Footer */}
          <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {isEdit ? "Update Customer" : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;
