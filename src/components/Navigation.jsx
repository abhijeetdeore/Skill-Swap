// src/components/Navigation.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";

export default function Navigation() {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-[#FEFCE8]">
      <Link to="/home" className="font-bold text-xl">Logo</Link>
      <div className="flex items-center gap-6">
        <Link to="/home">Home</Link>
        <Link to="/browse">Browse Skills</Link>
        <Link to="/myswaps">My Swaps</Link>
        <Link to="/chat">Notification</Link>
        <Link to="/profile">
          <img
            src={profile?.photoURL || "https://api.dicebear.com/7.x/initials/svg?seed=" + (profile?.name || "U")}
            alt="profile"
            className="w-8 h-8 rounded-full border"
          />
        </Link>
        <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
      </div>
    </nav>
  );
}
