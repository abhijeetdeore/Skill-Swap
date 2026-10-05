// src/pages/Onboarding.jsx
// First-run flow after Register: location + skills, then routes to /home.
// Skills and location can only be chosen from the suggestion lists.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../firebase/store/authStore";
import { updateUserProfile } from "../firebase/firestore";
import SkillPicker from "../components/SkillPicker";
import LocationPicker from "../components/LocationPicker";

export default function Onboarding() {
  const { profile, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [location, setLocation] = useState(profile?.location || "");
  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");
  const [teaches, setTeaches] = useState([]);
  const [learns, setLearns] = useState([]);
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

  const finish = async () => {
    if (!location) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.id, { location, teaches, learns, onboarded: true });
      await refreshProfile();
      navigate("/home");
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 bg-[#FEFCE8] min-h-screen max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome! Let's set up your profile</h1>

      <label className="font-bold block mb-1">Where are you based?</label>
      <div className="mb-1">
        <LocationPicker value={location} onChange={setLocation} />
      </div>
      <p className="text-xs text-gray-500 mb-6">
        {location ? "Location selected." : "Start typing and pick your city from the list."}
      </p>

      <label className="font-bold block mb-1">A skill you can teach</label>
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SkillPicker
            value={teachInput}
            onChange={setTeachInput}
            exclude={teaches.map((t) => t.skill)}
            placeholder="Search skills you can teach..."
            onEnterSelected={addTeach}
          />
        </div>
        <button
          onClick={addTeach}
          disabled={!teachInput}
          className="bg-black text-white px-4 rounded-full disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {teaches.map((t, i) => (
          <span key={i} className="bg-[#E8DCC0] px-3 py-1 rounded-full flex items-center gap-2">
            {t.skill}
            <button onClick={() => setTeaches(teaches.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>

      <label className="font-bold block mb-1">A skill you want to learn</label>
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <SkillPicker
            value={learnInput}
            onChange={setLearnInput}
            exclude={learns.map((l) => l.skill)}
            placeholder="Search skills you want to learn..."
            onEnterSelected={addLearn}
          />
        </div>
        <button
          onClick={addLearn}
          disabled={!learnInput}
          className="bg-black text-white px-4 rounded-full disabled:opacity-40"
        >
          Add
        </button>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {learns.map((l, i) => (
          <span key={i} className="bg-[#E8DCC0] px-3 py-1 rounded-full flex items-center gap-2">
            {l.skill}
            <button onClick={() => setLearns(learns.filter((_, idx) => idx !== i))}>×</button>
          </span>
        ))}
      </div>

      <button
        onClick={finish}
        disabled={!location || saving}
        className="w-full bg-red-600 text-white py-3 rounded-full disabled:opacity-40"
      >
        {saving ? "Saving..." : "Finish setup"}
      </button>
    </div>
  );
}
