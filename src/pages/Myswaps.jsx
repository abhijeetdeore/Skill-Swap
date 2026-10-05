// src/pages/Myswaps.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { getMySwaps, respondToSwapRequest, completeSwapRequest, clearSwapMeeting, chatIdFor } from "../firebase/firestore";
import MeetModal from "../components/MeetModal";

const formatWhen = (ts) => {
  const d = ts?.toDate?.();
  return d ? d.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
};

export default function Myswaps() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState("active"); // active | requests | completed
  const [data, setData] = useState({ active: [], requests: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [meetFor, setMeetFor] = useState(null); // the swap whose Meet modal is open

  const load = async () => {
    setLoading(true);
    const result = await getMySwaps(profile.id);
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) load();
  }, [profile]);

  const handleAccept = async (id, accept) => {
    await respondToSwapRequest(id, accept);
    load();
  };

  const handleComplete = async (id) => {
    await completeSwapRequest(id);
    load();
  };

  const list = data[tab] || [];

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Skill Swap</h1>
      <p className="text-gray-500 mb-6">Everything you're teaching, learning, or waiting to hear back on</p>

      <div className="flex gap-2 mb-6 bg-[#E8DCC0] rounded-full p-1 w-fit">
        {["active", "requests", "completed"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full capitalize ${tab === t ? "bg-black text-white" : ""}`}
          >
            {t} ({data[t]?.length || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {list.map((s) => (
            <div key={s.id} className="bg-[#E8DCC0] rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-lg">{s.otherUser?.name || "Unknown user"}</div>
                {tab !== "requests" && (
                  <span className={`text-white text-xs px-3 py-1 rounded-full ${tab === "completed" ? "bg-green-800" : "bg-green-700"}`}>
                    {tab === "completed" ? "Complete" : "In progress"}
                  </span>
                )}
              </div>
              <p>You teach {s.teachSkill}</p>
              <p>You learn {s.learnSkill}</p>

              {tab === "active" && (
                <div className="mt-3 bg-white/60 rounded-lg px-3 py-2 text-sm">
                  {s.meetLink ? (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span>
                        {s.meetType === "instant" ? "Instant meeting" : "Scheduled"}
                        {s.nextSession ? ` · ${formatWhen(s.nextSession)}` : ""}
                      </span>
                      <span className="flex items-center gap-2">
                        <a
                          href={s.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-700 text-white px-3 py-1 rounded-full"
                        >
                          Join Meet
                        </a>
                        <button onClick={() => setMeetFor(s)} className="underline text-gray-600">Change</button>
                        <button
                          onClick={async () => { await clearSwapMeeting(s.id); load(); }}
                          className="underline text-gray-500"
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">No meeting yet</span>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                {tab === "requests" ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleAccept(s.id, true)} className="border border-blue-400 text-blue-600 px-4 py-2 rounded-full">Accept</button>
                    <button onClick={() => handleAccept(s.id, false)} className="bg-red-600 text-white px-4 py-2 rounded-full">Decline</button>
                  </div>
                ) : tab === "active" ? (
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/chat/${chatIdFor(profile.id, s.otherUser?.id)}`)} className="border border-blue-400 text-blue-600 px-4 py-2 rounded-full">Message</button>
                    <button onClick={() => setMeetFor(s)} className="bg-black text-white px-4 py-2 rounded-full">
                      {s.meetLink ? "Reschedule" : "Meet"}
                    </button>
                  </div>
                ) : (
                  <button onClick={() => navigate(`/swap/${s.otherUser?.id}`)} className="border border-blue-400 text-blue-600 px-4 py-2 rounded-full">Review</button>
                )}
                {tab === "active" && (
                  <button onClick={() => handleComplete(s.id)} className="text-sm text-gray-500 underline">Mark complete</button>
                )}
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-gray-500 col-span-2">Nothing here yet.</p>}
        </div>
      )}

      {meetFor && (
        <MeetModal
          swap={meetFor}
          myProfile={profile}
          onClose={() => setMeetFor(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
