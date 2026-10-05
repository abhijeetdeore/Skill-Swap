// src/components/NewSwapModal.jsx
// Opens as a modal from Home's "New Swap +" button, per your design.
import { useState } from "react";
import { useAuthStore } from "../firebase/store/authStore";
import { createSwapPost } from "../firebase/firestore";
import SkillPicker from "./SkillPicker";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const FORMATS = ["Video", "In Person", "Chat"];

export default function NewSwapModal({ onClose }) {
  const { profile } = useAuthStore();
  const [teachSkill, setTeachSkill] = useState("");
  const [teachLevel, setTeachLevel] = useState("Beginner");
  const [teachFormat, setTeachFormat] = useState("Video");
  const [learnSkill, setLearnSkill] = useState("");
  const [learnLevel, setLearnLevel] = useState("Beginner");
  const [learnFormat, setLearnFormat] = useState("Video");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day) => {
    setAvailability((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async () => {
    if (!teachSkill || !learnSkill || !title) {
      alert("Please fill teach skill, learn skill, and trade title.");
      return;
    }
    setSubmitting(true);
    try {
      await createSwapPost(profile.id, {
        teachSkill, teachLevel, teachFormat,
        learnSkill, learnLevel, learnFormat,
        title, language, description, availability,
      });
      onClose();
    } catch (err) {
      alert("Failed to post swap: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FEFCE8] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
        <h2 className="text-2xl font-bold mb-6">New Swap</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#E8DCC0] rounded-xl p-4">
            <label className="font-semibold">What do you teach?</label>
            <div className="my-2">
              <SkillPicker
                value={teachSkill}
                onChange={setTeachSkill}
                placeholder="Search for a skill..."
                className="w-full rounded-full px-3 py-2 bg-white"
              />
            </div>
            <div className="text-sm font-semibold mt-2">Level</div>
            <div className="flex gap-1 my-1">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setTeachLevel(l)} className={`px-3 py-1 rounded-full text-sm ${teachLevel === l ? "bg-black text-white" : "bg-white"}`}>{l}</button>
              ))}
            </div>
            <div className="text-sm font-semibold mt-2">Format</div>
            <div className="flex gap-1 my-1">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setTeachFormat(f)} className={`px-3 py-1 rounded-full text-sm ${teachFormat === f ? "bg-black text-white" : "bg-white"}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="bg-[#E8DCC0] rounded-xl p-4">
            <label className="font-semibold">What do you learn?</label>
            <div className="my-2">
              <SkillPicker
                value={learnSkill}
                onChange={setLearnSkill}
                placeholder="Search for a skill..."
                className="w-full rounded-full px-3 py-2 bg-white"
              />
            </div>
            <div className="text-sm font-semibold mt-2">Level</div>
            <div className="flex gap-1 my-1">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLearnLevel(l)} className={`px-3 py-1 rounded-full text-sm ${learnLevel === l ? "bg-black text-white" : "bg-white"}`}>{l}</button>
              ))}
            </div>
            <div className="text-sm font-semibold mt-2">Format</div>
            <div className="flex gap-1 my-1">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setLearnFormat(f)} className={`px-3 py-1 rounded-full text-sm ${learnFormat === f ? "bg-black text-white" : "bg-white"}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <label className="font-semibold">Trade title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Guitar lesson for beginner..." className="w-full border rounded-full px-4 py-3 my-2" />

        <label className="font-semibold">Language</label>
        <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="Type in the language you are comfortable in" className="w-full border rounded-full px-4 py-3 my-2" />

        <label className="font-semibold">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="How do you want the session to be" className="w-full border rounded-xl px-4 py-3 my-2" />

        <label className="font-semibold">Availability</label>
        <div className="flex gap-2 my-2 flex-wrap">
          {DAYS.map((d) => (
            <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-1 rounded-full border ${availability.includes(d) ? "bg-[#E8DCC0]" : "bg-white"}`}>{d}</button>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="border border-blue-300 text-blue-600 px-5 py-2 rounded-full">Cancel</button>
          <button disabled={submitting} onClick={handleSubmit} className="bg-red-600 text-white px-5 py-2 rounded-full">
            {submitting ? "Posting..." : "Post this swap"}
          </button>
        </div>
      </div>
    </div>
  );
}
