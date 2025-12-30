// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import shipmentsReducer from "../features/shipmentSlice";
import userReducer from "../features/userSlice";
import customerReducer from "../features/customerSlice";
import authReducer from "../features/authSlice";
export const store = configureStore({
  reducer: {
    shipments: shipmentsReducer,
    users: userReducer,
    customerShipments: customerReducer,
    auth: authReducer,
  },
});

export default store;
