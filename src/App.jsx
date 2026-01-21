import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ScrollToTop from "./components/Common/ScrolToTop";
import { Provider } from "react-redux";
import { store } from "./redux/store/store";
import AuthGuard from "./pages/AuthGuard";
import Stats from "./analytics/Stats";
import { ToastContainer } from "react-toastify";

// 🔹 Direct imports (no lazy loading)
import LoginPage from "./pages/LoginPage";
import CustomerDashboard from "./components/Customer/Dashboard";
import ShipmentDetail from "./components/Customer/ShipmentDetailView";
import ShipmentManagement from "./components/Admin/ShippmentManagement";
import CustomerManagement from "./components/Admin/CustomerManagement";
import VesselManagement from "./components/Admin/VesselManagement";
import EditShipmentPage from "./components/Shipment/Edit/index";
import NotFoundPage from "./pages/404Page";
// import MigrationTool from "./components/Admin/MigrationTool";

// Admin layout
import Admin from "./components/Admin/Admin";

import { useEffect, useState } from "react";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Analytics />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster position="top-right" richColors />
        <ScrollToTop />

        {/* This wrapper handles token validation */}
        <TokenValidator>
          <AuthGuard>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route
                path="/customer/shipment/:id"
                element={<ShipmentDetail />}
              />
              <Route path="/admin" element={<Admin />}>
                <Route index element={<Navigate to="shipments" replace />} />
                <Route path="shipments" element={<ShipmentManagement />} />
                <Route path="stats" element={<Stats />} />
                <Route
                  path="shipments/edit/:id"
                  element={<EditShipmentPage />}
                />
                <Route path="users" element={<CustomerManagement />} />
                <Route path="vessels" element={<VesselManagement />} />
                {/* <Route path="migration" element={<MigrationTool />} /> */}
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AuthGuard>
        </TokenValidator>
      </BrowserRouter>
    </Provider>
  );
}

// ✅ This component handles token validation and navigation
function TokenValidator({ children }) {
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    async function validateToken() {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setValidated(true);
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/validateToken`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (response.status === 401) {
          // Token invalid or missing
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
          setValidated(true); // allow routes to render, user can see /login
          return;
        }

        const data = await response.json();
        if (!data.success) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userData");
          setValidated(true);
          return;
        }

        setValidated(true); // token valid
      } catch (err) {
        console.error(err);
        setValidated(true); // network or other errors, still allow rendering
      }
    }

    validateToken();
  }, []);

  if (!validated)
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray-100 border-t-blue-600"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 tracking-wide">
          Loading...
        </p>
      </div>
    );

  return children;
}

export default App;
