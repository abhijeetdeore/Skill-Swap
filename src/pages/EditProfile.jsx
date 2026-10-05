// src/pages/EditProfile.jsx  (NEW page — this didn't exist in your file tree)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { updateUserProfile } from "../firebase/firestore";
import SkillPicker from "../components/SkillPicker";
import LocationPicker from "../components/LocationPicker";

const FORMATS = ["Video", "In Person", "Chat"];

export default function EditProfile() {
  const { profile, refreshProfile } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [teaches, setTeaches] = useState(profile?.teaches || []);
  const [learns, setLearns] = useState(profile?.learns || []);
  const [format, setFormat] = useState(profile?.format || "Video");
  const [saving, setSaving] = useState(false);

  const addTeach = () => {
    if (!teachInput) return;
    setTeaches([...teaches, { skill: teachInput, level: "Beginner" }]);
    setTeachInput("");
  };
  const addLearn = () => {
    if (!learnInput) return;
    setLearns([...learns, { skill: learnInput, level: "Beginner" }]);
    setLearnInput("");
  };

  const handleSave = async () => {
    if (!location) {
      alert("Please pick your location from the suggestions.");
      return;
    }
    setSaving(true);
    try {
      await updateUserProfile(profile.id, { name, location, bio, teaches, learns, format });
      await refreshProfile();
      navigate("/profile");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4">&larr; Edit profile</button>

      <label className="font-bold block mb-1">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-full px-4 py-3 mb-4" />

      <label className="font-bold block mb-1">Location</label>
      <div className="mb-4">
        <LocationPicker value={location} onChange={setLocation} />
      </div>

      <label className="font-bold block mb-1">Bio</label>
      <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full border rounded-xl px-4 py-3 mb-4" />

      <label className="font-bold block mb-1">Skill you teach</label>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <SkillPicker
            value={teachInput}
            onChange={setTeachInput}
            exclude={teaches.map((t) => t.skill)}
            placeholder="Search skills you can teach..."
            onEnterSelected={addTeach}
          />
        </div>
        <button onClick={addTeach} disabled={!teachInput} className="bg-black text-white px-4 rounded-full disabled:opacity-40">Add</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {teaches.map((t, i) => (
          <span key={i} className="bg-[#E8DCC0] px-3 py-1 rounded-full flex items-center gap-2">
            {t.skill}
            <button onClick={() => setTeaches(teaches.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>

      <label className="font-bold block mb-1">Skill you want to learn</label>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <SkillPicker
            value={learnInput}
            onChange={setLearnInput}
            exclude={learns.map((l) => l.skill)}
            placeholder="Search skills you want to learn..."
            onEnterSelected={addLearn}
          />
        </div>
        <button onClick={addLearn} disabled={!learnInput} className="bg-black text-white px-4 rounded-full disabled:opacity-40">Add</button>
      </div>
      <div className="flex gap-2 flex-wrap mb-4">
        {learns.map((l, i) => (
          <span key={i} className="bg-[#E8DCC0] px-3 py-1 rounded-full flex items-center gap-2">
            {l.skill}
            <button onClick={() => setLearns(learns.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>

      <label className="font-bold block mb-1">Preferred format</label>
      <div className="flex gap-2 mb-6">
        {FORMATS.map((f) => (
          <button key={f} onClick={() => setFormat(f)} className={`px-4 py-2 rounded-full ${format === f ? "bg-black text-white" : "bg-[#E8DCC0]"}`}>{f}</button>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate(-1)} className="border border-blue-300 text-blue-600 px-5 py-2 rounded-full">Cancel</button>
        <button disabled={saving} onClick={handleSave} className="bg-red-600 text-white px-5 py-2 rounded-full">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
