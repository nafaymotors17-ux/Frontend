// components/Auth/AuthGuard.jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser, clearUser } from "../redux/features/authSlice";

const AuthGuard = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userData = localStorage.getItem("userData");

        if (!token || !userData) {
          // No token or user data found
          dispatch(clearUser());
          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
          setIsChecking(false);
          return;
        }

        // Parse user data
        const parsedUser = JSON.parse(userData);

        // Optional: Add token expiration check here
        // You can decode the JWT token and check if it's expired

        dispatch(setUser(parsedUser));
        const adminRoles = ["admin", "subadmin"];
        const isAdmin = adminRoles.includes(parsedUser.role);
        const isCustomer = parsedUser.role === "customer";

        const isOnAdminRoute = location.pathname.startsWith("/admin");
        const isOnCustomerRoute = location.pathname.startsWith("/customer");
        const isOnLoginRoute = location.pathname === "/login";

        if (isOnLoginRoute) {
          // If already logged in and trying to access login page, redirect to appropriate dashboard
          navigate(isAdmin ? "/admin/shipments" : "/customer", {
            replace: true,
          });
        } else if (isAdmin && !isOnAdminRoute) {
          navigate("/admin/shipments", { replace: true });
        } else if (isCustomer && !isOnCustomerRoute) {
          navigate("/customer", { replace: true });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Clear invalid data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        dispatch(clearUser());
        navigate("/login", { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, navigate, location.pathname]);

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user but not on login page, this will be handled by the useEffect
  if (!user && location.pathname !== "/login") {
    return null;
  }

  return children;
};

export default AuthGuard;
