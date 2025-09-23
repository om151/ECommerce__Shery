import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../Components/Common/LoadingSpinner.jsx";
import { useAuth } from "../store/Hooks/Common/hook.useAuth.js";


const userAlreadyLogin = ({children}) => {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  console.log(location)

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  return children;
};

export default userAlreadyLogin;
