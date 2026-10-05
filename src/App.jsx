// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./firebase/store/authStore";

import Navigation from "./components/Navigation";
import Landingpage from "./pages/Landingpage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Myswaps from "./pages/Myswaps";
import ChatList from "./pages/ChatList";
import ChatWindow from "./pages/ChatWindow";
import ViewSwap from "./pages/ViewSwap";
import Onboarding from "./pages/Onboarding";
import Schedule from "./pages/Schedule";
import Notfound from "./pages/Notfound";
import ProtectedRoute from "./routes/ProtectedRoute";
import RedirectIfAuthed from "./routes/RedirectIfAuthed";

export default function App() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  return (
    <BrowserRouter>
      {user && <Navigation />}
      <Routes>
        <Route path="/" element={<RedirectIfAuthed><Landingpage /></RedirectIfAuthed>} />
        <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
        <Route path="/register" element={<RedirectIfAuthed><Register /></RedirectIfAuthed>} />

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/swap/:userId" element={<ProtectedRoute><ViewSwap /></ProtectedRoute>} />
        <Route path="/myswaps" element={<ProtectedRoute><Myswaps /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatList /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />

        <Route path="*" element={<Notfound />} />
      </Routes>
    </BrowserRouter>
  );
}
