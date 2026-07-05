// ─── Protected Route ───────────────────────────────────────────────────────
// Wraps private pages. If the user is not authenticated, redirects to /login.
// Shows a loading spinner while auth state is being verified on first load.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-sandlewood/30 border-t-sandlewood animate-spin" />
          <p className="text-almond/40 text-sm font-sans tracking-wider uppercase">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
