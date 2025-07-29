import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and on login page, redirect to dashboard
    if (isAuthenticated && location.pathname === "/admin/login") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate, location]);

  const isLoginPage = location.pathname === "/admin/login";

  return (
    <div className="admin-container">
      {isLoginPage ? (
        <AdminLogin />
      ) : (
        <AdminDashboard />
      )}
    </div>
  );
}