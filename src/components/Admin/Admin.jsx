// Enhanced Admin.jsx
import React, { useEffect, useState } from "react";
import { FaSignOutAlt, FaHome, FaUsers } from "react-icons/fa";
import { FaShip } from "react-icons/fa";
import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/features/authSlice";
import { FaChartBar } from "react-icons/fa";
function Admin() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    await dispatch(logoutUser()).unwrap();
    navigate("/login");
  };

  useEffect(() => {
    // Check if we've already shown the welcome message in this session
    const welcomeShown = sessionStorage.getItem("adminWelcomeShown");

    if (!welcomeShown && !hasShownWelcome) {
      toast.success("Welcome, You'r loged in", {
        duration: 3000,
        position: "top-center", // This will fix the "downle toast" issue
      });

      // Mark as shown in sessionStorage so it doesn't show again during this browser session
      sessionStorage.setItem("adminWelcomeShown", "true");
      setHasShownWelcome(true);
    }
  }, [hasShownWelcome]);
  const navLinks = [
    { to: "/admin/shipments", icon: <FaShip />, label: "Shipments" },
    { to: "/admin/users", icon: <FaUsers />, label: "Customers" },
    { to: "/admin/stats", icon: <FaChartBar />, label: "Analytics" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-10 py-0.5">
          {/* Main top bar content */}
          <div className="flex items-center justify-between">
            {/* Left side - Brand and Welcome */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-sm font-bold text-gray-800">
                  Admin Portal
                </h1>
                <p className="text-sm text-gray-500"> Welcome back, Admin</p>
              </div>
            </div>

            {/* Right side - Navigation links and user info */}
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-1 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`
                    }
                  >
                    <span className="text-lg mr-2">{link.icon}</span>
                    <span className="font-semibold text-sm">{link.label}</span>
                  </NavLink>
                ))}
              </div>

              {/* User info and logout - Desktop */}
              <div className="hidden lg:flex items-center space-x-4">
                <div className="flex items-center space-x-3"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="ml-2 font-medium">Logout</span>
                </button>
              </div>

              {/* Mobile menu toggle */}
              <div className="flex lg:hidden items-center">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={toggleMenu}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="py-2 space-y-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 mx-2 rounded-lg ${
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`
                    }
                  >
                    {link.icon}
                    <span className="ml-3 font-medium">{link.label}</span>
                  </NavLink>
                ))}

                {/* Mobile user info and logout */}
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex items-center px-4 py-3"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaSignOutAlt />
                    <span className="ml-3 font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="px-4 py-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Admin;
