// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithGoogle, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/home");
    } catch (err) {
      // error already set in store; shown below
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/home");
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex bg-[#FEFCE8]">
      <div className="w-full max-w-md m-auto p-8">
        <h1 className="text-3xl font-bold mb-1">Skill Swap</h1>
        <p className="text-gray-500 mb-6">We are happy to see you again</p>

        <div className="flex gap-2 mb-6">
          <button className="flex-1 bg-red-600 text-white py-2 rounded-full">Sign In</button>
          <Link to="/register" className="flex-1 text-center border border-blue-300 text-blue-600 py-2 rounded-full">Sign Up</Link>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" required placeholder="Enter your email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-full px-4 py-3"
          />
          <input
            type="password" required placeholder="Enter your password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-full px-4 py-3"
          />
          <button disabled={submitting} type="submit" className="w-full bg-red-600 text-white py-3 rounded-full font-semibold">
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-gray-400 my-4">OR</div>

        <button onClick={handleGoogle} className="w-full border rounded-full py-3 flex items-center justify-center gap-2">
          Login with Google
        </button>
      </div>
    </div>
  );
}
