// src/routes/RedirectIfAuthed.jsx
// Opposite of ProtectedRoute: if you're already logged in, you shouldn't be
// able to view the Landing/Login/Register pages — send you to /home instead.
// This is also what stops the double-navbar bug (Navigation + Landing's own
// nav rendering on top of each other) because you never see Landing while logged in.
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";

export default function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (user) return <Navigate to="/home" replace />;

  return children;
}
