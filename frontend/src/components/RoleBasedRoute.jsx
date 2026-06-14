import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../store/authStore";
import { Loader } from "./Loader";

export const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <Loader fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
