// src/pages/Schedule.jsx
// Lists accepted swaps. Sessions that have a Google Meet saved (from My Swaps)
// show their time and a Join button, soonest first; the rest are listed below.
import { useEffect, useState } from "react";
import { useAuthStore } from "../firebase/store/authStore";
import { getMySwaps } from "../firebase/firestore";

const formatWhen = (ts) => {
  const d = ts?.toDate?.();
  return d ? d.toLocaleString([], { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "";
};

export default function Schedule() {
  const { profile } = useAuthStore();
  const [active, setActive] = useState([]);

  useEffect(() => {
    if (profile) getMySwaps(profile.id).then((d) => setActive(d.active));
  }, [profile]);

  const withMeet = active
    .filter((s) => s.meetLink)
    .sort((a, b) => (a.nextSession?.seconds || 0) - (b.nextSession?.seconds || 0));
  const withoutMeet = active.filter((s) => !s.meetLink);

  const Card = ({ s }) => (
    <div className="bg-[#E8DCC0] rounded-xl p-4 flex items-center justify-between gap-3">
      <div>
        <div className="font-bold">{s.otherUser?.name}</div>
        <p className="text-sm">{s.teachSkill} ⇆ {s.learnSkill}</p>
        {s.meetLink && <p className="text-sm text-gray-700">{formatWhen(s.nextSession)}</p>}
      </div>
      {s.meetLink && (
        <a href={s.meetLink} target="_blank" rel="noopener noreferrer" className="bg-green-700 text-white px-4 py-2 rounded-full whitespace-nowrap">
          Join Meet
        </a>
      )}
    </div>
  );

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>
      <div className="space-y-3 max-w-lg">
        {withMeet.map((s) => <Card key={s.id} s={s} />)}
        {withoutMeet.length > 0 && withMeet.length > 0 && (
          <p className="text-sm text-gray-500 pt-2">No meeting set yet (add one from My Swaps)</p>
        )}
        {withoutMeet.map((s) => <Card key={s.id} s={s} />)}
        {active.length === 0 && <p className="text-gray-500">No upcoming sessions.</p>}
      </div>
    </div>
  );
}
