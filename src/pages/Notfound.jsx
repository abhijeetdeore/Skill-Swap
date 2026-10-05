// src/pages/Notfound.jsx
import { Link } from "react-router-dom";
export default function Notfound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFCE8]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="mb-4">Page not found.</p>
        <Link to="/home" className="text-red-600 underline">Go home</Link>
      </div>
    </div>
  );
}
