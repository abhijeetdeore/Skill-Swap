// src/pages/ChatList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { getMyChats } from "../firebase/firestore";

export default function ChatList() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getMyChats(profile.id).then((c) => {
      setChats(c);
      setLoading(false);
    });
  }, [profile]);

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <h1 className="font-bold text-xl mb-4">SkillSwap Chat</h1>
      {loading ? (
        <p>Loading chats...</p>
      ) : (
        <div className="space-y-2 max-w-md">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="w-full text-left bg-[#E8DCC0] rounded-xl p-4 flex justify-between"
            >
              <div>
                <div className="font-bold">{c.otherUser?.name || "Unknown"}</div>
                <div className="text-sm text-gray-600 truncate max-w-xs">{c.lastMessage}</div>
              </div>
            </button>
          ))}
          {chats.length === 0 && <p className="text-gray-500">No conversations yet.</p>}
        </div>
      )}
    </div>
  );
}
