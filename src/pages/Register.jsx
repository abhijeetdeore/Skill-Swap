// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, loginWithGoogle, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password });
      navigate("/onboarding");
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      navigate("/onboarding");
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex bg-[#FEFCE8]">
      <div className="w-full max-w-md m-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Skill Swap</h1>

        <div className="flex gap-2 mb-6">
          <Link to="/login" className="flex-1 text-center bg-red-600 text-white py-2 rounded-full">Sign In</Link>
          <button className="flex-1 border border-blue-300 text-blue-600 py-2 rounded-full">Sign Up</button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-full px-4 py-3" />
          <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-full px-4 py-3" />
          <input type="password" required placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-full px-4 py-3" />
          <input type="password" required placeholder="Confirm your password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border rounded-full px-4 py-3" />
          <button disabled={submitting} type="submit" className="w-full bg-red-600 text-white py-3 rounded-full font-semibold">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-gray-400 my-4">OR</div>

        <button onClick={handleGoogle} className="w-full border rounded-full py-3">SignUp with Google</button>
      </div>
    </div>
  );
}
