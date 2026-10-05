// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { getDashboardData } from "../firebase/firestore";
import NewSwapModal from "../components/NewSwapModal";

export default function Home() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewSwap, setShowNewSwap] = useState(false);

  useEffect(() => {
    if (!profile) return;
    getDashboardData(profile.id).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [profile]);

  if (loading || !data) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {profile.name}.</h1>
          <p className="text-gray-500">
            You have {data.newMatchesCount} new swap requests and {data.pendingReviewCount} pending review.
          </p>
        </div>
        <button onClick={() => setShowNewSwap(true)} className="bg-red-600 text-white px-5 py-3 rounded-full">
          New Swap +
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-[#E8DCC0] rounded-xl p-5">
          <div className="text-2xl font-bold">{data.newMatchesCount}</div>
          <div>New Matches</div>
        </div>
        <div className="bg-[#E8DCC0] rounded-xl p-5">
          <div className="text-2xl font-bold">{data.upcomingSessionsCount}</div>
          <div>Upcoming sessions</div>
        </div>
        <div className="bg-[#E8DCC0] rounded-xl p-5">
          <div className="text-2xl font-bold">{data.pendingReviewCount}</div>
          <div>Pending review</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Your top matches today</h2>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {data.topMatches.map((u) => (
          <div key={u.id} className="bg-[#E8DCC0] rounded-xl p-5">
            <div className="flex justify-between">
              <div className="font-bold">{u.name}</div>
              <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">{u.matchScore}%</span>
            </div>
            <div className="text-sm text-gray-600 mb-2">{u.location}</div>
            <div className="text-xs mb-1">OFFERS YOU</div>
            <div className="flex gap-1 flex-wrap mb-2">
              {(u.teaches || []).map((t) => (
                <span key={t.skill} className="bg-black text-white text-xs px-2 py-1 rounded-full">{t.skill}</span>
              ))}
            </div>
            <div className="text-xs mb-1">WANTS TO LEARN</div>
            <div className="flex gap-1 flex-wrap mb-2">
              {(u.learns || []).map((l) => (
                <span key={l.skill} className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">{l.skill}</span>
              ))}
            </div>
            <button onClick={() => navigate(`/swap/${u.id}`)} className="w-full border border-blue-400 text-blue-600 rounded-full py-2">
              View Swap
            </button>
          </div>
        ))}
        {data.topMatches.length === 0 && <p className="text-gray-500 col-span-3">No matches yet — fill out your profile skills to get matched.</p>}
      </div>

      <h2 className="text-xl font-bold mb-4">Recent activity</h2>
      <div className="space-y-3 mb-10">
        {data.recentActivity.map((a, i) => (
          <div key={i} className="bg-[#E8DCC0] rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs
                ${a.type === "swap_accepted" ? "bg-green-700" : a.type === "message" ? "bg-blue-700" : "bg-amber-700"}`}>
                {a.type === "swap_accepted" ? "✓" : a.type === "message" ? "💬" : "★"}
              </span>
              <div>
                <div className="font-semibold">{a.text}</div>
                <div className="text-sm text-gray-600">{a.detail}</div>
              </div>
            </div>
          </div>
        ))}
        {data.recentActivity.length === 0 && <p className="text-gray-500">No recent activity yet.</p>}
      </div>

      {showNewSwap && <NewSwapModal onClose={() => setShowNewSwap(false)} />}
    </div>
  );
}
