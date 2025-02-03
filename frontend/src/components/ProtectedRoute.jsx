/* eslint-disable react/prop-types */
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import api from "../services/api";

const ProtectedRoute = ({ children }) => {
  const { isLoading, isError } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      // Store user data in localStorage when received
      if (response.data?.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    localStorage.removeItem("user"); // Clear user data on error
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
