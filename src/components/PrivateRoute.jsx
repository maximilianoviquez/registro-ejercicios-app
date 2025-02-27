import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// protego el acceso al dashboard solo si el usuario se autentico
const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  return user ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;