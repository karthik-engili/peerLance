import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../store/authStore";
import { Loader } from "./Loader";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return <Loader fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
