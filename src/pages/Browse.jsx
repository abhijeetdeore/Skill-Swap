// src/pages/Browse.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { browseUsers, sendSwapRequest } from "../firebase/firestore";

const FORMATS = ["", "Video", "In Person", "Chat"];
const LEVELS = ["", "Beginner", "Intermediate", "Advanced"];
const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Browse() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("");
  const [level, setLevel] = useState("");
  const [availability, setAvailability] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const runSearch = async () => {
    setLoading(true);
    const results = await browseUsers({
      myProfile: profile,
      skillQuery: search,
      format: format || undefined,
      level: level || undefined,
      availability: availability || undefined,
    });
    setUsers(results);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) runSearch();
  }, [profile]);

  // Re-run automatically whenever a filter changes
  useEffect(() => {
    if (profile) runSearch();
  }, [format, level, availability]);

  const handleSendRequest = async (otherUser) => {
    try {
      await sendSwapRequest({
        fromUserId: profile.id,
        toUserId: otherUser.id,
        teachSkill: profile.teaches?.[0]?.skill || "",
        learnSkill: otherUser.teaches?.[0]?.skill || "",
      });
      alert("Swap request sent!");
    } catch (err) {
      alert("Failed to send request: " + err.message);
    }
  };

  const clearFilters = () => {
    setFormat(""); setLevel(""); setAvailability("");
  };

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Browse Skills</h1>
      <p className="text-gray-500 mb-6">Find someone teaching what you want to learn</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && runSearch()}
        placeholder="Search a skill, like Spanish or Python"
        className="w-full border rounded-full px-5 py-4 mb-4"
      />

      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <button onClick={() => setShowFilters(!showFilters)} className="border rounded-full px-4 py-2 font-semibold">
          Categories
        </button>

        <select value={format} onChange={(e) => setFormat(e.target.value)} className="border rounded-full px-4 py-2">
          <option value="">Format (any)</option>
          {FORMATS.filter(Boolean).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>

        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded-full px-4 py-2">
          <option value="">Level (any)</option>
          {LEVELS.filter(Boolean).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="border rounded-full px-4 py-2">
          <option value="">Availability (any)</option>
          {DAYS.filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {(format || level || availability) && (
          <button onClick={clearFilters} className="text-sm text-red-600 underline">Clear filters</button>
        )}
      </div>

      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-[#E8DCC0] rounded-xl p-5">
              <div className="flex justify-between">
                <div className="font-bold">{u.name}</div>
                <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">{u.matchScore}%</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{u.location} ★ {u.rating?.toFixed(1) || "New"}</div>
              <div className="text-xs">OFFERS YOU</div>
              <div className="flex gap-1 flex-wrap mb-2">
                {(u.teaches || []).map((t) => <span key={t.skill} className="bg-black text-white text-xs px-2 py-1 rounded-full">{t.skill}</span>)}
              </div>
              <div className="text-xs">WANTS TO LEARN</div>
              <div className="flex gap-1 flex-wrap mb-3">
                {(u.learns || []).map((l) => <span key={l.skill} className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full">{l.skill}</span>)}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSendRequest(u)} className="flex-1 bg-red-600 text-white rounded-full py-2 text-sm">Send Request</button>
                <button onClick={() => navigate(`/swap/${u.id}`)} className="flex-1 border border-blue-400 text-blue-600 rounded-full py-2 text-sm">View</button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-gray-500 col-span-3">No matches found. Try different filters.</p>}
        </div>
      )}
    </div>
  );
}
