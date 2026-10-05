// src/components/MeetModal.jsx
// Start an instant Google Meet or schedule one for a swap.
//
// How it works without any Google API setup: "Create" opens Google Meet (or a
// pre-filled Google Calendar event) in a new tab; the user copies the link
// Google gives them and pastes it here. We validate it, save it on the swap
// and post it in the chat, so both people get a Join button.
import { useState } from "react";
import { saveSwapMeeting, isValidMeetLink } from "../firebase/firestore";

const pad = (n) => String(n).padStart(2, "0");
// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time.
const toLocalInput = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
// Google Calendar wants UTC "YYYYMMDDTHHmmssZ".
const toCalStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export default function MeetModal({ swap, myProfile, onClose, onSaved }) {
  const other = swap.otherUser;
  const [mode, setMode] = useState("instant"); // instant | schedule
  const defaultStart = new Date(Date.now() + 60 * 60 * 1000);
  defaultStart.setMinutes(0, 0, 0);
  const [when, setWhen] = useState(toLocalInput(defaultStart));
  const [duration, setDuration] = useState(60);
  const [link, setLink] = useState("");
  const [opened, setOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title = `SkillSwap: ${swap.teachSkill} ⇆ ${swap.learnSkill} with ${other?.name || "partner"}`;

  const openMeet = () => {
    if (mode === "instant") {
      window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer");
    } else {
      const start = new Date(when);
      if (isNaN(start)) { setError("Pick a valid date and time first."); return; }
      const end = new Date(start.getTime() + duration * 60 * 1000);
      const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${toCalStamp(start)}/${toCalStamp(end)}`,
        details: "Skill swap session arranged on SkillSwap.",
      });
      if (other?.email) params.set("add", other.email);
      window.open(`https://calendar.google.com/calendar/render?${params}`, "_blank", "noopener,noreferrer");
    }
    setError("");
    setOpened(true);
  };

  const handleSave = async () => {
    setError("");
    const scheduledAt = mode === "schedule" ? new Date(when) : null;
    if (mode === "schedule" && (isNaN(scheduledAt) || scheduledAt.getTime() < Date.now() - 60000)) {
      setError("Please choose a time in the future.");
      return;
    }
    if (!isValidMeetLink(link)) {
      setError("Paste a valid Google Meet link, like https://meet.google.com/abc-defg-hij");
      return;
    }
    setSaving(true);
    try {
      await saveSwapMeeting({
        requestId: swap.id,
        meetLink: link,
        scheduledAt,
        senderId: myProfile.id,
        receiverId: other?.id,
        note:
          mode === "schedule"
            ? `Meeting scheduled for ${scheduledAt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
            : "Join my Google Meet now",
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFCE8] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-1">Meet with {other?.name || "your partner"}</h2>
        <p className="text-sm text-gray-600 mb-4">{swap.teachSkill} ⇆ {swap.learnSkill}</p>

        <div className="flex gap-2 mb-4 bg-[#E8DCC0] rounded-full p-1 w-fit">
          {[["instant", "Start now"], ["schedule", "Schedule"]].map(([k, label]) => (
            <button
              key={k}
              onClick={() => { setMode(k); setOpened(false); setError(""); }}
              className={`px-4 py-1.5 rounded-full ${mode === k ? "bg-black text-white" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "schedule" && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-sm font-semibold block mb-1">Date & time</label>
              <input
                type="datetime-local"
                value={when}
                min={toLocalInput(new Date())}
                onChange={(e) => setWhen(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 bg-white"
              >
                {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 mb-4 text-sm space-y-3">
          <div>
            <div className="font-semibold mb-1">Step 1</div>
            <button onClick={openMeet} className="bg-black text-white px-4 py-2 rounded-full">
              {mode === "instant" ? "Open Google Meet" : "Create Google Calendar event"}
            </button>
            <p className="text-gray-500 mt-2">
              {mode === "instant"
                ? "Meet opens in a new tab with a fresh meeting room. Copy its link."
                : "In the event, click “Add Google Meet video conferencing”, save it, then copy the Meet link."}
            </p>
          </div>
          <div>
            <div className="font-semibold mb-1">Step 2: paste the link</div>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://meet.google.com/abc-defg-hij"
              className={`w-full border rounded-full px-4 py-2 ${opened ? "" : "opacity-80"}`}
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="border border-blue-300 text-blue-600 px-5 py-2 rounded-full">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !link.trim()}
            className="bg-red-600 text-white px-5 py-2 rounded-full disabled:opacity-40"
          >
            {saving ? "Saving..." : mode === "instant" ? "Share with partner" : "Save & share"}
          </button>
        </div>
      </div>
    </div>
  );
}
